// Every component exposes typed `classes` slots.
//
// Before this, only Window, ListView and FolderList did; the rest offered
// one-off props like `wrapperClassName` or nothing at all, so reaching an
// inner element meant guessing at a hashed CSS-module name.

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';

import { Button } from '../components/Button/Button';
import { IconButton } from '../components/IconButton/IconButton';
import { Checkbox } from '../components/Checkbox/Checkbox';
import { Radio } from '../components/Radio/Radio';
import { TextField } from '../components/TextField/TextField';
import { Select } from '../components/Select/Select';
import { Tabs, TabPanel } from '../components/Tabs/Tabs';
import { Dialog } from '../components/Dialog/Dialog';
import { Scrollbar } from '../components/Scrollbar/Scrollbar';
import { MenuBar } from '../components/MenuBar/MenuBar';
import { MenuItem } from '../components/MenuBar/MenuItem';
import { Window } from '../components/Window/Window';
import { ListView } from '../components/ListView/ListView';

const has = (container: HTMLElement, cls: string) => container.querySelector(`.${cls}`) !== null;

describe('classes slots', () => {
	it('Button', () => {
		const { container } = render(
			<Button classes={{ root: 'x-root', text: 'x-text' }} leftIcon={<i />}>
				Save
			</Button>
		);
		expect(has(container, 'x-root')).toBe(true);
		expect(has(container, 'x-text')).toBe(true);
	});

	it('IconButton', () => {
		const { container } = render(
			<IconButton icon={<i />} label="Print" classes={{ root: 'x-root', icon: 'x-icon' }} />
		);
		expect(has(container, 'x-root')).toBe(true);
		expect(has(container, 'x-icon')).toBe(true);
	});

	it('Checkbox', () => {
		const { container } = render(
			<Checkbox label="Hidden" classes={{ root: 'x-root', input: 'x-input', label: 'x-label' }} />
		);
		expect(has(container, 'x-root')).toBe(true);
		expect(has(container, 'x-input')).toBe(true);
		expect(has(container, 'x-label')).toBe(true);
	});

	it('Radio', () => {
		const { container } = render(
			<Radio name="n" value="a" label="A" classes={{ root: 'x-root', input: 'x-input' }} />
		);
		expect(has(container, 'x-root')).toBe(true);
		expect(has(container, 'x-input')).toBe(true);
	});

	it('TextField', () => {
		const { container } = render(
			<TextField
				label="Name"
				helperText="Hint"
				classes={{ root: 'x-root', input: 'x-input', helperText: 'x-helper' }}
			/>
		);
		expect(has(container, 'x-root')).toBe(true);
		expect(has(container, 'x-input')).toBe(true);
		expect(has(container, 'x-helper')).toBe(true);
	});

	it('Select', () => {
		const { container } = render(
			<Select
				label="Sort"
				options={[{ value: 'a', label: 'A' }]}
				classes={{ root: 'x-root', trigger: 'x-trigger' }}
			/>
		);
		expect(has(container, 'x-root')).toBe(true);
		expect(has(container, 'x-trigger')).toBe(true);
	});

	it('Tabs', () => {
		const { container } = render(
			<Tabs classes={{ root: 'x-root', tabList: 'x-list', tab: 'x-tab', panel: 'x-panel' }}>
				<TabPanel label="One">1</TabPanel>
			</Tabs>
		);
		expect(has(container, 'x-root')).toBe(true);
		expect(has(container, 'x-list')).toBe(true);
		expect(has(container, 'x-tab')).toBe(true);
		expect(has(container, 'x-panel')).toBe(true);
	});

	it('Dialog', () => {
		render(
			<Dialog open title="D" dialogClasses={{ backdrop: 'x-backdrop', container: 'x-container' }}>
				body
			</Dialog>
		);
		expect(document.querySelector('.x-backdrop')).not.toBeNull();
		expect(document.querySelector('.x-container')).not.toBeNull();
	});

	it('Scrollbar', () => {
		const { container } = render(
			<Scrollbar
				aria-label="s"
				viewportRatio={0.3}
				classes={{ root: 'x-root', track: 'x-track', thumb: 'x-thumb', button: 'x-button' }}
			/>
		);
		expect(has(container, 'x-root')).toBe(true);
		expect(has(container, 'x-track')).toBe(true);
		expect(has(container, 'x-thumb')).toBe(true);
		expect(has(container, 'x-button')).toBe(true);
	});

	it('MenuBar', () => {
		const { container } = render(
			<MenuBar
				defaultOpenMenuIndex={0}
				classes={{ root: 'x-root', trigger: 'x-trigger', dropdown: 'x-dropdown' }}
				menus={[{ label: 'File', items: <MenuItem label="Open" /> }]}
			/>
		);
		expect(has(container, 'x-root')).toBe(true);
		expect(has(container, 'x-trigger')).toBe(true);
		expect(has(container, 'x-dropdown')).toBe(true);
	});

	it('MenuItem', () => {
		const { container } = render(
			<div role="menu">
				<MenuItem
					label="Save"
					shortcut="⌘S"
					classes={{ root: 'x-root', item: 'x-item', label: 'x-label', shortcut: 'x-shortcut' }}
				/>
			</div>
		);
		expect(has(container, 'x-root')).toBe(true);
		expect(has(container, 'x-item')).toBe(true);
		expect(has(container, 'x-label')).toBe(true);
		expect(has(container, 'x-shortcut')).toBe(true);
	});

	it('Window', () => {
		const { container } = render(
			<Window
				title="W"
				resizable
				classes={{ root: 'x-root', titleBar: 'x-title', content: 'x-content' }}
			>
				body
			</Window>
		);
		expect(has(container, 'x-root')).toBe(true);
		expect(has(container, 'x-title')).toBe(true);
		expect(has(container, 'x-content')).toBe(true);
	});

	it('ListView', () => {
		const { container } = render(
			<ListView
				columns={[{ key: 'name', label: 'Name' }]}
				items={[{ id: '1', name: 'a' }]}
				classes={{ root: 'x-root', header: 'x-header', row: 'x-row', cell: 'x-cell' }}
			/>
		);
		expect(has(container, 'x-root')).toBe(true);
		expect(has(container, 'x-header')).toBe(true);
		expect(has(container, 'x-row')).toBe(true);
		expect(has(container, 'x-cell')).toBe(true);
	});
});
