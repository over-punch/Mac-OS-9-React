// Radio and RadioGroup Component Tests
//
// Covers the radiogroup pattern, arrow-key navigation, the layout that
// `orientation` now actually applies, and the error/helper slots.

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Radio, RadioGroup } from './Radio';
import { checkA11y } from '../../test/axe';

const renderGroup = (props: Partial<React.ComponentProps<typeof RadioGroup>> = {}) =>
	render(
		<RadioGroup name="view" aria-label="View as" {...props}>
			<Radio value="icon" label="as Icons" />
			<Radio value="list" label="as List" />
			<Radio value="button" label="as Buttons" />
		</RadioGroup>
	);

describe('RadioGroup', () => {
	it('exposes a named radiogroup', () => {
		renderGroup();
		expect(screen.getByRole('radiogroup', { name: 'View as' })).toBeInTheDocument();
		expect(screen.getAllByRole('radio')).toHaveLength(3);
	});

	it('shares its name across the radios', () => {
		renderGroup();
		for (const radio of screen.getAllByRole('radio')) {
			expect(radio).toHaveAttribute('name', 'view');
		}
	});

	it('selects on click and reports the value', () => {
		const onValueChange = vi.fn();
		renderGroup({ onValueChange });

		fireEvent.click(screen.getByLabelText('as List'));

		expect(onValueChange).toHaveBeenCalledWith('list');
	});

	it('honours a controlled value', () => {
		renderGroup({ value: 'button' });
		expect(screen.getByLabelText('as Buttons')).toBeChecked();
		expect(screen.getByLabelText('as Icons')).not.toBeChecked();
	});

	it('moves selection with the arrow keys', () => {
		const onValueChange = vi.fn();
		renderGroup({ value: 'icon', onValueChange });

		fireEvent.keyDown(screen.getByRole('radiogroup'), { key: 'ArrowDown' });

		expect(onValueChange).toHaveBeenCalledWith('list');
	});

	it('reports its orientation', () => {
		renderGroup({ orientation: 'horizontal' });
		expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-orientation', 'horizontal');
	});

	it('applies a layout class per orientation', () => {
		// aria-orientation was previously declared with no matching layout, so
		// the radios ran together inline whatever it was set to.
		const { rerender, container } = renderGroup({ orientation: 'vertical' });
		const group = container.querySelector('[role="radiogroup"]') as HTMLElement;
		expect(group.className).toMatch(/vertical/);

		rerender(
			<RadioGroup name="view" aria-label="View as" orientation="horizontal">
				<Radio value="icon" label="as Icons" />
			</RadioGroup>
		);
		expect((container.querySelector('[role="radiogroup"]') as HTMLElement).className).toMatch(
			/horizontal/
		);
	});

	it('disables every radio at once', () => {
		renderGroup({ disabled: true });
		for (const radio of screen.getAllByRole('radio')) {
			expect(radio).toBeDisabled();
		}
	});
});

describe('Radio error and helper text', () => {
	it('describes the control with its helper text', () => {
		render(<Radio name="x" value="a" label="Option" helperText="Pick one" />);
		expect(screen.getByLabelText('Option')).toHaveAccessibleDescription('Pick one');
	});

	it('marks the control invalid and describes it with the error', () => {
		render(<Radio name="x" value="a" label="Option" error errorMessage="Choose an option" />);
		const input = screen.getByLabelText('Option');
		expect(input).toHaveAttribute('aria-invalid', 'true');
		expect(input).toHaveAccessibleDescription('Choose an option');
	});

	it('renders nothing extra when neither is supplied', () => {
		const { container } = render(<Radio name="x" value="a" label="Plain" />);
		expect(container.querySelectorAll('p')).toHaveLength(0);
	});
});

describe('accessibility', () => {
	it('has no automatically detectable violations', async () => {
		const { container } = renderGroup();
		expect(await checkA11y(container)).toHaveNoViolations();
	});
});
