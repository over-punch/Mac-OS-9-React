// The change-callback convention.
//
// `onChange` is the native DOM change handler, on the components that wrap a
// native input. `onValueChange` is the parsed value, on every component that
// reports one. Where a component previously used `onChange` for a value, that
// name still works and warns once.

import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { resetDeprecationWarnings } from './deprecation';

import { Tabs, TabPanel } from '../components/Tabs/Tabs';
import { Radio, RadioGroup } from '../components/Radio/Radio';
import { Scrollbar } from '../components/Scrollbar/Scrollbar';
import { Select } from '../components/Select/Select';
import { Checkbox } from '../components/Checkbox/Checkbox';
import { TextField } from '../components/TextField/TextField';

let warn: MockInstance<(...args: unknown[]) => void>;

beforeEach(() => {
	resetDeprecationWarnings();
	warn = vi.spyOn(console, 'warn').mockImplementation(() => {}) as unknown as MockInstance<
		(...args: unknown[]) => void
	>;
});

afterEach(() => {
	warn.mockRestore();
});

describe('onChange means the native event', () => {
	it('Checkbox passes the DOM event', () => {
		const onChange = vi.fn();
		render(<Checkbox label="Toggle" onChange={onChange} />);
		fireEvent.click(screen.getByLabelText('Toggle'));
		expect(onChange.mock.calls[0]?.[0]).toHaveProperty('target');
		expect(warn).not.toHaveBeenCalled();
	});

	it('TextField passes the DOM event', () => {
		const onChange = vi.fn();
		render(<TextField label="Name" onChange={onChange} />);
		fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Quinn' } });
		expect(onChange.mock.calls[0]?.[0]).toHaveProperty('target');
		expect(warn).not.toHaveBeenCalled();
	});
});

describe('onValueChange means the parsed value', () => {
	it('Select reports the value', () => {
		const onValueChange = vi.fn();
		render(
			<Select
				label="Sort"
				options={[
					{ value: 'name', label: 'Name' },
					{ value: 'date', label: 'Date' },
				]}
				onValueChange={onValueChange}
			/>
		);
		fireEvent.click(screen.getByRole('combobox'));
		fireEvent.click(screen.getByRole('option', { name: 'Date' }));
		expect(onValueChange).toHaveBeenCalledWith('date');
	});

	it('RadioGroup reports the value', () => {
		const onValueChange = vi.fn();
		render(
			<RadioGroup name="v" aria-label="v" onValueChange={onValueChange}>
				<Radio value="icon" label="Icons" />
				<Radio value="list" label="List" />
			</RadioGroup>
		);
		fireEvent.click(screen.getByLabelText('List'));
		expect(onValueChange).toHaveBeenCalledWith('list');
		expect(warn).not.toHaveBeenCalled();
	});

	it('Scrollbar reports the value', () => {
		const onValueChange = vi.fn();
		render(
			<Scrollbar
				aria-label="Scroll"
				value={0.5}
				viewportRatio={0.2}
				onValueChange={onValueChange}
			/>
		);
		fireEvent.keyDown(screen.getByRole('scrollbar'), { key: 'ArrowDown' });
		expect(onValueChange).toHaveBeenCalled();
		expect(typeof onValueChange.mock.calls[0]?.[0]).toBe('number');
	});

	it('Tabs leads with the value and follows with the index', () => {
		const onValueChange = vi.fn();
		render(
			<Tabs onValueChange={onValueChange}>
				<TabPanel label="One" value="one">
					1
				</TabPanel>
				<TabPanel label="Two" value="two">
					2
				</TabPanel>
			</Tabs>
		);
		fireEvent.click(screen.getByRole('tab', { name: 'Two' }));
		expect(onValueChange).toHaveBeenCalledWith('two', 1);
	});
});

describe('the deprecated value-shaped onChange', () => {
	it('still works on RadioGroup, and warns once', () => {
		const onChange = vi.fn();
		render(
			<RadioGroup name="v" aria-label="v" onChange={onChange}>
				<Radio value="icon" label="Icons" />
				<Radio value="list" label="List" />
			</RadioGroup>
		);
		fireEvent.click(screen.getByLabelText('List'));

		expect(onChange).toHaveBeenCalledWith('list');
		expect(
			warn.mock.calls.filter((call: unknown[]) => String(call[0]).includes('`onChange`'))
		).toHaveLength(1);
	});

	it('still works on Tabs, with the old argument order', () => {
		const onChange = vi.fn();
		render(
			<Tabs onChange={onChange}>
				<TabPanel label="One" value="one">
					1
				</TabPanel>
				<TabPanel label="Two" value="two">
					2
				</TabPanel>
			</Tabs>
		);
		fireEvent.click(screen.getByRole('tab', { name: 'Two' }));
		expect(onChange).toHaveBeenCalledWith(1, 'two');
	});

	it('loses to onValueChange when both are given', () => {
		const onChange = vi.fn();
		const onValueChange = vi.fn();
		render(
			<RadioGroup name="v" aria-label="v" onChange={onChange} onValueChange={onValueChange}>
				<Radio value="icon" label="Icons" />
				<Radio value="list" label="List" />
			</RadioGroup>
		);
		fireEvent.click(screen.getByLabelText('List'));

		expect(onValueChange).toHaveBeenCalledWith('list');
		expect(onChange).not.toHaveBeenCalled();
	});
});
