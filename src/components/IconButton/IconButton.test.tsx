// IconButton Component Tests
//
// IconButton is a Button underneath, so these check that it inherits Button's
// behaviour rather than re-implementing it, and that the part it adds — an
// icon with a label in one of four positions — works.

import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IconButton } from './IconButton';
import { resetDeprecationWarnings } from '../../utils/deprecation';
import { checkA11y } from '../../test/axe';

const Icon = () => <svg data-testid="icon" />;

let warn: MockInstance<(...args: unknown[]) => void>;

beforeEach(() => {
	resetDeprecationWarnings();
	warn = vi.spyOn(console, 'warn').mockImplementation(() => {}) as unknown as MockInstance<
		(...args: unknown[]) => void
	>;
});

afterEach(() => warn.mockRestore());

describe('IconButton', () => {
	it('renders a button containing the icon', () => {
		render(<IconButton icon={<Icon />} aria-label="Save" />);
		expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
		expect(screen.getByTestId('icon')).toBeInTheDocument();
	});

	it('takes its accessible name from the visible label', () => {
		render(<IconButton icon={<Icon />} label="New Folder" />);
		expect(screen.getByRole('button', { name: 'New Folder' })).toBeInTheDocument();
	});

	it('fires onClick', () => {
		const onClick = vi.fn();
		render(<IconButton icon={<Icon />} label="Go" onClick={onClick} />);
		fireEvent.click(screen.getByRole('button'));
		expect(onClick).toHaveBeenCalled();
	});

	describe('inherited from Button', () => {
		it('applies the variant class', () => {
			const { container } = render(<IconButton icon={<Icon />} label="Erase" variant="danger" />);
			// The class comes from Button.module.css, not a parallel copy.
			expect(container.querySelector('[class*="button--danger"]')).not.toBeNull();
		});

		it('applies the size class', () => {
			const { container } = render(<IconButton icon={<Icon />} label="Big" size="lg" />);
			expect(container.querySelector('[class*="button--lg"]')).not.toBeNull();
		});

		it('disables natively, without a redundant aria-disabled', () => {
			render(<IconButton icon={<Icon />} label="Nope" disabled />);
			const button = screen.getByRole('button');
			expect(button).toBeDisabled();
			expect(button).not.toHaveAttribute('aria-disabled');
		});

		it('forwards a ref to the button element', () => {
			const ref = { current: null as HTMLButtonElement | null };
			render(<IconButton ref={ref} icon={<Icon />} label="Ref" />);
			expect(ref.current).toBeInstanceOf(HTMLButtonElement);
		});
	});

	describe('label position', () => {
		it.each(['left', 'right', 'top', 'bottom'] as const)('supports %s', (position) => {
			const { container } = render(
				<IconButton icon={<Icon />} label="Label" labelPosition={position} />
			);
			expect(container.querySelector(`[class*="content--${position}"]`)).not.toBeNull();
		});

		it('defaults to right', () => {
			const { container } = render(<IconButton icon={<Icon />} label="Label" />);
			expect(container.querySelector('[class*="content--right"]')).not.toBeNull();
		});
	});

	describe('accessible name', () => {
		it('warns when there is neither a label, aria-label nor title', () => {
			render(<IconButton icon={<Icon />} />);
			expect(
				warn.mock.calls.some((call: unknown[]) => String(call[0]).includes('accessible name'))
			).toBe(true);
		});

		it('does not warn when a title carries the name', () => {
			render(<IconButton icon={<Icon />} title="Print" />);
			expect(warn).not.toHaveBeenCalled();
		});
	});

	it('has no automatically detectable accessibility violations', async () => {
		const { container } = render(
			<>
				<IconButton icon={<Icon />} aria-label="Print" />
				<IconButton icon={<Icon />} label="Open" />
				<IconButton icon={<Icon />} label="Erase" variant="danger" disabled />
			</>
		);
		expect(await checkA11y(container)).toHaveNoViolations();
	});
});
