// Accessibility of the whole thing, not one component at a time.
//
// a11y.test.tsx renders each component alone. That cannot see the failures
// that only appear when components coexist, which is precisely what a manual
// screen-reader pass catches:
//
//   - two components generating the same DOM id
//   - an aria-controls / labelledby / describedby pointing at nothing
//   - a heading level skipped between sections
//   - something focusable sitting inside an aria-hidden subtree, so a
//     keyboard user can reach a control a screen reader says is not there
//
// None of these fail a component's own suite, and all of them are real.

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { checkA11y } from './axe';
import { Window } from '../components/Window';
import { WindowManagerProvider } from '../components/WindowManager';
import { GroupBox } from '../components/GroupBox';
import { WindowHeader } from '../components/WindowHeader';
import { TreeView } from '../components/TreeView';
import { Placard } from '../components/Placard';
import { Slider } from '../components/Slider';
import { LittleArrows } from '../components/LittleArrows';
import { Progress } from '../components/Progress';
import { ChasingArrows } from '../components/ChasingArrows';
import { BevelButton } from '../components/BevelButton';
import { ClockControl } from '../components/ClockControl';
import { DisclosureTriangle } from '../components/DisclosureTriangle';
import { Separator } from '../components/Separator';
import { Checkbox } from '../components/Checkbox';
import { TextField } from '../components/TextField';
import { Select } from '../components/Select';
import { Tabs, TabPanel } from '../components/Tabs';
import { ListView } from '../components/ListView';
import { Button } from '../components/Button';

/** A realistic screenful: many components, several of each, all at once. */
function Desktop() {
	return (
		<WindowManagerProvider>
			<Window id="finder" title="Macintosh HD">
				<WindowHeader trailing="1.2 GB available">6 items</WindowHeader>
				<TreeView
					aria-label="Macintosh HD"
					defaultExpanded={['apps']}
					items={[
						{
							id: 'apps',
							label: 'Applications',
							children: [{ id: 'sherlock', label: 'Sherlock 2' }],
						},
						{ id: 'readme', label: 'Read Me' },
					]}
				/>
				<Placard>Page 3 of 12</Placard>
				<ChasingArrows label="Updating window contents" />
			</Window>

			<Window id="panel" title="Appearance">
				<GroupBox title="Desktop">
					<Slider label="Highlight intensity" defaultValue={60} />
					<Checkbox label="Show hidden files" />
				</GroupBox>
				<GroupBox title="Fonts" variant="secondary">
					<TextField id="size" label="Size" defaultValue="12" />
					<LittleArrows controls="size" stepLabel="font size" onStep={() => {}} />
				</GroupBox>
				<Separator />
				<ClockControl label="Menu bar clock" value={{ hours: 9, minutes: 41 }} />
				<div role="radiogroup" aria-label="Tools">
					<BevelButton behaviour="radio" selected aria-label="Pen">
						P
					</BevelButton>
					<BevelButton behaviour="radio" selected={false} aria-label="Brush">
						B
					</BevelButton>
				</div>
			</Window>

			<Window id="controls" title="Controls">
				<Select
					label="Sort by"
					options={[
						{ value: 'name', label: 'Name' },
						{ value: 'kind', label: 'Kind' },
					]}
					defaultValue="name"
				/>
				<Progress value={62} label="Copying files" showValue />
				<Progress label="Connecting to server" />
				<DisclosureTriangle label="Advanced" controls="advanced" />
				<div id="advanced">
					<Checkbox label="Rebuild the desktop database" />
					<Button>Apply</Button>
				</div>
				<Tabs aria-label="Views">
					<TabPanel value="list" label="List">
						<ListView
							aria-label="Files"
							columns={[{ key: 'name', label: 'Name' }]}
							items={[{ id: '1', name: 'Read Me' }]}
							height={80}
						/>
					</TabPanel>
					<TabPanel value="icon" label="Icon">
						Icons
					</TabPanel>
				</Tabs>
			</Window>
		</WindowManagerProvider>
	);
}

describe('a screenful of components together', () => {
	it('has no automatically detectable violations', async () => {
		const { container } = render(<Desktop />);
		expect(await checkA11y(container)).toHaveNoViolations();
	});

	it('generates no duplicate ids', () => {
		const { container } = render(<Desktop />);
		const ids = [...container.querySelectorAll('[id]')].map((el) => el.id);
		const seen = new Set<string>();
		const duplicates = ids.filter((id) => (seen.has(id) ? true : (seen.add(id), false)));

		// Two components minting the same id makes every aria reference to it
		// ambiguous, and nothing about either component alone reveals it.
		expect([...new Set(duplicates)]).toEqual([]);
	});

	it('never points an aria reference at something that is not there', () => {
		const { container } = render(<Desktop />);
		const dangling: string[] = [];

		for (const attribute of ['aria-controls', 'aria-labelledby', 'aria-describedby', 'aria-owns']) {
			for (const el of container.querySelectorAll(`[${attribute}]`)) {
				for (const id of (el.getAttribute(attribute) ?? '').split(/\s+/).filter(Boolean)) {
					// The document, not the container: dialogs and menus portal
					// out, so their targets legitimately live elsewhere.
					if (!document.getElementById(id)) {
						dangling.push(`${el.tagName.toLowerCase()}[${attribute}="${id}"]`);
					}
				}
			}
		}

		expect(dangling, 'these reference an element that does not exist').toEqual([]);
	});

	it('puts nothing focusable inside an aria-hidden subtree', () => {
		const { container } = render(<Desktop />);
		const reachable = [
			...container.querySelectorAll(
				'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
			),
			// tabindex="-1" is what takes something OUT of the tab order, so it
			// is not reachable however focusable it looks. TreeView's own
			// triangle is exactly this: aria-hidden and tabindex="-1", because
			// the row around it already announces the expanded state.
		].filter((el) => el.getAttribute('tabindex') !== '-1');

		// A control a keyboard user can reach but a screen reader says is not
		// there is worse than one that is simply missing.
		const hiddenButFocusable = reachable
			.filter((el) => el.closest('[aria-hidden="true"]'))
			.map((el) => (el.getAttribute('aria-label') || el.textContent || el.tagName).slice(0, 40));

		expect(hiddenButFocusable).toEqual([]);
	});

	it('uses no positive tabindex', () => {
		const { container } = render(<Desktop />);
		// A positive tabindex reorders the whole page's tab sequence, not just
		// the component's, so one component can wreck navigation everywhere.
		const positive = [...container.querySelectorAll('[tabindex]')]
			.map((el) => Number(el.getAttribute('tabindex')))
			.filter((value) => value > 0);

		expect(positive).toEqual([]);
	});
});
