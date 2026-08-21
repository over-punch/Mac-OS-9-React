// Scroll-driven zoom into the machine's screen, plus a pointer-following tilt.
//
// The screen holds the real, live desktop — not a picture of one. That decides
// the whole design here: the machine is laid out at the size it will be when
// the zoom finishes, so its screen is exactly viewport-sized and the desktop
// inside it is at 1:1. The hero then scales the machine DOWN to fit, and
// scrolling runs that scale back up to 1.
//
// Doing it the other way round — laying the machine out small and scaling it
// up — is what forced the old version to show a mock-up: at hero size the
// screen was 560px wide, so anything real inside it would have been laid out
// for a 560px viewport and then magnified sixfold.
//
// Because the scale lands on exactly 1, nothing is magnified at the end. The
// desktop is simply the page, at its natural size, and becomes interactive.
// There is no second copy below to scroll into, and no seam.
//
// Implementation notes:
//  - Zoom and tilt are written by the same rAF loop, to two nested elements.
//    Two independent writers on nested transforms is how you get jitter.
//  - The desktop is `inert` until the zoom completes, so a keyboard user can
//    never land on a control inside a machine that is 30% of its final size.
//  - `prefers-reduced-motion` skips straight to the desktop: no zoom, no tilt.

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
		const live = stage.querySelector<HTMLElement>('.machineScreen__live');
		const above = stage.querySelector<HTMLElement>('.zoomCopy--above');
		const below = stage.querySelector<HTMLElement>('.zoomCopy--below');
		if (!machine || !tilt || !live || !above || !below) return;

		// The pending frame is local to this effect run, not a ref shared
		// across them: under StrictMode a shared ref still holding the first
		// run's cancelled id makes the second run think a frame is pending.
		let frame: number | null = null;

		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

		// Only pointers that hover — a touch "pointer" is wherever the last tap
		// landed, so following it would snap the machine around on every tap.
		const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');

		const target = { x: 0, y: 0 };
		const current = { x: 0, y: 0 };

		// Whether the desktop is currently reachable. `null` rather than false
		// so the first setReleased(false) actually applies the attributes — the
		// no-op guard below would otherwise skip it and leave the hero's
		// desktop tabbable while it is 27% of its final size.
		let released: boolean | null = null;

		// Geometry measured at rest, re-measured only on resize.
		let natural = {
			originX: 0,
			originY: 0,
			offsetX: 0,
			offsetY: 0,
			heroScale: 0.27,
			heroTop: 0,
		};

		const measure = () => {
			machine.style.transform = 'none';
			tilt.style.setProperty('--tilt-x', '0deg');
			tilt.style.setProperty('--tilt-y', '0deg');

			const machineRect = machine.getBoundingClientRect();
			const liveRect = live.getBoundingClientRect();

			// Fit the machine into whatever room the copy leaves, rather than
			// trusting a constant. A fixed hero scale looks right at one
			// viewport and collides with the headline at another — which is
			// exactly what happened on the 1200x630 social card.
			const gapTop = above.getBoundingClientRect().bottom + HERO_GUTTER;
			const gapBottom = below.getBoundingClientRect().top - HERO_GUTTER;
			const gapHeight = Math.max(gapBottom - gapTop, 1);

			const heroScale = clamp(
				Math.min(gapHeight / machineRect.height, (window.innerWidth * 0.92) / machineRect.width),
				HERO_SCALE_MIN,
				HERO_SCALE_MAX
			);

			natural = {
				// Scale about the top-centre of the live desktop, so that point
				// is the one thing that does not move as the machine grows.
				originX: liveRect.left - machineRect.left + liveRect.width / 2,
				originY: liveRect.top - machineRect.top,
				// Where that point sits in the viewport at rest, which is what
				// the translation has to cancel out at full zoom.
				offsetX: liveRect.left + liveRect.width / 2,
				offsetY: liveRect.top,
				heroScale,
				// Centre the scaled machine in the gap. The transform origin is
				// the live desktop's top-centre, so this is where that point has
				// to land for the machine's box to sit where we want it.
				heroTop: gapTop + (gapHeight - machineRect.height * heroScale) / 2,
			};

			machine.style.transformOrigin = `${natural.originX}px ${natural.originY}px`;
		};

		/** Make the desktop reachable, or take it back out of reach. */
		const setReleased = (next: boolean) => {
			if (next === released) return;
			released = next;
			stage.dataset.released = next ? 'true' : 'false';
			if (next) {
				live.removeAttribute('inert');
				live.removeAttribute('aria-hidden');
			} else {
				// Set through the DOM rather than as a JSX prop because React 18
				// does not recognise `inert` as a known attribute.
				live.setAttribute('inert', '');
				live.setAttribute('aria-hidden', 'true');
			}
		};

		const apply = () => {
			frame = null;

			if (reduceMotion.matches) {
				stage.style.setProperty('--zoom-progress', '1');
				machine.style.transform = 'none';
				tilt.style.setProperty('--tilt-x', '0deg');
				tilt.style.setProperty('--tilt-y', '0deg');
				setReleased(true);
				return;
			}

			const rect = track.getBoundingClientRect();
			const scrollable = rect.height - window.innerHeight;
			const raw = scrollable <= 0 ? 0 : clamp(-rect.top / scrollable, 0, 1);
			const progress = clamp(raw / ZOOM_COMPLETE_AT, 0, 1);

			// Ease so the zoom starts gently and accelerates in.
			const eased = progress * progress;

			// The machine is laid out at full size and shrunk to fit the hero,
			// so the scale runs heroScale -> 1 rather than 1 -> something.
			const scale = natural.heroScale + eased * (1 - natural.heroScale);

			// The machine is out of flow, so both ends of the journey are set
			// here. The live desktop's top-centre starts at the hero anchor and
			// finishes at the top centre of the viewport — where, at scale 1,
			// the desktop is exactly the page.
			const heroY = natural.heroTop + natural.originY * natural.heroScale;
			const dx = window.innerWidth / 2 - natural.offsetX;
			const dy = heroY - natural.offsetY - heroY * eased;

			stage.style.setProperty('--zoom-progress', String(progress));
			machine.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;

			// Hand over only once the desktop is genuinely at full size. Any
			// earlier and clicks land on a target that is still moving.
			setReleased(progress >= RELEASE_AT);

			// The tilt is a hero flourish: it unwinds early, so the machine is
			// square to the viewer well before the screen fills the viewport.
			// A perspective rotation still applied at the end would shear the
			// whole desktop.
			const strength = clamp(1 - progress / TILT_GONE_AT, 0, 1);

			current.x += (target.x - current.x) * TILT_EASE;
			current.y += (target.y - current.y) * TILT_EASE;

			tilt.style.setProperty('--tilt-x', `${current.x * strength}deg`);
			tilt.style.setProperty('--tilt-y', `${current.y * strength}deg`);

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

			const nx = clamp((event.clientX / window.innerWidth) * 2 - 1, -1, 1);
			const ny = clamp((event.clientY / window.innerHeight) * 2 - 1, -1, 1);

			// Positive rotateY sends the right edge away, so the machine faces
			// a pointer to its right; rotateX is inverted for the same reason.
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

		setReleased(false);
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
			<div className="zoomStage" ref={stageRef} data-released="false">
				<div className="zoomCopy zoomCopy--above">{above}</div>
				<div className="zoomMachine">{children}</div>
				<div className="zoomCopy zoomCopy--below">{below}</div>
			</div>
		</div>
	);
}

/** Fraction of the scroll track over which the zoom completes. */
const ZOOM_COMPLETE_AT = 0.8;

/** Clear space kept between the machine and the copy above and below it. */
const HERO_GUTTER = 20;

/**
 * Bounds on the fitted hero scale. The floor stops the machine becoming a
 * postage stamp in a very short window; the ceiling stops it filling the hero
 * on a tall one, where the point is that you are looking at a whole computer.
 */
const HERO_SCALE_MIN = 0.14;
const HERO_SCALE_MAX = 0.34;

/** Progress past which the desktop becomes interactive. */
const RELEASE_AT = 0.995;

/**
 * Degrees of rotation at the far edge of the viewport. Enough that the case
 * flanks come into view and the layers shift against each other, without the
 * machine looking like it is being waved around.
 */
const MAX_TILT = 11;

/** Fraction of the zoom over which the tilt returns to square. */
const TILT_GONE_AT = 0.35;

/** Per-frame fraction of the remaining distance to the pointer. */
const TILT_EASE = 0.09;

/** Below this many degrees of error the tilt is treated as arrived. */
const TILT_SETTLED = 0.01;

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}
