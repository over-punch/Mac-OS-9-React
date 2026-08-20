// Scroll-driven zoom into the machine's screen.
//
// The hero shows the whole computer with copy above and below it. As you
// scroll, the machine scales up about the centre of its screen until the
// screen fills the viewport — at which point the page hands off to the
// desktop section, which is styled to continue seamlessly from it.
//
// Implementation notes:
//  - The scale target is computed from the real measured screen rect rather
//    than hardcoded, so it lands exactly edge-to-edge at any viewport size.
//  - Scroll progress is read in a rAF-throttled listener and written to CSS
//    custom properties, so the animation runs off compositor-friendly
//    transforms and React never re-renders during the scroll.
//  - `prefers-reduced-motion` skips the zoom entirely and shows the desktop.

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
	const frameRef = useRef<number | null>(null);

	useEffect(() => {
		const track = trackRef.current;
		const stage = stageRef.current;
		if (!track || !stage) return;

		const machine = stage.querySelector<HTMLElement>('.zoomMachine');
		const screen = stage.querySelector<HTMLElement>('.machine__screen');
		if (!machine || !screen) return;

		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

		// Geometry measured at rest, re-measured only on resize. Measuring
		// every frame would feed the element's own transform back into the
		// calculation.
		let natural = { width: 1, height: 1, centerX: 0, centerY: 0, originX: 0, originY: 0 };

		const measure = () => {
			// Clear the transform so the rects describe the untransformed layout.
			machine.style.transform = 'none';

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
			frameRef.current = null;

			if (reduceMotion.matches) {
				stage.style.setProperty('--zoom-progress', '0');
				machine.style.transform = 'none';
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
			const target =
				Math.max(window.innerWidth / natural.width, window.innerHeight / natural.height) *
				OVERSCAN;
			const scale = 1 + eased * (target - 1);

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
		};

		const onScroll = () => {
			if (frameRef.current !== null) return;
			frameRef.current = requestAnimationFrame(apply);
		};

		const onResize = () => {
			measure();
			apply();
		};

		measure();
		apply();

		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onResize);
		reduceMotion.addEventListener('change', onResize);

		return () => {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onResize);
			reduceMotion.removeEventListener('change', onResize);
			if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
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

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}
