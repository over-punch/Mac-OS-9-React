// Scroll-driven zoom into the machine's screen, plus a pointer-following tilt.
//
// The hero shows the whole computer with copy above and below it. It turns
// slightly to face the cursor, the way a thing on a desk would if you leaned
// to look at it. As you scroll, the tilt unwinds and the machine scales up
// about the centre of its screen until the screen fills the viewport — at
// which point the page hands off to the desktop section, which is styled to
// continue seamlessly from it.
//
// Implementation notes:
//  - The scale target is computed from the real measured screen rect rather
//    than hardcoded, so it lands exactly edge-to-edge at any viewport size.
//  - Zoom and tilt are written by the same rAF loop, to two nested elements.
//    Two independent writers on nested transforms is how you get jitter.
//  - Progress and pointer are read in rAF-throttled listeners and written to
//    transforms and CSS custom properties, so the animation runs off
//    compositor-friendly transforms and React never re-renders during it.
//  - `prefers-reduced-motion` skips both the zoom and the tilt.

import { useEffect, useRef, type ReactNode } from 'react';

export interface ZoomStageProps {
	/** Copy rendered above the machine in the hero. */
	above: ReactNode;
	/** Copy rendered below the machine in the hero. */
	below: ReactNode;
	/** The machine itself. */
	children: ReactNode;
}

export function ZoomStage({ above, below, children }: ZoomStageProps) {
	const trackRef = useRef<HTMLDivElement>(null);
	const stageRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const track = trackRef.current;
		const stage = stageRef.current;
		if (!track || !stage) return;

		const machine = stage.querySelector<HTMLElement>('.zoomMachine');
		const tilt = stage.querySelector<HTMLElement>('.machine');
		const screen = stage.querySelector<HTMLElement>('.machine__screen');
		if (!machine || !tilt || !screen) return;

		// The pending frame is local to this effect run, not a ref shared across
		// them. Under StrictMode the effect mounts, tears down and mounts again:
		// a shared ref still holding the first run's cancelled frame id makes
		// the second run's scheduler think a frame is already pending, and the
		// loop never starts again.
		let frame: number | null = null;

		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

		// Only pointers that hover — a touch "pointer" is wherever the last tap
		// landed, so following it would snap the machine around on every tap
		// rather than track anything.
		const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');

		// Geometry measured at rest, re-measured only on resize. Measuring
		// every frame would feed the element's own transform back into the
		// calculation.
		let natural = { width: 1, height: 1, centerX: 0, centerY: 0, originX: 0, originY: 0 };

		// Tilt in degrees: where the pointer asks the machine to face, and
		// where it is actually facing this frame. The gap between them is what
		// makes the movement read as weight rather than as a cursor readout.
		const target = { x: 0, y: 0 };
		const current = { x: 0, y: 0 };

		const measure = () => {
			// Clear the transforms so the rects describe the untransformed layout.
			machine.style.transform = 'none';
			tilt.style.setProperty('--tilt-x', '0deg');
			tilt.style.setProperty('--tilt-y', '0deg');

			const stageRect = stage.getBoundingClientRect();
			const machineRect = machine.getBoundingClientRect();
			const screenRect = screen.getBoundingClientRect();

			natural = {
				width: screenRect.width,
				height: screenRect.height,
				// Screen centre relative to the stage, which is pinned at the top
				// of the viewport for the whole sticky phase — so this stays valid
				// however far the page is scrolled.
				centerX: screenRect.left - stageRect.left + screenRect.width / 2,
				centerY: screenRect.top - stageRect.top + screenRect.height / 2,
				// Screen centre within the machine box, used as the scale origin so
				// the screen stays put while everything around it grows away.
				originX: screenRect.left - machineRect.left + screenRect.width / 2,
				originY: screenRect.top - machineRect.top + screenRect.height / 2,
			};

			machine.style.transformOrigin = `${natural.originX}px ${natural.originY}px`;
		};

		const apply = () => {
			frame = null;

			if (reduceMotion.matches) {
				stage.style.setProperty('--zoom-progress', '0');
				machine.style.transform = 'none';
				tilt.style.setProperty('--tilt-x', '0deg');
				tilt.style.setProperty('--tilt-y', '0deg');
				return;
			}

			const rect = track.getBoundingClientRect();
			const scrollable = rect.height - window.innerHeight;
			const raw = scrollable <= 0 ? 0 : clamp(-rect.top / scrollable, 0, 1);

			// The zoom finishes before the track does, leaving the last stretch
			// fully zoomed. Without that dwell the screen only reaches full
			// bleed at exactly progress 1, which a real scroll rarely lands on —
			// so a sliver of bezel stayed visible at the handoff.
			const progress = clamp(raw / ZOOM_COMPLETE_AT, 0, 1);

			// Ease so the zoom starts gently and accelerates into the screen.
			const eased = progress * progress;

			// Scale at which the screen covers the viewport in both axes, with a
			// little overscan so no seam shows at the edges.
			const fill =
				Math.max(window.innerWidth / natural.width, window.innerHeight / natural.height) * OVERSCAN;
			const scale = 1 + eased * (fill - 1);

			// Scaling is about the screen's own centre, so that point stays put.
			// Horizontally the screen eases to the middle of the viewport;
			// vertically its TOP edge eases to the top of the viewport rather
			// than its centre — the screen ends up taller than the viewport, and
			// cropping the bottom keeps the menu bar visible and lines the screen
			// up with the desktop section that follows.
			const scaledHeight = natural.height * scale;
			const dx = (window.innerWidth / 2 - natural.centerX) * eased;
			const dy = (scaledHeight / 2 - natural.centerY) * eased;

			stage.style.setProperty('--zoom-progress', String(progress));
			machine.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;

			// The tilt is a hero-only flourish: it unwinds over the first part
			// of the scroll so the machine is square to the viewer well before
			// the screen reaches the edges of the viewport. A perspective
			// rotation still applied at 6x would shear the whole desktop.
			const strength = clamp(1 - progress / TILT_GONE_AT, 0, 1);

			// Ease towards the pointer rather than snapping to it.
			current.x += (target.x - current.x) * TILT_EASE;
			current.y += (target.y - current.y) * TILT_EASE;

			tilt.style.setProperty('--tilt-x', `${current.x * strength}deg`);
			tilt.style.setProperty('--tilt-y', `${current.y * strength}deg`);

			// Keep the loop alive only while the tilt is still visibly moving.
			// Scroll and pointer events restart it; otherwise it stops, so an
			// idle hero costs nothing.
			const settled =
				Math.abs(target.x - current.x) < TILT_SETTLED &&
				Math.abs(target.y - current.y) < TILT_SETTLED;
			if (!settled) schedule();
		};

		const schedule = () => {
			if (frame !== null) return;
			frame = requestAnimationFrame(apply);
		};

		const onPointerMove = (event: PointerEvent) => {
			if (!canHover.matches || reduceMotion.matches) return;

			// Measured against the viewport rather than the machine's own box,
			// so the machine faces where you are on the page, and the far
			// corners of a wide window still reach the full tilt.
			const nx = clamp((event.clientX / window.innerWidth) * 2 - 1, -1, 1);
			const ny = clamp((event.clientY / window.innerHeight) * 2 - 1, -1, 1);

			// Positive rotateY turns the right edge away, so the machine faces
			// a pointer to its right. rotateX is inverted for the same reason:
			// a pointer above should tip the top of the case towards it.
			target.y = nx * MAX_TILT;
			target.x = -ny * MAX_TILT;
			schedule();
		};

		const onPointerLeave = () => {
			target.x = 0;
			target.y = 0;
			schedule();
		};

		const onResize = () => {
			measure();
			apply();
		};

		measure();
		apply();

		window.addEventListener('scroll', schedule, { passive: true });
		window.addEventListener('resize', onResize);
		window.addEventListener('pointermove', onPointerMove, { passive: true });
		document.addEventListener('pointerleave', onPointerLeave);
		reduceMotion.addEventListener('change', onResize);

		return () => {
			window.removeEventListener('scroll', schedule);
			window.removeEventListener('resize', onResize);
			window.removeEventListener('pointermove', onPointerMove);
			document.removeEventListener('pointerleave', onPointerLeave);
			reduceMotion.removeEventListener('change', onResize);
			if (frame !== null) cancelAnimationFrame(frame);
		};
	}, []);

	return (
		<div className="zoomTrack" ref={trackRef}>
			<div className="zoomStage" ref={stageRef}>
				<div className="zoomCopy zoomCopy--above">{above}</div>
				<div className="zoomMachine">{children}</div>
				<div className="zoomCopy zoomCopy--below">{below}</div>
			</div>
		</div>
	);
}

/** Fraction of the scroll track over which the zoom completes. */
const ZOOM_COMPLETE_AT = 0.82;

/** Slight overshoot so no bezel seam shows at the edges of the landing frame. */
const OVERSCAN = 1.02;

/**
 * Degrees of rotation at the far edge of the viewport. Small on purpose: the
 * machine should look like it noticed you, not like it is being waved around.
 */
const MAX_TILT = 6;

/** Fraction of the zoom over which the tilt returns to square. */
const TILT_GONE_AT = 0.35;

/** Per-frame fraction of the remaining distance to the pointer. */
const TILT_EASE = 0.09;

/** Below this many degrees of error the tilt is treated as arrived. */
const TILT_SETTLED = 0.01;

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}
