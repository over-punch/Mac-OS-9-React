// Select Component Tests
//
// Covers the custom listbox: combobox semantics, keyboard navigation,
// type-ahead, groups, and form participation.

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { Select, type SelectOption } from './Select';

afterEach(cleanup);

const options: SelectOption[] = [
	{ value: 'red', label: 'Red' },
	{ value: 'green', label: 'Green' },
	{ value: 'blue', label: 'Blue' },
	{ value: 'grey', label: 'Grey', disabled: true },
];

function trigger(): HTMLElement {
	return screen.getByRole('combobox');
}

describe('Select', () => {
	// ========================================
	// Combobox semantics (issue #38)
	// ========================================

	it('renders a combobox rather than a native select', () => {
		const { container } = render(<Select label="Colour" options={options} />);
		expect(trigger()).toBeInTheDocument();
		expect(container.querySelector('select')).toBeNull();
	});

	it('shows the placeholder when nothing is selected', () => {
		render(<Select options={options} placeholder="Pick one" />);
		expect(trigger()).toHaveTextContent('Pick one');
	});

	it('opens the listbox on click and marks aria-expanded', () => {
		render(<Select label="Colour" options={options} />);
		expect(trigger()).toHaveAttribute('aria-expanded', 'false');
		expect(screen.queryByRole('listbox')).toBeNull();

		fireEvent.click(trigger());
		expect(trigger()).toHaveAttribute('aria-expanded', 'true');
		expect(screen.getByRole('listbox')).toBeInTheDocument();
		expect(screen.getAllByRole('option')).toHaveLength(4);
	});

	it('takes its accessible name from the label', () => {
		render(<Select label="Colour" options={options} />);
		expect(trigger()).toHaveAccessibleName('Colour');
	});

	it('marks the selected option with aria-selected', () => {
		render(<Select options={options} value="green" />);
		fireEvent.click(trigger());
		const selected = screen
			.getAllByRole('option')
			.filter((o) => o.getAttribute('aria-selected') === 'true');
		expect(selected).toHaveLength(1);
		expect(selected[0]).toHaveTextContent('Green');
	});

	// ========================================
	// Selection
	// ========================================

	it('selects an option on click and closes', () => {
		const onValueChange = vi.fn();
		render(<Select options={options} onValueChange={onValueChange} />);
		fireEvent.click(trigger());
		fireEvent.click(screen.getByRole('option', { name: /Blue/ }));

		expect(onValueChange).toHaveBeenCalledWith('blue');
		expect(screen.queryByRole('listbox')).toBeNull();
	});

	it('ignores clicks on disabled options', () => {
		const onValueChange = vi.fn();
		render(<Select options={options} onValueChange={onValueChange} />);
		fireEvent.click(trigger());
		fireEvent.click(screen.getByRole('option', { name: /Grey/ }));
		expect(onValueChange).not.toHaveBeenCalled();
	});

	it('works uncontrolled from a defaultValue', () => {
		render(<Select options={options} defaultValue="red" />);
		expect(trigger()).toHaveTextContent('Red');
		fireEvent.click(trigger());
		fireEvent.click(screen.getByRole('option', { name: /Green/ }));
		expect(trigger()).toHaveTextContent('Green');
	});

	// ========================================
	// Keyboard (issue #38)
	// ========================================

	it('opens with ArrowDown', () => {
		render(<Select options={options} />);
		fireEvent.keyDown(trigger(), { key: 'ArrowDown' });
		expect(screen.getByRole('listbox')).toBeInTheDocument();
	});

	it('moves the cursor with arrows and tracks aria-activedescendant', () => {
		render(<Select options={options} />);
		fireEvent.click(trigger());
		const first = trigger().getAttribute('aria-activedescendant');

		fireEvent.keyDown(trigger(), { key: 'ArrowDown' });
		expect(trigger().getAttribute('aria-activedescendant')).not.toBe(first);
	});

	it('skips disabled options when navigating', () => {
		render(<Select options={options} />);
		fireEvent.click(trigger());
		// Cursor starts at Red; End should land on Blue, not the disabled Grey.
		fireEvent.keyDown(trigger(), { key: 'End' });
		fireEvent.keyDown(trigger(), { key: 'Enter' });
		expect(trigger()).toHaveTextContent('Blue');
	});

	it('commits the cursor position with Enter', () => {
		const onValueChange = vi.fn();
		render(<Select options={options} onValueChange={onValueChange} />);
		fireEvent.click(trigger());
		fireEvent.keyDown(trigger(), { key: 'ArrowDown' });
		fireEvent.keyDown(trigger(), { key: 'Enter' });
		expect(onValueChange).toHaveBeenCalledWith('green');
	});

	it('closes on Escape without selecting', () => {
		const onValueChange = vi.fn();
		render(<Select options={options} onValueChange={onValueChange} />);
		fireEvent.click(trigger());
		fireEvent.keyDown(trigger(), { key: 'Escape' });
		expect(screen.queryByRole('listbox')).toBeNull();
		expect(onValueChange).not.toHaveBeenCalled();
	});

	it('supports type-ahead while open', () => {
		render(<Select options={options} />);
		fireEvent.click(trigger());
		fireEvent.keyDown(trigger(), { key: 'b' });
		fireEvent.keyDown(trigger(), { key: 'Enter' });
		expect(trigger()).toHaveTextContent('Blue');
	});

	it('supports type-ahead while closed', () => {
		const onValueChange = vi.fn();
		render(<Select options={options} onValueChange={onValueChange} />);
		fireEvent.keyDown(trigger(), { key: 'g' });
		expect(onValueChange).toHaveBeenCalledWith('green');
	});

	// ========================================
	// Groups
	// ========================================

	it('draws one heading per group', () => {
		render(
			<Select
				options={[
					{ value: 'us', label: 'United States', group: 'North America' },
					{ value: 'ca', label: 'Canada', group: 'North America' },
					{ value: 'fr', label: 'France', group: 'Europe' },
				]}
			/>
		);
		fireEvent.click(trigger());
		expect(screen.getByText('North America')).toBeInTheDocument();
		expect(screen.getByText('Europe')).toBeInTheDocument();
	});

	// ========================================
	// Forms and validation
	// ========================================

	it('carries its value in a hidden input for form submission', () => {
		const { container } = render(<Select name="colour" options={options} value="red" />);
		const hidden = container.querySelector('input[type="hidden"]') as HTMLInputElement;
		expect(hidden).toBeInTheDocument();
		expect(hidden.name).toBe('colour');
		expect(hidden.value).toBe('red');
	});

	it('wires error message and aria-invalid', () => {
		render(<Select options={options} error errorMessage="Required field" />);
		expect(trigger()).toHaveAttribute('aria-invalid', 'true');
		expect(screen.getByRole('alert')).toHaveTextContent('Required field');
		expect(trigger().getAttribute('aria-describedby')).toContain('error');
	});

	it('does not open when disabled', () => {
		render(<Select options={options} disabled />);
		fireEvent.click(trigger());
		expect(screen.queryByRole('listbox')).toBeNull();
	});
});
