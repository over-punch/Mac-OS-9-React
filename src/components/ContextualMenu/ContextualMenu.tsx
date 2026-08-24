// ContextualMenu component - Mac OS 9 style
//
// Right-click menus arrived in Mac OS 8 and the library had no contextmenu
// handling anywhere — every consumer wanting one had to build the whole thing.
//
// Two ways in, because a contextual menu reached only by right-click is
// unreachable without a pointer: the platform's own context-menu key and
// Shift+F10 open it too, anchored to the focused element rather than to a
// pointer that is not there.

import {
	forwardRef,
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
	type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { mergeClasses } from '../../utils/classNames';
import { type MenuItemData } from '../MenuBar';
import styles from './ContextualMenu.module.css';

/** Gap kept between the menu and the edge of the viewport. */
const EDGE_PADDING = 8;

/**
 * Classes for targeting ContextualMenu sub-elements.
 */
export interface ContextualMenuClasses {
	/** The region that listens for the gesture. */
	root?: string;
	/** The floating menu. */
	menu?: string;
	/** A menu item. */
	item?: string;
}

export interface ContextualMenuProps {
	/**
	 * The menu's contents.
	 *
	 * An item with `separator: true` renders a divider and is skipped by the
	 * keyboard, since there is nothing there to choose.
	 */
	items: MenuItemData[];

	/**
	 * Called with the chosen item.
	 */
	onSelect?: (item: MenuItemData) => void;

	/**
	 * Accessible name for the menu.
	 */
	'aria-label'?: string;

	/**
	 * The region the gesture applies to.
	 */
	children: ReactNode;

	/**
	 * Whether the menu can be opened at all.
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
	classes?: ContextualMenuClasses;
}

/** Where the menu is pinned, in viewport coordinates. */
interface Anchor {
	x: number;
	y: number;
}

/**
 * Mac OS 9 style contextual menu.
 *
 * @example
 * ```tsx
 * <ContextualMenu
 *   aria-label="File actions"
 *   items={[
 *     { label: 'Open' },
 *     { label: 'Get Info', shortcut: '⌘I' },
 *     { separator: true, label: '' },
 *     { label: 'Move to Trash' },
 *   ]}
 *   onSelect={(item) => run(item.label)}
 * >
 *   <FileIcon />
 * </ContextualMenu>
 * ```
 */
export const ContextualMenu = forwardRef<HTMLDivElement, ContextualMenuProps>(
	(
		{
			items,
			onSelect,
			children,
			disabled = false,
			className = '',
			classes,
			'aria-label': ariaLabel,
		},
		ref
	) => {
		const [anchor, setAnchor] = useState<Anchor | null>(null);
		const [activeIndex, setActiveIndex] = useState(0);
		const menuRef = useRef<HTMLDivElement>(null);
		const regionRef = useRef<HTMLDivElement | null>(null);
		// Where focus came from, so closing can put it back rather than
		// dropping it on the body.
		const restoreTo = useRef<HTMLElement | null>(null);

		/** Indices that can actually be chosen — separators cannot. */
		const selectable = items
			.map((item, index) => ({ item, index }))
			.filter(({ item }) => !item.separator && !item.disabled)
			.map(({ index }) => index);

		const open = useCallback(
			(at: Anchor) => {
				if (disabled) return;
				restoreTo.current =
					document.activeElement instanceof HTMLElement ? document.activeElement : null;
				setAnchor(at);
				setActiveIndex(selectable[0] ?? 0);
			},
			[disabled, selectable]
		);

		const close = useCallback(() => {
			setAnchor(null);
			const previous = restoreTo.current;
			if (previous?.isConnected) previous.focus();
		}, []);

		const choose = useCallback(
			(index: number) => {
				const item = items[index];
				if (!item || item.disabled || item.separator) return;
				onSelect?.(item);
				close();
			},
			[items, onSelect, close]
		);

		// Focus the menu once it exists, so the arrow keys reach it.
		useLayoutEffect(() => {
			if (anchor) menuRef.current?.focus();
		}, [anchor]);

		// Clamp into the viewport after measuring. A menu opened near the
		// bottom-right would otherwise run off the screen with no way to
		// scroll to it.
		const [style, setStyle] = useState<React.CSSProperties>({});
		useLayoutEffect(() => {
			if (!anchor) return;
			const menu = menuRef.current;
			if (!menu) return;
			const { width, height } = menu.getBoundingClientRect();
			const maxX = window.innerWidth - width - EDGE_PADDING;
			const maxY = window.innerHeight - height - EDGE_PADDING;
			setStyle({
				left: Math.max(EDGE_PADDING, Math.min(anchor.x, maxX)),
				top: Math.max(EDGE_PADDING, Math.min(anchor.y, maxY)),
			});
		}, [anchor]);

		useEffect(() => {
			if (!anchor) return;
			const onPointerDown = (event: PointerEvent) => {
				if (!menuRef.current?.contains(event.target as Node)) close();
			};
			// Scrolling or resizing moves the thing the menu was pinned to, so
			// the menu is no longer pointing at anything.
			const onDismiss = () => close();

			document.addEventListener('pointerdown', onPointerDown, true);
			window.addEventListener('scroll', onDismiss, true);
			window.addEventListener('resize', onDismiss);
			return () => {
				document.removeEventListener('pointerdown', onPointerDown, true);
				window.removeEventListener('scroll', onDismiss, true);
				window.removeEventListener('resize', onDismiss);
			};
		}, [anchor, close]);

		const step = (direction: 1 | -1) => {
			if (!selectable.length) return;
			const current = selectable.indexOf(activeIndex);
			const next = (current + direction + selectable.length) % selectable.length;
			setActiveIndex(selectable[next] ?? activeIndex);
		};

		const handleMenuKeyDown = (event: React.KeyboardEvent) => {
			switch (event.key) {
				case 'ArrowDown':
					event.preventDefault();
					step(1);
					break;
				case 'ArrowUp':
					event.preventDefault();
					step(-1);
					break;
				case 'Home':
					event.preventDefault();
					setActiveIndex(selectable[0] ?? 0);
					break;
				case 'End':
					event.preventDefault();
					setActiveIndex(selectable[selectable.length - 1] ?? 0);
					break;
				case 'Enter':
				case ' ':
					event.preventDefault();
					choose(activeIndex);
					break;
				case 'Escape':
					event.preventDefault();
					close();
					break;
				case 'Tab':
					// Tabbing away from an open menu closes it rather than
					// leaving it floating over whatever you moved to.
					close();
					break;
				default:
					break;
			}
		};

		const handleRegionKeyDown = (event: React.KeyboardEvent) => {
			// ContextMenu is the dedicated key; Shift+F10 is the same gesture
			// on keyboards without one. Both anchor to the focused element,
			// because there is no pointer to anchor to.
			const wants = event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10');
			if (!wants) return;
			event.preventDefault();
			const target = event.target instanceof HTMLElement ? event.target : regionRef.current;
			const rect = target?.getBoundingClientRect();
			open({ x: rect?.left ?? 0, y: rect?.bottom ?? 0 });
		};

		return (
			<div
				ref={(node) => {
					regionRef.current = node;
					if (typeof ref === 'function') ref(node);
					// A forwarded ref object is typed readonly, but assigning
					// through it is exactly what forwarding one means.
					else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
				}}
				className={mergeClasses(styles.region, className, classes?.root)}
				onContextMenu={(event) => {
					if (disabled) return;
					event.preventDefault();
					open({ x: event.clientX, y: event.clientY });
				}}
				onKeyDown={handleRegionKeyDown}
			>
				{children}

				{anchor !== null &&
					createPortal(
						<div
							ref={menuRef}
							role="menu"
							aria-label={ariaLabel}
							tabIndex={-1}
							onKeyDown={handleMenuKeyDown}
							className={mergeClasses(styles.menu, classes?.menu)}
							style={style}
						>
							{items.map((item, index) =>
								item.separator ? (
									<div key={`separator-${index}`} role="separator" className={styles.separator} />
								) : (
									<div
										key={item.label}
										role="menuitem"
										aria-disabled={item.disabled || undefined}
										// The menu holds focus and points at the
										// current item, which is what lets a
										// separator be skipped without it ever
										// having been focusable.
										id={`item-${index}`}
										className={mergeClasses(
											styles.item,
											index === activeIndex && styles['item--active'],
											item.disabled && styles['item--disabled'],
											classes?.item
										)}
										onPointerEnter={() => !item.disabled && setActiveIndex(index)}
										onClick={() => choose(index)}
									>
										<span className={styles.label}>{item.label}</span>
										{item.shortcut && <span className={styles.shortcut}>{item.shortcut}</span>}
									</div>
								)
							)}
						</div>,
						document.body
					)}
			</div>
		);
	}
);

ContextualMenu.displayName = 'ContextualMenu';

export default ContextualMenu;
