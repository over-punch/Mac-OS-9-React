// FolderList Tests
//
// FolderList is a compound: a Window wrapped around a ListView. The thing
// worth pinning down is the seam between them — that Window props reach the
// Window, ListView props reach the ListView, and the `classes` object is
// split correctly across both rather than landing on one of them.

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FolderList } from './FolderList';
import type { ListItem } from '../ListView';
import { checkA11y } from '../../test/axe';
import { resetDeprecationWarnings } from '../../utils/deprecation';
import { nth } from '../../test/nth';

interface FileRow extends ListItem {
	name: string;
	modified: string;
	size: string;
}

const ITEMS: FileRow[] = [
	{ id: 'a', name: 'Read Me', modified: '12 May 1999', size: '4 KB' },
	{ id: 'b', name: 'System Folder', modified: '3 Jan 1999', size: '—' },
	{ id: 'c', name: 'Applications', modified: '9 Sep 1999', size: '—' },
];

describe('FolderList', () => {
	it('renders as a window with the given title', () => {
		render(<FolderList title="Macintosh HD" items={ITEMS} />);
		expect(screen.getByText('Macintosh HD')).toBeInTheDocument();
	});

	it('lists every item', () => {
		render(<FolderList title="Macintosh HD" items={ITEMS} />);
		for (const item of ITEMS) {
			expect(screen.getByText(item.name)).toBeInTheDocument();
		}
	});

	describe('columns', () => {
		it('defaults to the Finder three', () => {
			render(<FolderList title="Macintosh HD" items={ITEMS} />);
			expect(screen.getByText('Name')).toBeInTheDocument();
			expect(screen.getByText('Date Modified')).toBeInTheDocument();
			expect(screen.getByText('Size')).toBeInTheDocument();
		});

		it('accepts its own columns instead', () => {
			render(
				<FolderList
					title="Macintosh HD"
					items={ITEMS}
					columns={[{ key: 'name', label: 'Item' }]}
				/>
			);
			expect(screen.getByText('Item')).toBeInTheDocument();
			expect(screen.queryByText('Date Modified')).not.toBeInTheDocument();
		});
	});

	describe('the seam between Window and ListView', () => {
		it('forwards Window props to the Window', () => {
			const onClose = vi.fn();
			render(<FolderList title="Macintosh HD" items={ITEMS} onClose={onClose} />);

			fireEvent.click(screen.getByRole('button', { name: /close/i }));

			expect(onClose).toHaveBeenCalled();
		});

		it('forwards ListView props to the ListView', () => {
			const onSelectionChange = vi.fn();
			render(
				<FolderList
					title="Macintosh HD"
					items={ITEMS}
					onSelectionChange={onSelectionChange}
				/>
			);

			fireEvent.click(screen.getByText('System Folder'));

			expect(onSelectionChange).toHaveBeenCalledWith(['b']);
		});

		it('opens an item, which is how a folder window is actually used', () => {
			const onItemOpen = vi.fn();
			render(<FolderList title="Macintosh HD" items={ITEMS} onItemOpen={onItemOpen} />);

			fireEvent.doubleClick(screen.getByText('Read Me'));

			expect(onItemOpen).toHaveBeenCalledWith(expect.objectContaining({ id: 'a' }));
		});

		it('does not log its own deprecation warning', () => {
			// FolderList used to reach the content area through Window's
			// `contentClassName`, which 2.0 deprecated — so every FolderList
			// render warned about a prop the consumer had never passed and
			// could not stop passing.
			const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
			resetDeprecationWarnings();

			render(<FolderList title="Macintosh HD" items={ITEMS} />);

			expect(
				warn.mock.calls.filter((call) => String(call[0]).includes('contentClassName'))
			).toHaveLength(0);
			warn.mockRestore();
		});

		it('splits the classes object across both halves', () => {
			// This is the branch the compound exists to get right: `listView`
			// belongs to the inner list, `titleBar` to the outer window.
			const { container } = render(
				<FolderList
					title="Macintosh HD"
					items={ITEMS}
					classes={{ listView: 'my-list', titleBar: 'my-title-bar', window: 'my-content' }}
				/>
			);

			expect(container.querySelector('.my-list')).not.toBeNull();
			expect(container.querySelector('.my-title-bar')).not.toBeNull();
			expect(container.querySelector('.my-content')).not.toBeNull();
		});
	});

	describe('empty and loading', () => {
		it('renders an empty folder without rows', () => {
			render(<FolderList title="Empty" items={[]} />);
			expect(screen.queryByText('Read Me')).not.toBeInTheDocument();
		});

		it('shows a custom empty state', () => {
			render(
				<FolderList title="Empty" items={[]} emptyState={<span>There are no items.</span>} />
			);
			expect(screen.getByText('There are no items.')).toBeInTheDocument();
		});
	});

	it('keeps its generic row type through the callback', () => {
		const seen: string[] = [];
		render(
			<FolderList<FileRow>
				title="Macintosh HD"
				items={ITEMS}
				// `row.size` compiles only if TItem survived forwardRef.
				onItemOpen={(row) => seen.push(row.size)}
			/>
		);

		fireEvent.doubleClick(screen.getByText('Read Me'));

		expect(nth(seen, 0)).toBe('4 KB');
	});

	it('has no automatically detectable accessibility violations', async () => {
		const { container } = render(
			<FolderList title="Macintosh HD" items={ITEMS} onClose={() => {}} />
		);
		expect(await checkA11y(container)).toHaveNoViolations();
	});
});
