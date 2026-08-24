// ClockControl Component Tests
//
// Mac OS 9 edited the time a segment at a time, and the arrows moved whichever
// segment was selected. Both halves of that need pinning, plus the wrap: the
// original came round from 23 to 00 rather than stopping.

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ClockControl } from './ClockControl';
import { checkA11y } from '../../test/axe';

describe('ClockControl', () => {
	const time = { hours: 7, minutes: 30 };

	it('groups its segments under one name', () => {
		render(<ClockControl label="Alarm time" value={time} />);
		expect(screen.getByRole('group', { name: 'Alarm time' })).toBeInTheDocument();
	});

	it('exposes each segment as a spinbutton with its own range', () => {
		render(<ClockControl label="Alarm time" value={time} />);
		const hours = screen.getByRole('spinbutton', { name: 'hours' });
		const minutes = screen.getByRole('spinbutton', { name: 'minutes' });
		// One spinbutton for the whole time would have no meaningful range.
		expect(hours).toHaveAttribute('aria-valuemax', '23');
		expect(minutes).toHaveAttribute('aria-valuemax', '59');
	});

	it('pads to two digits, because 7:5 is not a time', () => {
		render(<ClockControl label="Alarm time" value={{ hours: 7, minutes: 5 }} />);
		expect(screen.getByRole('spinbutton', { name: 'hours' })).toHaveTextContent('07');
		expect(screen.getByRole('spinbutton', { name: 'minutes' })).toHaveTextContent('05');
	});

	it('steps the segment with the arrow keys', () => {
		const onValueChange = vi.fn();
		render(<ClockControl label="Alarm time" value={time} onValueChange={onValueChange} />);
		fireEvent.keyDown(screen.getByRole('spinbutton', { name: 'minutes' }), { key: 'ArrowUp' });
		expect(onValueChange).toHaveBeenCalledWith({ hours: 7, minutes: 31, seconds: 0 });
	});

	it('wraps rather than stopping at the end', () => {
		const onValueChange = vi.fn();
		render(
			<ClockControl
				label="Alarm time"
				value={{ hours: 23, minutes: 59 }}
				onValueChange={onValueChange}
			/>
		);
		fireEvent.keyDown(screen.getByRole('spinbutton', { name: 'hours' }), { key: 'ArrowUp' });
		expect(onValueChange).toHaveBeenCalledWith({ hours: 0, minutes: 59, seconds: 0 });
	});

	it('moves between segments with left and right', () => {
		const onValueChange = vi.fn();
		render(<ClockControl label="Alarm time" value={time} onValueChange={onValueChange} />);
		const hours = screen.getByRole('spinbutton', { name: 'hours' });
		fireEvent.focus(hours);
		fireEvent.keyDown(hours, { key: 'ArrowRight' });
		// The arrows now drive minutes, so a step lands there. pointerDown,
		// not click: LittleArrows steps on press so hold-to-repeat can start.
		fireEvent.pointerDown(screen.getByRole('button', { name: 'Increase minutes' }));
		expect(onValueChange).toHaveBeenCalledWith({ hours: 7, minutes: 31, seconds: 0 });
	});

	it('shows seconds only when asked', () => {
		const { rerender } = render(<ClockControl label="Alarm time" value={time} />);
		expect(screen.queryByRole('spinbutton', { name: 'seconds' })).not.toBeInTheDocument();
		rerender(<ClockControl label="Alarm time" value={time} showSeconds />);
		expect(screen.getByRole('spinbutton', { name: 'seconds' })).toBeInTheDocument();
	});

	describe('12-hour display', () => {
		it('shows midnight as 12 AM, not 00', () => {
			render(<ClockControl label="Alarm time" hour12 value={{ hours: 0, minutes: 0 }} />);
			expect(screen.getByRole('spinbutton', { name: 'hours' })).toHaveTextContent('12');
			expect(screen.getByText('AM')).toBeInTheDocument();
		});

		it('keeps the underlying value in 24-hour terms', () => {
			render(<ClockControl label="Alarm time" hour12 value={{ hours: 19, minutes: 0 }} />);
			const hours = screen.getByRole('spinbutton', { name: 'hours' });
			// Displaying 07 PM must not change what the value is, or toggling
			// the display would silently move the clock.
			expect(hours).toHaveTextContent('07');
			expect(hours).toHaveAttribute('aria-valuenow', '19');
			expect(screen.getByText('PM')).toBeInTheDocument();
		});
	});

	it('has no automatically detectable accessibility violations', async () => {
		const { container } = render(<ClockControl label="Alarm time" value={time} showSeconds />);
		expect(await checkA11y(container)).toHaveNoViolations();
	});
});
