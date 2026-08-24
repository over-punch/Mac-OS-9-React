// Slider Component Tests
//
// The keyboard contract is the part that is easy to ship broken, because a
// slider looks finished as soon as dragging works. These cover the arrow,
// Page, Home and End keys, the range clamp, and the tick snapping — which is
// behaviour, not decoration: a ticked slider lands on ticks.

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Slider } from './Slider';
import { checkA11y } from '../../test/axe';

describe('Slider', () => {
	it('reports its value and range', () => {
		render(<Slider label="Volume" value={40} />);
		const slider = screen.getByRole('slider');
		expect(slider).toHaveAttribute('aria-valuenow', '40');
		expect(slider).toHaveAttribute('aria-valuemin', '0');
		expect(slider).toHaveAttribute('aria-valuemax', '100');
	});

	it('is named by its visible label', () => {
		render(<Slider label="Volume" value={40} />);
		expect(screen.getByRole('slider', { name: 'Volume' })).toBeInTheDocument();
	});

	describe('keyboard', () => {
		const setup = (props = {}) => {
			const onValueChange = vi.fn();
			render(<Slider label="Volume" value={50} onValueChange={onValueChange} {...props} />);
			return { slider: screen.getByRole('slider'), onValueChange };
		};

		it.each([
			['ArrowRight', 51],
			['ArrowUp', 51],
			['ArrowLeft', 49],
			['ArrowDown', 49],
		])('%s moves by one step', (key, expected) => {
			const { slider, onValueChange } = setup();
			fireEvent.keyDown(slider, { key });
			expect(onValueChange).toHaveBeenCalledWith(expected);
		});

		it('Page Up and Page Down move by a tenth of the range', () => {
			const { slider, onValueChange } = setup();
			fireEvent.keyDown(slider, { key: 'PageUp' });
			expect(onValueChange).toHaveBeenCalledWith(60);
			fireEvent.keyDown(slider, { key: 'PageDown' });
			expect(onValueChange).toHaveBeenCalledWith(40);
		});

		it('Home and End go to the ends', () => {
			const { slider, onValueChange } = setup();
			fireEvent.keyDown(slider, { key: 'Home' });
			expect(onValueChange).toHaveBeenCalledWith(0);
			fireEvent.keyDown(slider, { key: 'End' });
			expect(onValueChange).toHaveBeenCalledWith(100);
		});

		it('will not step past the ends', () => {
			const onValueChange = vi.fn();
			render(<Slider label="Volume" value={100} onValueChange={onValueChange} />);
			fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' });
			// Already at the maximum, so there is no new value to report.
			expect(onValueChange).not.toHaveBeenCalled();
		});

		it('does nothing when disabled', () => {
			const { slider, onValueChange } = setup({ disabled: true });
			fireEvent.keyDown(slider, { key: 'ArrowRight' });
			expect(onValueChange).not.toHaveBeenCalled();
			expect(slider).toHaveAttribute('tabindex', '-1');
		});
	});

	describe('ticks', () => {
		it('steps between ticks rather than by one', () => {
			const onValueChange = vi.fn();
			// Five ticks across 1..5 puts one at every whole number.
			render(
				<Slider label="Speed" min={1} max={5} ticks={5} value={3} onValueChange={onValueChange} />
			);
			fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' });
			expect(onValueChange).toHaveBeenCalledWith(4);
		});

		it('snaps a value that falls between ticks', () => {
			render(<Slider label="Speed" min={0} max={100} ticks={5} value={30} />);
			// Ticks at 0/25/50/75/100 — 30 is nearest 25.
			expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '25');
		});

		it('draws one tick mark per tick', () => {
			const { container } = render(<Slider label="Speed" ticks={5} value={0} />);
			expect(container.querySelectorAll('[aria-hidden="true"] > span')).toHaveLength(5);
		});
	});

	it('uses valueText where a bare number would not communicate', () => {
		render(<Slider label="Speed" min={1} max={3} value={2} valueText="Medium" />);
		expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', 'Medium');
	});

	it('reports orientation when vertical', () => {
		render(<Slider label="Volume" orientation="vertical" value={0} />);
		expect(screen.getByRole('slider')).toHaveAttribute('aria-orientation', 'vertical');
	});

	it('has no automatically detectable accessibility violations', async () => {
		const { container } = render(<Slider label="Volume" value={40} ticks={5} />);
		expect(await checkA11y(container)).toHaveNoViolations();
	});
});
