// Public hook surface for the component library.
//
// These are the primitives the components themselves are built on. They are
// exported because an app extending the library — a custom window chrome, its
// own menu — needs the same pointer lifecycle, dismissal and placement
// behaviour, and re-implementing them is exactly how the duplication in
// issue #55 arose in the first place.

export { usePointerGesture } from './usePointerGesture';
export type { PointerGesture, PointerGestureHandlers } from './usePointerGesture';

export { useDraggable } from './useDraggable';
export type { DragPoint, UseDraggableOptions, UseDraggableResult } from './useDraggable';

export { useResizable } from './useResizable';
export type {
	ResizeDirection,
	ResizeRect,
	UseResizableOptions,
	UseResizableResult,
} from './useResizable';

export { useOutsideClick } from './useOutsideClick';
export type { UseOutsideClickOptions } from './useOutsideClick';

export { useMenuPosition } from './useMenuPosition';
export type { MenuPosition, UseMenuPositionOptions } from './useMenuPosition';

export { clamp, measureContainingBlock, measureOffset } from './gestureGeometry';
export type { ContainingBlock } from './gestureGeometry';
