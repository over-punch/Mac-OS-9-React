// Library-wide accessibility smoke tests
//
// The README states a WCAG 2.1 AA goal. This renders every exported
// component in a realistic configuration and runs the automated portion of
// that standard against it, so a regression in naming, roles, or ARIA
// wiring fails the build rather than shipping.
//
// Automated rules catch roughly a third of WCAG criteria. Component-specific
// suites cover the parts a scanner cannot see — focus order, keyboard
// operation, and live-region behaviour.

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { checkA11y } from './axe';

import { Button } from '../components/Button/Button';
import { Checkbox } from '../components/Checkbox/Checkbox';
import { Dialog } from '../components/Dialog/Dialog';
import { FolderList } from '../components/FolderList/FolderList';
import { Icon } from '../components/Icon/Icon';
import { IconLibrary } from '../components/Icon/IconLibrary';
import { IconButton } from '../components/IconButton/IconButton';
import { ListView } from '../components/ListView/ListView';
import { MenuBar } from '../components/MenuBar/MenuBar';
import { MenuDropdown } from '../components/MenuBar/MenuDropdown';
import { MenuItem } from '../components/MenuBar/MenuItem';
import { Radio, RadioGroup } from '../components/Radio/Radio';
import { Scrollbar } from '../components/Scrollbar/Scrollbar';
import { Select } from '../components/Select/Select';
import { Tabs, TabPanel } from '../components/Tabs/Tabs';
import { TextField } from '../components/TextField/TextField';
import { Window } from '../components/Window/Window';

const listColumns = [
	{ key: 'name', label: 'Name' },
	{ key: 'size', label: 'Size' },
];
const listItems = [
	{ id: '1', name: 'Read Me', size: '2 KB' },
	{ id: '2', name: 'System Folder', size: '--' },
];

/**
 * Each case renders one component the way a consumer reasonably would —
 * labelled, with its required props supplied.
 */
const cases: ReadonlyArray<readonly [string, React.ReactElement]> = [
	['Button', <Button key="b">Save</Button>],
	[
		'Button (icon only)',
		<Button key="bi" iconOnly aria-label="Close window">
			<IconLibrary icon="close" label={null} />
		</Button>,
	],
	[
		'Button (link)',
		<Button key="bl" as="a" href="/docs">
			Read the docs
		</Button>,
	],
	[
		'Button (loading)',
		<Button key="bld" loading loadingText="Saving…">
			Save
		</Button>,
	],
	['Checkbox', <Checkbox key="c" label="Show hidden files" />],
	['Checkbox (error)', <Checkbox key="ce" label="Accept terms" error />],
	[
		'IconButton',
		<IconButton key="ib" icon={<IconLibrary icon="trash" label={null} />} aria-label="Delete" />,
	],
	[
		'IconButton (labelled)',
		<IconButton key="ibl" icon={<IconLibrary icon="print" label={null} />} label="Print" />,
	],
	[
		'Icon',
		<Icon key="i" label="Alert">
			<rect width="16" height="16" />
		</Icon>,
	],
	['IconLibrary', <IconLibrary key="il" icon="folder" />],
	['ListView', <ListView key="lv" columns={listColumns} items={listItems} selectedIds={['1']} />],
	['ListView (empty)', <ListView key="lve" columns={listColumns} items={[]} />],
	['ListView (loading)', <ListView key="lvl" columns={listColumns} items={[]} loading />],
	[
		'MenuBar',
		<MenuBar
			key="mb"
			menus={[
				{ label: 'File', items: <MenuItem label="Open…" shortcut="⌘O" /> },
				{ label: 'Site', type: 'link', href: '/' },
			]}
			defaultOpenMenuIndex={0}
		/>,
	],
	[
		'MenuDropdown',
		<MenuDropdown key="md" label="Options" items={<MenuItem label="Preferences…" />} />,
	],
	[
		'MenuItem',
		<div key="mi" role="menu">
			<MenuItem label="Save" shortcut="⌘S" />
		</div>,
	],
	[
		'MenuItem (checked)',
		<div key="mic" role="menu">
			<MenuItem label="Show Grid" checked />
		</div>,
	],
	[
		'RadioGroup',
		<RadioGroup key="rg" name="view" ariaLabel="View as">
			<Radio value="icon" label="Icons" />
			<Radio value="list" label="List" />
		</RadioGroup>,
	],
	[
		'Scrollbar',
		<Scrollbar key="sb" ariaLabel="Document scroll" value={0.25} viewportRatio={0.4} />,
	],
	[
		'Scrollbar (horizontal)',
		<Scrollbar key="sbh" orientation="horizontal" ariaLabel="Pan" value={0} viewportRatio={0.5} />,
	],
	[
		'Select',
		<Select
			key="s"
			label="Sort by"
			options={[
				{ value: 'name', label: 'Name' },
				{ value: 'date', label: 'Date Modified' },
			]}
		/>,
	],
	[
		'Tabs',
		<Tabs key="t" ariaLabel="Settings">
			<TabPanel label="General">General settings</TabPanel>
			<TabPanel label="Advanced">Advanced settings</TabPanel>
		</Tabs>,
	],
	['TextField', <TextField key="tf" label="File name" helperText="Up to 31 characters" />],
	['TextField (multiline)', <TextField key="tfm" label="Comments" multiline />],
	['TextField (error)', <TextField key="tfe" label="Email" error errorMessage="Required" />],
	[
		'Window',
		<Window key="w" title="Untitled" draggable resizable onClose={() => {}} onMinimize={() => {}}>
			<p>Window body</p>
		</Window>,
	],
	['FolderList', <FolderList key="fl" title="Macintosh HD" items={listItems} />],
];

describe('accessibility', () => {
	it.each(cases)('%s has no automatically detectable violations', async (_name, element) => {
		const { container } = render(element);
		expect(await checkA11y(container)).toHaveNoViolations();
	});

	it('Dialog has no automatically detectable violations', async () => {
		render(
			<Dialog open title="Save changes" ariaDescribedBy="dialog-desc">
				<p id="dialog-desc">Do you want to save before closing?</p>
				<Button>Cancel</Button>
				<Button variant="primary">Save</Button>
			</Dialog>
		);
		// Portalled to document.body, so scan the dialog itself.
		expect(await checkA11y(screen.getByRole('dialog'))).toHaveNoViolations();
	});
});
