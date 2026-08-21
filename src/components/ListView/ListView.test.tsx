// ListView Component Tests
//
// Covers selection semantics (including Shift extending rather than
// replacing), the empty and loading states, sorting, and the render props.

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { useState } from 'react';
import { ListView, type ListColumn, type ListItem } from './ListView';
import { checkA11y } from '../../test/axe';

const columns: ListColumn[] = [
	{ key: 'name', label: 'Name' },
	{ key: 'size', label: 'Size' },
];

const items: ListItem[] = [
	{ id: 'a', name: 'Alpha', size: '1 KB' },
	{ id: 'b', name: 'Bravo', size: '2 KB' },
	{ id: 'c', name: 'Charlie', size: '3 KB' },
	{ id: 'd', name: 'Delta', size: '4 KB' },
];

/**
 * ListView's selection is controlled: it reads `selectedIds` and reports
 * changes through `onSelectionChange`. Multi-click behaviour therefore only
 * makes sense against a harness that feeds the new selection back in.
 */
function ControlledList({ onChange }: { onChange: (ids: string[]) => void }) {
	const [selected, setSelected] = useState<string[]>([]);
	return (
		<ListView
			columns={columns}
			items={items}
			selectedIds={selected}
			onSelectionChange={(ids) => {
				setSelected(ids);
				onChange(ids);
			}}
		/>
	);
}

describe('ListView', () => {
	it('renders headers and every row', () => {
		render(<ListView columns={columns} items={items} />);

		expect(screen.getByText('Name')).toBeInTheDocument();
		expect(screen.getByText('Size')).toBeInTheDocument();
		expect(screen.getByText('Alpha')).toBeInTheDocument();
		expect(screen.getByText('Delta')).toBeInTheDocument();
	});

	it('renders each row without a React key warning', () => {
		const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
		render(<ListView columns={columns} items={items} />);
		const keyWarnings = spy.mock.calls.filter((call) => String(call[0]).includes('unique "key"'));
		expect(keyWarnings).toHaveLength(0);
		spy.mockRestore();
	});

	describe('states', () => {
		it('shows an empty state rather than a blank box', () => {
			render(<ListView columns={columns} items={[]} />);
			expect(screen.getByText('No items')).toBeInTheDocument();
		});

		it('accepts custom empty content', () => {
			render(
				<ListView columns={columns} items={[]} emptyState={<span>This folder is empty</span>} />
			);
			expect(screen.getByText('This folder is empty')).toBeInTheDocument();
		});

		it('shows the loading state and marks the body busy', () => {
			const { container } = render(<ListView columns={columns} items={items} loading />);
			expect(screen.getByText('Loading…')).toBeInTheDocument();
			expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
			expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
		});

		it('prefers the loading state over the empty state', () => {
			render(<ListView columns={columns} items={[]} loading />);
			expect(screen.getByText('Loading…')).toBeInTheDocument();
			expect(screen.queryByText('No items')).not.toBeInTheDocument();
		});
	});

	describe('selection', () => {
		it('selects a single row on click', () => {
			const onSelectionChange = vi.fn();
			render(<ListView columns={columns} items={items} onSelectionChange={onSelectionChange} />);

			fireEvent.click(screen.getByText('Bravo'));

			expect(onSelectionChange).toHaveBeenCalledWith(['b']);
		});

		it('toggles with the meta key', () => {
			const onSelectionChange = vi.fn();
			render(
				<ListView
					columns={columns}
					items={items}
					selectedIds={['a']}
					onSelectionChange={onSelectionChange}
				/>
			);

			fireEvent.click(screen.getByText('Charlie'), { metaKey: true });
			expect(onSelectionChange).toHaveBeenCalledWith(['a', 'c']);
		});

		it('deselects an already-selected row with the meta key', () => {
			const onSelectionChange = vi.fn();
			render(
				<ListView
					columns={columns}
					items={items}
					selectedIds={['a', 'c']}
					onSelectionChange={onSelectionChange}
				/>
			);

			fireEvent.click(screen.getByText('Alpha'), { metaKey: true });
			expect(onSelectionChange).toHaveBeenCalledWith(['c']);
		});

		it('extends the previous selection with Shift instead of replacing it', () => {
			const onChange = vi.fn();
			render(<ControlledList onChange={onChange} />);

			// Pick Alpha, add Charlie with meta, then Shift-click Delta.
			fireEvent.click(screen.getByText('Alpha'));
			fireEvent.click(screen.getByText('Charlie'), { metaKey: true });
			fireEvent.click(screen.getByText('Delta'), { shiftKey: true });

			// Charlie is the anchor, so the c..d range joins the a and c the
			// user had already chosen — Alpha is not discarded.
			expect(onChange).toHaveBeenLastCalledWith(['a', 'c', 'd']);
		});

		it('selects the whole range between anchor and target', () => {
			const onChange = vi.fn();
			render(<ControlledList onChange={onChange} />);

			fireEvent.click(screen.getByText('Alpha'));
			fireEvent.click(screen.getByText('Delta'), { shiftKey: true });

			expect(onChange).toHaveBeenLastCalledWith(['a', 'b', 'c', 'd']);
		});

		it('marks selected rows in the DOM', () => {
			const { container } = render(
				<ListView columns={columns} items={items} selectedIds={['b']} />
			);
			const selected = container.querySelectorAll('[data-selected="true"]');
			expect(selected).toHaveLength(1);
			expect(within(selected[0] as HTMLElement).getByText('Bravo')).toBeInTheDocument();
		});
	});

	describe('interaction callbacks', () => {
		it('opens an item on double click', () => {
			const onItemOpen = vi.fn();
			render(<ListView columns={columns} items={items} onItemOpen={onItemOpen} />);

			fireEvent.doubleClick(screen.getByText('Bravo'));

			expect(onItemOpen).toHaveBeenCalledWith(expect.objectContaining({ id: 'b' }));
		});

		it('reports row hover', () => {
			const onItemMouseEnter = vi.fn();
			const onItemMouseLeave = vi.fn();
			render(
				<ListView
					columns={columns}
					items={items}
					onItemMouseEnter={onItemMouseEnter}
					onItemMouseLeave={onItemMouseLeave}
				/>
			);

			const cell = screen.getByText('Alpha');
			fireEvent.mouseEnter(cell.parentElement as HTMLElement);
			expect(onItemMouseEnter).toHaveBeenCalledWith(expect.objectContaining({ id: 'a' }));

			fireEvent.mouseLeave(cell.parentElement as HTMLElement);
			expect(onItemMouseLeave).toHaveBeenCalledWith(expect.objectContaining({ id: 'a' }));
		});

		it('reports cell clicks with their column', () => {
			const onCellClick = vi.fn();
			render(<ListView columns={columns} items={items} onCellClick={onCellClick} />);

			fireEvent.click(screen.getByText('2 KB'));

			expect(onCellClick).toHaveBeenCalledWith(
				expect.objectContaining({ id: 'b' }),
				expect.objectContaining({ key: 'size' }),
				expect.anything()
			);
		});
	});

	describe('sorting', () => {
		it('toggles direction on repeated header clicks', () => {
			const onSort = vi.fn();
			render(<ListView columns={columns} items={items} onSort={onSort} />);

			fireEvent.click(screen.getByText('Name'));
			expect(onSort).toHaveBeenCalledWith('name', 'asc');

			fireEvent.click(screen.getByText('Name'));
			expect(onSort).toHaveBeenLastCalledWith('name', 'desc');
		});

		it('does not sort a column marked unsortable', () => {
			const onSort = vi.fn();
			render(
				<ListView
					columns={[{ key: 'name', label: 'Name', sortable: false }]}
					items={items}
					onSort={onSort}
				/>
			);

			fireEvent.click(screen.getByText('Name'));

			expect(onSort).not.toHaveBeenCalled();
		});
	});

	describe('render props', () => {
		it('lets renderCell replace cell content', () => {
			render(
				<ListView
					columns={columns}
					items={items}
					renderCell={(value, item, column) =>
						column.key === 'name' ? <strong>{`${item.id}:${String(value)}`}</strong> : String(value)
					}
				/>
			);
			expect(screen.getByText('a:Alpha')).toBeInTheDocument();
		});

		it('lets renderRow replace the row entirely', () => {
			render(
				<ListView
					columns={columns}
					items={items}
					renderRow={(item, state) => (
						<div key={item.id} data-testid="custom-row">
							{`${String(item.name)} @ ${state.index}`}
						</div>
					)}
				/>
			);
			expect(screen.getAllByTestId('custom-row')).toHaveLength(4);
			expect(screen.getByText('Charlie @ 2')).toBeInTheDocument();
		});
	});

	it('renders non-string cell values without crashing', () => {
		render(
			<ListView
				columns={[{ key: 'count', label: 'Count' }]}
				items={[
					{ id: '1', count: 42 },
					{ id: '2', count: null },
					{ id: '3', count: undefined },
				]}
			/>
		);
		expect(screen.getByText('42')).toBeInTheDocument();
	});

	describe('keyboard (WCAG 2.1.1)', () => {
		it('exposes rows as listbox options', () => {
			render(<ListView columns={columns} items={items} ariaLabel="Files" />);

			const listbox = screen.getByRole('listbox', { name: 'Files' });
			expect(listbox).toHaveAttribute('aria-multiselectable', 'true');
			expect(screen.getAllByRole('option')).toHaveLength(4);
		});

		it('drops the listbox role while empty, since it would have no options', () => {
			render(<ListView columns={columns} items={[]} />);
			expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
		});

		it('keeps a single tab stop across the rows', () => {
			render(<ListView columns={columns} items={items} />);
			const tabbable = screen
				.getAllByRole('option')
				.filter((row) => row.getAttribute('tabindex') === '0');
			expect(tabbable).toHaveLength(1);
		});

		it('moves and selects with the arrow keys', () => {
			const onChange = vi.fn();
			render(<ControlledList onChange={onChange} />);

			const rows = screen.getAllByRole('option');
			rows[0].focus();
			fireEvent.keyDown(rows[0], { key: 'ArrowDown' });

			expect(onChange).toHaveBeenLastCalledWith(['b']);
			expect(screen.getAllByRole('option')[1]).toHaveFocus();
		});

		it('jumps to the ends with Home and End', () => {
			const onChange = vi.fn();
			render(<ControlledList onChange={onChange} />);

			const rows = screen.getAllByRole('option');
			rows[0].focus();

			fireEvent.keyDown(rows[0], { key: 'End' });
			expect(onChange).toHaveBeenLastCalledWith(['d']);

			fireEvent.keyDown(screen.getAllByRole('option')[3], { key: 'Home' });
			expect(onChange).toHaveBeenLastCalledWith(['a']);
		});

		it('extends the selection with Shift and an arrow key', () => {
			const onChange = vi.fn();
			render(<ControlledList onChange={onChange} />);

			const rows = screen.getAllByRole('option');
			fireEvent.click(screen.getByText('Alpha'));
			fireEvent.keyDown(rows[0], { key: 'ArrowDown', shiftKey: true });

			expect(onChange).toHaveBeenLastCalledWith(['a', 'b']);
		});

		it('opens an item with Enter', () => {
			const onItemOpen = vi.fn();
			render(<ListView columns={columns} items={items} onItemOpen={onItemOpen} />);

			fireEvent.keyDown(screen.getAllByRole('option')[2], { key: 'Enter' });

			expect(onItemOpen).toHaveBeenCalledWith(expect.objectContaining({ id: 'c' }));
		});

		it('selects with Space without opening', () => {
			const onItemOpen = vi.fn();
			const onSelectionChange = vi.fn();
			render(
				<ListView
					columns={columns}
					items={items}
					onItemOpen={onItemOpen}
					onSelectionChange={onSelectionChange}
				/>
			);

			fireEvent.keyDown(screen.getAllByRole('option')[1], { key: ' ' });

			expect(onSelectionChange).toHaveBeenCalledWith(['b']);
			expect(onItemOpen).not.toHaveBeenCalled();
		});

		it('makes sortable headers operable and announces sort state', () => {
			const onSort = vi.fn();
			render(<ListView columns={columns} items={items} onSort={onSort} />);

			const header = screen.getByRole('button', { name: 'Name, sortable' });
			expect(header).toHaveAttribute('tabindex', '0');

			fireEvent.keyDown(header, { key: 'Enter' });
			expect(onSort).toHaveBeenCalledWith('name', 'asc');

			// Sort state is carried by the accessible name. aria-sort is only
			// valid on columnheader/rowheader/row, and these headers are
			// buttons — setting it there would be invalid ARIA.
			expect(screen.getByRole('button', { name: 'Name, sorted ascending' })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /Name/ })).not.toHaveAttribute('aria-sort');
		});

		it('does not make an unsortable header a control', () => {
			render(
				<ListView columns={[{ key: 'name', label: 'Name', sortable: false }]} items={items} />
			);
			expect(screen.queryByRole('button', { name: /Name/ })).not.toBeInTheDocument();
		});
	});

	it('has no automatically detectable accessibility violations', async () => {
		const { container } = render(<ListView columns={columns} items={items} selectedIds={['a']} />);
		expect(await checkA11y(container)).toHaveNoViolations();
	});
});
