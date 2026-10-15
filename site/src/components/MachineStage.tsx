// Chooses how the machine is drawn, and owns the handoff to the live desktop.
//
// Two detached elements, created once and never re-created. `host` is the 4:3
// aperture and belongs to CSS3DRenderer for the whole session — nothing else
// ever writes to its style. `page` is the viewport-sized desktop inside it,
// and *that* is what moves: into a plain full-viewport wrapper once the zoom
// completes, and back into the aperture when you scroll away again.
//
// Moving the page rather than the host is deliberate. CSS3DRenderer caches the
// transform it wrote per object and skips rewriting an unchanged one, so any
// inline style cleared off the host is never restored — the aperture ends up
// stranded without its transform and the desktop spills out beside the case.
// Leaving the host alone means there is nothing to strand.
//
// Moving a node rather than re-parenting it in React is what keeps the
// desktop's state — open windows, chosen flavour, selected rows — across the
// handoff. React renders into `page` through a portal and never has to care
// where it currently is.
//
// WebGL is loaded on demand and is never on the critical path: if it fails, is
// unsupported, or the visitor prefers reduced motion, the desktop is simply
// there, at full size, with no machine around it.
//
// `autoBoot` plays the zoom without the visitor scrolling, for links that
// promise to open straight into the desktop. It drives the real scroll
// position rather than a parallel animation, so the page ends exactly where a
// scrolling visitor would be and scrolling back up reverses it as usual.

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { MachineGLHandle } from './machineGL';

export interface MachineStageProps {
	/** The live desktop. */
	children: ReactNode;
	/** Copy rendered above the machine in the hero. */
	above: ReactNode;
	/** Copy rendered below the machine in the hero. */
	below: ReactNode;
	/** Scroll through the zoom automatically and hand focus to the desktop. */
	autoBoot?: boolean;
}

/** Fraction of the scroll track over which the zoom completes. */
const ZOOM_COMPLETE_AT = 0.8;

/** Progress past which the desktop is released to the page. */
const RELEASE_AT = 0.995;

/** Degrees of rotation at the far edge of the viewport. */
const MAX_TILT = 13;

/** Fraction of the zoom over which the tilt returns to square. */
const TILT_GONE_AT = 0.4;

/** Per-frame fraction of the remaining distance to the pointer. */
const TILT_EASE = 0.09;

/** Clear space kept between the machine and the copy above and below it. */
const HERO_GUTTER = 16;

/** Milliseconds the hero is held before an auto-boot starts moving. */
const AUTO_BOOT_DELAY = 500;

/** Milliseconds an auto-boot takes to scroll from the hero to the release. */
const AUTO_BOOT_DURATION = 1500;

/** Ease-in-out cubic, for t in [0, 1]. */
function easeInOutCubic(t: number): number {
	return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

/** Whether this browser can give us a WebGL2 context at all. */
function hasWebGL(): boolean {
	try {
		const canvas = document.createElement('canvas');
		return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
	} catch {
		return false;
	}
}

export function MachineStage({ children, above, below, autoBoot = false }: MachineStageProps) {
	// Created once and never re-created. `host` is the whole 4:3 aperture and
	// is what gets moved between homes; `page` is the viewport-sized region
	// inside it that React actually portals the desktop into. The rest of the
	// aperture is filled in the desktop's own colour, so it reads as more
	// desktop rather than as letterboxing.
	const { host, page } = useMemo(() => {
		const hostNode = document.createElement('div');
		hostNode.className = 'machineScreen__live';

		const pageNode = document.createElement('div');
		pageNode.className = 'machineScreen__page';
		hostNode.appendChild(pageNode);

		return { host: hostNode, page: pageNode };
	}, []);

	const trackRef = useRef<HTMLDivElement>(null);
	const stageRef = useRef<HTMLDivElement>(null);
	const mountRef = useRef<HTMLDivElement>(null);
	const releaseRef = useRef<HTMLDivElement>(null);

	const [mode, setMode] = useState<'pending' | 'gl' | 'flat'>('pending');

	useEffect(() => {
		const track = trackRef.current;
		const stage = stageRef.current;
		const mount = mountRef.current;
		const release = releaseRef.current;
		const above = stage?.querySelector<HTMLElement>('.zoomCopy--above');
		const below = stage?.querySelector<HTMLElement>('.zoomCopy--below');
		if (!track || !stage || !mount || !release || !above || !below) return;

		/** The vertical band the copy leaves free for the machine. */
		const measureBand = () => ({
			top: above.getBoundingClientRect().bottom + HERO_GUTTER,
			bottom: below.getBoundingClientRect().top - HERO_GUTTER,
		});

		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
		const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');

		let handle: MachineGLHandle | null = null;
		let frame: number | null = null;
		let cancelled = false;

		// Auto-boot timers, and the input listeners that hand control back.
		let bootDelay: number | null = null;
		let bootFrame: number | null = null;

		// null rather than false so the first call always applies the
		// attributes, instead of being skipped by the no-op guard.
		let released: boolean | null = null;

		const target = { x: 0, y: 0 };
		const current = { x: 0, y: 0 };

		const setReleased = (next: boolean) => {
			if (next === released) return;
			released = next;
			stage.dataset.released = next ? 'true' : 'false';

			if (next) {
				// Only the page moves. Where it sits in each home is decided by
				// CSS on the parent, so no inline style is written here at all.
				release.appendChild(page);
				page.removeAttribute('inert');
				page.removeAttribute('aria-hidden');
				handle?.setVisible(false);
			} else {
				host.appendChild(page);
				// `inert` is set through the DOM rather than as a JSX prop
				// because React 18 does not recognise it as a known attribute.
				page.setAttribute('inert', '');
				page.setAttribute('aria-hidden', 'true');
				handle?.setVisible(true);
			}
		};

		const readProgress = () => {
			const rect = track.getBoundingClientRect();
			const scrollable = rect.height - window.innerHeight;
			const raw = scrollable <= 0 ? 0 : clamp(-rect.top / scrollable, 0, 1);
			return clamp(raw / ZOOM_COMPLETE_AT, 0, 1);
		};

		/** Moves focus to the released desktop without scrolling anything. */
		const focusDesktop = () => {
			if (!page.hasAttribute('tabindex')) page.setAttribute('tabindex', '-1');
			page.focus({ preventScroll: true });
		};

		// --- Flat fallback: no machine, just the desktop ---------------------
		const runFlat = () => {
			release.appendChild(page);
			page.removeAttribute('inert');
			page.removeAttribute('aria-hidden');
			stage.dataset.released = 'true';
			released = true;
			setMode('flat');
			// The desktop already fills the viewport here, so booting is only
			// a matter of where focus starts.
			if (autoBoot) focusDesktop();
		};

		if (reduceMotion.matches || !hasWebGL()) {
			runFlat();
			return;
		}

		const apply = () => {
			frame = null;
			if (!handle) return;

			const progress = readProgress();
			stage.style.setProperty('--zoom-progress', String(progress));

			const strength = clamp(1 - progress / TILT_GONE_AT, 0, 1);
			current.x += (target.x - current.x) * TILT_EASE;
			current.y += (target.y - current.y) * TILT_EASE;

			setReleased(progress >= RELEASE_AT);

			if (released !== true) {
				handle.update(progress, current.x * strength, current.y * strength);
			}

			const settled =
				Math.abs(target.x - current.x) < 0.01 && Math.abs(target.y - current.y) < 0.01;
			if (!settled) schedule();
		};

		const schedule = () => {
			if (frame !== null) return;
			frame = requestAnimationFrame(apply);
		};

		const onPointerMove = (event: PointerEvent) => {
			if (!canHover.matches) return;
			const nx = clamp((event.clientX / window.innerWidth) * 2 - 1, -1, 1);
			const ny = clamp((event.clientY / window.innerHeight) * 2 - 1, -1, 1);
			// A pointer to the right should turn the machine to face it, and a
			// pointer above should tip its top toward the viewer.
			target.y = nx * MAX_TILT;
			target.x = -ny * MAX_TILT;
			schedule();
		};

		const onPointerLeave = () => {
			target.x = 0;
			target.y = 0;
			schedule();
		};

		// --- Auto-boot -------------------------------------------------------
		const bootInputs = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;

		const stopAutoBoot = () => {
			if (bootDelay !== null) window.clearTimeout(bootDelay);
			if (bootFrame !== null) cancelAnimationFrame(bootFrame);
			bootDelay = null;
			bootFrame = null;
			for (const type of bootInputs) window.removeEventListener(type, stopAutoBoot, true);
		};

		/** Scroll offset at which the zoom is complete and the desktop released. */
		const releaseScrollY = () => {
			const rect = track.getBoundingClientRect();
			const scrollable = rect.height - window.innerHeight;
			return Math.ceil(rect.top + window.scrollY + scrollable * ZOOM_COMPLETE_AT);
		};

		const startAutoBoot = () => {
			// Any input from the visitor means they have taken over.
			for (const type of bootInputs) {
				window.addEventListener(type, stopAutoBoot, { capture: true, passive: true });
			}

			bootDelay = window.setTimeout(() => {
				bootDelay = null;
				const from = window.scrollY;
				const to = releaseScrollY();
				const start = performance.now();

				const step = (now: number) => {
					const t = clamp((now - start) / AUTO_BOOT_DURATION, 0, 1);
					// `instant` overrides the page's smooth scroll-behavior, which
					// would otherwise turn every frame into its own animation.
					window.scrollTo({ top: from + (to - from) * easeInOutCubic(t), behavior: 'instant' });

					if (t < 1) {
						bootFrame = requestAnimationFrame(step);
						return;
					}

					stopAutoBoot();
					// Apply now rather than on the next frame, so the page is
					// released (and no longer inert) before focus moves into it.
					apply();
					if (released) focusDesktop();
				};

				bootFrame = requestAnimationFrame(step);
			}, AUTO_BOOT_DELAY);
		};

		const onResize = () => {
			handle?.resize();
			const band = measureBand();
			handle?.setHeroBand(band.top, band.bottom);
			apply();
		};

		void (async () => {
			try {
				const { createMachineGL } = await import('./machineGL');
				if (cancelled) return;

				handle = await createMachineGL({ mount, screenContent: host });
				if (cancelled) {
					handle.dispose();
					return;
				}

				setMode('gl');
				const band = measureBand();
				handle.setHeroBand(band.top, band.bottom);
				setReleased(false);
				apply();

				window.addEventListener('scroll', schedule, { passive: true });
				window.addEventListener('resize', onResize);
				window.addEventListener('pointermove', onPointerMove, { passive: true });
				document.addEventListener('pointerleave', onPointerLeave);

				if (autoBoot) startAutoBoot();
			} catch (error) {
				// A machine is decoration; the desktop is the content. Losing the
				// first must never cost the second.
				console.warn('Machine: falling back to the flat desktop.', error);
				if (!cancelled) runFlat();
			}
		})();

		return () => {
			cancelled = true;
			stopAutoBoot();
			window.removeEventListener('scroll', schedule);
			window.removeEventListener('resize', onResize);
			window.removeEventListener('pointermove', onPointerMove);
			document.removeEventListener('pointerleave', onPointerLeave);
			if (frame !== null) cancelAnimationFrame(frame);
			handle?.dispose();
		};
	}, [host, page, autoBoot]);

	return (
		<div className="zoomTrack" ref={trackRef} data-mode={mode}>
			<div className="zoomStage" ref={stageRef} data-released="false">
				<div className="zoomCopy zoomCopy--above">{above}</div>
				<div className="machineGL" ref={mountRef} aria-hidden="true" />
				<div className="machineRelease" ref={releaseRef} />
				<div className="zoomCopy zoomCopy--below">{below}</div>
			</div>
			{createPortal(children, page)}
		</div>
	);
}
