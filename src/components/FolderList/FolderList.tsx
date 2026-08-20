// FolderList component - Mac OS 9 style folder/file list window
// Window component with integrated ListView for file browsing

// Note: no per-file 'use client' directive. The library ships as a single
// bundle and Rollup applies the "use client" banner to the whole output,
// so per-file directives were both inconsistent (4 of 16 components) and
// silently dropped at bundle time.

import React, { forwardRef, useState } from 'react';
import { Window, WindowProps } from '../Window/Window';
import { WindowPosition } from '../../types';
import { 
	ListView, 
	ListColumn, 
	ListItem,
	ListViewClasses,
	RowRenderState,
	RowDefaultProps,
	CellRenderState,
	HeaderCellRenderState,
	HeaderCellDefaultProps
} from '../ListView/ListView';
import styles from './FolderList.module.css';

/**
 * Classes for targeting FolderList sub-elements
 */
export interface FolderListClasses {
	/** Root window container */
	root?: string;
	/** Window component */
	window?: string;
	/** Title bar */
	titleBar?: string;
	/** ListView container */
	listView?: string;
	/** ListView header */
	header?: string;
	/** ListView header cell */
	headerCell?: string;
	/** ListView body */
	body?: string;
	/** ListView row */
	row?: string;
	/** ListView cell */
	cell?: string;
}

export interface FolderListProps extends Omit<WindowProps, 'children' | 'classes'> {
	/**
	 * Column definitions for the list
	 * @default [{ key: 'name', label: 'Name' }, { key: 'modified', label: 'Date Modified' }, { key: 'size', label: 'Size' }]
	 */
	columns?: ListColumn[];

	/**
	 * Whether the folder list window can be dragged by its title bar
	 * Window starts in normal flow and becomes absolutely positioned when dragged
	 * @default false
	 */
	draggable?: boolean;

	/**
	 * Initial position for draggable folder lists (uncontrolled)
	 * Only used when draggable is true
	 */
	defaultPosition?: WindowPosition;

	/**
	 * Controlled position for draggable folder lists
	 * Only used when draggable is true
	 */
	position?: WindowPosition;

	/**
	 * Callback when folder list position changes (during drag)
	 * Only called when draggable is true
	 */
	onPositionChange?: (position: WindowPosition) => void;

	/**
	 * Items to display in the list
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
	 * Callback when item is double-clicked (opened)
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
	 * Callback when column header is clicked for sorting
	 */
	onSort?: (columnKey: string, direction: 'asc' | 'desc') => void;

	/**
	 * Callback when mouse enters the folder list window
	 */
	onMouseEnter?: (event: React.MouseEvent<HTMLDivElement>) => void;

	/**
	 * Height of the list view area
	 * @default 400
	 */
	listHeight?: number | string;

	/**
	 * Custom classes for targeting sub-elements
	 */
	classes?: FolderListClasses;

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
 * Mac OS 9 style FolderList component
 * 
 * Window with integrated ListView for browsing files and folders.
 * Similar to Finder list view in Mac OS 9.
 * 
 * @example
 * ```tsx
 * // Basic folder list
 * <FolderList
 *   title="My Documents"
 *   items={[
 *     { id: '1', name: 'Document.txt', modified: 'Today', size: '2 KB', icon: <FileIcon /> },
 *     { id: '2', name: 'Images', modified: 'Yesterday', size: '--', icon: <FolderIcon /> }
 *   ]}
 *   selectedIds={['1']}
 *   onSelectionChange={(ids) => console.log('Selected:', ids)}
 *   onItemOpen={(item) => console.log('Open:', item.name)}
 * />
 * 
 * // Draggable folder list
 * <FolderList
 *   title="My Documents"
 *   items={items}
 *   draggable
 *   defaultPosition={{ x: 100, y: 100 }}
 * />
 * ```
 */
export const FolderList = forwardRef<HTMLDivElement, FolderListProps>(
	(
		{
			columns = [
				{ key: 'name', label: 'Name', width: '40%' },
				{ key: 'modified', label: 'Date Modified', width: '30%' },
				{ key: 'size', label: 'Size', width: '30%' },
			],
			items,
			selectedIds,
			onSelectionChange,
			onItemOpen,
			onItemMouseEnter,
			onItemMouseLeave,
			onSort,
			onMouseEnter,
			listHeight = 400,
			classes,
			renderRow,
			renderCell,
			renderHeaderCell,
			onCellClick,
			onCellMouseEnter,
			onCellMouseLeave,
			...windowProps
		},
		ref
	) => {
		// Build ListView classes from FolderList classes
		const listViewClasses: ListViewClasses | undefined = classes ? {
			root: classes.listView,
			header: classes.header,
			headerCell: classes.headerCell,
			body: classes.body,
			row: classes.row,
			cell: classes.cell,
		} : undefined;

		// Window content with ListView
		return (
			<Window 
				ref={ref} 
				contentClassName={styles.folderListContent} 
				onMouseEnter={onMouseEnter}
				className={classes?.root}
				{...windowProps}
			>
				<ListView
					columns={columns}
					items={items}
					selectedIds={selectedIds}
					onSelectionChange={onSelectionChange}
					onItemOpen={onItemOpen}
					onItemMouseEnter={onItemMouseEnter}
					onItemMouseLeave={onItemMouseLeave}
					onSort={onSort}
					height={listHeight}
					className={styles.listView}
					classes={listViewClasses}
					renderRow={renderRow}
					renderCell={renderCell}
					renderHeaderCell={renderHeaderCell}
					onCellClick={onCellClick}
					onCellMouseEnter={onCellMouseEnter}
					onCellMouseLeave={onCellMouseLeave}
				/>
			</Window>
		);
	}
);

FolderList.displayName = 'FolderList';

export default FolderList;
