// ListView component - Mac OS 9 style multi-column list
// List view with sortable columns and row selection

// Note: no per-file 'use client' directive. The library ships as a single
// bundle and Rollup applies the "use client" banner to the whole output,
// so per-file directives were both inconsistent (4 of 16 components) and
// silently dropped at bundle time.

import React, { forwardRef, useState, useCallback, useEffect, useId, useMemo, useRef } from 'react';
import { mergeClasses } from '../../utils/classNames';
import { resolveAria } from '../../utils/aria';
import styles from './ListView.module.css';

export interface ListColumn {
	/**
	 * Column key/identifier
	 */
	key: string;

	/**
	 * Column header label
	 */
	label: string;

	/**
	 * Column width (px or percentage)
	 * @default 'auto'
	 */
	width?: number | string;

	/**
	 * Whether column is sortable
	 * @default true
	 */
	sortable?: boolean;
}

/**
 * A row in a ListView.
 *
 * The index signature is `unknown`, not `any`. `any` disabled type checking
 * on every property read from a row — `item.nmae` compiled, and so did
 * `item.size.toFixed(2)` on a string. Parameterise `ListView` with your own
 * row type to get real types back:
 *
 * ```tsx
 * interface FileRow extends ListItem {
 *   name: string;
 *   size: number;
 * }
 *
 * <ListView<FileRow> items={files} columns={columns} />
 * ```
 */
export interface ListItem {
	/**
	 * Unique item ID
	 */
	id: string;

	/**
	 * Optional icon to display
	 */
	icon?: React.ReactNode;

	/**
	 * Item data - keys should match column keys
	 */
	[key: string]: unknown;
}

/**
 * Classes for targeting ListView sub-elements
 */
export interface ListViewClasses {
	/** Root container */
	root?: string;
	/** Header row container */
	header?: string;
	/** Individual header cell */
	headerCell?: string;
	/** Body container (scrollable area) */
	body?: string;
	/** Individual row */
	row?: string;
	/** Individual cell */
	cell?: string;
	/** Empty-state container */
	empty?: string;
	/** Loading-state container */
	loading?: string;
}

/**
 * Row render prop state
 */
export interface RowRenderState {
	/** Whether this row is selected */
	isSelected: boolean;
	/** Whether this row is being hovered */
	isHovered: boolean;
	/** Row index in the list */
	index: number;
}

/**
 * Row render prop default props
 * Spread these on your custom element for accessibility and behavior
 */
export interface RowDefaultProps {
	key: string;
	id: string;
	className: string;
	/** Listbox option semantics — spread these to keep the row accessible. */
	role: 'option';
	'aria-selected': boolean;
	/** Roving tabindex: 0 on the active row, -1 on the rest. */
	tabIndex: number;
	onKeyDown: (e: React.KeyboardEvent) => void;
	onClick: (e: React.MouseEvent) => void;
	onDoubleClick: () => void;
	onMouseEnter: () => void;
	onMouseLeave: () => void;
	'data-selected': boolean;
	'data-index': number;
	'data-item-id': string;
}

/**
 * Cell render prop state
 */
export interface CellRenderState {
	/** Whether this cell is being hovered */
	isHovered: boolean;
	/** Whether the row containing this cell is selected */
	isRowSelected: boolean;
	/** Column index */
	columnIndex: number;
	/** Row index */
	rowIndex: number;
}

/**
 * Header cell render prop state
 */
export interface HeaderCellRenderState {
	/** Whether this column is currently sorted */
	isSorted: boolean;
	/** Current sort direction if sorted */
	sortDirection?: 'asc' | 'desc';
}

/**
 * Header cell render prop default props
 */
export interface HeaderCellDefaultProps {
	key: string;
	className: string;
	style: React.CSSProperties;
	onClick: () => void;
	/** Present on sortable columns, which behave as buttons. */
	role?: 'button';
	tabIndex?: number;
	/** Column label plus sort state; aria-sort is not valid on a button. */
	'aria-label'?: string;
	onKeyDown?: (event: React.KeyboardEvent) => void;
	'data-column': string;
	'data-sortable': boolean;
	'data-sorted'?: boolean;
	'data-sort-direction'?: 'asc' | 'desc';
}

export interface ListViewProps<TItem extends ListItem = ListItem> {
	/**
	 * Column definitions.
	 *
	 * Declared `readonly` because ListView never mutates it — this lets you
	 * pass an `as const` array or a frozen array without a cast.
	 */
	columns: readonly ListColumn[];

	/**
	 * List items. Never mutated by ListView.
	 */
	items: readonly TItem[];

	/**
	 * Selected item IDs. Never mutated by ListView.
	 */
	selectedIds?: readonly string[];

	/**
	 * Callback when selection changes
	 */
	onSelectionChange?: (selectedIds: string[]) => void;

	/**
	 * Callback when item is double-clicked
	 */
	onItemOpen?: (item: TItem) => void;

	/**
	 * Callback when mouse enters an item (row-level)
	 */
	onItemMouseEnter?: (item: TItem) => void;

	/**
	 * Callback when mouse leaves an item (row-level)
	 */
	onItemMouseLeave?: (item: TItem) => void;

	/**
	 * Callback when column is clicked for sorting
	 */
	onSort?: (columnKey: string, direction: 'asc' | 'desc') => void;

	/**
	 * Additional CSS class names
	 */
	className?: string;

	/**
	 * Height of the list view
	 */
	height?: number | string;

	/**
	 * Custom classes for targeting sub-elements
	 */
	classes?: ListViewClasses;

	/**
	 * Accessible name for the list.
	 *
	 * The rows form a listbox, and a listbox needs a name for a screen reader
	 * to announce what is being chosen from. Supply this, or `ariaLabelledBy`
	 * pointing at a visible heading.
	 *
	 * @default 'List'
	 */
	'aria-label'?: string;

	/**
	 * ID of a visible element naming the list. Takes precedence over
	 * `aria-label`.
	 */
	'aria-labelledby'?: string;

	/** @deprecated Use `aria-label`. */
	ariaLabel?: string;

	/** @deprecated Use `aria-labelledby`. */
	ariaLabelledBy?: string;

	/**
	 * Content shown in place of the rows when `items` is empty and the list
	 * is not loading. Without this the component renders an empty box, which
	 * reads as a broken list rather than an empty one.
	 *
	 * @default 'No items'
	 */
	emptyState?: React.ReactNode;

	/**
	 * Whether the list is waiting on data. While true, `loadingState` is
	 * shown instead of the rows and the body is marked `aria-busy`.
	 *
	 * @default false
	 */
	loading?: boolean;

	/**
	 * Content shown in place of the rows while `loading` is true.
	 *
	 * @default 'Loading…'
	 */
	loadingState?: React.ReactNode;

	/**
	 * Override row rendering
	 * @param item - The list item
	 * @param state - Row state (selected, hovered, index)
	 * @param defaultProps - Props to spread on custom element for accessibility
	 * @returns Custom row element (fully replaces default)
	 */
	renderRow?: (
		item: TItem,
		state: RowRenderState,
		defaultProps: RowDefaultProps
	) => React.ReactNode;

	/**
	 * Override cell rendering
	 * @param value - Cell value (item[columnKey])
	 * @param item - Full item object
	 * @param column - Column definition
	 * @param state - Cell state (hovered, selected row, indices)
	 * @returns Custom cell content (fully replaces default)
	 */
	renderCell?: (
		value: unknown,
		item: TItem,
		column: ListColumn,
		state: CellRenderState
	) => React.ReactNode;

	/**
	 * Override header cell rendering
	 * @param column - Column definition
	 * @param state - Header state (sorted, direction)
	 * @param defaultProps - Props to spread on custom element
	 * @returns Custom header cell element (fully replaces default)
	 */
	renderHeaderCell?: (
		column: ListColumn,
		state: HeaderCellRenderState,
		defaultProps: HeaderCellDefaultProps
	) => React.ReactNode;

	/**
	 * Callback when a cell is clicked
	 */
	onCellClick?: (item: TItem, column: ListColumn, event: React.MouseEvent) => void;

	/**
	 * Callback when mouse enters a cell
	 */
	onCellMouseEnter?: (item: TItem, column: ListColumn) => void;

	/**
	 * Callback when mouse leaves a cell
	 */
	onCellMouseLeave?: (item: TItem, column: ListColumn) => void;
}

/**
 * Coerces an arbitrary cell value into something React can render.
 *
 * Rows are typed with an `unknown` index signature, so a value read out of
 * one is not automatically a ReactNode.
 */
function renderValue(value: unknown): React.ReactNode {
	if (value === null || value === undefined || typeof value === 'boolean') return null;
	if (typeof value === 'string' || typeof value === 'number') return value;
	if (React.isValidElement(value)) return value;
	return String(value);
}

/**
 * A single ListView row.
 *
 * Extracted and memoised because hover state lives in the parent: without
 * this, moving the pointer across a 500-row list re-rendered all 500 rows on
 * every row boundary. Now only the row being left and the row being entered
 * re-render. Every callback prop below is referentially stable for the life
 * of the ListView, which is what makes the memo effective.
 */
interface ListViewRowProps<TItem extends ListItem> {
	item: TItem;
	columns: readonly ListColumn[];
	columnStyles: readonly React.CSSProperties[];
	rowIndex: number;
	isSelected: boolean;
	isHovered: boolean;
	/** Whether this row holds the single tab stop for the list. */
	isFocusable: boolean;
	rowId: string;
	hoveredColumnKey: string | null;
	classes?: ListViewClasses;
	onRowKeyDown: (item: ListItem, index: number, event: React.KeyboardEvent) => void;
	onRowClick: (item: ListItem, event: React.MouseEvent) => void;
	onRowDoubleClick: (item: ListItem) => void;
	onRowEnter: (item: ListItem) => void;
	onRowLeave: (item: ListItem) => void;
	onCellEnter: (item: ListItem, column: ListColumn) => void;
	onCellLeave: (item: ListItem, column: ListColumn) => void;
	onCellClickInternal: (item: ListItem, column: ListColumn, event: React.MouseEvent) => void;
	renderRow?: ListViewProps<TItem>['renderRow'];
	renderCell?: ListViewProps<TItem>['renderCell'];
}

function ListViewRowInner<TItem extends ListItem>({
	item,
	columns,
	columnStyles,
	rowIndex,
	isSelected,
	isHovered,
	isFocusable,
	rowId,
	hoveredColumnKey,
	classes,
	onRowKeyDown,
	onRowClick,
	onRowDoubleClick,
	onRowEnter,
	onRowLeave,
	onCellEnter,
	onCellLeave,
	onCellClickInternal,
	renderRow,
	renderCell,
}: ListViewRowProps<TItem>) {
	const rowDefaultProps: RowDefaultProps = {
		key: item.id,
		id: rowId,
		className: mergeClasses(styles.row, isSelected && styles.selected, classes?.row),
		// Rows are listbox options: focusable one at a time via a roving
		// tabindex, so the list is a single tab stop that the arrow keys move
		// within. Before this they were plain divs with onClick, which made
		// selecting and opening an item impossible without a pointer.
		role: 'option',
		'aria-selected': isSelected,
		tabIndex: isFocusable ? 0 : -1,
		onKeyDown: (event) => onRowKeyDown(item, rowIndex, event),
		onClick: (event) => onRowClick(item, event),
		onDoubleClick: () => onRowDoubleClick(item),
		onMouseEnter: () => onRowEnter(item),
		onMouseLeave: () => onRowLeave(item),
		'data-selected': isSelected,
		'data-index': rowIndex,
		'data-item-id': item.id,
	};

	if (renderRow) {
		const rowState: RowRenderState = { isSelected, isHovered, index: rowIndex };
		return <>{renderRow(item, rowState, rowDefaultProps)}</>;
	}

	// `key` is passed to the element explicitly rather than arriving through
	// the spread: React reads `key` off the JSX element, not off the props
	// object, so spreading it silently produced keyless children.
	const { key: _key, ...rowElementProps } = rowDefaultProps;

	return (
		<div {...rowElementProps}>
			{columns.map((column, columnIndex) => {
				const value = item[column.key];
				const isCellHovered = isHovered && hoveredColumnKey === column.key;

				const cellState: CellRenderState = {
					isHovered: isCellHovered,
					isRowSelected: isSelected,
					columnIndex,
					rowIndex,
				};

				return (
					<div
						key={column.key}
						className={mergeClasses(styles.cell, classes?.cell)}
						style={columnStyles[columnIndex]}
						data-column={column.key}
						data-hovered={isCellHovered}
						onClick={(event) => onCellClickInternal(item, column, event)}
						onMouseEnter={() => onCellEnter(item, column)}
						onMouseLeave={() => onCellLeave(item, column)}
					>
						{renderCell ? (
							renderCell(value, item, column, cellState)
						) : (
							<>
								{columnIndex === 0 && item.icon ? (
									<span className={styles.icon}>{item.icon}</span>
								) : null}
								{renderValue(value)}
							</>
						)}
					</div>
				);
			})}
		</div>
	);
}

const ListViewRow = React.memo(ListViewRowInner) as typeof ListViewRowInner;

/**
 * Mac OS 9 style ListView component
 *
 * Multi-column list with sortable headers and row selection.
 * Similar to Finder list view.
 *
 * @example
 * ```tsx
 * <ListView
 *   columns={[
 *     { key: 'name', label: 'Name' },
 *     { key: 'modified', label: 'Date Modified' },
 *     { key: 'size', label: 'Size' }
 *   ]}
 *   items={[
 *     { id: '1', name: 'Document.txt', modified: 'Today', size: '2 KB' },
 *     { id: '2', name: 'Images', modified: 'Yesterday', size: '--' }
 *   ]}
 *   selectedIds={['1']}
 *   onSelectionChange={(ids) => console.log('Selected:', ids)}
 *   onItemMouseEnter={(item) => console.log('Hovering:', item.name)}
 * />
 *
 * // Typed rows
 * interface FileRow extends ListItem {
 *   name: string;
 *   size: number;
 * }
 * <ListView<FileRow> items={files} columns={columns} />
 * ```
 */
function ListViewInner<TItem extends ListItem = ListItem>(
	{
		columns,
		items,
		selectedIds = [],
		onSelectionChange,
		onItemOpen,
		onItemMouseEnter,
		onItemMouseLeave,
		onSort,
		className = '',
		height = 'auto',
		classes,
		ariaLabel,
		ariaLabelledBy,
		'aria-label': ariaLabelAttr,
		'aria-labelledby': ariaLabelledByAttr,
		emptyState = 'No items',
		loading = false,
		loadingState = 'Loading…',
		renderRow,
		renderCell,
		renderHeaderCell,
		onCellClick,
		onCellMouseEnter,
		onCellMouseLeave,
	}: ListViewProps<TItem>,
	ref: React.ForwardedRef<HTMLDivElement>
) {
	const [sortColumn, setSortColumn] = useState<string | null>(null);
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
	const [hoveredRow, setHoveredRow] = useState<string | null>(null);
	const [hoveredColumnKey, setHoveredColumnKey] = useState<string | null>(null);

	// Standard attributes win; the camelCase aliases warn once in development.
	const resolvedAriaLabel =
		resolveAria('ListView', 'aria-label', 'ariaLabel', ariaLabelAttr, ariaLabel) ?? 'List';
	const resolvedAriaLabelledBy = resolveAria(
		'ListView',
		'aria-labelledby',
		'ariaLabelledBy',
		ariaLabelledByAttr,
		ariaLabelledBy
	);

	// Index of the row holding the list's single tab stop. Kept in state so the
	// roving tabindex follows the user's focus.
	const [focusedIndex, setFocusedIndex] = useState(0);

	// Ids are per-instance so two ListViews on a page can't collide.
	const baseId = useId();
	const bodyRef = useRef<HTMLDivElement>(null);

	// Membership tests run once per row per render. `selectedIds.includes()`
	// inside the row map made selection checking O(rows x selected), which on
	// a large list with a large selection is quadratic.
	const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

	// Anchor for Shift range selection, plus the selection as it stood before
	// the current Shift sequence began. Shift+click extends that base
	// selection with the anchor..target range instead of discarding
	// everything the user had already picked.
	const anchorIdRef = useRef<string | null>(null);
	const baseSelectionRef = useRef<readonly string[]>([]);

	// Latest props, read from inside stable callbacks. Without this the row
	// handlers would change identity whenever the selection or item list
	// changed, defeating the row memoisation entirely.
	const latestRef = useRef({
		items,
		selectedIds,
		selectedSet,
		onSelectionChange,
		onItemOpen,
		onItemMouseEnter,
		onItemMouseLeave,
		onCellClick,
		onCellMouseEnter,
		onCellMouseLeave,
	});
	useEffect(() => {
		latestRef.current = {
			items,
			selectedIds,
			selectedSet,
			onSelectionChange,
			onItemOpen,
			onItemMouseEnter,
			onItemMouseLeave,
			onCellClick,
			onCellMouseEnter,
			onCellMouseLeave,
		};
	});

	// Class names
	const classNames = mergeClasses(styles.listView, className, classes?.root);

	// One style object per column, reused by every row. Previously each cell
	// allocated a fresh `{ width }` object on every render, which also meant
	// no row could ever be memoised on prop identity.
	const columnStyles = useMemo(
		() =>
			columns.map((column) => ({
				width: typeof column.width === 'number' ? `${column.width}px` : column.width,
			})),
		[columns]
	);

	// Handle column header click
	const handleColumnClick = useCallback(
		(columnKey: string, sortable: boolean = true) => {
			if (!sortable || !onSort) return;

			const newDirection = sortColumn === columnKey && sortDirection === 'asc' ? 'desc' : 'asc';
			setSortColumn(columnKey);
			setSortDirection(newDirection);
			onSort(columnKey, newDirection);
		},
		[sortColumn, sortDirection, onSort]
	);

	const handleRowClick = useCallback((item: ListItem, event: React.MouseEvent) => {
		const {
			items: liveItems,
			selectedIds: liveSelected,
			selectedSet: liveSelectedSet,
			onSelectionChange: liveOnChange,
		} = latestRef.current;
		if (!liveOnChange) return;

		const itemId = item.id;

		if (event.metaKey || event.ctrlKey) {
			// Toggle one item, and make it the anchor for a later Shift+click.
			anchorIdRef.current = itemId;
			baseSelectionRef.current = liveSelectedSet.has(itemId)
				? liveSelected.filter((id) => id !== itemId)
				: [...liveSelected, itemId];
			liveOnChange([...baseSelectionRef.current]);
			return;
		}

		if (event.shiftKey && (anchorIdRef.current || liveSelected.length > 0)) {
			const anchorId = anchorIdRef.current ?? liveSelected[liveSelected.length - 1];
			const anchorIndex = liveItems.findIndex((candidate) => candidate.id === anchorId);
			const currentIndex = liveItems.findIndex((candidate) => candidate.id === itemId);

			if (anchorIndex === -1 || currentIndex === -1) {
				liveOnChange([itemId]);
				return;
			}

			const start = Math.min(anchorIndex, currentIndex);
			const end = Math.max(anchorIndex, currentIndex);
			const rangeIds = liveItems.slice(start, end + 1).map((candidate) => candidate.id);

			// Extend rather than replace: whatever was selected before this
			// Shift sequence stays selected.
			liveOnChange([...new Set([...baseSelectionRef.current, ...rangeIds])]);
			return;
		}

		// Single select — this click becomes the anchor and the new base.
		anchorIdRef.current = itemId;
		baseSelectionRef.current = [itemId];
		liveOnChange([itemId]);
	}, []);

	const handleRowDoubleClick = useCallback((item: ListItem) => {
		latestRef.current.onItemOpen?.(item as TItem);
	}, []);

	const handleRowEnter = useCallback((item: ListItem) => {
		setHoveredRow(item.id);
		latestRef.current.onItemMouseEnter?.(item as TItem);
	}, []);

	const handleRowLeave = useCallback((item: ListItem) => {
		setHoveredRow(null);
		setHoveredColumnKey(null);
		latestRef.current.onItemMouseLeave?.(item as TItem);
	}, []);

	const handleCellEnter = useCallback((item: ListItem, column: ListColumn) => {
		setHoveredColumnKey(column.key);
		latestRef.current.onCellMouseEnter?.(item as TItem, column);
	}, []);

	const handleCellLeave = useCallback((item: ListItem, column: ListColumn) => {
		setHoveredColumnKey(null);
		latestRef.current.onCellMouseLeave?.(item as TItem, column);
	}, []);

	const handleCellClickInternal = useCallback(
		(item: ListItem, column: ListColumn, event: React.MouseEvent) => {
			latestRef.current.onCellClick?.(item as TItem, column, event);
		},
		[]
	);

	/** Moves the roving tab stop to `index` and puts DOM focus on that row. */
	const focusRow = useCallback(
		(index: number) => {
			const clamped = Math.max(0, Math.min(items.length - 1, index));
			setFocusedIndex(clamped);
			const target = bodyRef.current?.querySelector<HTMLElement>(`[data-index="${clamped}"]`);
			target?.focus();
		},
		[items.length]
	);

	/**
	 * Keyboard equivalents for everything the pointer can do (WCAG 2.1.1).
	 *
	 * Arrow keys move between rows, Home/End jump to the ends, Space and Enter
	 * select, Enter also opens, and holding Shift while arrowing extends the
	 * selection the same way Shift-click does.
	 */
	const handleRowKeyDown = useCallback(
		(item: ListItem, index: number, event: React.KeyboardEvent) => {
			const {
				items: liveItems,
				onSelectionChange: liveOnChange,
				onItemOpen: liveOnOpen,
			} = latestRef.current;

			const move = (nextIndex: number) => {
				event.preventDefault();
				const clamped = Math.max(0, Math.min(liveItems.length - 1, nextIndex));
				focusRow(clamped);

				const target = liveItems[clamped];
				if (!target) return;

				if (event.shiftKey) {
					// Extend from the anchor, exactly as Shift-click does.
					const anchorId = anchorIdRef.current ?? target.id;
					const anchorIndex = liveItems.findIndex((candidate) => candidate.id === anchorId);
					const start = Math.min(anchorIndex === -1 ? clamped : anchorIndex, clamped);
					const end = Math.max(anchorIndex === -1 ? clamped : anchorIndex, clamped);
					const rangeIds = liveItems.slice(start, end + 1).map((candidate) => candidate.id);
					liveOnChange?.([...new Set([...baseSelectionRef.current, ...rangeIds])]);
					return;
				}

				// Plain arrow movement selects the row it lands on, which is how
				// Finder behaves and keeps selection and focus in step.
				anchorIdRef.current = target.id;
				baseSelectionRef.current = [target.id];
				liveOnChange?.([target.id]);
			};

			switch (event.key) {
				case 'ArrowDown':
					move(index + 1);
					break;
				case 'ArrowUp':
					move(index - 1);
					break;
				case 'Home':
					move(0);
					break;
				case 'End':
					move(liveItems.length - 1);
					break;
				case ' ':
					event.preventDefault();
					anchorIdRef.current = item.id;
					baseSelectionRef.current = [item.id];
					liveOnChange?.([item.id]);
					break;
				case 'Enter':
					event.preventDefault();
					liveOnChange?.([item.id]);
					liveOnOpen?.(item as TItem);
					break;
				default:
					break;
			}
		},
		[focusRow]
	);

	// Keep the tab stop in range when the list shrinks.
	useEffect(() => {
		setFocusedIndex((current) => Math.max(0, Math.min(items.length - 1, current)));
	}, [items.length]);

	// Container style
	const containerStyle: React.CSSProperties = {};
	if (height !== 'auto') {
		containerStyle.height = typeof height === 'number' ? `${height}px` : height;
	}

	// Whether the body is currently rendering rows rather than a placeholder.
	const hasRows = !loading && items.length > 0;

	const renderBody = () => {
		if (loading) {
			return (
				<div className={mergeClasses(styles.placeholder, classes?.loading)}>{loadingState}</div>
			);
		}

		if (items.length === 0) {
			return <div className={mergeClasses(styles.placeholder, classes?.empty)}>{emptyState}</div>;
		}

		return items.map((item, rowIndex) => (
			<ListViewRow
				key={item.id}
				item={item}
				columns={columns}
				columnStyles={columnStyles}
				rowIndex={rowIndex}
				isSelected={selectedSet.has(item.id)}
				isHovered={hoveredRow === item.id}
				isFocusable={rowIndex === focusedIndex}
				rowId={`${baseId}-row-${rowIndex}`}
				hoveredColumnKey={hoveredRow === item.id ? hoveredColumnKey : null}
				classes={classes}
				onRowKeyDown={handleRowKeyDown}
				onRowClick={handleRowClick}
				onRowDoubleClick={handleRowDoubleClick}
				onRowEnter={handleRowEnter}
				onRowLeave={handleRowLeave}
				onCellEnter={handleCellEnter}
				onCellLeave={handleCellLeave}
				onCellClickInternal={handleCellClickInternal}
				renderRow={renderRow}
				renderCell={renderCell}
			/>
		));
	};

	return (
		<div ref={ref} className={classNames} style={containerStyle}>
			{/* Column headers */}
			<div className={mergeClasses(styles.header, classes?.header)}>
				{columns.map((column, columnIndex) => {
					const isSorted = sortColumn === column.key;
					const headerState: HeaderCellRenderState = {
						isSorted,
						sortDirection: isSorted ? sortDirection : undefined,
					};

					const sortable = column.sortable !== false;
					const headerDefaultProps: HeaderCellDefaultProps = {
						key: column.key,
						className: mergeClasses(
							styles.headerCell,
							sortable && styles.sortable,
							classes?.headerCell
						),
						style: columnStyles[columnIndex] ?? {},
						onClick: () => handleColumnClick(column.key, column.sortable),
						// A sortable header is a control, so it must be reachable and
						// operable from the keyboard.
						//
						// Sort state goes into the accessible name rather than
						// `aria-sort`: that attribute is only valid on
						// columnheader, rowheader and row, and these headers are
						// buttons in a flex strip, not table cells. On a button it
						// is invalid ARIA and is announced to nobody.
						role: sortable ? 'button' : undefined,
						tabIndex: sortable ? 0 : undefined,
						'aria-label': sortable
							? isSorted
								? `${column.label}, sorted ${sortDirection === 'asc' ? 'ascending' : 'descending'}`
								: `${column.label}, sortable`
							: undefined,
						onKeyDown: sortable
							? (event: React.KeyboardEvent) => {
									if (event.key !== 'Enter' && event.key !== ' ') return;
									event.preventDefault();
									handleColumnClick(column.key, column.sortable);
								}
							: undefined,
						'data-column': column.key,
						'data-sortable': sortable,
						...(isSorted && {
							'data-sorted': true,
							'data-sort-direction': sortDirection,
						}),
					};

					// Custom render owns the element, so it also owns the key.
					if (renderHeaderCell) {
						return (
							<React.Fragment key={column.key}>
								{renderHeaderCell(column, headerState, headerDefaultProps)}
							</React.Fragment>
						);
					}

					// `key` comes off the props object and onto the element itself.
					const { key: _key, ...headerElementProps } = headerDefaultProps;

					return (
						<div key={column.key} {...headerElementProps}>
							{column.label}
							{isSorted && (
								<span className={styles.sortIndicator}>{sortDirection === 'asc' ? '▲' : '▼'}</span>
							)}
						</div>
					);
				})}
			</div>

			{/* List items */}
			<div
				ref={bodyRef}
				className={mergeClasses(styles.body, classes?.body)}
				// A multi-selectable listbox: rows are its options. This also gives
				// the scroll container keyboard access, which a plain scrollable
				// <div> of non-focusable rows does not have.
				//
				// The role is dropped while the list is empty or loading: a
				// listbox is required to contain options, and applying it to a
				// box holding only a placeholder is invalid ARIA.
				role={hasRows ? 'listbox' : undefined}
				aria-multiselectable={hasRows ? true : undefined}
				aria-label={hasRows && !resolvedAriaLabelledBy ? resolvedAriaLabel : undefined}
				aria-labelledby={hasRows ? resolvedAriaLabelledBy : undefined}
				aria-busy={loading || undefined}
			>
				{renderBody()}
			</div>
		</div>
	);
}

/**
 * `forwardRef` erases generics, so the forwarded component is re-cast to a
 * signature that keeps `TItem`. This is what lets `<ListView<FileRow> …>`
 * infer the row type in `renderCell`, `onItemOpen` and friends.
 */
export const ListView = forwardRef(ListViewInner) as <TItem extends ListItem = ListItem>(
	props: ListViewProps<TItem> & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement | null;

(ListView as { displayName?: string }).displayName = 'ListView';

export default ListView;
