// Standard aria-* props and their deprecated camelCase aliases.
//
// Every component accepts the standard attribute now. The camelCase names are
// still honoured because they were public API, but they warn once and lose to
// the standard form.

import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest';
import { render, screen } from '@testing-library/react';
import { resetDeprecationWarnings } from './deprecation';

import { Tabs, TabPanel } from '../components/Tabs/Tabs';
import { ListView } from '../components/ListView/ListView';
import { Scrollbar } from '../components/Scrollbar/Scrollbar';
import { Dialog } from '../components/Dialog/Dialog';
import { TextField } from '../components/TextField/TextField';
import { Checkbox } from '../components/Checkbox/Checkbox';
import { Radio, RadioGroup } from '../components/Radio/Radio';
import { Button } from '../components/Button/Button';

const columns = [{ key: 'name', label: 'Name' }];
const items = [{ id: '1', name: 'Read Me' }];

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

/** Did anything warn about the given deprecated prop name? */
const warnedAbout = (name: string) =>
	warn.mock.calls.some((call: unknown[]) => String(call[0]).includes(`\`${name}\``));

describe('standard aria-* props', () => {
	it('Tabs takes aria-label', () => {
		render(
			<Tabs aria-label="Settings sections">
				<TabPanel label="General">g</TabPanel>
			</Tabs>
		);
		expect(screen.getByRole('tablist')).toHaveAccessibleName('Settings sections');
		expect(warnedAbout('ariaLabel')).toBe(false);
	});

	it('ListView takes aria-label', () => {
		render(<ListView columns={columns} items={items} aria-label="Files" />);
		expect(screen.getByRole('listbox')).toHaveAccessibleName('Files');
	});

	it('Scrollbar takes aria-label', () => {
		render(<Scrollbar aria-label="Document scroll" viewportRatio={0.4} />);
		expect(screen.getByRole('scrollbar')).toHaveAccessibleName('Document scroll');
	});

	it('Dialog takes aria-label and aria-describedby', () => {
		render(
			<Dialog open title="Ignored" aria-label="Confirm quit" aria-describedby="why">
				<p id="why">Unsaved work will be lost.</p>
			</Dialog>
		);
		const dialog = screen.getByRole('dialog');
		expect(dialog).toHaveAccessibleName('Confirm quit');
		expect(dialog).toHaveAccessibleDescription('Unsaved work will be lost.');
	});

	it('TextField takes aria-label', () => {
		render(<TextField aria-label="Search files" />);
		expect(screen.getByLabelText('Search files')).toBeInTheDocument();
	});

	it('Checkbox takes aria-label', () => {
		render(<Checkbox aria-label="Show hidden files" />);
		expect(screen.getByLabelText('Show hidden files')).toBeInTheDocument();
	});

	it('RadioGroup takes aria-label', () => {
		render(
			<RadioGroup name="view" aria-label="View as">
				<Radio value="icon" label="Icons" />
			</RadioGroup>
		);
		expect(screen.getByRole('radiogroup')).toHaveAccessibleName('View as');
	});

	it('Button takes aria-label', () => {
		render(
			<Button iconOnly aria-label="Close window">
				<span>x</span>
			</Button>
		);
		expect(screen.getByRole('button')).toHaveAccessibleName('Close window');
	});
});

describe('deprecated camelCase aliases', () => {
	it('still work', () => {
		render(
			<Tabs ariaLabel="Legacy name">
				<TabPanel label="General">g</TabPanel>
			</Tabs>
		);
		expect(screen.getByRole('tablist')).toHaveAccessibleName('Legacy name');
	});

	it('warn once, naming the replacement', () => {
		const { rerender } = render(
			<Tabs ariaLabel="Legacy name">
				<TabPanel label="General">g</TabPanel>
			</Tabs>
		);
		rerender(
			<Tabs ariaLabel="Legacy name">
				<TabPanel label="General">g</TabPanel>
			</Tabs>
		);

		const matching = warn.mock.calls.filter((call: unknown[]) =>
			String(call[0]).includes('`ariaLabel`')
		);
		expect(matching).toHaveLength(1);
		expect(String(matching[0]?.[0])).toContain('aria-label');
	});

	it('lose to the standard attribute when both are given', () => {
		render(
			<Tabs ariaLabel="Legacy name" aria-label="Standard name">
				<TabPanel label="General">g</TabPanel>
			</Tabs>
		);
		expect(screen.getByRole('tablist')).toHaveAccessibleName('Standard name');
	});

	it('do not warn when unused', () => {
		render(
			<Tabs aria-label="Standard only">
				<TabPanel label="General">g</TabPanel>
			</Tabs>
		);
		expect(warn).not.toHaveBeenCalled();
	});
});
