// Scrollbar component - Mac OS 9 style
// Classic scrollbar with arrows and draggable thumb

// Note: no per-file 'use client' directive. The library ships as a single
// bundle and Rollup applies the "use client" banner to the whole output,
// so per-file directives were both inconsistent (4 of 16 components) and
// silently dropped at bundle time.

import React, { forwardRef, useRef, useCallback } from 'react';
import { mergeClasses } from '../../utils/classNames';
import { resolveAria } from '../../utils/aria';
import { warnDeprecatedProp } from '../../utils/deprecation';
import { usePointerGesture } from '../../hooks/usePointerGesture';
import styles from './Scrollbar.module.css';

export interface ScrollbarProps {
	/**
	 * Scrollbar orientation
	 * @default 'vertical'
	 */
	orientation?: 'vertical' | 'horizontal';

	/**
	 * Current scroll position (0-1)
	 */
	value?: number;

	/**
	 * Viewport size relative to content size (0-1).
	 *
	 * This is the one number that makes a scrollbar meaningful: it sets the
	 * thumb's proportion of the track and the PageUp/PageDown step. Compute
	 * it as `clientHeight / scrollHeight` (or the width equivalent) for the
	 * region being scrolled.
	 *
	 * There is deliberately no default. It previously defaulted to `0.2`, so
	 * a scrollbar wired up without it rendered a confident, entirely
	 * fictional thumb covering a fifth of the track — whatever the content's
	 * real length — and looked correct while being wrong. Omitting it now
	 * logs a development warning and falls back to a full-length thumb,
	 * which reads as "nothing to scroll" rather than as a plausible lie.
	 */
	viewportRatio?: number;

	/**
	 * Called with the new scroll position, 0 to 1.
	 *
	 * Named `onValueChange` because it reports a value rather than a DOM
	 * event. Across the library, `onChange` is always the native change
	 * handler of a wrapped input, and `onValueChange` is always the parsed
	 * value — Scrollbar wraps no input, so it only has the latter.
	 */
	onValueChange?: (value: number) => void;

	/** @deprecated Use `onValueChange`. */
	onChange?: (value: number) => void;

	/**
	 * Additional CSS class names
	 */
	className?: string;

	/**
	 * Whether scrollbar is disabled
	 * @default false
	 */
	disabled?: boolean;

	/**
	 * Accessible label for the scrollbar track. Required for AT users
	 * unless `controls` points at an element with a known accessible name.
	 */
	'aria-label'?: string;

	/** @deprecated Use `aria-label`. */
	ariaLabel?: string;

	/**
	 * ID of the scrollable region this scrollbar controls. Surfaces as
	 * `aria-controls` per WAI-ARIA scrollbar pattern.
	 */
	controls?: string;

	/**
	 * Per-keystroke increment for Arrow keys, expressed as a fraction of
	 * the full track (0-1).
	 * @default 0.1
	 */
	step?: number;
}

/**
 * Mac OS 9 style Scrollbar component
 *
 * Classic scrollbar with arrow buttons and draggable thumb.
 * Can be used standalone or integrated with scrollable content.
 *
 * @example
 * ```tsx
 * <Scrollbar
 *   orientation="vertical"
 *   value={0.5}
 *   viewportRatio={0.3}
 *   onValueChange={(value) => console.log('Scroll position:', value)}
 * />
 * ```
 */
export const Scrollbar = forwardRef<HTMLDivElement, ScrollbarProps>(
	(
		{
			orientation = 'vertical',
			value = 0,
			viewportRatio,
			onChange,
			onValueChange,
			'aria-label': ariaLabelAttr,
			className = '',
			disabled = false,
			ariaLabel,
			controls,
			step = 0.1,
		},
		ref
	) => {
		const trackRef = useRef<HTMLDivElement>(null);

		const isVertical = orientation === 'vertical';

		// Helper used by both arrow buttons and keyboard handler to clamp
		// the next value into the valid 0-1 range before notifying.
		// `onValueChange` is the supported name; `onChange` still works and
		// warns once in development.
		if (process.env.NODE_ENV !== 'production' && onChange && !onValueChange) {
			warnDeprecatedProp('Scrollbar', 'onChange', 'onValueChange');
		}
		const emitValue = onValueChange ?? onChange;

		const commitValue = useCallback(
			(next: number) => {
				if (disabled || !emitValue) return;
				const clamped = Math.max(0, Math.min(1, next));
				if (clamped !== value) emitValue(clamped);
			},
			[disabled, emitValue, value]
		);

		// Calculate thumb size based on viewport ratio
		// Omitting viewportRatio is a wiring mistake, not a styling choice, so
		// say so in development and fall back to a full-length thumb — the
		// honest rendering of "we do not know how long the content is".
		if (process.env.NODE_ENV !== 'production' && viewportRatio === undefined) {
			console.warn(
				'Scrollbar: `viewportRatio` is required to size the thumb and the page step. ' +
					'Pass clientHeight / scrollHeight (or the width equivalent) for the scrolled region.'
			);
		}
		const effectiveViewportRatio = viewportRatio ?? 1;

		// Standard attribute wins; the camelCase alias warns once in development.
		const resolvedAriaLabel = resolveAria(
			'Scrollbar',
			'aria-label',
			'ariaLabel',
			ariaLabelAttr,
			ariaLabel
		);

		const thumbSize = Math.max(effectiveViewportRatio * 100, 10); // Minimum 10% size

		// Calculate thumb position
		const maxThumbPos = 100 - thumbSize;
		const thumbPos = value * maxThumbPos;

		// Class names
		const classNames = mergeClasses(
			styles.scrollbar,
			styles[`scrollbar--${orientation}`],
			disabled && styles['scrollbar--disabled'],
			className
		);

		// Handle arrow clicks
		const handleDecrement = useCallback(
			() => commitValue(value - step),
			[commitValue, step, value]
		);
		const handleIncrement = useCallback(
			() => commitValue(value + step),
			[commitValue, step, value]
		);

		// WAI-ARIA scrollbar keyboard interaction.
		// Arrow keys step by `step`, PageUp/PageDown step by `viewportRatio`,
		// Home/End jump to the extremes. The handler is attached to the
		// focusable track so it only fires when the scrollbar itself has focus.
		const handleKeyDown = useCallback(
			(event: React.KeyboardEvent<HTMLDivElement>) => {
				if (disabled) return;
				const decKey = isVertical ? 'ArrowUp' : 'ArrowLeft';
				const incKey = isVertical ? 'ArrowDown' : 'ArrowRight';
				switch (event.key) {
					case decKey:
						event.preventDefault();
						commitValue(value - step);
						break;
					case incKey:
						event.preventDefault();
						commitValue(value + step);
						break;
					case 'PageUp':
						event.preventDefault();
						commitValue(value - effectiveViewportRatio);
						break;
					case 'PageDown':
						event.preventDefault();
						commitValue(value + effectiveViewportRatio);
						break;
					case 'Home':
						event.preventDefault();
						commitValue(0);
						break;
					case 'End':
						event.preventDefault();
						commitValue(1);
						break;
				}
			},
			[commitValue, disabled, isVertical, step, value, effectiveViewportRatio]
		);

		// Handle track clicks
		const handleTrackClick = useCallback(
			(event: React.MouseEvent<HTMLDivElement>) => {
				if (disabled || !emitValue || !trackRef.current) return;

				const rect = trackRef.current.getBoundingClientRect();
				const clickPos = isVertical ? event.clientY - rect.top : event.clientX - rect.left;
				const trackSize = isVertical ? rect.height : rect.width;

				// Convert click position to scroll value (0-1)
				const clickRatio = clickPos / trackSize;
				const newValue = Math.max(0, Math.min(1, clickRatio));
				emitValue(newValue);
			},
			[disabled, emitValue, isVertical]
		);

		// Thumb dragging runs on the shared pointer gesture hook, which owns the
		// lifecycle: listeners attach once per gesture rather than re-binding
		// whenever a dependency changes mid-drag, and moves are coalesced into
		// one animation frame.
		//
		// The previous effect also guarded on `onChange` specifically, so a
		// consumer using only `onValueChange` could not drag the thumb at all.
		const { isActive: isDragging, start: startThumbDrag } = usePointerGesture<{
			pointer: number;
			value: number;
			trackSize: number;
		}>({
			onStart: (event) => {
				if (disabled || !emitValue) return null;
				if (event.button !== 0 || !event.isPrimary) return null;

				const track = trackRef.current;
				if (!track) return null;

				event.preventDefault();
				event.stopPropagation();

				const rect = track.getBoundingClientRect();
				return {
					pointer: isVertical ? event.clientY : event.clientX,
					value,
					// Measured once: the track cannot resize mid-drag.
					trackSize: isVertical ? rect.height : rect.width,
				};
			},
			onMove: (event, dragStart) => {
				if (dragStart.trackSize <= 0) return;
				const current = isVertical ? event.clientY : event.clientX;
				const delta = (current - dragStart.pointer) / dragStart.trackSize;
				emitValue?.(Math.max(0, Math.min(1, dragStart.value + delta)));
			},
		});

		return (
			<div ref={ref} className={classNames}>
				<button
					type="button"
					className={`${styles.arrow} ${styles['arrow--start']}`}
					onClick={handleDecrement}
					disabled={disabled}
					aria-label={isVertical ? 'Scroll up' : 'Scroll left'}
				>
					<div className={styles.arrowIcon} />
				</button>

				<div
					ref={trackRef}
					className={styles.track}
					onClick={handleTrackClick}
					onKeyDown={handleKeyDown}
					role="scrollbar"
					tabIndex={disabled ? -1 : 0}
					aria-valuenow={Math.round(value * 100)}
					aria-valuemin={0}
					aria-valuemax={100}
					aria-orientation={orientation}
					aria-label={resolvedAriaLabel}
					aria-controls={controls}
					aria-disabled={disabled || undefined}
				>
					<div
						className={mergeClasses(styles.thumb, isDragging && styles['thumb--dragging'])}
						style={{
							[isVertical ? 'height' : 'width']: `${thumbSize}%`,
							[isVertical ? 'top' : 'left']: `${thumbPos}%`,
							touchAction: 'none',
						}}
						onPointerDown={startThumbDrag}
					/>
				</div>

				<button
					type="button"
					className={`${styles.arrow} ${styles['arrow--end']}`}
					onClick={handleIncrement}
					disabled={disabled}
					aria-label={isVertical ? 'Scroll down' : 'Scroll right'}
				>
					<div className={styles.arrowIcon} />
				</button>
			</div>
		);
	}
);

Scrollbar.displayName = 'Scrollbar';

export default Scrollbar;
