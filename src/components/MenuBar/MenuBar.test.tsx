// MenuBar Component Tests
//
// Covers the menubar ARIA contract, the roving tabindex, keyboard
// navigation, the data-driven menu form, and dismissal behaviour.

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MenuBar, type Menu } from './MenuBar';
import { MenuItem } from './MenuItem';
import { checkA11y } from '../../test/axe';
import { nth } from '../../test/nth';

const menus: Menu[] = [
	{ label: 'File', content: <MenuItem label="Open…" shortcut="⌘O" /> },
	{ label: 'Edit', content: <MenuItem label="Undo" shortcut="⌘Z" /> },
	{ label: 'Help', type: 'link', href: '/help' },
];

describe('MenuBar', () => {
	it('renders a menubar with one menuitem per menu', () => {
		render(<MenuBar menus={menus} />);

		expect(screen.getByRole('menubar')).toBeInTheDocument();
		expect(screen.getAllByRole('menuitem')).toHaveLength(3);
	});

	it('labels menus without adding headings to the document outline', () => {
		render(<MenuBar menus={menus} />);

		expect(screen.getByRole('menuitem', { name: 'File' })).toBeInTheDocument();
		expect(screen.queryByRole('heading')).not.toBeInTheDocument();
	});

	describe('roving tabindex', () => {
		it('keeps exactly one trigger in the tab order', () => {
			render(<MenuBar menus={menus} />);

			const tabbable = screen
				.getAllByRole('menuitem')
				.filter((item) => item.getAttribute('tabindex') === '0');

			expect(tabbable).toHaveLength(1);
		});

		it('moves the tab stop as focus moves', () => {
			render(<MenuBar menus={menus} />);
			const items = screen.getAllByRole('menuitem');
			const file = nth(items, 0);
			const edit = nth(items, 1);

			expect(file).toHaveAttribute('tabindex', '0');

			fireEvent.focus(edit);

			expect(edit).toHaveAttribute('tabindex', '0');
			expect(file).toHaveAttribute('tabindex', '-1');
		});
	});

	describe('opening and closing', () => {
		it('opens a dropdown on click and marks the trigger expanded', () => {
			render(<MenuBar menus={menus} />);
			const file = screen.getByRole('menuitem', { name: 'File' });

			expect(file).toHaveAttribute('aria-expanded', 'false');
			fireEvent.click(file);

			expect(file).toHaveAttribute('aria-expanded', 'true');
			expect(screen.getByRole('menu')).toBeInTheDocument();
		});

		it('points the open dropdown at its trigger', () => {
			render(<MenuBar menus={menus} />);
			const file = screen.getByRole('menuitem', { name: 'File' });
			fireEvent.click(file);

			expect(screen.getByRole('menu')).toHaveAttribute('aria-labelledby', file.id);
		});

		it('closes when the same trigger is clicked again', () => {
			render(<MenuBar menus={menus} />);
			const file = screen.getByRole('menuitem', { name: 'File' });

			fireEvent.click(file);
			fireEvent.click(file);

			expect(file).toHaveAttribute('aria-expanded', 'false');
		});

		it('closes on a click outside', () => {
			render(
				<>
					<MenuBar menus={menus} />
					<button>elsewhere</button>
				</>
			);

			fireEvent.click(screen.getByRole('menuitem', { name: 'File' }));
			expect(screen.getByRole('menu')).toBeInTheDocument();

			fireEvent.click(screen.getByText('elsewhere'));

			expect(screen.queryByRole('menu')).not.toBeInTheDocument();
		});

		it('closes on Escape', () => {
			render(<MenuBar menus={menus} />);

			fireEvent.click(screen.getByRole('menuitem', { name: 'File' }));
			fireEvent.keyDown(document, { key: 'Escape' });

			expect(screen.queryByRole('menu')).not.toBeInTheDocument();
		});

		it('opens the menu named by defaultOpenMenuIndex', () => {
			render(<MenuBar menus={menus} defaultOpenMenuIndex={1} />);
			expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveAttribute(
				'aria-expanded',
				'true'
			);
		});

		it('defers to openMenuIndex when controlled', () => {
			const onMenuOpen = vi.fn();
			render(<MenuBar menus={menus} openMenuIndex={0} onMenuOpen={onMenuOpen} />);

			fireEvent.click(screen.getByRole('menuitem', { name: 'Edit' }));

			expect(onMenuOpen).toHaveBeenCalledWith(1);
			// The parent owns the state, so File stays open until it says otherwise.
			expect(screen.getByRole('menuitem', { name: 'File' })).toHaveAttribute(
				'aria-expanded',
				'true'
			);
		});
	});

	describe('keyboard navigation', () => {
		it('opens the focused menu with ArrowDown', () => {
			render(<MenuBar menus={menus} />);
			const file = screen.getByRole('menuitem', { name: 'File' });

			fireEvent.focus(file);
			fireEvent.keyDown(screen.getByRole('menubar'), { key: 'ArrowDown' });

			expect(file).toHaveAttribute('aria-expanded', 'true');
		});

		it('moves between menus with the arrow keys', () => {
			render(<MenuBar menus={menus} />);

			fireEvent.focus(screen.getByRole('menuitem', { name: 'File' }));
			fireEvent.keyDown(screen.getByRole('menubar'), { key: 'ArrowRight' });

			expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus();
		});

		it('wraps around at the ends', () => {
			render(<MenuBar menus={menus} />);

			fireEvent.focus(screen.getByRole('menuitem', { name: 'File' }));
			fireEvent.keyDown(screen.getByRole('menubar'), { key: 'ArrowLeft' });

			expect(screen.getByRole('menuitem', { name: 'Help' })).toHaveFocus();
		});

		it('jumps to the ends with Home and End', () => {
			render(<MenuBar menus={menus} />);
			const menubar = screen.getByRole('menubar');

			fireEvent.focus(screen.getByRole('menuitem', { name: 'File' }));
			fireEvent.keyDown(menubar, { key: 'End' });
			expect(screen.getByRole('menuitem', { name: 'Help' })).toHaveFocus();

			fireEvent.keyDown(menubar, { key: 'Home' });
			expect(screen.getByRole('menuitem', { name: 'File' })).toHaveFocus();
		});

		it('skips disabled menus', () => {
			render(
				<MenuBar
					menus={[
						{ label: 'File', content: <MenuItem label="Open…" /> },
						{ label: 'Edit', disabled: true, content: <MenuItem label="Undo" /> },
						{ label: 'View', content: <MenuItem label="Zoom" /> },
					]}
				/>
			);

			fireEvent.focus(screen.getByRole('menuitem', { name: 'File' }));
			fireEvent.keyDown(screen.getByRole('menubar'), { key: 'ArrowRight' });

			expect(screen.getByRole('menuitem', { name: 'View' })).toHaveFocus();
		});
	});

	describe('items and content are separate props', () => {
		// 1.x had a single `items` prop typed `ReactNode | MenuItemData[]` and
		// told the two apart at runtime by asking whether the first array
		// element was a React element — so `[<MenuItem />]`, an ordinary way
		// to write one JSX child, was read as data and rendered an empty menu.
		// 2.0 splits them so the type decides instead.
		it('renders data from items and JSX from content', () => {
			render(
				<MenuBar
					menus={[
						{ label: 'File', items: [{ label: 'Open…' }] },
						{ label: 'Edit', content: <MenuItem label="Undo" /> },
					]}
					defaultOpenMenuIndex={0}
				/>
			);
			expect(screen.getByRole('menuitem', { name: /Open/ })).toBeInTheDocument();
		});

		it('opens no dropdown for an empty items array', () => {
			render(<MenuBar menus={[{ label: 'File', items: [] }]} defaultOpenMenuIndex={0} />);

			// An empty `role="menu"` with no `menuitem` children is not a
			// useful thing to show a screen reader, so nothing opens.
			expect(screen.getAllByRole('menuitem')).toHaveLength(1);
			expect(screen.queryByRole('menu')).not.toBeInTheDocument();
		});

		it('prefers items when a menu supplies both', () => {
			render(
				<MenuBar
					menus={[
						{
							label: 'File',
							items: [{ label: 'FromData' }],
							content: <MenuItem label="FromJSX" />,
						},
					]}
					defaultOpenMenuIndex={0}
				/>
			);
			expect(screen.getByRole('menuitem', { name: 'FromData' })).toBeInTheDocument();
			expect(screen.queryByRole('menuitem', { name: 'FromJSX' })).not.toBeInTheDocument();
		});
	});

	describe('data-driven menus', () => {
		it('renders MenuItemData without any JSX from the caller', () => {
			const onOpen = vi.fn();
			render(
				<MenuBar
					menus={[
						{
							label: 'File',
							items: [
								{ label: 'Open…', shortcut: '⌘O', onClick: onOpen },
								{ label: 'Save', shortcut: '⌘S' },
							],
						},
					]}
					defaultOpenMenuIndex={0}
				/>
			);

			expect(screen.getByRole('menuitem', { name: /Open/ })).toBeInTheDocument();
			fireEvent.click(screen.getByRole('menuitem', { name: /Open/ }));
			expect(onOpen).toHaveBeenCalled();
		});

		it('renders nested submenus from data', () => {
			render(
				<MenuBar
					menus={[
						{
							label: 'File',
							items: [{ label: 'Recent', submenu: [{ label: 'report.txt' }] }],
						},
					]}
					defaultOpenMenuIndex={0}
				/>
			);

			const recent = screen.getByRole('menuitem', { name: /Recent/ });
			expect(recent).toHaveAttribute('aria-haspopup', 'menu');
		});
	});

	describe('link menus', () => {
		it('renders as an anchor with a safe href', () => {
			render(<MenuBar menus={menus} />);
			expect(screen.getByRole('menuitem', { name: 'Help' })).toHaveAttribute('href', '/help');
		});

		it('strips a javascript: href', () => {
			render(<MenuBar menus={[{ label: 'Bad', type: 'link', href: 'javascript:alert(1)' }]} />);
			expect(screen.getByRole('menuitem', { name: 'Bad' })).not.toHaveAttribute(
				'href',
				expect.stringContaining('javascript')
			);
		});
	});

	it('has no automatically detectable accessibility violations', async () => {
		const { container } = render(<MenuBar menus={menus} defaultOpenMenuIndex={0} />);
		expect(await checkA11y(container)).toHaveNoViolations();
	});
});

describe('compound API', () => {
	it('exposes its companions as static properties', () => {
		// The folder holds three flat-exported siblings, which reads as a
		// compound API; attaching them makes that relationship real.
		expect(MenuBar.Item).toBe(MenuItem);
		expect(MenuBar.Dropdown).toBeDefined();
	});

	it('renders a menu declared through MenuBar.Item', () => {
		render(
			<MenuBar
				defaultOpenMenuIndex={0}
				menus={[{ label: 'File', content: <MenuBar.Item label="Open…" shortcut="⌘O" /> }]}
			/>
		);
		expect(screen.getByRole('menuitem', { name: /Open/ })).toBeInTheDocument();
	});

	it('still works as a flat import', () => {
		render(
			<MenuBar
				defaultOpenMenuIndex={0}
				menus={[{ label: 'File', content: <MenuItem label="Save" /> }]}
			/>
		);
		expect(screen.getByRole('menuitem', { name: 'Save' })).toBeInTheDocument();
	});
});
