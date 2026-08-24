// Separator component - Mac OS 9 style
//
// The engraved rule that divided a dialog into sections. It is two 1px lines,
// not one: a dark line with a light line beneath it, which is what makes it
// look cut into the surface rather than drawn on top.

import { forwardRef } from 'react';
import { mergeClasses } from '../../utils/classNames';
import styles from './Separator.module.css';

export interface SeparatorProps {
	/**
	 * Which way the rule runs.
	 * @default 'horizontal'
	 */
	orientation?: 'horizontal' | 'vertical';

	/**
	 * Whether the rule carries meaning for assistive tech.
	 *
	 * A rule that merely groups things visually is decoration, and announcing
	 * it adds noise. One that genuinely separates — between unrelated groups
	 * of controls — is a real separator. Defaults to decorative because that
	 * is the common case.
	 * @default true
	 */
	decorative?: boolean;

	/**
	 * Additional CSS class names.
	 */
	className?: string;
}

/**
 * Mac OS 9 style engraved separator.
 *
 * @example
 * ```tsx
 * <Separator />
 * <Separator orientation="vertical" />
 * <Separator decorative={false} />
 * ```
 */
export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(
	({ orientation = 'horizontal', decorative = true, className = '' }, ref) => (
		<div
			ref={ref}
			// A decorative rule is hidden outright; `role="none"` alone would
			// leave it in the accessibility tree as an unnamed generic.
			role={decorative ? undefined : 'separator'}
			aria-hidden={decorative || undefined}
			aria-orientation={decorative ? undefined : orientation}
			className={mergeClasses(styles.separator, styles[`separator--${orientation}`], className)}
		/>
	)
);

Separator.displayName = 'Separator';

export default Separator;
