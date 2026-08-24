// BevelButton Component Tests
//
// The behaviour prop decides the semantics, not just the look — that is the
// whole reason this is a component and not a CSS class on Button. A radio must
// announce as a radio, because "exactly one of these applies" is information a
// pressed-looking button does not carry.

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BevelButton } from './BevelButton';
import { checkA11y } from '../../test/axe';

describe('BevelButton', () => {
	it('is a plain button when it pushes', () => {
		render(<BevelButton>Tool</BevelButton>);
		const button = screen.getByRole('button', { name: 'Tool' });
		expect(button).not.toHaveAttribute('aria-pressed');
		expect(button).not.toHaveAttribute('aria-checked');
	});

	it('announces a toggle as pressed or not', () => {
		const { rerender } = render(
			<BevelButton behaviour="toggle" selected={false}>
				B
			</BevelButton>
		);
		expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
		rerender(
			<BevelButton behaviour="toggle" selected>
				B
			</BevelButton>
		);
		expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
	});

	it('announces a radio as a radio, not a pressed button', () => {
		render(
			<BevelButton behaviour="radio" selected aria-label="Pen">
				P
			</BevelButton>
		);
		// A pressed-looking button says "on". A radio says "one of a set", and
		// that difference is the whole point of the behaviour.
		const radio = screen.getByRole('radio', { name: 'Pen' });
		expect(radio).toHaveAttribute('aria-checked', 'true');
		expect(radio).not.toHaveAttribute('aria-pressed');
	});

	it('advertises a popup and whether it is open', () => {
		const { rerender } = render(<BevelButton behaviour="popup">Style</BevelButton>);
		const button = screen.getByRole('button');
		expect(button).toHaveAttribute('aria-haspopup', 'menu');
		expect(button).toHaveAttribute('aria-expanded', 'false');
		rerender(
			<BevelButton behaviour="popup" expanded>
				Style
			</BevelButton>
		);
		expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
	});

	it('never looks stuck in when it only pushes', () => {
		// `selected` is meaningless for a push button, and honouring it would
		// leave a momentary control looking latched.
		const { container } = render(<BevelButton selected>Tool</BevelButton>);
		const cls = container.querySelector('button')?.className ?? '';
		expect(cls).not.toMatch(/selected/);
	});

	it('reports presses', () => {
		const onClick = vi.fn();
		render(<BevelButton onClick={onClick}>Tool</BevelButton>);
		fireEvent.click(screen.getByRole('button'));
		expect(onClick).toHaveBeenCalled();
	});

	it('has no automatically detectable accessibility violations', async () => {
		const { container } = render(
			<div role="radiogroup" aria-label="Tools">
				<BevelButton behaviour="radio" selected aria-label="Pen">
					P
				</BevelButton>
				<BevelButton behaviour="radio" selected={false} aria-label="Brush">
					B
				</BevelButton>
			</div>
		);
		expect(await checkA11y(container)).toHaveNoViolations();
	});
});
