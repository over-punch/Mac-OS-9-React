// Common types used across the Mac OS 9 UI library

/**
 * Generic classes object for targeting sub-elements within components.
 * Components extend this with specific element keys.
 *
 * There is deliberately no `[key: string]: string | undefined` index
 * signature. With one, every component-specific classes type — WindowClasses,
 * ListViewClasses — silently accepted any key at all, so a typo like
 * `titlebar` for `titleBar` type-checked and then did nothing at runtime.
 * Component types satisfy this constraint structurally without it.
 */
export interface ComponentClasses {
	root?: string;
}

/**
 * Base component props that all components should extend
 * @template TClasses - Specific classes type for the component
 */
export interface BaseComponentProps<TClasses extends ComponentClasses = ComponentClasses> {
	/** Additional CSS class name for root element */
	className?: string;
	/** Inline styles */
	style?: React.CSSProperties;
	/** Custom classes for targeting sub-elements */
	classes?: TClasses;
	/** Test ID for testing purposes */
	'data-testid'?: string;
}

/**
 * Common render state interface for render prop patterns
 * Provides information about element state for conditional rendering
 */
export interface RenderState {
	/** Whether the element is being hovered */
	isHovered?: boolean;
	/** Whether the element is selected */
	isSelected?: boolean;
	/** Whether the element is in active state (e.g., pressed) */
	isActive?: boolean;
	/** Whether the element has keyboard focus */
	isFocused?: boolean;
	/** Whether the element is disabled */
	isDisabled?: boolean;
}

/**
 * Common variant types for Mac OS 9 components.
 *
 * This mirrors what the components actually accept. It previously read
 * `'default' | 'primary' | 'secondary'` while Button and IconButton
 * implemented `'default' | 'primary' | 'danger'` — so the exported type
 * named a variant no component had and omitted one every component did.
 */
export type Variant = 'default' | 'primary' | 'danger';

/**
 * Common size types.
 *
 * Abbreviated to match the components. The exported type previously read
 * `'small' | 'medium' | 'large'` while every component's `size` prop took
 * `'sm' | 'md' | 'lg'`, making the shared type unusable with any of them.
 */
export type Size = 'sm' | 'md' | 'lg';

/**
 * Common state types
 */
export type State = 'default' | 'hover' | 'active' | 'disabled' | 'focused';

/**
 * Window position for draggable windows
 */
export interface WindowPosition {
	x: number;
	y: number;
}

/**
 * Component ref types
 */
export type ButtonRef = HTMLButtonElement;
export type InputRef = HTMLInputElement;
export type SelectRef = HTMLSelectElement;
export type TextAreaRef = HTMLTextAreaElement;
export type DivRef = HTMLDivElement;
