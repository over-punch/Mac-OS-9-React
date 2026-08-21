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

import React, { forwardRef, useState, useRef, useEffect, useCallback, useId } from 'react';
import { mergeClasses } from '../../utils/classNames';
import { warnDeprecatedProp } from '../../utils/deprecation';
import { useWindowManager } from '../WindowManager/WindowManager';
import { useDraggable } from '../../hooks/useDraggable';
import { useResizable } from '../../hooks/useResizable';
import { clamp, measureContainingBlock, measureOffset } from '../../hooks/gestureGeometry';
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
	 * Custom class name for the content area.
	 *
	 * @deprecated Use `classes.content`. Every other single-purpose
	 * `*ClassName` prop in the library was folded into a `classes` object and
	 * removed in 2.0; this one was never marked deprecated in 1.x, so it warns
	 * through 2.x and goes away in 3.0.
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
	 *
	 * Inside a `<WindowManagerProvider>` the manager assigns the z-index by
	 * stack position and this prop is ignored — set it only for windows you
	 * are stacking by hand.
	 */
	zIndex?: number;

	/**
	 * Stable identity for this window within a `<WindowManagerProvider>`.
	 * Defaults to a generated id. Supply one when windows mount and unmount
	 * and you want stack position to survive.
	 */
	id?: string;

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
			id,
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
		// Optional z-order coordination. Outside a WindowManagerProvider this is
		// null and the component falls back to its own `active` / `zIndex`
		// props, so the manager is purely additive for existing consumers.
		const manager = useWindowManager();
		const generatedId = useId();
		const windowId = id ?? generatedId;

		useEffect(() => {
			if (!manager) return;
			manager.register(windowId);
			return () => manager.unregister(windowId);
			// `manager` identity changes whenever the stack does; depending on it
			// here would unregister and re-register on every raise.
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [windowId]);

		// Root element, used by the keyboard handlers to measure the window
		// without a DOM query.
		const windowRef = useRef<HTMLDivElement | null>(null);

		// Drag and resize both run on the shared gesture hooks, which own the
		// pointer lifecycle: listeners attach once per gesture and read their
		// callbacks through a ref, moves are coalesced into one animation frame,
		// and the geometry is measured once at gesture start and then worked in
		// pure pointer deltas — which is what makes it correct under ancestor
		// transforms, where offsetParent lies about the containing block.

		// Drag state management
		const [internalPosition, setInternalPosition] = useState<WindowPosition | null>(
			defaultPosition || null
		);
		const [hasBeenDragged, setHasBeenDragged] = useState(!!defaultPosition);

		// Resize state. `hasBeenResized` flips on the first successful resize and
		// stays true, so the size persists after pointerup rather than snapping
		// back to the width/height props.
		const [internalSize, setInternalSize] = useState<{
			width: number | string;
			height: number | string;
		}>({ width, height });
		const [hasBeenResized, setHasBeenResized] = useState(false);

		// Latest-callback refs, so the commit helpers stay referentially stable.
		const latestRef = useRef({ controlledPosition, onPositionChange, onResize });
		useEffect(() => {
			latestRef.current = { controlledPosition, onPositionChange, onResize };
		});

		// Use controlled position if provided, otherwise use internal state
		const currentPosition = controlledPosition || internalPosition;

		// A window is absolutely positioned as soon as it has a position from any
		// source. Deriving this — rather than latching it at mount — means a
		// `position` prop supplied later still takes effect (issue #26).
		const isPositioned = draggable && (hasBeenDragged || currentPosition !== null);

		// Once resized, internalSize wins so the dimensions persist.
		const currentWidth = hasBeenResized ? internalSize.width : width;
		const currentHeight = hasBeenResized ? internalSize.height : height;

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

		/** Publishes a new size. Clamping is handled by useResizable. */
		const commitSize = useCallback((next: { width: number; height: number }) => {
			setInternalSize(next);
			setHasBeenResized(true);
			latestRef.current.onResize?.(next);
		}, []);

		// The title bar is the handle, but the whole window is what moves.
		const resolveWindow = useCallback(
			(event: React.PointerEvent<HTMLElement>) =>
				(event.currentTarget as HTMLElement).closest(`.${styles.window}`) as HTMLElement | null,
			[]
		);

		/**
		 * Pin the rendered size before the window leaves normal flow.
		 *
		 * Grabbing a window switches it to `position: absolute`. Any width it
		 * was getting from its parent — a grid cell, a flex child, a `width:
		 * 100%` rule — then resolves against the positioned ancestor instead,
		 * so the window visibly jumped to a different size the instant you
		 * touched the title bar. Measuring once at the start of the gesture
		 * and committing that as an explicit size keeps it exactly the size it
		 * already was.
		 */
		const freezeSize = useCallback(() => {
			if (hasBeenResized) return;
			const node = windowRef.current;
			if (!node) return;
			const rect = node.getBoundingClientRect();
			if (rect.width === 0 && rect.height === 0) return;
			setInternalSize({ width: rect.width, height: rect.height });
			setHasBeenResized(true);
		}, [hasBeenResized]);

		const { isDragging, handleProps: dragHandleProps } = useDraggable({
			enabled: draggable,
			resolveTarget: resolveWindow,
			boundary,
			boundaryBuffer: DRAG_BOUNDARY_BUFFER,
			onDragStart: freezeSize,
			onDrag: commitPosition,
		});

		const { isResizing, getHandleProps: getResizeHandleProps } = useResizable({
			enabled: resizable,
			resolveTarget: resolveWindow,
			minWidth,
			minHeight,
			maxWidth,
			maxHeight,
			onResize: (rect) => commitSize({ width: rect.width, height: rect.height }),
		});

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
				const container = measureContainingBlock(windowElement);

				// Before the first move the window is still in normal flow, so
				// derive its origin from its offset within the containing block.
				const origin = currentPosition ?? measureOffset(windowElement);

				let x = origin.x + delta.dx * step;
				let y = origin.y + delta.dy * step;

				// The pointer path clamps inside useDraggable; the keyboard path
				// applies the same rule here.
				if (boundary === 'parent') {
					x = clamp(
						x,
						DRAG_BOUNDARY_BUFFER - windowElement.offsetWidth,
						container.width - DRAG_BOUNDARY_BUFFER
					);
					y = clamp(y, 0, container.height - DRAG_BOUNDARY_BUFFER);
				}

				commitPosition({ x, y });
			},
			[draggable, keyboardStep, currentPosition, commitPosition, boundary]
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

				commitSize({
					width: clamp(rect.width + delta.dx * step, minWidth, maxWidth ?? Number.MAX_SAFE_INTEGER),
					height: clamp(
						rect.height + delta.dy * step,
						minHeight,
						maxHeight ?? Number.MAX_SAFE_INTEGER
					),
				});
			},
			[resizable, keyboardStep, commitSize, minWidth, minHeight, maxWidth, maxHeight]
		);

		// --- Rendering --------------------------------------------------------

		// Inside a manager, "active" means "topmost in the stack"; outside one,
		// the caller's prop stands.
		const resolvedActive = manager ? manager.activeId === windowId : active;
		const resolvedZIndex = manager ? manager.getZIndex(windowId) : zIndex;

		const windowClassNames = mergeClasses(
			styles.window,
			resolvedActive ? styles['window--active'] : styles['window--inactive'],
			isPositioned && styles['window--draggable'],
			className,
			classes?.root
		);

		if (process.env.NODE_ENV !== 'production' && contentClassName && !classes?.content) {
			warnDeprecatedProp('Window', 'contentClassName', 'classes.content');
		}
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

		// The size bounds constrain layout, not just the resize gesture. They
		// used to be handed to useResizable and nowhere else, so a window with
		// `maxWidth` still laid out wider than it if its content or its parent
		// said so — the prop only took effect once you dragged the grow box.
		if (maxWidth !== undefined) windowStyle.maxWidth = maxWidth;
		if (maxHeight !== undefined) windowStyle.maxHeight = maxHeight;

		if (isPositioned && currentPosition) {
			windowStyle.position = 'absolute';
			windowStyle.left = `${currentPosition.x}px`;
			windowStyle.top = `${currentPosition.y}px`;
		}

		if (resolvedZIndex !== undefined) {
			windowStyle.zIndex = resolvedZIndex;
		}

		// Merge the forwarded ref with our internal one so keyboard handlers
		// can measure the window without a DOM query.
		const handleActivate = useCallback(() => {
			manager?.raise(windowId);
			onActivate?.();
		}, [manager, windowId, onActivate]);

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
						{...dragHandleProps}
						onKeyDown={draggable ? handleTitleBarKeyDown : undefined}
						tabIndex={draggable ? 0 : undefined}
						aria-label={draggable ? `Move ${title} window` : undefined}
						aria-keyshortcuts={draggable ? 'ArrowUp ArrowDown ArrowLeft ArrowRight' : undefined}
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
				onPointerDown={handleActivate}
				onFocusCapture={handleActivate}
			>
				{renderTitleBar()}
				<div className={contentClassNames}>{children}</div>
				{resizable && (
					<button
						type="button"
						className={mergeClasses(
							styles.resizeHandle,
							isResizing && styles['resizeHandle--active'],
							classes?.resizeHandle
						)}
						{...getResizeHandleProps('se')}
						onKeyDown={handleResizeKeyDown}
						aria-label="Resize window"
						aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight"
						title="Resize window"
					/>
				)}
			</div>
		);
	}
);

Window.displayName = 'Window';

export default Window;
