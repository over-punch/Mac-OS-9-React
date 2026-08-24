// TreeView component - Mac OS 9 style
//
// Finder's list view: rows that nest under disclosure triangles, so you can
// open a folder in place instead of leaving the window.
//
// This is a separate component rather than a mode on ListView because the two
// are different ARIA patterns, not two looks at one pattern. ListView is a
// multi-selectable `listbox` of `option`s, which has no notion of depth; a
// tree is `tree`/`treeitem` with `aria-level`, `aria-expanded` and nested
// `group`s. Bolting hierarchy onto the listbox would have produced options
// claiming a depth their role cannot express.
//
// The keyboard map is the standard tree one, which is also what Finder did:
// Right opens a folder and then steps into it, Left closes it and then steps
// out to its parent.

import { forwardRef, useCallback, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { mergeClasses } from '../../utils/classNames';
import { DisclosureTriangle } from '../DisclosureTriangle';
import styles from './TreeView.module.css';

/**
 * One row of the tree.
 */
export interface TreeNode {
	/** Stable identity. */
	id: string;

	/** What the row says. */
	label: React.ReactNode;

	/** Icon shown before the label. */
	icon?: React.ReactNode;

	/**
	 * Nested rows.
	 *
	 * An empty array is not the same as omitting it: an empty array is a
	 * folder that happens to be empty and still gets a triangle, while
	 * omitting it is a leaf that never had one.
	 */
	children?: TreeNode[];
}

/**
 * Classes for targeting TreeView sub-elements.
 */
export interface TreeViewClasses {
	/** The tree container. */
	root?: string;
	/** A row. */
	item?: string;
	/** A row's label. */
	label?: string;
	/** A nested group. */
	group?: string;
}

export interface TreeViewProps {
	/**
	 * The rows, nested.
	 */
	items: TreeNode[];

	/**
	 * Ids of the open rows. Controlled.
	 */
	expanded?: string[];

	/**
	 * Ids open to begin with, when uncontrolled.
	 */
	defaultExpanded?: string[];

	/**
	 * Called with the new set of open ids.
	 */
	onExpandedChange?: (expanded: string[]) => void;

	/**
	 * Id of the selected row. Controlled.
	 */
	selected?: string | null;

	/**
	 * Called when a row is chosen.
	 */
	onSelectedChange?: (id: string) => void;

	/**
	 * Accessible name for the tree.
	 */
	'aria-label'?: string;

	/**
	 * ID of an element naming the tree.
	 */
	'aria-labelledby'?: string;

	/**
	 * Additional CSS class names.
	 */
	className?: string;

	/**
	 * Classes for targeting sub-elements.
	 */
	classes?: TreeViewClasses;
}

/** A row flattened out of the tree, with the depth it sits at. */
interface FlatNode {
	node: TreeNode;
	level: number;
	/** Index among its siblings, 1-based, for aria-posinset. */
	position: number;
	/** How many siblings it has, for aria-setsize. */
	setSize: number;
}

/** Whether a node is a folder — something that can open, empty or not. */
const isBranch = (node: TreeNode) => node.children !== undefined;

/**
 * Every row currently on screen, in the order the eye and the arrow keys move
 * through them. Closed folders contribute themselves but not their contents.
 */
function flatten(items: TreeNode[], expanded: Set<string>, level = 1): FlatNode[] {
	const rows: FlatNode[] = [];
	items.forEach((node, index) => {
		rows.push({ node, level, position: index + 1, setSize: items.length });
		if (isBranch(node) && expanded.has(node.id) && node.children?.length) {
			rows.push(...flatten(node.children, expanded, level + 1));
		}
	});
	return rows;
}

/**
 * Mac OS 9 style hierarchical list view.
 *
 * @example
 * ```tsx
 * <TreeView
 *   aria-label="Macintosh HD"
 *   items={[
 *     { id: 'apps', label: 'Applications', children: [
 *       { id: 'sherlock', label: 'Sherlock 2' },
 *     ]},
 *     { id: 'readme', label: 'Read Me' },
 *   ]}
 * />
 * ```
 */
export const TreeView = forwardRef<HTMLUListElement, TreeViewProps>(
	(
		{
			items,
			expanded,
			defaultExpanded = [],
			onExpandedChange,
			selected,
			onSelectedChange,
			className = '',
			classes,
			'aria-label': ariaLabel,
			'aria-labelledby': ariaLabelledBy,
		},
		ref
	) => {
		const [internalExpanded, setInternalExpanded] = useState<string[]>(defaultExpanded);
		const [internalSelected, setInternalSelected] = useState<string | null>(null);
		// Which row Tab lands on. A tree is one tab stop, and the arrows move
		// within it — twenty folders must not mean twenty tab stops.
		const [active, setActive] = useState<string | null>(null);
		const rowRefs = useRef(new Map<string, HTMLLIElement>());

		const openIds = useMemo(
			() => new Set(expanded ?? internalExpanded),
			[expanded, internalExpanded]
		);
		const rows = useMemo(() => flatten(items, openIds), [items, openIds]);

		const currentSelected = selected !== undefined ? selected : internalSelected;
		const focused = active ?? rows[0]?.node.id ?? null;

		const setExpanded = useCallback(
			(next: Set<string>) => {
				const list = [...next];
				if (expanded === undefined) setInternalExpanded(list);
				onExpandedChange?.(list);
			},
			[expanded, onExpandedChange]
		);

		const toggle = useCallback(
			(id: string, open: boolean) => {
				const next = new Set(openIds);
				if (open) next.add(id);
				else next.delete(id);
				setExpanded(next);
			},
			[openIds, setExpanded]
		);

		const select = useCallback(
			(id: string) => {
				if (selected === undefined) setInternalSelected(id);
				onSelectedChange?.(id);
			},
			[selected, onSelectedChange]
		);

		/** Move focus to a row, both in state and in the DOM. */
		const focusRow = useCallback((id: string) => {
			setActive(id);
			rowRefs.current.get(id)?.focus();
		}, []);

		const handleKeyDown = (event: KeyboardEvent<HTMLLIElement>, row: FlatNode) => {
			const index = rows.findIndex((r) => r.node.id === row.node.id);
			const branch = isBranch(row.node);
			const open = openIds.has(row.node.id);

			switch (event.key) {
				case 'ArrowDown': {
					event.preventDefault();
					const next = rows[index + 1];
					if (next) focusRow(next.node.id);
					break;
				}
				case 'ArrowUp': {
					event.preventDefault();
					const previous = rows[index - 1];
					if (previous) focusRow(previous.node.id);
					break;
				}
				case 'ArrowRight': {
					event.preventDefault();
					// Open a closed folder; step into an open one.
					if (branch && !open) toggle(row.node.id, true);
					else if (branch && open) {
						const child = rows[index + 1];
						if (child && child.level > row.level) focusRow(child.node.id);
					}
					break;
				}
				case 'ArrowLeft': {
					event.preventDefault();
					// Close an open folder; step out to the parent otherwise.
					if (branch && open) {
						toggle(row.node.id, false);
					} else {
						for (let i = index - 1; i >= 0; i--) {
							const candidate = rows[i];
							if (candidate && candidate.level < row.level) {
								focusRow(candidate.node.id);
								break;
							}
						}
					}
					break;
				}
				case 'Home': {
					event.preventDefault();
					const first = rows[0];
					if (first) focusRow(first.node.id);
					break;
				}
				case 'End': {
					event.preventDefault();
					const last = rows[rows.length - 1];
					if (last) focusRow(last.node.id);
					break;
				}
				case 'Enter':
				case ' ': {
					event.preventDefault();
					select(row.node.id);
					break;
				}
				default:
					break;
			}
		};

		return (
			<ul
				ref={ref}
				role="tree"
				aria-label={ariaLabelledBy ? undefined : ariaLabel}
				aria-labelledby={ariaLabelledBy}
				className={mergeClasses(styles.tree, className, classes?.root)}
			>
				{rows.map((row) => {
					const branch = isBranch(row.node);
					const open = openIds.has(row.node.id);
					const isFocused = focused === row.node.id;

					return (
						<li
							key={row.node.id}
							ref={(element) => {
								if (element) rowRefs.current.set(row.node.id, element);
								else rowRefs.current.delete(row.node.id);
							}}
							role="treeitem"
							aria-level={row.level}
							aria-posinset={row.position}
							aria-setsize={row.setSize}
							// Only a folder can be open or closed. A leaf with
							// aria-expanded="false" claims it has contents.
							aria-expanded={branch ? open : undefined}
							aria-selected={currentSelected === row.node.id}
							tabIndex={isFocused ? 0 : -1}
							onKeyDown={(event) => handleKeyDown(event, row)}
							onFocus={() => setActive(row.node.id)}
							onClick={(event) => {
								event.stopPropagation();
								select(row.node.id);
								focusRow(row.node.id);
							}}
							className={mergeClasses(
								styles.item,
								currentSelected === row.node.id && styles['item--selected'],
								classes?.item
							)}
							style={{ paddingLeft: `calc(${row.level - 1} * var(--spacing-4))` }}
						>
							<span className={styles.row}>
								{branch ? (
									<DisclosureTriangle
										size="sm"
										expanded={open}
										onExpandedChange={(next) => toggle(row.node.id, next)}
										// The triangle is inside a row that is
										// already focusable and already announces
										// its own expanded state, so exposing it
										// again would double every folder.
										tabIndex={-1}
										aria-hidden="true"
										className={styles.twisty}
									/>
								) : (
									<span className={styles.twistySpacer} aria-hidden="true" />
								)}

								{row.node.icon && (
									<span className={styles.icon} aria-hidden="true">
										{row.node.icon}
									</span>
								)}

								<span className={mergeClasses(styles.label, classes?.label)}>{row.node.label}</span>
							</span>
						</li>
					);
				})}
			</ul>
		);
	}
);

TreeView.displayName = 'TreeView';

export default TreeView;
