// Placard Component Tests
//
// The thing worth pinning is that a placard is only a button when it has
// something to do. A readout rendered as a button is a control that goes
// nowhere: it takes Tab focus, invites a press, and does nothing.

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Placard } from './Placard';
import { checkA11y } from '../../test/axe';

describe('Placard', () => {
	it('is plain text when it has no action', () => {
		render(<Placard>Page 3 of 12</Placard>);
		expect(screen.getByText('Page 3 of 12')).toBeInTheDocument();
		// Not focusable, not pressable, not announced as a control.
		expect(screen.queryByRole('button')).not.toBeInTheDocument();
	});

	it('is a real button when it has one', () => {
		const onClick = vi.fn();
		render(
			<Placard onClick={onClick} aria-label="Change magnification">
				100%
			</Placard>
		);
		const button = screen.getByRole('button', { name: 'Change magnification' });
		fireEvent.click(button);
		expect(onClick).toHaveBeenCalled();
	});

	it('can be disabled once pressable', () => {
		const onClick = vi.fn();
		render(
			<Placard onClick={onClick} disabled>
				100%
			</Placard>
		);
		expect(screen.getByRole('button')).toBeDisabled();
		fireEvent.click(screen.getByRole('button'));
		expect(onClick).not.toHaveBeenCalled();
	});

	it('has no automatically detectable accessibility violations', async () => {
		const { container } = render(
			<>
				<Placard>Page 3 of 12</Placard>
				<Placard onClick={vi.fn()} aria-label="Change magnification">
					100%
				</Placard>
			</>
		);
		expect(await checkA11y(container)).toHaveNoViolations();
	});
});
