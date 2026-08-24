// LittleArrows Component Tests
//
// Two buttons, not one control with halves — so each direction must be
// separately reachable and separately named. The repeat-on-hold is the other
// half: it has to start after a pause (or a single click fires twice) and it
// has to stop when the pointer leaves, or it runs forever.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { LittleArrows } from './LittleArrows';
import { checkA11y } from '../../test/axe';

describe('LittleArrows', () => {
	it('exposes both directions as buttons', () => {
		render(<LittleArrows onStep={vi.fn()} />);
		expect(screen.getByRole('button', { name: 'Increase' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Decrease' })).toBeInTheDocument();
	});

	it('names what is being stepped when told', () => {
		render(<LittleArrows onStep={vi.fn()} stepLabel="volume" />);
		expect(screen.getByRole('button', { name: 'Increase volume' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Decrease volume' })).toBeInTheDocument();
	});

	it('steps in the right direction', () => {
		const onStep = vi.fn();
		render(<LittleArrows onStep={onStep} />);
		fireEvent.pointerDown(screen.getByRole('button', { name: 'Increase' }));
		expect(onStep).toHaveBeenCalledWith(1);
		fireEvent.pointerDown(screen.getByRole('button', { name: 'Decrease' }));
		expect(onStep).toHaveBeenCalledWith(-1);
	});

	it('associates itself with the field it drives', () => {
		render(<LittleArrows onStep={vi.fn()} controls="qty" />);
		expect(screen.getByRole('button', { name: 'Increase' })).toHaveAttribute(
			'aria-controls',
			'qty'
		);
	});

	it('stops each end independently', () => {
		const onStep = vi.fn();
		render(<LittleArrows onStep={onStep} upDisabled />);
		expect(screen.getByRole('button', { name: 'Increase' })).toBeDisabled();
		expect(screen.getByRole('button', { name: 'Decrease' })).toBeEnabled();
		fireEvent.pointerDown(screen.getByRole('button', { name: 'Increase' }));
		expect(onStep).not.toHaveBeenCalled();
	});

	it('steps once per keypress, without repeating', () => {
		const onStep = vi.fn();
		render(<LittleArrows onStep={onStep} />);
		// Holding a key already repeats at the OS level; repeating again here
		// would double it.
		fireEvent.keyDown(screen.getByRole('button', { name: 'Increase' }), { key: 'Enter' });
		expect(onStep).toHaveBeenCalledTimes(1);
	});

	describe('repeat on hold', () => {
		beforeEach(() => vi.useFakeTimers());
		afterEach(() => vi.useRealTimers());

		it('waits before repeating, so a click is one step', () => {
			const onStep = vi.fn();
			render(<LittleArrows onStep={onStep} />);
			const up = screen.getByRole('button', { name: 'Increase' });

			fireEvent.pointerDown(up);
			expect(onStep).toHaveBeenCalledTimes(1);

			act(() => void vi.advanceTimersByTime(300));
			expect(onStep).toHaveBeenCalledTimes(1);

			act(() => void vi.advanceTimersByTime(200));
			expect(onStep.mock.calls.length).toBeGreaterThan(1);
		});

		it('stops when the pointer leaves', () => {
			const onStep = vi.fn();
			render(<LittleArrows onStep={onStep} />);
			const up = screen.getByRole('button', { name: 'Increase' });

			fireEvent.pointerDown(up);
			act(() => void vi.advanceTimersByTime(1000));
			const afterHold = onStep.mock.calls.length;

			// A pointer released outside the button never fires pointerup on
			// it, so leaving has to be enough to stop the repeat.
			fireEvent.pointerLeave(up);
			act(() => void vi.advanceTimersByTime(1000));
			expect(onStep).toHaveBeenCalledTimes(afterHold);
		});
	});

	it('has no automatically detectable accessibility violations', async () => {
		const { container } = render(<LittleArrows onStep={vi.fn()} stepLabel="quantity" />);
		expect(await checkA11y(container)).toHaveNoViolations();
	});
});
