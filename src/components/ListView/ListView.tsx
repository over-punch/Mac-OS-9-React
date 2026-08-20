// ListView component - Mac OS 9 style multi-column list
// List view with sortable columns and row selection

// Note: no per-file 'use client' directive. The library ships as a single
// bundle and Rollup applies the "use client" banner to the whole output,
// so per-file directives were both inconsistent (4 of 16 components) and
// silently dropped at bundle time.

import React, { forwardRef, useState, useCallback } from 'react';
import { mergeClasses } from '../../utils/classNames';
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

export interface ListItem {
	/**
	 * Unique item ID
	 */
	id: string;

	/**
	 * Item data - keys should match column keys
	 */
	[key: string]: any;

	/**
	 * Optional icon to display
	 */
	icon?: React.ReactNode;
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
	className: string;
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
	'data-column': string;
	'data-sortable': boolean;
	'data-sorted'?: boolean;
	'data-sort-direction'?: 'asc' | 'desc';
}

export interface ListViewProps {
	/**
	 * Column definitions
	 */
	columns: ListColumn[];

	/**
	 * List items
	 */
	items: ListItem[];

	/**
	 * Selected item IDs
	 */
	selectedIds?: string[];

	/**
	 * Callback when selection changes
	 */
	onSelectionChange?: (selectedIds: string[]) => void;

	/**
	 * Callback when item is double-clicked
	 */
	onItemOpen?: (item: ListItem) => void;

	/**
	 * Callback when mouse enters an item (row-level)
	 */
	onItemMouseEnter?: (item: ListItem) => void;

	/**
	 * Callback when mouse leaves an item (row-level)
	 */
	onItemMouseLeave?: (item: ListItem) => void;

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
	 * Override row rendering
	 * @param item - The list item
	 * @param state - Row state (selected, hovered, index)
	 * @param defaultProps - Props to spread on custom element for accessibility
	 * @returns Custom row element (fully replaces default)
	 */
	renderRow?: (
		item: ListItem,
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
		value: any,
		item: ListItem,
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
	onCellClick?: (
		item: ListItem,
		column: ListColumn,
		event: React.MouseEvent
	) => void;

	/**
	 * Callback when mouse enters a cell
	 */
	onCellMouseEnter?: (
		item: ListItem,
		column: ListColumn
	) => void;

	/**
	 * Callback when mouse leaves a cell
	 */
	onCellMouseLeave?: (
		item: ListItem,
		column: ListColumn
	) => void;
}

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
 * ```
 */
export const ListView = forwardRef<HTMLDivElement, ListViewProps>(
	(
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
			renderRow,
			renderCell,
			renderHeaderCell,
			onCellClick,
			onCellMouseEnter,
			onCellMouseLeave,
		},
		ref
	) => {
		const [sortColumn, setSortColumn] = useState<string | null>(null);
		const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
		const [hoveredRow, setHoveredRow] = useState<string | null>(null);
		const [hoveredCell, setHoveredCell] = useState<{
			rowId: string;
			columnKey: string;
		} | null>(null);

		// Class names
		const classNames = mergeClasses(styles.listView, className, classes?.root);

		// Handle column header click
		const handleColumnClick = useCallback(
			(columnKey: string, sortable: boolean = true) => {
				if (!sortable || !onSort) return;

				const newDirection =
					sortColumn === columnKey && sortDirection === 'asc' ? 'desc' : 'asc';
				setSortColumn(columnKey);
				setSortDirection(newDirection);
				onSort(columnKey, newDirection);
			},
			[sortColumn, sortDirection, onSort]
		);

		// Handle row click
		const handleRowClick = useCallback(
			(itemId: string, event: React.MouseEvent) => {
				if (!onSelectionChange) return;

				if (event.metaKey || event.ctrlKey) {
					// Multi-select with Cmd/Ctrl
					if (selectedIds.includes(itemId)) {
						onSelectionChange(selectedIds.filter((id) => id !== itemId));
					} else {
						onSelectionChange([...selectedIds, itemId]);
					}
				} else if (event.shiftKey && selectedIds.length > 0) {
					// Range select with Shift
					const lastSelectedId = selectedIds[selectedIds.length - 1];
					const lastIndex = items.findIndex((item) => item.id === lastSelectedId);
					const currentIndex = items.findIndex((item) => item.id === itemId);

					const start = Math.min(lastIndex, currentIndex);
					const end = Math.max(lastIndex, currentIndex);
					const rangeIds = items.slice(start, end + 1).map((item) => item.id);

					onSelectionChange(rangeIds);
				} else {
					// Single select
					onSelectionChange([itemId]);
				}
			},
			[selectedIds, items, onSelectionChange]
		);

		// Handle row double-click
		const handleRowDoubleClick = useCallback(
			(item: ListItem) => {
				if (onItemOpen) {
					onItemOpen(item);
				}
			},
			[onItemOpen]
		);

		// Handle row mouse enter
		const handleRowMouseEnter = useCallback(
			(item: ListItem) => {
				if (onItemMouseEnter) {
					onItemMouseEnter(item);
				}
			},
			[onItemMouseEnter]
		);

		// Container style
		const containerStyle: React.CSSProperties = {};
		if (height !== 'auto') {
			containerStyle.height = typeof height === 'number' ? `${height}px` : height;
		}

		return (
			<div ref={ref} className={classNames} style={containerStyle}>
				{/* Column headers */}
				<div className={mergeClasses(styles.header, classes?.header)}>
					{columns.map((column) => {
						const isSorted = sortColumn === column.key;
						const headerState: HeaderCellRenderState = {
							isSorted,
							sortDirection: isSorted ? sortDirection : undefined,
						};

						const headerDefaultProps: HeaderCellDefaultProps = {
							key: column.key,
							className: mergeClasses(
								styles.headerCell,
								column.sortable !== false && styles.sortable,
								classes?.headerCell
							),
							style: {
								width:
									typeof column.width === 'number'
										? `${column.width}px`
										: column.width,
							},
							onClick: () => handleColumnClick(column.key, column.sortable),
							'data-column': column.key,
							'data-sortable': column.sortable !== false,
							...(isSorted && {
								'data-sorted': true,
								'data-sort-direction': sortDirection,
							}),
						};

						// Use custom render or default
						if (renderHeaderCell) {
							return renderHeaderCell(column, headerState, headerDefaultProps);
						}

						// Default header cell rendering
						return (
							<div {...headerDefaultProps}>
								{column.label}
								{isSorted && (
									<span className={styles.sortIndicator}>
										{sortDirection === 'asc' ? '▲' : '▼'}
									</span>
								)}
							</div>
						);
					})}
				</div>

				{/* List items */}
				<div className={mergeClasses(styles.body, classes?.body)}>
					{items.map((item, rowIndex) => {
						const isSelected = selectedIds.includes(item.id);
						const isHovered = hoveredRow === item.id;

						const rowState: RowRenderState = {
							isSelected,
							isHovered,
							index: rowIndex,
						};

						const rowDefaultProps: RowDefaultProps = {
							key: item.id,
							className: mergeClasses(
								styles.row,
								isSelected && styles.selected,
								classes?.row
							),
							onClick: (e) => handleRowClick(item.id, e),
							onDoubleClick: () => handleRowDoubleClick(item),
							onMouseEnter: () => {
								setHoveredRow(item.id);
								onItemMouseEnter?.(item);
							},
							onMouseLeave: () => {
								setHoveredRow(null);
								setHoveredCell(null);
								onItemMouseLeave?.(item);
							},
							'data-selected': isSelected,
							'data-index': rowIndex,
							'data-item-id': item.id,
						};

						// Use custom row render or default
						if (renderRow) {
							return renderRow(item, rowState, rowDefaultProps);
						}

						// Default row rendering
						return (
							<div {...rowDefaultProps}>
								{columns.map((column, columnIndex) => {
									const value = item[column.key];
									const isCellHovered = 
										hoveredCell?.rowId === item.id && 
										hoveredCell?.columnKey === column.key;

									const cellState: CellRenderState = {
										isHovered: isCellHovered,
										isRowSelected: isSelected,
										columnIndex,
										rowIndex,
									};

									// Cell event handlers
									const handleCellClick = (e: React.MouseEvent) => {
										if (onCellClick) {
											onCellClick(item, column, e);
										}
									};

									const handleCellMouseEnter = () => {
										setHoveredCell({ rowId: item.id, columnKey: column.key });
										if (onCellMouseEnter) {
											onCellMouseEnter(item, column);
										}
									};

									const handleCellMouseLeave = () => {
										setHoveredCell(null);
										if (onCellMouseLeave) {
											onCellMouseLeave(item, column);
										}
									};

									// Use custom cell render or default
									if (renderCell) {
										return (
											<div
												key={column.key}
												className={mergeClasses(styles.cell, classes?.cell)}
												style={{
													width:
														typeof column.width === 'number'
															? `${column.width}px`
															: column.width,
												}}
												data-column={column.key}
												data-hovered={isCellHovered}
												onClick={handleCellClick}
												onMouseEnter={handleCellMouseEnter}
												onMouseLeave={handleCellMouseLeave}
											>
												{renderCell(value, item, column, cellState)}
											</div>
										);
									}

									// Default cell rendering
									return (
										<div
											key={column.key}
											className={mergeClasses(styles.cell, classes?.cell)}
											style={{
												width:
													typeof column.width === 'number'
														? `${column.width}px`
														: column.width,
											}}
											data-column={column.key}
											data-hovered={isCellHovered}
											onClick={handleCellClick}
											onMouseEnter={handleCellMouseEnter}
											onMouseLeave={handleCellMouseLeave}
										>
											{columnIndex === 0 && item.icon && (
												<span className={styles.icon}>{item.icon}</span>
											)}
											{value}
										</div>
									);
								})}
							</div>
						);
					})}
				</div>
			</div>
		);
	}
);

ListView.displayName = 'ListView';

export default ListView;
