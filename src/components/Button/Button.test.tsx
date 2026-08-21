// Button Component Tests

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';
import styles from './Button.module.css';

/**
 * Looks up a CSS module class, failing if it isn't there.
 *
 * `styles[...]` is `string | undefined` under noUncheckedIndexedAccess, and
 * passing undefined to toHaveClass would have asserted nothing — so renaming a
 * class in Button.module.css could have silently hollowed out these tests
 * rather than failing them.
 */
const cls = (key: string): string => {
	const value = styles[key];
	if (!value) throw new Error(`Button.module.css has no class "${key}"`);
	return value;
};

describe('Button', () => {
	// ========================================
	// Rendering Tests
	// ========================================

	it('renders with children', () => {
		render(<Button>Click Me</Button>);
		expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
	});

	it('renders with default variant', () => {
		const { container } = render(<Button>Default</Button>);
		const button = container.querySelector('button');
		expect(button).toHaveClass(cls('button--default'));
	});

	it('renders with primary variant', () => {
		const { container } = render(<Button variant="primary">Primary</Button>);
		const button = container.querySelector('button');
		expect(button).toHaveClass(cls('button--primary'));
	});

	it('renders with danger variant', () => {
		const { container } = render(<Button variant="danger">Danger</Button>);
		const button = container.querySelector('button');
		expect(button).toHaveClass(cls('button--danger'));
	});

	// ========================================
	// Size Tests
	// ========================================

	it('renders with small size', () => {
		const { container } = render(<Button size="sm">Small</Button>);
		const button = container.querySelector('button');
		expect(button).toHaveClass(cls('button--sm'));
	});

	it('renders with medium size (default)', () => {
		const { container } = render(<Button>Medium</Button>);
		const button = container.querySelector('button');
		expect(button).toHaveClass(cls('button--md'));
	});

	it('renders with large size', () => {
		const { container } = render(<Button size="lg">Large</Button>);
		const button = container.querySelector('button');
		expect(button).toHaveClass(cls('button--lg'));
	});

	// ========================================
	// State Tests
	// ========================================

	it('renders as disabled', () => {
		render(<Button disabled>Disabled</Button>);
		const button = screen.getByRole('button');
		expect(button).toBeDisabled();
	});

	it('renders with full width', () => {
		const { container } = render(<Button fullWidth>Full Width</Button>);
		const button = container.querySelector('button');
		expect(button).toHaveClass(cls('button--full-width'));
	});

	// ========================================
	// Interaction Tests
	// ========================================

	it('calls onClick handler when clicked', async () => {
		const handleClick = vi.fn();
		const user = userEvent.setup();

		render(<Button onClick={handleClick}>Click Me</Button>);

		const button = screen.getByRole('button');
		await user.click(button);

		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it('does not call onClick when disabled', () => {
		const handleClick = vi.fn();

		render(
			<Button disabled onClick={handleClick}>
				Disabled
			</Button>
		);

		const button = screen.getByRole('button');
		// Use fireEvent instead of userEvent because disabled button has pointer-events: none
		fireEvent.click(button);

		expect(handleClick).not.toHaveBeenCalled();
	});

	it('responds to keyboard Enter key', async () => {
		const handleClick = vi.fn();
		const user = userEvent.setup();

		render(<Button onClick={handleClick}>Press Enter</Button>);

		const button = screen.getByRole('button');
		button.focus();
		await user.keyboard('{Enter}');

		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it('responds to keyboard Space key', async () => {
		const handleClick = vi.fn();
		const user = userEvent.setup();

		render(<Button onClick={handleClick}>Press Space</Button>);

		const button = screen.getByRole('button');
		button.focus();
		await user.keyboard(' ');

		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	// ========================================
	// Type Tests
	// ========================================

	it('has button type by default', () => {
		render(<Button>Button</Button>);
		const button = screen.getByRole('button');
		expect(button).toHaveAttribute('type', 'button');
	});

	it('can be set as submit type', () => {
		render(<Button type="submit">Submit</Button>);
		const button = screen.getByRole('button');
		expect(button).toHaveAttribute('type', 'submit');
	});

	it('can be set as reset type', () => {
		render(<Button type="reset">Reset</Button>);
		const button = screen.getByRole('button');
		expect(button).toHaveAttribute('type', 'reset');
	});

	// ========================================
	// Accessibility Tests
	// ========================================

	it('has accessible role', () => {
		render(<Button>Accessible Button</Button>);
		expect(screen.getByRole('button')).toBeInTheDocument();
	});

	it('relies on native disabled for a button, without a redundant aria-disabled', () => {
		render(<Button disabled>Disabled Button</Button>);
		const button = screen.getByRole('button');
		// A native <button> with `disabled` is already out of the accessibility
		// tree and the tab order. A second aria-disabled adds nothing and is
		// one more piece of state that can drift out of sync.
		expect(button).toBeDisabled();
		expect(button).not.toHaveAttribute('aria-disabled');
	});

	it('uses aria-disabled for a link, which has no native disabled', () => {
		render(
			<Button as="a" href="/somewhere" disabled>
				Disabled Link
			</Button>
		);
		const link = screen.getByText('Disabled Link').closest('a');
		expect(link).toHaveAttribute('aria-disabled', 'true');
		expect(link).not.toHaveAttribute('href');
	});

	it('is keyboard focusable when enabled', () => {
		render(<Button>Focusable</Button>);
		const button = screen.getByRole('button');
		button.focus();
		expect(button).toHaveFocus();
	});

	it('is not keyboard focusable when disabled', () => {
		render(<Button disabled>Not Focusable</Button>);
		const button = screen.getByRole('button');
		button.focus();
		expect(button).not.toHaveFocus();
	});

	// ========================================
	// Props Tests
	// ========================================

	it('forwards additional props', () => {
		render(
			<Button data-testid="custom-button" aria-label="Custom Button">
				Button
			</Button>
		);

		const button = screen.getByTestId('custom-button');
		expect(button).toHaveAttribute('aria-label', 'Custom Button');
	});

	it('accepts custom className', () => {
		const { container } = render(<Button className="custom-class">Button</Button>);
		const button = container.querySelector('button');
		expect(button).toHaveClass('custom-class');
	});

	it('forwards ref correctly', () => {
		const ref = vi.fn();
		render(<Button ref={ref}>Button with Ref</Button>);
		expect(ref).toHaveBeenCalled();
	});

	// ========================================
	// Edge Cases
	// ========================================

	it('renders with empty children', () => {
		const { container } = render(<Button>{''}</Button>);
		const button = container.querySelector('button');
		expect(button).toBeInTheDocument();
	});

	it('renders with complex children', () => {
		render(
			<Button>
				<span>Complex</span> <strong>Children</strong>
			</Button>
		);

		expect(screen.getByRole('button')).toBeInTheDocument();
		expect(screen.getByText('Complex')).toBeInTheDocument();
		expect(screen.getByText('Children')).toBeInTheDocument();
	});

	// ========================================
	// Combination Tests
	// ========================================

	it('renders with multiple modifiers', () => {
		const { container } = render(
			<Button variant="primary" size="lg" fullWidth disabled className="custom">
				Complex Button
			</Button>
		);

		const button = container.querySelector('button');
		expect(button).toHaveClass(cls('button--primary'));
		expect(button).toHaveClass(cls('button--lg'));
		expect(button).toHaveClass(cls('button--full-width'));
		expect(button).toHaveClass(cls('button--disabled'));
		expect(button).toHaveClass('custom');
		expect(button).toBeDisabled();
	});

	// ---- asChild ---------------------------------------------------------
	//
	// The caller owns the element and its navigation; Button contributes
	// styling, ARIA and the disabled/loading behaviour. These were the least
	// covered paths in the component.
	describe('asChild', () => {
		it('renders the child element rather than a button', () => {
			render(
				<Button asChild>
					<a href="/docs">Docs</a>
				</Button>
			);

			const link = screen.getByRole('link', { name: 'Docs' });
			expect(link).toHaveAttribute('href', '/docs');
			expect(screen.queryByRole('button')).not.toBeInTheDocument();
		});

		it("merges its classes onto the child without dropping the child's own", () => {
			render(
				<Button asChild className="from-button">
					<a href="/docs" className="from-child">
						Docs
					</a>
				</Button>
			);

			const link = screen.getByRole('link', { name: 'Docs' });
			expect(link).toHaveClass('from-child');
			expect(link.className).toContain('from-button');
		});

		it("keeps the child's own onClick", () => {
			const onClick = vi.fn();
			render(
				<Button asChild>
					<a href="#x" onClick={onClick}>
						Docs
					</a>
				</Button>
			);

			fireEvent.click(screen.getByRole('link'));

			expect(onClick).toHaveBeenCalled();
		});

		it("suppresses the child's onClick when disabled", () => {
			// An anchor has no native disabled state, so this is the only thing
			// stopping a disabled Button from navigating.
			const onClick = vi.fn();
			render(
				<Button asChild disabled>
					<a href="#x" onClick={onClick}>
						Docs
					</a>
				</Button>
			);

			fireEvent.click(screen.getByRole('link'));

			expect(onClick).not.toHaveBeenCalled();
		});

		it("suppresses the child's onClick while loading", () => {
			const onClick = vi.fn();
			render(
				<Button asChild loading>
					<a href="#x" onClick={onClick}>
						Docs
					</a>
				</Button>
			);

			fireEvent.click(screen.getByRole('link'));

			expect(onClick).not.toHaveBeenCalled();
		});

		it('renders nothing and complains when the child is not an element', () => {
			// Fails soft rather than throwing: `Children.only` used to take the
			// consumer's whole tree down before this message could be logged.
			const error = vi.spyOn(console, 'error').mockImplementation(() => {});

			const { container } = render(<Button asChild>just text</Button>);

			expect(container.firstChild).toBeNull();
			expect(error).toHaveBeenCalledWith(expect.stringContaining('asChild'));
			error.mockRestore();
		});

		it('renders nothing and complains when given several children', () => {
			const error = vi.spyOn(console, 'error').mockImplementation(() => {});

			const { container } = render(
				<Button asChild>
					<a href="/a">A</a>
					<a href="/b">B</a>
				</Button>
			);

			expect(container.firstChild).toBeNull();
			expect(error).toHaveBeenCalledWith(expect.stringContaining('2 children'));
			error.mockRestore();
		});
	});

	// ---- as="a" ----------------------------------------------------------
	describe('as an anchor', () => {
		it('renders a link with its href', () => {
			render(
				<Button as="a" href="/docs">
					Docs
				</Button>
			);
			expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('href', '/docs');
		});

		it('adds rel="noopener noreferrer" for target="_blank"', () => {
			render(
				<Button as="a" href="https://example.com" target="_blank">
					Out
				</Button>
			);
			expect(screen.getByRole('link')).toHaveAttribute('rel', 'noopener noreferrer');
		});

		it('leaves an explicit rel alone', () => {
			render(
				<Button as="a" href="https://example.com" target="_blank" rel="nofollow">
					Out
				</Button>
			);
			expect(screen.getByRole('link')).toHaveAttribute('rel', 'nofollow');
		});

		it('strips a javascript: href rather than rendering it', () => {
			// Fail closed: a visible but non-functional link beats one that
			// executes whatever was in the untrusted string.
			render(
				<Button as="a" href={'javascript:alert(1)' as string}>
					Bad
				</Button>
			);

			const link = screen.getByText('Bad').closest('a');
			expect(link?.getAttribute('href') ?? '').not.toContain('javascript');
		});

		it('carries aria-disabled and blocks the click when disabled', () => {
			const onClick = vi.fn();
			render(
				<Button as="a" href="/docs" disabled onClick={onClick}>
					Docs
				</Button>
			);

			const link = screen.getByText('Docs').closest('a')!;
			expect(link).toHaveAttribute('aria-disabled', 'true');

			fireEvent.click(link);
			expect(onClick).not.toHaveBeenCalled();
		});

		it('calls onClick when it is not disabled', () => {
			const onClick = vi.fn();
			render(
				<Button as="a" href="#x" onClick={onClick}>
					Docs
				</Button>
			);

			fireEvent.click(screen.getByRole('link'));

			expect(onClick).toHaveBeenCalled();
		});
	});
});
