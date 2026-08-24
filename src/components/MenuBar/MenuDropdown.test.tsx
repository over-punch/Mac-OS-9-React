// MenuDropdown
//
// A standalone dropdown, used where a menu is needed outside a MenuBar. It sat
// at 39.7% coverage — the least-tested component in the package — which is
// awkward for something whose whole job is opening, closing and staying inside
// the viewport.

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MenuDropdown } from './MenuDropdown';
import { MenuItem } from './MenuItem';
import { checkA11y } from '../../test/axe';

const CONTENT = (
	<>
		<MenuItem label="Open" />
		<MenuItem label="Close" />
	</>
);

const open = (name = 'File') => fireEvent.click(screen.getByRole('button', { name }));

afterEach(cleanup);

describe('MenuDropdown', () => {
	it('starts closed', () => {
		render(<MenuDropdown label="File" content={CONTENT} />);
		expect(screen.queryByRole('menu')).not.toBeInTheDocument();
		expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
	});

	it('advertises that it opens a menu', () => {
		render(<MenuDropdown label="File" content={CONTENT} />);
		expect(screen.getByRole('button')).toHaveAttribute('aria-haspopup', 'menu');
	});

	it('opens and closes on the trigger', () => {
		render(<MenuDropdown label="File" content={CONTENT} />);
		open();
		expect(screen.getByRole('menu')).toBeInTheDocument();
		expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');

		open();
		expect(screen.queryByRole('menu')).not.toBeInTheDocument();
	});

	it('names the menu by its trigger', () => {
		render(<MenuDropdown label="File" content={CONTENT} />);
		open();
		expect(screen.getByRole('menu', { name: 'File' })).toBeInTheDocument();
	});

	it('accepts a non-string label without wrapping it', () => {
		render(<MenuDropdown label={<em data-testid="custom">File</em>} content={CONTENT} />);
		// Menu labels are not document structure, so the component must not
		// impose its own element on a caller who supplied one.
		expect(screen.getByTestId('custom')).toBeInTheDocument();
	});

	describe('disabled', () => {
		it('cannot be opened', () => {
			render(<MenuDropdown label="File" content={CONTENT} disabled />);
			const trigger = screen.getByRole('button');
			expect(trigger).toBeDisabled();
			fireEvent.click(trigger);
			expect(screen.queryByRole('menu')).not.toBeInTheDocument();
		});

		it('says so to assistive tech as well as to the browser', () => {
			render(<MenuDropdown label="File" content={CONTENT} disabled />);
			expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
		});
	});

	describe('dismissal', () => {
		it('closes on Escape', () => {
			render(<MenuDropdown label="File" content={CONTENT} />);
			open();
			fireEvent.keyDown(document, { key: 'Escape' });
			expect(screen.queryByRole('menu')).not.toBeInTheDocument();
		});

		it('closes when a click lands outside', () => {
			render(
				<>
					<MenuDropdown label="File" content={CONTENT} />
					<button type="button">Elsewhere</button>
				</>
			);
			open();
			fireEvent.click(screen.getByRole('button', { name: 'Elsewhere' }));
			expect(screen.queryByRole('menu')).not.toBeInTheDocument();
		});

		it('closes when an item is chosen, and the item still fires first', () => {
			const onClick = vi.fn();
			render(
				<MenuDropdown
					label="File"
					content={
						<>
							<MenuItem label="Open" onClick={onClick} />
							<MenuItem label="Close" />
						</>
					}
				/>
			);
			open();
			fireEvent.click(screen.getByText('Open'));

			// Choosing something dismisses the menu — and the item's handler
			// runs before it goes. The dropdown listens for `click` rather than
			// `mousedown` precisely so that ordering holds even when content is
			// rendered into a portal.
			expect(onClick).toHaveBeenCalledTimes(1);
			expect(screen.queryByRole('menu')).not.toBeInTheDocument();
		});

		it('stops listening once closed', () => {
			const removeListener = vi.spyOn(document, 'removeEventListener');
			render(<MenuDropdown label="File" content={CONTENT} />);
			open();
			fireEvent.keyDown(document, { key: 'Escape' });
			expect(removeListener).toHaveBeenCalledWith('keydown', expect.any(Function));
			removeListener.mockRestore();
		});
	});

	describe('alignment', () => {
		it('defaults to left and can align right', () => {
			const { container: left } = render(<MenuDropdown label="A" content={CONTENT} />);
			fireEvent.click(left.querySelector('button')!);
			const leftMenu = left.querySelector('[role="menu"]')!.className;

			const { container: right } = render(
				<MenuDropdown label="B" content={CONTENT} align="right" />
			);
			fireEvent.click(right.querySelector('button')!);
			const rightMenu = right.querySelector('[role="menu"]')!.className;

			expect(leftMenu).not.toBe(rightMenu);
		});
	});

	it('forwards its ref to the container', () => {
		const ref = { current: null as HTMLDivElement | null };
		render(<MenuDropdown ref={ref} label="File" content={CONTENT} />);
		// The component keeps its own handle for collision detection; the
		// consumer must still get the node.
		expect(ref.current).toBeInstanceOf(HTMLDivElement);
	});

	it('applies classes to the slots it documents', () => {
		render(
			<MenuDropdown
				label="File"
				content={CONTENT}
				className="root-class"
				classes={{ trigger: 'trigger-class', dropdown: 'dropdown-class' }}
			/>
		);
		open();
		expect(document.querySelector('.root-class')).not.toBeNull();
		expect(document.querySelector('.trigger-class')).not.toBeNull();
		expect(document.querySelector('.dropdown-class')).not.toBeNull();
	});

	it('has no automatically detectable accessibility violations', async () => {
		const { container } = render(<MenuDropdown label="File" content={CONTENT} />);
		open();
		expect(await checkA11y(container)).toHaveNoViolations();
	});
});
