// MenuItem
//
// It sat at 57% coverage while carrying two things that are easy to get wrong
// and invisible when they are: the role derivation (which was a shipped bug —
// see PITFALLS.md), and the WAI-ARIA submenu keyboard pattern.

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MenuItem } from './MenuItem';
import { checkA11y } from '../../test/axe';

describe('MenuItem', () => {
	it('renders its label', () => {
		render(<MenuItem label="Open" />);
		expect(screen.getByRole('menuitem', { name: 'Open' })).toBeInTheDocument();
	});

	it('shows a keyboard shortcut without letting it become the name', () => {
		render(<MenuItem label="Save" shortcut="⌘S" />);
		expect(screen.getByText('⌘S')).toBeInTheDocument();
		expect(screen.getByRole('menuitem', { name: /Save/ })).toBeInTheDocument();
	});

	it('reports clicks', () => {
		const onClick = vi.fn();
		render(<MenuItem label="Open" onClick={onClick} />);
		fireEvent.click(screen.getByRole('menuitem'));
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it('ignores clicks when disabled', () => {
		const onClick = vi.fn();
		render(<MenuItem label="Open" disabled onClick={onClick} />);
		expect(screen.getByRole('menuitem')).toBeDisabled();
		fireEvent.click(screen.getByRole('menuitem'));
		expect(onClick).not.toHaveBeenCalled();
	});

	it('reports focus and blur', () => {
		const onFocus = vi.fn();
		const onBlur = vi.fn();
		render(<MenuItem label="Open" onFocus={onFocus} onBlur={onBlur} />);
		const item = screen.getByRole('menuitem');
		fireEvent.focus(item);
		fireEvent.blur(item);
		expect(onFocus).toHaveBeenCalledTimes(1);
		expect(onBlur).toHaveBeenCalledTimes(1);
	});

	describe('the role follows what the item IS, not its current value', () => {
		it('is a plain menuitem when it is not checkable', () => {
			render(<MenuItem label="Open" />);
			expect(screen.getByRole('menuitem')).toBeInTheDocument();
		});

		it('is a checkbox item even while unchecked', () => {
			render(<MenuItem label="Show Grid" checked={false} />);
			// Deriving the role from the *value* meant an unchecked option
			// announced as a plain command, and the role changed under the
			// user on every toggle.
			const item = screen.getByRole('menuitemcheckbox');
			expect(item).toHaveAttribute('aria-checked', 'false');
		});

		it('is a radio item when it is one of a mutually exclusive set', () => {
			render(<MenuItem label="Chocolate" checked selection="radio" />);
			const item = screen.getByRole('menuitemradio');
			expect(item).toHaveAttribute('aria-checked', 'true');
		});

		it('never puts aria-checked on a plain command', () => {
			render(<MenuItem label="Open" />);
			expect(screen.getByRole('menuitem')).not.toHaveAttribute('aria-checked');
		});
	});

	describe('submenu keyboard pattern', () => {
		const withSubmenu = (props = {}) =>
			render(
				<MenuItem
					label="Recent"
					hasSubmenu
					content={
						<>
							<MenuItem label="Document 1" />
							<MenuItem label="Document 2" />
						</>
					}
					{...props}
				/>
			);

		it('ArrowRight opens the submenu and moves focus into it', async () => {
			withSubmenu();
			const trigger = screen.getByRole('menuitem', { name: /Recent/ });
			fireEvent.keyDown(trigger, { key: 'ArrowRight' });

			expect(screen.getByRole('menuitem', { name: 'Document 1' })).toBeInTheDocument();
			// Focus is deferred a microtask so the submenu exists first.
			await act(async () => {});
			expect(screen.getByRole('menuitem', { name: 'Document 1' })).toHaveFocus();
		});

		it('ArrowLeft closes it again and returns focus to the parent', async () => {
			withSubmenu();
			const trigger = screen.getByRole('menuitem', { name: /Recent/ });
			fireEvent.keyDown(trigger, { key: 'ArrowRight' });
			await act(async () => {});

			fireEvent.keyDown(trigger, { key: 'ArrowLeft' });
			expect(screen.queryByRole('menuitem', { name: 'Document 1' })).not.toBeInTheDocument();
			expect(trigger).toHaveFocus();
		});

		it('opens on hover too', () => {
			const { container } = withSubmenu();
			fireEvent.mouseEnter(container.firstElementChild!);
			expect(screen.getByRole('menuitem', { name: 'Document 1' })).toBeInTheDocument();
			fireEvent.mouseLeave(container.firstElementChild!);
			expect(screen.queryByRole('menuitem', { name: 'Document 1' })).not.toBeInTheDocument();
		});

		it('does nothing on ArrowRight when there is no submenu', () => {
			render(<MenuItem label="Open" />);
			const item = screen.getByRole('menuitem');
			fireEvent.keyDown(item, { key: 'ArrowRight' });
			expect(screen.queryByRole('menu')).not.toBeInTheDocument();
		});

		it('does not open a disabled item’s submenu', () => {
			withSubmenu({ disabled: true });
			fireEvent.keyDown(screen.getByRole('menuitem', { name: /Recent/ }), { key: 'ArrowRight' });
			expect(screen.queryByRole('menuitem', { name: 'Document 1' })).not.toBeInTheDocument();
		});
	});

	it('renders a separator', () => {
		const { container } = render(<MenuItem label="" separator />);
		expect(container.firstElementChild).not.toBeNull();
	});

	it('applies classes to the slots it documents', () => {
		render(
			<MenuItem
				label="Open"
				icon={<span>i</span>}
				shortcut="⌘O"
				classes={{ root: 'root-c', item: 'item-c', label: 'label-c', shortcut: 'shortcut-c' }}
			/>
		);
		for (const cls of ['.root-c', '.item-c', '.label-c', '.shortcut-c']) {
			expect(document.querySelector(cls), `${cls} should be applied`).not.toBeNull();
		}
	});

	it('has no automatically detectable accessibility violations', async () => {
		const { container } = render(
			<div role="menu">
				<MenuItem label="Open" shortcut="⌘O" />
				<MenuItem label="Show Grid" checked={false} />
				<MenuItem label="Chocolate" checked selection="radio" />
			</div>
		);
		expect(await checkA11y(container)).toHaveNoViolations();
	});
});
