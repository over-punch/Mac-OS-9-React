// ContextualMenu Component Tests
//
// A contextual menu reachable only by right-click is unreachable without a
// pointer, so the keyboard route is the assertion that matters most. After
// that: separators must be skipped rather than merely unfocusable, and closing
// must give focus back rather than dropping it on the body.

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContextualMenu } from './ContextualMenu';
import { type MenuItemData } from '../MenuBar';
import { checkA11y } from '../../test/axe';

const ITEMS: MenuItemData[] = [
	{ label: 'Open' },
	{ label: 'Get Info', shortcut: '⌘I' },
	{ label: 'Duplicate', disabled: true },
	{ label: '', separator: true },
	{ label: 'Move to Trash' },
];

function setup(props = {}) {
	const onSelect = vi.fn();
	render(
		<ContextualMenu aria-label="File actions" items={ITEMS} onSelect={onSelect} {...props}>
			<button type="button">Read Me</button>
		</ContextualMenu>
	);
	return { onSelect, trigger: screen.getByRole('button', { name: 'Read Me' }) };
}

describe('ContextualMenu', () => {
	it('opens on right-click', () => {
		const { trigger } = setup();
		fireEvent.contextMenu(trigger, { clientX: 40, clientY: 40 });
		expect(screen.getByRole('menu', { name: 'File actions' })).toBeInTheDocument();
	});

	it('opens with Shift+F10, for keyboards without a menu key', () => {
		const { trigger } = setup();
		trigger.focus();
		fireEvent.keyDown(trigger, { key: 'F10', shiftKey: true });
		expect(screen.getByRole('menu')).toBeInTheDocument();
	});

	it('opens with the ContextMenu key', () => {
		const { trigger } = setup();
		trigger.focus();
		fireEvent.keyDown(trigger, { key: 'ContextMenu' });
		expect(screen.getByRole('menu')).toBeInTheDocument();
	});

	it('does not open when disabled', () => {
		const { trigger } = setup({ disabled: true });
		fireEvent.contextMenu(trigger);
		expect(screen.queryByRole('menu')).not.toBeInTheDocument();
	});

	it('reports the chosen item', () => {
		const { trigger, onSelect } = setup();
		fireEvent.contextMenu(trigger);
		fireEvent.click(screen.getByText('Get Info'));
		expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ label: 'Get Info' }));
	});

	it('ignores a disabled item', () => {
		const { trigger, onSelect } = setup();
		fireEvent.contextMenu(trigger);
		fireEvent.click(screen.getByText('Duplicate'));
		expect(onSelect).not.toHaveBeenCalled();
		expect(screen.getByRole('menu')).toBeInTheDocument();
	});

	describe('keyboard', () => {
		it('skips separators and disabled items when arrowing', () => {
			const { trigger, onSelect } = setup();
			fireEvent.contextMenu(trigger);
			const menu = screen.getByRole('menu');

			// Open -> Get Info -> Move to Trash: Duplicate is disabled and the
			// separator is not an item at all.
			fireEvent.keyDown(menu, { key: 'ArrowDown' });
			fireEvent.keyDown(menu, { key: 'ArrowDown' });
			fireEvent.keyDown(menu, { key: 'Enter' });

			expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ label: 'Move to Trash' }));
		});

		it('wraps around the ends', () => {
			const { trigger, onSelect } = setup();
			fireEvent.contextMenu(trigger);
			const menu = screen.getByRole('menu');
			fireEvent.keyDown(menu, { key: 'ArrowUp' });
			fireEvent.keyDown(menu, { key: 'Enter' });
			expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ label: 'Move to Trash' }));
		});

		it('Escape closes and gives focus back', () => {
			const { trigger } = setup();
			trigger.focus();
			fireEvent.keyDown(trigger, { key: 'ContextMenu' });
			fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });

			expect(screen.queryByRole('menu')).not.toBeInTheDocument();
			// Dropping focus on <body> would strand a keyboard user.
			expect(document.activeElement).toBe(trigger);
		});
	});

	it('closes when something outside is pressed', () => {
		const { trigger } = setup();
		fireEvent.contextMenu(trigger);
		expect(screen.getByRole('menu')).toBeInTheDocument();
		fireEvent.pointerDown(document.body);
		expect(screen.queryByRole('menu')).not.toBeInTheDocument();
	});

	it('renders separators as separators, not as items', () => {
		const { trigger } = setup();
		fireEvent.contextMenu(trigger);
		expect(screen.getAllByRole('menuitem')).toHaveLength(4);
		expect(screen.getAllByRole('separator')).toHaveLength(1);
	});

	it('has no automatically detectable accessibility violations', async () => {
		const { trigger } = setup();
		fireEvent.contextMenu(trigger);
		expect(await checkA11y(document.body)).toHaveNoViolations();
	});
});
