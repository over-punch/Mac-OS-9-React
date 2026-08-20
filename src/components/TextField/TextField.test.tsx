// TextField Component Tests
//
// Covers label association, the multiline variant, and the error live
// region the review flagged as silent.

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import { TextField } from './TextField';
import { checkA11y } from '../../test/axe';

describe('TextField', () => {
	it('associates the label with the input', () => {
		render(<TextField label="Your name" />);
		expect(screen.getByLabelText('Your name')).toBeInTheDocument();
	});

	it('uses a supplied id rather than a generated one', () => {
		render(<TextField label="Email" id="email-field" />);
		expect(screen.getByLabelText('Email')).toHaveAttribute('id', 'email-field');
	});

	it('gives two unlabelled fields distinct generated ids', () => {
		render(
			<>
				<TextField label="One" />
				<TextField label="Two" />
			</>
		);
		expect(screen.getByLabelText('One').id).not.toBe(screen.getByLabelText('Two').id);
	});

	it('keeps its id stable across re-renders', () => {
		const { rerender } = render(<TextField label="Name" />);
		const firstId = screen.getByLabelText('Name').id;

		rerender(<TextField label="Name" placeholder="typed" />);

		expect(screen.getByLabelText('Name').id).toBe(firstId);
	});

	it('reports typing through onChange', () => {
		const onChange = vi.fn();
		render(<TextField label="Name" onChange={onChange} />);

		fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Quinn' } });

		expect(onChange).toHaveBeenCalled();
	});

	describe('multiline', () => {
		it('renders a textarea', () => {
			render(<TextField label="Notes" multiline />);
			expect(screen.getByLabelText('Notes').tagName).toBe('TEXTAREA');
		});

		it('renders an input by default', () => {
			render(<TextField label="Notes" />);
			expect(screen.getByLabelText('Notes').tagName).toBe('INPUT');
		});

		it('honours the rows prop', () => {
			render(<TextField label="Notes" multiline rows={8} />);
			expect(screen.getByLabelText('Notes')).toHaveAttribute('rows', '8');
		});

		it('forwards textarea-specific props', () => {
			render(<TextField label="Notes" multiline textareaProps={{ wrap: 'hard' }} />);
			expect(screen.getByLabelText('Notes')).toHaveAttribute('wrap', 'hard');
		});

		it('supports the same error state as the single-line field', () => {
			render(<TextField label="Notes" multiline error errorMessage="Too long" />);
			expect(screen.getByLabelText('Notes')).toHaveAttribute('aria-invalid', 'true');
			expect(screen.getByText('Too long')).toBeInTheDocument();
		});
	});

	describe('error and helper text', () => {
		it('describes the input with its helper text', () => {
			render(<TextField label="Password" helperText="At least 8 characters" />);
			expect(screen.getByLabelText('Password')).toHaveAccessibleDescription(
				'At least 8 characters'
			);
		});

		it('marks the field invalid and describes it with the error', () => {
			render(<TextField label="Email" error errorMessage="Not a valid address" />);

			const input = screen.getByLabelText('Email');
			expect(input).toHaveAttribute('aria-invalid', 'true');
			expect(input).toHaveAccessibleDescription('Not a valid address');
		});

		it('keeps the live region mounted so the error is announced when it appears', () => {
			function Harness() {
				const [error, setError] = useState(false);
				return (
					<>
						<button onClick={() => setError(true)}>fail</button>
						<TextField label="Email" error={error} errorMessage="Not a valid address" />
					</>
				);
			}

			const { container } = render(<Harness />);

			// The region exists before the error does — assistive tech only
			// announces changes within a region that was already present.
			const region = container.querySelector('[aria-live="polite"]');
			expect(region).toBeInTheDocument();
			expect(region).toHaveAttribute('hidden');

			fireEvent.click(screen.getByText('fail'));

			expect(container.querySelector('[aria-live="polite"]')).not.toHaveAttribute('hidden');
			expect(screen.getByText('Not a valid address')).toBeInTheDocument();
		});

		it('can announce assertively', () => {
			const { container } = render(
				<TextField label="Email" error errorMessage="Bad" errorLiveRegion="assertive" />
			);
			expect(container.querySelector('[aria-live="assertive"]')).toBeInTheDocument();
		});

		it('can opt out of the live region entirely', () => {
			const { container } = render(
				<TextField label="Email" error errorMessage="Bad" errorLiveRegion="off" />
			);
			expect(container.querySelector('[aria-live]')).not.toBeInTheDocument();
			// The message is still rendered and still describes the field.
			expect(screen.getByText('Bad')).toBeInTheDocument();
		});

		it('hides the helper text once an error is showing', () => {
			render(
				<TextField label="Email" helperText="We never share this" error errorMessage="Required" />
			);
			expect(screen.queryByText('We never share this')).not.toBeInTheDocument();
		});
	});

	it('supports the disabled state', () => {
		render(<TextField label="Name" disabled />);
		expect(screen.getByLabelText('Name')).toBeDisabled();
	});

	it('has no automatically detectable accessibility violations', async () => {
		const { container } = render(
			<>
				<TextField label="Name" helperText="As it appears on your ID" />
				<TextField label="Bio" multiline />
				<TextField label="Email" error errorMessage="Not a valid address" />
			</>
		);
		expect(await checkA11y(container)).toHaveNoViolations();
	});
});
