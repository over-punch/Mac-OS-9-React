// FolderList component - Mac OS 9 style folder/file list window
// Window component with integrated ListView for file browsing

// Note: no per-file 'use client' directive. The library ships as a single
// bundle and Rollup applies the "use client" banner to the whole output,
// so per-file directives were both inconsistent (4 of 16 components) and
// silently dropped at bundle time.

import React, { forwardRef } from 'react';
import { Window, WindowProps, type WindowClasses } from '../Window/Window';
import {
	ListView,
	ListColumn,
	ListItem,
	ListViewClasses,
	ListViewProps,
} from '../ListView/ListView';
import { mergeClasses } from '../../utils/classNames';
import styles from './FolderList.module.css';

/**
 * Classes for targeting FolderList sub-elements
 */
export interface FolderListClasses {
	/** Root window container */
	root?: string;
	/** Window content area, around the list */
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

/**
 * The ListView props FolderList passes straight through.
 *
 * Derived from ListViewProps rather than re-declared. The previous version
 * hand-copied a dozen of these declarations, so every ListView signature
 * change had to be mirrored here by hand or the two would drift apart —
 * and `columns`, `draggable`, `position` and friends were duplicated from
 * WindowProps as well, which already supplies them.
 *
 * `columns` is re-declared below because FolderList gives it a default;
 * `className`, `classes` and `height` are owned by FolderList itself.
 */
type ForwardedListViewProps<TItem extends ListItem> = Omit<
	ListViewProps<TItem>,
	'columns' | 'className' | 'classes' | 'height'
>;

export interface FolderListProps<TItem extends ListItem = ListItem>
	extends Omit<WindowProps, 'children' | 'classes'>, ForwardedListViewProps<TItem> {
	/**
	 * Column definitions for the list
	 * @default [{ key: 'name', label: 'Name' }, { key: 'modified', label: 'Date Modified' }, { key: 'size', label: 'Size' }]
	 */
	columns?: readonly ListColumn[];

	/**
	 * Height of the list view area
	 * @default 400
	 */
	listHeight?: number | string;

	/**
	 * Custom classes for targeting sub-elements
	 */
	classes?: FolderListClasses;
}

/**
 * Default Finder-style columns. Declared at module scope so the default keeps
 * a stable identity between renders — an inline literal would allocate a new
 * array every render and invalidate ListView's memoised column styles.
 */
const DEFAULT_COLUMNS: readonly ListColumn[] = [
	{ key: 'name', label: 'Name', width: '40%' },
	{ key: 'modified', label: 'Date Modified', width: '30%' },
	{ key: 'size', label: 'Size', width: '30%' },
];

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
function FolderListInner<TItem extends ListItem = ListItem>(
	{
		columns = DEFAULT_COLUMNS,
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
		emptyState,
		loading,
		loadingState,
		renderRow,
		renderCell,
		renderHeaderCell,
		onCellClick,
		onCellMouseEnter,
		onCellMouseLeave,
		...windowProps
	}: FolderListProps<TItem>,
	ref: React.ForwardedRef<HTMLDivElement>
) {
	// FolderList is a Window wrapped around a ListView, so its `classes`
	// object has to be split across both halves. `window` and `titleBar` were
	// declared here but never forwarded, so setting either did nothing at all.
	const listViewClasses: ListViewClasses | undefined = classes
		? {
				root: classes.listView,
				header: classes.header,
				headerCell: classes.headerCell,
				body: classes.body,
				row: classes.row,
				cell: classes.cell,
			}
		: undefined;

	// The content class is passed through `classes` rather than the
	// `contentClassName` prop: that prop is deprecated as of 2.0, and passing
	// it from inside the library made every FolderList render log a
	// deprecation warning the consumer had no way to act on.
	const windowClasses: WindowClasses = {
		titleBar: classes?.titleBar,
		content: mergeClasses(styles.folderListContent, classes?.window),
	};

	// Window content with ListView
	return (
		<Window
			ref={ref}
			classes={windowClasses}
			onMouseEnter={onMouseEnter}
			className={classes?.root}
			{...windowProps}
		>
			<ListView<TItem>
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
				emptyState={emptyState}
				loading={loading}
				loadingState={loadingState}
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

/**
 * `forwardRef` erases generics, so the forwarded component is re-cast to a
 * signature that keeps `TItem` — matching how ListView is exported.
 */
export const FolderList = forwardRef(FolderListInner) as <TItem extends ListItem = ListItem>(
	props: FolderListProps<TItem> & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement | null;

(FolderList as { displayName?: string }).displayName = 'FolderList';

export default FolderList;
