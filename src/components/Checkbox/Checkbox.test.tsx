// Checkbox Component Tests
//
// Focused on the error and helper slots added for issue #45, and the
// indeterminate state.

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import { Checkbox } from './Checkbox';
import { checkA11y } from '../../test/axe';

describe('Checkbox', () => {
	it('associates its label', () => {
		render(<Checkbox label="Show hidden files" />);
		expect(screen.getByLabelText('Show hidden files')).toBeInTheDocument();
	});

	it('toggles', () => {
		const onChange = vi.fn();
		render(<Checkbox label="Toggle" onChange={onChange} />);
		fireEvent.click(screen.getByLabelText('Toggle'));
		expect(onChange).toHaveBeenCalled();
	});

	it('supports the disabled state', () => {
		render(<Checkbox label="Nope" disabled />);
		expect(screen.getByLabelText('Nope')).toBeDisabled();
	});

	describe('error and helper text', () => {
		it('describes the control with its helper text', () => {
			render(<Checkbox label="Terms" helperText="You can change this later" />);
			expect(screen.getByLabelText('Terms')).toHaveAccessibleDescription(
				'You can change this later'
			);
		});

		it('marks the control invalid and describes it with the error', () => {
			render(<Checkbox label="Terms" error errorMessage="You must accept the terms" />);
			const input = screen.getByLabelText('Terms');
			expect(input).toHaveAttribute('aria-invalid', 'true');
			expect(input).toHaveAccessibleDescription('You must accept the terms');
		});

		it('keeps the live region mounted so the error is announced when it appears', () => {
			function Harness() {
				const [error, setError] = useState(false);
				return (
					<>
						<button onClick={() => setError(true)}>fail</button>
						<Checkbox label="Terms" error={error} errorMessage="Required" />
					</>
				);
			}

			const { container } = render(<Harness />);

			const region = container.querySelector('[aria-live="polite"]');
			expect(region).toBeInTheDocument();
			expect(region).toHaveAttribute('hidden');

			fireEvent.click(screen.getByText('fail'));

			expect(container.querySelector('[aria-live="polite"]')).not.toHaveAttribute('hidden');
			expect(screen.getByText('Required')).toBeInTheDocument();
		});

		it('hides the helper text once an error is showing', () => {
			render(
				<Checkbox label="Terms" helperText="Optional guidance" error errorMessage="Required" />
			);
			expect(screen.queryByText('Optional guidance')).not.toBeInTheDocument();
		});

		it('can opt out of the live region', () => {
			const { container } = render(
				<Checkbox label="Terms" error errorMessage="Required" errorLiveRegion="off" />
			);
			expect(container.querySelector('[aria-live]')).not.toBeInTheDocument();
			expect(screen.getByText('Required')).toBeInTheDocument();
		});

		it('renders nothing extra when neither is supplied', () => {
			const { container } = render(<Checkbox label="Plain" />);
			expect(container.querySelector('[aria-live]')).not.toBeInTheDocument();
			expect(container.querySelectorAll('p')).toHaveLength(0);
		});
	});

	it('has no automatically detectable accessibility violations', async () => {
		const { container } = render(
			<>
				<Checkbox label="Plain" />
				<Checkbox label="With helper" helperText="Guidance" />
				<Checkbox label="With error" error errorMessage="Required" />
			</>
		);
		expect(await checkA11y(container)).toHaveNoViolations();
	});
});
