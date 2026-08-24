// ImageWell component - Mac OS 9 style
//
// A sunken well holding an image you can drop a new one into — the control
// the Appearance and Desktop Pictures control panels used for the current
// picture.
//
// Drag and drop cannot be the only way in. A well that only accepts a drop is
// unusable by keyboard and by anyone who cannot drag, so this is a button
// that also accepts drops: Return or Space opens the picker, and a drop is a
// shortcut for people who can.

import { forwardRef, useCallback, useState, type DragEvent, type ReactNode } from 'react';
import { mergeClasses } from '../../utils/classNames';
import styles from './ImageWell.module.css';

/**
 * Classes for targeting ImageWell sub-elements.
 */
export interface ImageWellClasses {
	/** The sunken well. */
	root?: string;
	/** The image inside it. */
	image?: string;
	/** The empty-state content. */
	empty?: string;
}

export interface ImageWellProps {
	/**
	 * Source of the image currently in the well. Leave empty for the empty
	 * state.
	 */
	src?: string;

	/**
	 * Description of the current image, for assistive tech.
	 *
	 * The well's own accessible name says what the control does; this says
	 * what is in it. Both matter — "Desktop picture" and "Mount Fuji at
	 * dawn" answer different questions.
	 */
	imageAlt?: string;

	/**
	 * What the well is for, e.g. "Desktop picture". Names the control.
	 */
	label: string;

	/**
	 * Shown when the well is empty.
	 */
	placeholder?: ReactNode;

	/**
	 * Called with dropped files, or with the files chosen however `onBrowse`
	 * collects them.
	 */
	onFiles?: (files: File[]) => void;

	/**
	 * Called when the well is activated by click or keyboard.
	 *
	 * This is the accessible route in. Without it the well is drop-only,
	 * which is unusable without a pointer.
	 */
	onBrowse?: () => void;

	/**
	 * Whether the well accepts anything.
	 * @default false
	 */
	disabled?: boolean;

	/**
	 * Additional CSS class names.
	 */
	className?: string;

	/**
	 * Classes for targeting sub-elements.
	 */
	classes?: ImageWellClasses;
}

/**
 * Mac OS 9 style image well.
 *
 * @example
 * ```tsx
 * <ImageWell
 *   label="Desktop picture"
 *   src={picture}
 *   imageAlt="Mount Fuji at dawn"
 *   onBrowse={openPicker}
 *   onFiles={([file]) => setPicture(URL.createObjectURL(file))}
 * />
 * ```
 */
export const ImageWell = forwardRef<HTMLButtonElement, ImageWellProps>(
	(
		{
			src,
			imageAlt,
			label,
			placeholder,
			onFiles,
			onBrowse,
			disabled = false,
			className = '',
			classes,
		},
		ref
	) => {
		const [dragging, setDragging] = useState(false);

		const stop = (event: DragEvent) => {
			event.preventDefault();
			event.stopPropagation();
		};

		const handleDrop = useCallback(
			(event: DragEvent<HTMLButtonElement>) => {
				stop(event);
				setDragging(false);
				if (disabled) return;
				const files = Array.from(event.dataTransfer.files);
				if (files.length) onFiles?.(files);
			},
			[disabled, onFiles]
		);

		return (
			<button
				ref={ref}
				type="button"
				// The well is a button first. Everything below is an extra way
				// to reach the same action.
				aria-label={label}
				disabled={disabled}
				onClick={onBrowse}
				onDragOver={(event) => {
					stop(event);
					if (!disabled) setDragging(true);
				}}
				onDragEnter={stop}
				onDragLeave={() => setDragging(false)}
				onDrop={handleDrop}
				className={mergeClasses(
					styles.well,
					dragging && styles['well--dragging'],
					className,
					classes?.root
				)}
			>
				{src ? (
					<img
						src={src}
						// Empty alt where no description was given: the button is
						// already named, so an unnamed image would announce the
						// filename or nothing useful.
						alt={imageAlt ?? ''}
						className={mergeClasses(styles.image, classes?.image)}
						draggable={false}
					/>
				) : (
					<span className={mergeClasses(styles.empty, classes?.empty)} aria-hidden="true">
						{placeholder}
					</span>
				)}
			</button>
		);
	}
);

ImageWell.displayName = 'ImageWell';

export default ImageWell;
