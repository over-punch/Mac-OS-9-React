// Window component - Mac OS 9 style
// Classic window container with optional title bar, pointer + keyboard
// driven dragging and resizing.
//
// Correctness notes (panel review):
//  - Pointer moves are coalesced into a single requestAnimationFrame tick so
//    a fast drag produces at most one React state update per frame (#21)
//  - The offsetParent rect is measured once at gesture start instead of on
//    every move; it cannot change mid-gesture (#23)
//  - Drag/resize both have full keyboard equivalents so the component
//    satisfies WCAG 2.1.1 Keyboard (#25)
//  - A `position` prop supplied after mount is honoured immediately rather
//    than waiting for the first drag (#26)
//  - The title bar pattern SVG is a module-level constant, so dragging no
//    longer re-renders 16 <rect> nodes per frame (#54)

import React, { forwardRef, useState, useRef, useEffect, useCallback } from 'react';
import { mergeClasses } from '../../utils/classNames';
import { WindowPosition } from '../../types';
import styles from './Window.module.css';

/**
 * Classes for targeting Window sub-elements
 */
export interface WindowClasses {
	/** Root container */
	root?: string;
	/** Title bar */
	titleBar?: string;
	/** Title text */
	titleText?: string;
	/** Window controls container */
	controls?: string;
	/** Individual control button */
	controlButton?: string;
	/** Content area */
	content?: string;
	/** Resize handle (grow box) */
	resizeHandle?: string;
}

export interface WindowProps {
	/**
	 * Window content
	 */
	children: React.ReactNode;

	/**
	 * Window title (displays in title bar if no titleBar prop provided)
	 */
	title?: string;

	/**
	 * Custom title bar component
	 * If provided, overrides the default title bar
	 */
	titleBar?: React.ReactNode;

	/**
	 * Whether window is active/focused.
	 *
	 * Defaults to `true` because the common case is a single standalone
	 * window, which Mac OS 9 always renders in its active state. When you
	 * render several windows, drive this from your own focus state
	 * alongside `onActivate`.
	 *
	 * @default true
	 */
	active?: boolean;

	/**
	 * Width of the window
	 * @default 'auto'
	 */
	width?: number | string;

	/**
	 * Height of the window
	 * @default 'auto'
	 */
	height?: number | string;

	/**
	 * Custom class name for the window container
	 */
	className?: string;

	/**
	 * Custom class name for the content area
	 */
	contentClassName?: string;

	/**
	 * Custom classes for targeting sub-elements
	 */
	classes?: WindowClasses;

	/**
	 * Whether to show window controls (close, minimize, maximize)
	 * @default true
	 */
	showControls?: boolean;

	/**
	 * Callback when close button is clicked
	 */
	onClose?: () => void;

	/**
	 * Callback when minimize button is clicked
	 */
	onMinimize?: () => void;

	/**
	 * Callback when maximize button is clicked
	 */
	onMaximize?: () => void;

	/**
	 * Callback when mouse enters the window
	 */
	onMouseEnter?: (event: React.MouseEvent<HTMLDivElement>) => void;

	/**
	 * Called when the user interacts with any part of the window (pointer
	 * down or keyboard focus entering it).
	 *
	 * Use this together with `zIndex` and `active` to implement
	 * click-to-front behaviour across a set of windows — the library
	 * deliberately does not own a global window manager, because stacking
	 * order belongs to the app that knows about all the windows.
	 *
	 * @example
	 * ```tsx
	 * const [order, setOrder] = useState(['a', 'b']);
	 * const raise = (id: string) =>
	 *   setOrder((prev) => [...prev.filter((w) => w !== id), id]);
	 *
	 * {order.map((id, i) => (
	 *   <Window
	 *     key={id}
	 *     zIndex={i + 1}
	 *     active={order[order.length - 1] === id}
	 *     onActivate={() => raise(id)}
	 *   />
	 * ))}
	 * ```
	 */
	onActivate?: () => void;

	/**
	 * Explicit stacking order for the window. Applied as CSS `z-index` on
	 * the root element. Pair with `onActivate` for click-to-front.
	 */
	zIndex?: number;

	/**
	 * Whether the window has a resize handle.
	 *
	 * Mac OS 9 windows resize from the bottom-right "grow box" only — there
	 * are no edge or corner handles on the other three sides. The handle is
	 * keyboard operable: focus it and use the arrow keys.
	 *
	 * @default false
	 */
	resizable?: boolean;

	/**
	 * Minimum width when resizing
	 * @default 200
	 */
	minWidth?: number;

	/**
	 * Minimum height when resizing
	 * @default 100
	 */
	minHeight?: number;

	/**
	 * Maximum width when resizing
	 */
	maxWidth?: number;

	/**
	 * Maximum height when resizing
	 */
	maxHeight?: number;

	/**
	 * Callback when window is resized
	 * Only called when resizable is true
	 */
	onResize?: (size: { width: number; height: number }) => void;

	/**
	 * Whether the window can be dragged by its title bar.
	 *
	 * The window starts in normal flow and becomes absolutely positioned
	 * once it has a position. The title bar is also focusable and moves
	 * with the arrow keys.
	 *
	 * @default false
	 */
	draggable?: boolean;

	/**
	 * Initial position for draggable windows (uncontrolled)
	 * Only used when draggable is true
	 */
	defaultPosition?: WindowPosition;

	/**
	 * Controlled position for draggable windows.
	 * Only used when draggable is true. Supplying this at any point — including
	 * after mount — immediately positions the window.
	 */
	position?: WindowPosition;

	/**
	 * Callback when window position changes (during drag or keyboard move)
	 * Only called when draggable is true
	 */
	onPositionChange?: (position: WindowPosition) => void;

	/**
	 * How drag movement is constrained.
	 *
	 * - `'parent'` (default) — at least 24px of the title bar always stays
	 *   inside the parent / offsetParent so the user can't lose the window
	 *   by flinging it off-screen.
	 * - `'none'` — no constraint. Caller is responsible for keeping the
	 *   window reachable.
	 *
	 * @default 'parent'
	 */
	boundary?: 'parent' | 'none';

	/**
	 * Pixels moved per arrow-key press when dragging or resizing with the
	 * keyboard. Holding Shift multiplies the step by 10.
	 * @default 1
	 */
	keyboardStep?: number;
}

/**
 * Minimum number of pixels of the title bar that must remain inside the
 * parent rect when `boundary="parent"` is active. Tuned to match a single
 * close-button hitbox so the user always has somewhere to grab.
 */
const DRAG_BOUNDARY_BUFFER = 24;

/** Multiplier applied to `keyboardStep` while Shift is held. */
const KEYBOARD_COARSE_MULTIPLIER = 10;

/**
 * Decorative pinstripe pattern that flanks the window title.
 *
 * Hoisted to module scope and wrapped in `React.memo` so the 16 `<rect>`
 * nodes are created once for the whole application instead of being
 * re-created on every drag frame.
 */
/**
 * Fills for the title bar pinstripe, driven by design tokens rather than
 * literal hexes so a consumer can retheme the title bar. Declared once at
 * module scope; SVG presentation attributes can't read var(), so these are
 * applied as inline styles.
 */
const PATTERN_FILL: React.CSSProperties = { fill: 'var(--window-titlebar-pattern-fill)' };
const PATTERN_HIGHLIGHT: React.CSSProperties = { fill: 'var(--window-titlebar-pattern-highlight)' };
const PATTERN_SHADE: React.CSSProperties = { fill: 'var(--window-titlebar-pattern-shade)' };
const PATTERN_STRIPE: React.CSSProperties = { fill: 'var(--window-titlebar-stripe)' };

const TitleBarPattern = React.memo(function TitleBarPattern() {
	return (
		<svg
			width="132"
			height="13"
			viewBox="0 0 132 13"
			fill="none"
			preserveAspectRatio="none"
			aria-hidden="true"
			focusable="false"
			xmlns="http://www.w3.org/2000/svg"
		>
			<rect width="130.517" height="13" style={PATTERN_FILL} />
			<rect width="1" height="13" style={PATTERN_HIGHLIGHT} />
			<rect x="130" width="1" height="13" style={PATTERN_SHADE} />
			<rect y="1" width="131.268" height="1" style={PATTERN_STRIPE} />
			<rect y="5" width="131.268" height="1" style={PATTERN_STRIPE} />
			<rect y="9" width="131.268" height="1" style={PATTERN_STRIPE} />
			<rect y="3" width="131.268" height="1" style={PATTERN_STRIPE} />
			<rect y="7" width="131.268" height="1" style={PATTERN_STRIPE} />
			<rect y="11" width="131.268" height="1" style={PATTERN_STRIPE} />
		</svg>
	);
});

/** Rect of the positioning ancestor, captured once per gesture. */
interface ParentMetrics {
	left: number;
	top: number;
	width: number;
	height: number;
}

/** Reads the metrics of an element's `offsetParent`, falling back to the viewport. */
function readParentMetrics(element: HTMLElement): ParentMetrics {
	const parent = element.offsetParent as HTMLElement | null;
	if (parent) {
		const rect = parent.getBoundingClientRect();
		return {
			left: rect.left,
			top: rect.top,
			width: parent.clientWidth,
			height: parent.clientHeight,
		};
	}
	const viewportWidth =
		typeof window !== 'undefined' ? window.innerWidth : Number.POSITIVE_INFINITY;
	const viewportHeight =
		typeof window !== 'undefined' ? window.innerHeight : Number.POSITIVE_INFINITY;
	return { left: 0, top: 0, width: viewportWidth, height: viewportHeight };
}

/**
 * Mac OS 9 style Window component
 *
 * Classic window container with title bar and content area.
 *
 * Features:
 * - Classic Mac OS 9 window styling with beveled edges
 * - Optional title bar with window controls
 * - Active/inactive states
 * - Composable with a custom title bar via the `titleBar` prop
 * - Flexible sizing
 * - Draggable windows (optional) — by pointer or keyboard
 * - Resizable windows (optional) — by pointer or keyboard
 *
 * **Positioning caveat:** drag positions are expressed in the coordinate
 * space of the window's `offsetParent`. A CSS `transform`, `filter`, or
 * `perspective` on an ancestor creates a new containing block, which
 * changes what `offsetParent` resolves to. If you drag inside a transformed
 * subtree, make the direct parent `position: relative` so the coordinate
 * space is unambiguous.
 *
 * @example
 * ```tsx
 * // Simple window with title
 * <Window title="My Window">
 *   <p>Window content goes here</p>
 * </Window>
 *
 * // Window with a custom title bar. `titleBar` replaces the default one
 * // entirely, so it owns its own markup, styling, and drag affordance.
 * <Window titleBar={<MyToolbar onClose={close} />}>
 *   <p>Content</p>
 * </Window>
 *
 * // Draggable window (uncontrolled)
 * <Window title="Draggable" draggable>
 *   <p>Drag me by the title bar, or focus it and use the arrow keys.</p>
 * </Window>
 *
 * // Controlled draggable window
 * const [pos, setPos] = useState({ x: 0, y: 0 });
 * <Window title="Controlled" draggable position={pos} onPositionChange={setPos}>
 *   <p>Parent controls position</p>
 * </Window>
 * ```
 */
export const Window = forwardRef<HTMLDivElement, WindowProps>(
	(
		{
			children,
			title,
			titleBar,
			active = true,
			width = 'auto',
			height = 'auto',
			className = '',
			contentClassName = '',
			classes,
			showControls = true,
			onClose,
			onMinimize,
			onMaximize,
			onMouseEnter,
			onActivate,
			zIndex,
			resizable = false,
			minWidth = 200,
			minHeight = 100,
			maxWidth,
			maxHeight,
			onResize,
			draggable = false,
			defaultPosition,
			position: controlledPosition,
			onPositionChange,
			boundary = 'parent',
			keyboardStep = 1,
		},
		ref
	) => {
		// Root element, used by the keyboard handlers to measure the window
		// without a DOM query.
		const windowRef = useRef<HTMLDivElement | null>(null);

		// Element captured at gesture start, so mousemove never queries the DOM.
		const dragWindowRef = useRef<HTMLElement | null>(null);

		// Parent metrics captured once per gesture — the positioning ancestor
		// cannot resize mid-drag, so re-measuring on every move was pure cost.
		const parentMetricsRef = useRef<ParentMetrics | null>(null);

		// Drag state management
		const [internalPosition, setInternalPosition] = useState<WindowPosition | null>(
			defaultPosition || null
		);
		const [isDragging, setIsDragging] = useState(false);
		const [hasBeenDragged, setHasBeenDragged] = useState(!!defaultPosition);
		const dragStartRef = useRef<{ x: number; y: number } | null>(null);

		// Resize state management. `hasBeenResized` flips to true on the first
		// successful resize and stays true thereafter; from that point on
		// `internalSize` is the canonical width/height so the user's resize
		// persists after pointerup (issue #10).
		const [internalSize, setInternalSize] = useState<{
			width: number | string;
			height: number | string;
		}>({
			width,
			height,
		});
		const [isResizing, setIsResizing] = useState(false);
		const [hasBeenResized, setHasBeenResized] = useState(false);
		const resizeStartRef = useRef<{
			width: number;
			height: number;
			pointerX: number;
			pointerY: number;
		} | null>(null);

		// requestAnimationFrame coalescing. Pointer devices fire moves far
		// faster than the browser paints; without this every event triggered a
		// React render (issue #21).
		const rafRef = useRef<number | null>(null);
		const pendingPointerRef = useRef<{ x: number; y: number } | null>(null);

		const cancelPendingFrame = useCallback(() => {
			if (rafRef.current !== null) {
				cancelAnimationFrame(rafRef.current);
				rafRef.current = null;
			}
			pendingPointerRef.current = null;
		}, []);

		// Cancel any in-flight frame if the component unmounts mid-gesture.
		useEffect(() => cancelPendingFrame, [cancelPendingFrame]);

		// Latest-callback refs. Reading from a ref inside the document pointermove
		// handler means we can leave callbacks out of the effect dependency
		// arrays — otherwise the listeners would re-attach mid-drag every time
		// the parent re-rendered (issue #9), causing dropped move events.
		const latestRef = useRef({
			controlledPosition,
			onPositionChange,
			onResize,
			minWidth,
			minHeight,
			maxWidth,
			maxHeight,
			boundary,
		});
		useEffect(() => {
			latestRef.current = {
				controlledPosition,
				onPositionChange,
				onResize,
				minWidth,
				minHeight,
				maxWidth,
				maxHeight,
				boundary,
			};
		});

		// Use controlled position if provided, otherwise use internal state
		const currentPosition = controlledPosition || internalPosition;

		// A window is absolutely positioned as soon as it has a position from
		// any source. Deriving this (rather than latching it in state at mount)
		// means a `position` prop supplied later still takes effect (issue #26).
		const isPositioned = draggable && (hasBeenDragged || currentPosition !== null);

		// Once the user has resized, internalSize wins so the dimensions
		// persist after pointerup. Before that we honor the width/height props.
		const currentWidth = hasBeenResized ? internalSize.width : width;
		const currentHeight = hasBeenResized ? internalSize.height : height;

		/**
		 * Clamps a candidate position so at least DRAG_BOUNDARY_BUFFER pixels of
		 * the window stay inside the positioning ancestor.
		 */
		const clampPosition = useCallback(
			(x: number, y: number, element: HTMLElement, metrics: ParentMetrics): WindowPosition => {
				if (latestRef.current.boundary !== 'parent') return { x, y };

				const minX = DRAG_BOUNDARY_BUFFER - element.offsetWidth;
				const maxX = metrics.width - DRAG_BOUNDARY_BUFFER;
				const minY = 0;
				const maxY = metrics.height - DRAG_BOUNDARY_BUFFER;

				return {
					x: Math.max(minX, Math.min(maxX, x)),
					y: Math.max(minY, Math.min(maxY, y)),
				};
			},
			[]
		);

		/** Publishes a new position to whichever source of truth is in charge. */
		const commitPosition = useCallback((next: WindowPosition) => {
			const { controlledPosition: liveControlled, onPositionChange: liveOnChange } =
				latestRef.current;
			if (liveControlled && liveOnChange) {
				liveOnChange(next);
			} else {
				setInternalPosition(next);
				liveOnChange?.(next);
			}
			setHasBeenDragged(true);
		}, []);

		/** Clamps and publishes a new size. */
		const commitSize = useCallback((rawWidth: number, rawHeight: number) => {
			const {
				minWidth: liveMinWidth,
				minHeight: liveMinHeight,
				maxWidth: liveMaxWidth,
				maxHeight: liveMaxHeight,
				onResize: liveOnResize,
			} = latestRef.current;

			let nextWidth = rawWidth;
			let nextHeight = rawHeight;

			if (nextWidth < liveMinWidth) nextWidth = liveMinWidth;
			if (nextHeight < liveMinHeight) nextHeight = liveMinHeight;
			if (liveMaxWidth && nextWidth > liveMaxWidth) nextWidth = liveMaxWidth;
			if (liveMaxHeight && nextHeight > liveMaxHeight) nextHeight = liveMaxHeight;

			setInternalSize({ width: nextWidth, height: nextHeight });
			setHasBeenResized(true);
			liveOnResize?.({ width: nextWidth, height: nextHeight });
		}, []);

		// Pointer-down on the title bar starts a drag. Pointer Events (instead
		// of mouse events) unify mouse, touch, and pen input so the component
		// works on tablets and phones — previously it was mouse-only.
		const handleTitleBarPointerDown = useCallback(
			(event: React.PointerEvent<HTMLDivElement>) => {
				if (!draggable) return;

				// Only react to primary button / primary contact. Ignores
				// right-click and secondary touches that browsers report
				// alongside the primary one.
				if (event.button !== 0 || !event.isPrimary) return;

				// Don't start drag if clicking on buttons
				if ((event.target as HTMLElement).closest('button')) {
					return;
				}

				event.preventDefault();

				const windowElement = (event.currentTarget as HTMLElement).closest(
					`.${styles.window}`
				) as HTMLElement;

				if (!windowElement) return;

				// Store the window element reference for use during drag
				dragWindowRef.current = windowElement;
				parentMetricsRef.current = readParentMetrics(windowElement);

				const rect = windowElement.getBoundingClientRect();
				const metrics = parentMetricsRef.current;

				// Offset from pointer to window origin, in the parent's space.
				dragStartRef.current = {
					x: event.clientX - (rect.left - metrics.left),
					y: event.clientY - (rect.top - metrics.top),
				};

				setIsDragging(true);
			},
			[draggable]
		);

		// Pointer-down on the resize handle starts a resize gesture.
		const handleResizePointerDown = useCallback(
			(event: React.PointerEvent<HTMLElement>) => {
				if (!resizable) return;
				if (event.button !== 0 || !event.isPrimary) return;

				event.preventDefault();
				event.stopPropagation();

				const windowElement = (event.currentTarget as HTMLElement).closest(
					`.${styles.window}`
				) as HTMLElement;

				if (!windowElement) return;

				const rect = windowElement.getBoundingClientRect();

				resizeStartRef.current = {
					width: rect.width,
					height: rect.height,
					pointerX: event.clientX,
					pointerY: event.clientY,
				};

				setIsResizing(true);
			},
			[resizable]
		);

		// Resize listeners. Depends only on `isResizing` so they attach once
		// when the user grabs the handle and detach on pointerup, regardless
		// of how often the parent re-renders during the gesture (issue #9).
		// Pointer events instead of mouse events give us mouse/touch/pen
		// uniformity (issue #11); pointercancel covers system interruptions.
		useEffect(() => {
			if (!isResizing) return;

			const flush = () => {
				rafRef.current = null;
				const pointer = pendingPointerRef.current;
				const start = resizeStartRef.current;
				if (!pointer || !start) return;

				commitSize(
					start.width + (pointer.x - start.pointerX),
					start.height + (pointer.y - start.pointerY)
				);
			};

			const handlePointerMove = (event: PointerEvent) => {
				if (!event.isPrimary) return;
				event.preventDefault();
				if (!resizeStartRef.current) return;

				pendingPointerRef.current = { x: event.clientX, y: event.clientY };
				if (rafRef.current === null) {
					rafRef.current = requestAnimationFrame(flush);
				}
			};

			const handlePointerEnd = () => {
				// Apply the final pointer position before tearing down, so a
				// gesture that ends between frames isn't silently dropped.
				if (rafRef.current !== null) {
					cancelAnimationFrame(rafRef.current);
					rafRef.current = null;
					flush();
				}
				pendingPointerRef.current = null;
				setIsResizing(false);
				resizeStartRef.current = null;
			};

			document.addEventListener('pointermove', handlePointerMove);
			document.addEventListener('pointerup', handlePointerEnd);
			document.addEventListener('pointercancel', handlePointerEnd);

			return () => {
				document.removeEventListener('pointermove', handlePointerMove);
				document.removeEventListener('pointerup', handlePointerEnd);
				document.removeEventListener('pointercancel', handlePointerEnd);
				cancelPendingFrame();
			};
		}, [isResizing, commitSize, cancelPendingFrame]);

		// Drag listeners. Same effect-deps strategy as resize — attach once
		// on drag start, detach on drag end (issue #9). The boundary clamp
		// (issue #12) prevents the window from being lost off-screen.
		// Pointer events for touch / pen support (issue #11).
		useEffect(() => {
			if (!isDragging) return;

			const flush = () => {
				rafRef.current = null;
				const pointer = pendingPointerRef.current;
				const start = dragStartRef.current;
				const windowElement = dragWindowRef.current;
				const metrics = parentMetricsRef.current;
				if (!pointer || !start || !windowElement || !metrics) return;

				commitPosition(
					clampPosition(
						pointer.x - metrics.left - start.x,
						pointer.y - metrics.top - start.y,
						windowElement,
						metrics
					)
				);
			};

			const handlePointerMove = (event: PointerEvent) => {
				if (!event.isPrimary) return;
				event.preventDefault();
				if (!dragStartRef.current) return;

				pendingPointerRef.current = { x: event.clientX, y: event.clientY };
				if (rafRef.current === null) {
					rafRef.current = requestAnimationFrame(flush);
				}
			};

			const handlePointerEnd = () => {
				if (rafRef.current !== null) {
					cancelAnimationFrame(rafRef.current);
					rafRef.current = null;
					flush();
				}
				pendingPointerRef.current = null;
				setIsDragging(false);
				dragStartRef.current = null;
				dragWindowRef.current = null;
				parentMetricsRef.current = null;
			};

			document.addEventListener('pointermove', handlePointerMove);
			document.addEventListener('pointerup', handlePointerEnd);
			document.addEventListener('pointercancel', handlePointerEnd);

			return () => {
				document.removeEventListener('pointermove', handlePointerMove);
				document.removeEventListener('pointerup', handlePointerEnd);
				document.removeEventListener('pointercancel', handlePointerEnd);
				cancelPendingFrame();
			};
		}, [isDragging, commitPosition, clampPosition, cancelPendingFrame]);

		// --- Keyboard equivalents (WCAG 2.1.1, issue #25) ---------------------

		/** Maps an arrow key to a unit delta, or null for any other key. */
		const arrowDelta = (key: string): { dx: number; dy: number } | null => {
			switch (key) {
				case 'ArrowLeft':
					return { dx: -1, dy: 0 };
				case 'ArrowRight':
					return { dx: 1, dy: 0 };
				case 'ArrowUp':
					return { dx: 0, dy: -1 };
				case 'ArrowDown':
					return { dx: 0, dy: 1 };
				default:
					return null;
			}
		};

		const handleTitleBarKeyDown = useCallback(
			(event: React.KeyboardEvent<HTMLDivElement>) => {
				if (!draggable) return;
				const delta = arrowDelta(event.key);
				if (!delta) return;

				const windowElement = windowRef.current;
				if (!windowElement) return;

				event.preventDefault();

				const step = keyboardStep * (event.shiftKey ? KEYBOARD_COARSE_MULTIPLIER : 1);
				const metrics = readParentMetrics(windowElement);

				// Before the first move the window is still in normal flow, so
				// derive its current origin from the live layout rect.
				const origin =
					currentPosition ??
					(() => {
						const rect = windowElement.getBoundingClientRect();
						return { x: rect.left - metrics.left, y: rect.top - metrics.top };
					})();

				commitPosition(
					clampPosition(
						origin.x + delta.dx * step,
						origin.y + delta.dy * step,
						windowElement,
						metrics
					)
				);
			},
			[draggable, keyboardStep, currentPosition, commitPosition, clampPosition]
		);

		const handleResizeKeyDown = useCallback(
			(event: React.KeyboardEvent<HTMLElement>) => {
				if (!resizable) return;
				const delta = arrowDelta(event.key);
				if (!delta) return;

				const windowElement = windowRef.current;
				if (!windowElement) return;

				event.preventDefault();

				const step = keyboardStep * (event.shiftKey ? KEYBOARD_COARSE_MULTIPLIER : 1);
				const rect = windowElement.getBoundingClientRect();

				commitSize(rect.width + delta.dx * step, rect.height + delta.dy * step);
			},
			[resizable, keyboardStep, commitSize]
		);

		// --- Rendering --------------------------------------------------------

		const windowClassNames = mergeClasses(
			styles.window,
			active ? styles['window--active'] : styles['window--inactive'],
			isPositioned && styles['window--draggable'],
			className,
			classes?.root
		);

		const contentClassNames = mergeClasses(styles.content, contentClassName, classes?.content);

		const titleBarClassNames = mergeClasses(
			styles.titleBar,
			draggable && styles['titleBar--draggable'],
			isDragging && styles['titleBar--dragging'],
			classes?.titleBar
		);

		const windowStyle: React.CSSProperties = {};

		if (currentWidth !== 'auto') {
			windowStyle.width = typeof currentWidth === 'number' ? `${currentWidth}px` : currentWidth;
		}

		if (currentHeight !== 'auto') {
			windowStyle.height = typeof currentHeight === 'number' ? `${currentHeight}px` : currentHeight;
		}

		if (isPositioned && currentPosition) {
			windowStyle.position = 'absolute';
			windowStyle.left = `${currentPosition.x}px`;
			windowStyle.top = `${currentPosition.y}px`;
		}

		if (zIndex !== undefined) {
			windowStyle.zIndex = zIndex;
		}

		// Merge the forwarded ref with our internal one so keyboard handlers
		// can measure the window without a DOM query.
		const setRootRef = useCallback(
			(node: HTMLDivElement | null) => {
				windowRef.current = node;
				if (typeof ref === 'function') {
					ref(node);
				} else if (ref) {
					(ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
				}
			},
			[ref]
		);

		const renderTitleBar = () => {
			if (titleBar) {
				return titleBar;
			}

			if (title) {
				return (
					<div
						className={titleBarClassNames}
						data-num-controls={[onClose, onMinimize, onMaximize].filter(Boolean).length}
						onPointerDown={handleTitleBarPointerDown}
						onKeyDown={draggable ? handleTitleBarKeyDown : undefined}
						tabIndex={draggable ? 0 : undefined}
						aria-label={draggable ? `Move ${title} window` : undefined}
						aria-keyshortcuts={draggable ? 'ArrowUp ArrowDown ArrowLeft ArrowRight' : undefined}
						style={draggable ? { touchAction: 'none' } : undefined}
					>
						{showControls && (
							<div className={mergeClasses(styles.controls, classes?.controls)}>
								{onClose && (
									<button
										type="button"
										className={mergeClasses(styles.controlButton, classes?.controlButton)}
										onClick={onClose}
										aria-label="Close"
										title="Close"
									>
										<div className={styles.closeBox} />
									</button>
								)}
								{onMinimize && (
									<button
										type="button"
										className={mergeClasses(styles.controlButton, classes?.controlButton)}
										onClick={onMinimize}
										aria-label="Minimize"
										title="Minimize"
									>
										<div className={styles.minimizeBox} />
									</button>
								)}
								{onMaximize && (
									<button
										type="button"
										className={mergeClasses(styles.controlButton, classes?.controlButton)}
										onClick={onMaximize}
										aria-label="Maximize"
										title="Maximize"
									>
										<div className={styles.maximizeBox} />
									</button>
								)}
							</div>
						)}
						<div className={styles.titleCenter}>
							<TitleBarPattern />
							<div className={mergeClasses(styles.titleText, classes?.titleText, 'bold')}>
								{title}
							</div>
							<TitleBarPattern />
						</div>
					</div>
				);
			}

			return null;
		};

		return (
			<div
				ref={setRootRef}
				className={windowClassNames}
				style={windowStyle}
				onMouseEnter={onMouseEnter}
				onPointerDown={onActivate}
				onFocusCapture={onActivate}
			>
				{renderTitleBar()}
				<div className={contentClassNames}>{children}</div>
				{resizable && (
					<button
						type="button"
						className={mergeClasses(styles.resizeHandle, classes?.resizeHandle)}
						onPointerDown={handleResizePointerDown}
						onKeyDown={handleResizeKeyDown}
						aria-label="Resize window"
						aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight"
						title="Resize window"
						style={{ touchAction: 'none' }}
					/>
				)}
			</div>
		);
	}
);

Window.displayName = 'Window';

export default Window;
