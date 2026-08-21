// The change-callback convention.
//
// `onChange` is the native DOM change handler, on the components that wrap a
// native input. `onValueChange` is the parsed value, on every component that
// reports one. 1.x also accepted `onChange` for a value and warned; 2.0
// removed those aliases, so the two names never overlap.

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

describe('the value-shaped onChange alias, removed in 2.0', () => {
	// These components report a value, not a DOM event, so `onValueChange` is
	// the only name they answer to. 1.x accepted `onChange` for the same thing
	// and warned; 2.0 removed it. The cast is how a 1.x caller's code reaches
	// the component now that the prop is off the type — the point of the test
	// is that it is inert rather than quietly still wired up.
	it('is gone from RadioGroup', () => {
		const onChange = vi.fn();
		const legacy = { onChange } as unknown as { onValueChange?: (value: string) => void };
		render(
			<RadioGroup name="v" aria-label="v" {...legacy}>
				<Radio value="icon" label="Icons" />
				<Radio value="list" label="List" />
			</RadioGroup>
		);
		fireEvent.click(screen.getByLabelText('List'));

		expect(onChange).not.toHaveBeenCalled();
	});

	it('is gone from Tabs', () => {
		const onChange = vi.fn();
		const legacy = { onChange } as unknown as {
			onValueChange?: (value: string | undefined, index: number) => void;
		};
		render(
			<Tabs {...legacy}>
				<TabPanel label="One" value="one">
					1
				</TabPanel>
				<TabPanel label="Two" value="two">
					2
				</TabPanel>
			</Tabs>
		);
		fireEvent.click(screen.getByRole('tab', { name: 'Two' }));

		expect(onChange).not.toHaveBeenCalled();
	});

	it('is gone from Scrollbar', () => {
		const onChange = vi.fn();
		const legacy = { onChange } as unknown as { onValueChange?: (value: number) => void };
		render(<Scrollbar aria-label="Doc" value={0.5} viewportRatio={0.3} {...legacy} />);
		fireEvent.keyDown(screen.getByRole('scrollbar'), { key: 'End' });

		expect(onChange).not.toHaveBeenCalled();
	});
});
