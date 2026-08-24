// TreeView Component Tests
//
// A tree is not a listbox with indentation. The assertions that matter are the
// ones a listbox could not satisfy: aria-level, aria-expanded on folders only,
// and the Right/Left keys that open a folder then step into it.

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TreeView, type TreeNode } from './TreeView';
import { checkA11y } from '../../test/axe';

const ITEMS: TreeNode[] = [
	{
		id: 'apps',
		label: 'Applications',
		children: [
			{ id: 'sherlock', label: 'Sherlock 2' },
			{ id: 'simpletext', label: 'SimpleText' },
		],
	},
	{ id: 'readme', label: 'Read Me' },
	{ id: 'empty', label: 'Empty Folder', children: [] },
];

const tree = (props = {}) =>
	render(<TreeView aria-label="Macintosh HD" items={ITEMS} {...props} />);

describe('TreeView', () => {
	it('is a tree, not a list of options', () => {
		tree();
		expect(screen.getByRole('tree', { name: 'Macintosh HD' })).toBeInTheDocument();
		expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
	});

	it('reports depth, which a listbox has no way to express', () => {
		tree({ defaultExpanded: ['apps'] });
		expect(screen.getByRole('treeitem', { name: /Applications/ })).toHaveAttribute(
			'aria-level',
			'1'
		);
		expect(screen.getByRole('treeitem', { name: /Sherlock 2/ })).toHaveAttribute('aria-level', '2');
	});

	it('marks only folders as expandable', () => {
		tree();
		// A leaf with aria-expanded="false" claims to have contents.
		expect(screen.getByRole('treeitem', { name: /Applications/ })).toHaveAttribute('aria-expanded');
		expect(screen.getByRole('treeitem', { name: /Read Me/ })).not.toHaveAttribute('aria-expanded');
	});

	it('treats an empty folder as a folder', () => {
		tree();
		// `children: []` is an empty folder and keeps its triangle; omitting
		// children is a leaf that never had one.
		expect(screen.getByRole('treeitem', { name: /Empty Folder/ })).toHaveAttribute(
			'aria-expanded',
			'false'
		);
	});

	it('hides collapsed contents entirely', () => {
		tree();
		expect(screen.queryByRole('treeitem', { name: /Sherlock 2/ })).not.toBeInTheDocument();
	});

	describe('keyboard', () => {
		it('Right opens a folder, then steps into it', () => {
			tree();
			const apps = screen.getByRole('treeitem', { name: /Applications/ });
			apps.focus();

			fireEvent.keyDown(apps, { key: 'ArrowRight' });
			expect(screen.getByRole('treeitem', { name: /Sherlock 2/ })).toBeInTheDocument();

			fireEvent.keyDown(screen.getByRole('treeitem', { name: /Applications/ }), {
				key: 'ArrowRight',
			});
			expect(screen.getByRole('treeitem', { name: /Sherlock 2/ })).toHaveFocus();
		});

		it('Left closes a folder, and steps out from a child', () => {
			tree({ defaultExpanded: ['apps'] });
			const child = screen.getByRole('treeitem', { name: /Sherlock 2/ });
			child.focus();

			fireEvent.keyDown(child, { key: 'ArrowLeft' });
			expect(screen.getByRole('treeitem', { name: /Applications/ })).toHaveFocus();

			fireEvent.keyDown(screen.getByRole('treeitem', { name: /Applications/ }), {
				key: 'ArrowLeft',
			});
			expect(screen.queryByRole('treeitem', { name: /Sherlock 2/ })).not.toBeInTheDocument();
		});

		it('Up and Down move through what is visible, skipping closed contents', () => {
			tree();
			const apps = screen.getByRole('treeitem', { name: /Applications/ });
			apps.focus();
			fireEvent.keyDown(apps, { key: 'ArrowDown' });
			// Applications is closed, so the next visible row is Read Me.
			expect(screen.getByRole('treeitem', { name: /Read Me/ })).toHaveFocus();
		});

		it('Home and End jump to the ends', () => {
			tree();
			const readme = screen.getByRole('treeitem', { name: /Read Me/ });
			readme.focus();
			fireEvent.keyDown(readme, { key: 'Home' });
			expect(screen.getByRole('treeitem', { name: /Applications/ })).toHaveFocus();
			fireEvent.keyDown(screen.getByRole('treeitem', { name: /Applications/ }), { key: 'End' });
			expect(screen.getByRole('treeitem', { name: /Empty Folder/ })).toHaveFocus();
		});

		it('Enter selects', () => {
			const onSelectedChange = vi.fn();
			tree({ onSelectedChange });
			const readme = screen.getByRole('treeitem', { name: /Read Me/ });
			readme.focus();
			fireEvent.keyDown(readme, { key: 'Enter' });
			expect(onSelectedChange).toHaveBeenCalledWith('readme');
		});
	});

	it('is one tab stop, not one per row', () => {
		tree({ defaultExpanded: ['apps'] });
		const tabbable = screen
			.getAllByRole('treeitem')
			.filter((item) => item.getAttribute('tabindex') === '0');
		// Twenty folders must not mean twenty tab stops.
		expect(tabbable).toHaveLength(1);
	});

	it('reports the open set when a folder is toggled', () => {
		const onExpandedChange = vi.fn();
		tree({ onExpandedChange });
		fireEvent.click(
			screen.getByRole('treeitem', { name: /Applications/ }).querySelector('button')!
		);
		expect(onExpandedChange).toHaveBeenCalledWith(['apps']);
	});

	it('has no automatically detectable accessibility violations', async () => {
		const { container } = render(
			<TreeView aria-label="Macintosh HD" items={ITEMS} defaultExpanded={['apps']} />
		);
		expect(await checkA11y(container)).toHaveNoViolations();
	});
});
