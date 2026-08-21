// Tabs Component Tests
//
// Covers the ARIA wiring, per-instance ids, keyboard navigation, disabled
// tabs, and the panel focusability the review flagged.

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tabs, TabPanel } from './Tabs';
import { checkA11y } from '../../test/axe';
import { nth } from '../../test/nth';

describe('Tabs', () => {
	it('renders a tab per panel and shows the first by default', () => {
		render(
			<Tabs>
				<TabPanel label="General">General content</TabPanel>
				<TabPanel label="Advanced">Advanced content</TabPanel>
			</Tabs>
		);

		expect(screen.getAllByRole('tab')).toHaveLength(2);
		expect(screen.getByText('General content')).toBeInTheDocument();
		expect(screen.queryByText('Advanced content')).not.toBeInTheDocument();
	});

	it('honours defaultActiveTab', () => {
		render(
			<Tabs defaultActiveTab={1}>
				<TabPanel label="One">First</TabPanel>
				<TabPanel label="Two">Second</TabPanel>
			</Tabs>
		);
		expect(screen.getByRole('tab', { name: 'Two' })).toHaveAttribute('aria-selected', 'true');
	});

	it('switches panels on click and reports the change', () => {
		const onChange = vi.fn();
		render(
			<Tabs onChange={onChange}>
				<TabPanel label="One" value="one">
					First
				</TabPanel>
				<TabPanel label="Two" value="two">
					Second
				</TabPanel>
			</Tabs>
		);

		fireEvent.click(screen.getByRole('tab', { name: 'Two' }));

		expect(onChange).toHaveBeenCalledWith(1, 'two');
		expect(screen.getByText('Second')).toBeInTheDocument();
	});

	it('respects a controlled activeTab', () => {
		const onChange = vi.fn();
		render(
			<Tabs activeTab={0} onChange={onChange}>
				<TabPanel label="One">First</TabPanel>
				<TabPanel label="Two">Second</TabPanel>
			</Tabs>
		);

		fireEvent.click(screen.getByRole('tab', { name: 'Two' }));

		// The parent owns the state, so the panel does not move on its own.
		expect(onChange).toHaveBeenCalledWith(1, undefined);
		expect(screen.getByText('First')).toBeInTheDocument();
	});

	describe('children handling', () => {
		it('accepts conditional and fragmented children', () => {
			const showAdvanced = false;
			render(
				<Tabs>
					<TabPanel label="General">General</TabPanel>
					{showAdvanced && <TabPanel label="Advanced">Advanced</TabPanel>}
					<TabPanel label="About">About</TabPanel>
				</Tabs>
			);

			expect(screen.getAllByRole('tab')).toHaveLength(2);
			expect(screen.getByRole('tab', { name: 'About' })).toBeInTheDocument();
		});

		it('accepts children produced by a map', () => {
			render(
				<Tabs>
					{['A', 'B', 'C'].map((name) => (
						<TabPanel key={name} label={name}>
							{`${name} body`}
						</TabPanel>
					))}
				</Tabs>
			);
			expect(screen.getAllByRole('tab')).toHaveLength(3);
		});
	});

	describe('ARIA wiring', () => {
		it('links each tab to its panel', () => {
			render(
				<Tabs>
					<TabPanel label="One">First</TabPanel>
				</Tabs>
			);

			const tab = screen.getByRole('tab');
			const panel = screen.getByRole('tabpanel');

			expect(tab).toHaveAttribute('aria-controls', panel.id);
			expect(panel).toHaveAttribute('aria-labelledby', tab.id);
		});

		it('gives two Tabs instances distinct ids', () => {
			render(
				<>
					<Tabs ariaLabel="First set">
						<TabPanel label="A">A body</TabPanel>
					</Tabs>
					<Tabs ariaLabel="Second set">
						<TabPanel label="B">B body</TabPanel>
					</Tabs>
				</>
			);

			const tabs = screen.getAllByRole('tab');
			const first = nth(tabs, 0);
			const second = nth(tabs, 1);
			expect(first.id).not.toBe(second.id);
			expect(first.getAttribute('aria-controls')).not.toBe(second.getAttribute('aria-controls'));
		});

		it('makes the active panel focusable so it is reachable by keyboard', () => {
			render(
				<Tabs>
					<TabPanel label="Static">Just text, nothing focusable.</TabPanel>
				</Tabs>
			);
			expect(screen.getByRole('tabpanel')).toHaveAttribute('tabindex', '0');
		});

		it('keeps only the selected tab in the tab order', () => {
			render(
				<Tabs>
					<TabPanel label="One">First</TabPanel>
					<TabPanel label="Two">Second</TabPanel>
				</Tabs>
			);

			const allTabs = screen.getAllByRole('tab');
			const one = nth(allTabs, 0);
			const two = nth(allTabs, 1);
			expect(one).toHaveAttribute('tabindex', '0');
			expect(two).toHaveAttribute('tabindex', '-1');
		});

		it('supports ariaLabelledBy', () => {
			render(
				<>
					<h2 id="settings-heading">Settings</h2>
					<Tabs ariaLabelledBy="settings-heading">
						<TabPanel label="One">First</TabPanel>
					</Tabs>
				</>
			);
			expect(screen.getByRole('tablist')).toHaveAccessibleName('Settings');
		});
	});

	describe('keyboard navigation', () => {
		const renderThree = () =>
			render(
				<Tabs>
					<TabPanel label="One">First</TabPanel>
					<TabPanel label="Two">Second</TabPanel>
					<TabPanel label="Three">Third</TabPanel>
				</Tabs>
			);

		it('moves right with ArrowRight', () => {
			renderThree();
			fireEvent.keyDown(screen.getByRole('tab', { name: 'One' }), { key: 'ArrowRight' });
			expect(screen.getByRole('tab', { name: 'Two' })).toHaveAttribute('aria-selected', 'true');
		});

		it('wraps from the last tab to the first', () => {
			renderThree();
			fireEvent.click(screen.getByRole('tab', { name: 'Three' }));
			fireEvent.keyDown(screen.getByRole('tab', { name: 'Three' }), { key: 'ArrowRight' });
			expect(screen.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true');
		});

		it('wraps backwards from the first tab to the last', () => {
			renderThree();
			fireEvent.keyDown(screen.getByRole('tab', { name: 'One' }), { key: 'ArrowLeft' });
			expect(screen.getByRole('tab', { name: 'Three' })).toHaveAttribute('aria-selected', 'true');
		});

		it('jumps to the ends with Home and End', () => {
			renderThree();
			fireEvent.keyDown(screen.getByRole('tab', { name: 'One' }), { key: 'End' });
			expect(screen.getByRole('tab', { name: 'Three' })).toHaveAttribute('aria-selected', 'true');

			fireEvent.keyDown(screen.getByRole('tab', { name: 'Three' }), { key: 'Home' });
			expect(screen.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true');
		});

		it('ignores unrelated keys', () => {
			renderThree();
			fireEvent.keyDown(screen.getByRole('tab', { name: 'One' }), { key: 'x' });
			expect(screen.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true');
		});
	});

	describe('disabled tabs', () => {
		it('does not activate a disabled tab on click', () => {
			const onChange = vi.fn();
			render(
				<Tabs onChange={onChange}>
					<TabPanel label="One">First</TabPanel>
					<TabPanel label="Two" disabled>
						Second
					</TabPanel>
				</Tabs>
			);

			fireEvent.click(screen.getByRole('tab', { name: 'Two' }));

			expect(onChange).not.toHaveBeenCalled();
			expect(screen.getByText('First')).toBeInTheDocument();
		});

		it('skips a disabled tab when arrowing past it', () => {
			render(
				<Tabs>
					<TabPanel label="One">First</TabPanel>
					<TabPanel label="Two" disabled>
						Second
					</TabPanel>
					<TabPanel label="Three">Third</TabPanel>
				</Tabs>
			);

			fireEvent.keyDown(screen.getByRole('tab', { name: 'One' }), { key: 'ArrowRight' });

			expect(screen.getByRole('tab', { name: 'Three' })).toHaveAttribute('aria-selected', 'true');
		});
	});

	it('has no automatically detectable accessibility violations', async () => {
		const { container } = render(
			<Tabs ariaLabel="Settings sections">
				<TabPanel label="General">General content</TabPanel>
				<TabPanel label="Advanced">Advanced content</TabPanel>
			</Tabs>
		);
		expect(await checkA11y(container)).toHaveNoViolations();
	});
});
