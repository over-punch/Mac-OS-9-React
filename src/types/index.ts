// Types shared across the Mac OS 9 UI library.
//
// Deliberately small. This module previously also exported BaseComponentProps,
// RenderState, State, and one-line ref aliases (ButtonRef = HTMLButtonElement
// and friends) — none of which any component referenced. Exported types are
// API: they pin down shapes, so speculative ones constrain a refactor while
// buying nobody anything (issue #76). Anything here now has a real consumer,
// and the ones components use are referenced by them so the two cannot drift
// apart again.

/**
 * Shape every component-specific `classes` object conforms to.
 *
 * There is deliberately no `[key: string]: string | undefined` index
 * signature. With one, every component's classes type silently accepted any
 * key at all, so a typo like `titlebar` for `titleBar` type-checked and then
 * did nothing at runtime.
 */
export interface ComponentClasses {
	root?: string;
}

/**
 * The variants Mac OS 9 components share.
 *
 * Referenced by Button and IconButton, so it cannot drift from what they
 * accept — which is exactly what happened before, when this read
 * `'default' | 'primary' | 'secondary'` while the components implemented
 * `'default' | 'primary' | 'danger'`.
 */
export type Variant = 'default' | 'primary' | 'danger';

/**
 * The size scale the form controls share.
 *
 * Referenced by Button, IconButton, Checkbox, Radio, TextField, Select and
 * Tabs. Icon has its own wider scale and does not use this.
 */
export type Size = 'sm' | 'md' | 'lg';

/**
 * Position of a draggable Window within its containing block, in CSS pixels.
 */
export interface WindowPosition {
	x: number;
	y: number;
}
