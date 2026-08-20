// Button Component Tests

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';
import styles from './Button.module.css';

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
		expect(button).toHaveClass(styles['button--default']);
	});

	it('renders with primary variant', () => {
		const { container } = render(<Button variant="primary">Primary</Button>);
		const button = container.querySelector('button');
		expect(button).toHaveClass(styles['button--primary']);
	});

	it('renders with danger variant', () => {
		const { container } = render(<Button variant="danger">Danger</Button>);
		const button = container.querySelector('button');
		expect(button).toHaveClass(styles['button--danger']);
	});

	// ========================================
	// Size Tests
	// ========================================

	it('renders with small size', () => {
		const { container } = render(<Button size="sm">Small</Button>);
		const button = container.querySelector('button');
		expect(button).toHaveClass(styles['button--sm']);
	});

	it('renders with medium size (default)', () => {
		const { container } = render(<Button>Medium</Button>);
		const button = container.querySelector('button');
		expect(button).toHaveClass(styles['button--md']);
	});

	it('renders with large size', () => {
		const { container } = render(<Button size="lg">Large</Button>);
		const button = container.querySelector('button');
		expect(button).toHaveClass(styles['button--lg']);
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
		expect(button).toHaveClass(styles['button--full-width']);
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
		expect(button).toHaveClass(styles['button--primary']);
		expect(button).toHaveClass(styles['button--lg']);
		expect(button).toHaveClass(styles['button--full-width']);
		expect(button).toHaveClass(styles['button--disabled']);
		expect(button).toHaveClass('custom');
		expect(button).toBeDisabled();
	});
});
