// Scrollbar component - Mac OS 9 style
// Classic scrollbar with arrows and draggable thumb

'use client';

import React, { forwardRef, useRef, useState, useEffect, useCallback } from 'react';
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
	 * Viewport size relative to content size (0-1)
	 * Used to calculate thumb size AND the page-step size for
	 * PageUp/PageDown keyboard navigation.
	 */
	viewportRatio?: number;

	/**
	 * Callback when scroll position changes
	 */
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
 *   onChange={(value) => console.log('Scroll position:', value)}
 * />
 * ```
 */
export const Scrollbar = forwardRef<HTMLDivElement, ScrollbarProps>(
	(
		{
			orientation = 'vertical',
			value = 0,
			viewportRatio = 0.2,
			onChange,
			className = '',
			disabled = false,
			ariaLabel,
			controls,
			step = 0.1,
		},
		ref
	) => {
		const trackRef = useRef<HTMLDivElement>(null);
		const [isDragging, setIsDragging] = useState(false);
		const [dragStartPos, setDragStartPos] = useState(0);
		const [dragStartValue, setDragStartValue] = useState(0);

		const isVertical = orientation === 'vertical';

		// Helper used by both arrow buttons and keyboard handler to clamp
		// the next value into the valid 0-1 range before notifying.
		const commitValue = useCallback(
			(next: number) => {
				if (disabled || !onChange) return;
				const clamped = Math.max(0, Math.min(1, next));
				if (clamped !== value) onChange(clamped);
			},
			[disabled, onChange, value]
		);

		// Calculate thumb size based on viewport ratio
		const thumbSize = Math.max(viewportRatio * 100, 10); // Minimum 10% size

		// Calculate thumb position
		const maxThumbPos = 100 - thumbSize;
		const thumbPos = value * maxThumbPos;

		// Class names
		const classNames = [
			styles.scrollbar,
			styles[`scrollbar--${orientation}`],
			disabled && styles['scrollbar--disabled'],
			className,
		]
			.filter(Boolean)
			.join(' ');

		// Handle arrow clicks
		const handleDecrement = useCallback(() => commitValue(value - step), [commitValue, step, value]);
		const handleIncrement = useCallback(() => commitValue(value + step), [commitValue, step, value]);

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
						commitValue(value - viewportRatio);
						break;
					case 'PageDown':
						event.preventDefault();
						commitValue(value + viewportRatio);
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
			[commitValue, disabled, isVertical, step, value, viewportRatio]
		);

		// Handle track clicks
		const handleTrackClick = useCallback(
			(event: React.MouseEvent<HTMLDivElement>) => {
				if (disabled || !onChange || !trackRef.current) return;

				const rect = trackRef.current.getBoundingClientRect();
				const clickPos = isVertical
					? event.clientY - rect.top
					: event.clientX - rect.left;
				const trackSize = isVertical ? rect.height : rect.width;

				// Convert click position to scroll value (0-1)
				const clickRatio = clickPos / trackSize;
				const newValue = Math.max(0, Math.min(1, clickRatio));
				onChange(newValue);
			},
			[disabled, onChange, isVertical]
		);

		// Handle thumb drag start
		const handleThumbMouseDown = useCallback(
			(event: React.MouseEvent) => {
				if (disabled) return;
				event.preventDefault();
				event.stopPropagation();
				setIsDragging(true);
				setDragStartPos(isVertical ? event.clientY : event.clientX);
				setDragStartValue(value);
			},
			[disabled, isVertical, value]
		);

		// Handle drag move
		useEffect(() => {
			if (!isDragging || !onChange || !trackRef.current) return;

			const handleMouseMove = (event: MouseEvent) => {
				const currentPos = isVertical ? event.clientY : event.clientX;
				const delta = currentPos - dragStartPos;

				const rect = trackRef.current!.getBoundingClientRect();
				const trackSize = isVertical ? rect.height : rect.width;
				const deltaRatio = delta / trackSize;

				const newValue = Math.max(0, Math.min(1, dragStartValue + deltaRatio));
				onChange(newValue);
			};

			const handleMouseUp = () => {
				setIsDragging(false);
			};

			document.addEventListener('mousemove', handleMouseMove);
			document.addEventListener('mouseup', handleMouseUp);

			return () => {
				document.removeEventListener('mousemove', handleMouseMove);
				document.removeEventListener('mouseup', handleMouseUp);
			};
		}, [isDragging, dragStartPos, dragStartValue, onChange, isVertical]);

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
					aria-label={ariaLabel}
					aria-controls={controls}
					aria-disabled={disabled || undefined}
				>
					<div
						className={styles.thumb}
						style={{
							[isVertical ? 'height' : 'width']: `${thumbSize}%`,
							[isVertical ? 'top' : 'left']: `${thumbPos}%`,
						}}
						onMouseDown={handleThumbMouseDown}
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
