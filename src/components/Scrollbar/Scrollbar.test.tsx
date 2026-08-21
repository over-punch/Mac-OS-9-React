// Scrollbar Component Tests
//
// Written against the 2.0 API only — `onValueChange` and `aria-label` — so
// they hold either side of the deprecated aliases being removed, and act as
// the safety net for that removal. This was the least-covered component in
// the library at 41%.

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Scrollbar } from './Scrollbar';
import { checkA11y } from '../../test/axe';

/** jsdom reports a zero-size track; give it one so drag maths has a basis. */
function stubTrack(size = 200) {
	const original = Element.prototype.getBoundingClientRect;
	Element.prototype.getBoundingClientRect = function () {
		return {
			width: size,
			height: size,
			top: 0,
			left: 0,
			right: size,
			bottom: size,
			x: 0,
			y: 0,
			toJSON: () => ({}),
		} as DOMRect;
	};
	return () => {
		Element.prototype.getBoundingClientRect = original;
	};
}

describe('Scrollbar', () => {
	it('exposes the WAI-ARIA scrollbar contract', () => {
		render(<Scrollbar aria-label="Document" value={0.25} viewportRatio={0.4} />);

		const bar = screen.getByRole('scrollbar', { name: 'Document' });
		expect(bar).toHaveAttribute('aria-valuenow', '25');
		expect(bar).toHaveAttribute('aria-valuemin', '0');
		expect(bar).toHaveAttribute('aria-valuemax', '100');
	});

	it('links to the region it controls', () => {
		render(<Scrollbar aria-label="Document" viewportRatio={0.4} controls="doc-body" />);
		expect(screen.getByRole('scrollbar')).toHaveAttribute('aria-controls', 'doc-body');
	});

	it('is focusable so it can be driven from the keyboard', () => {
		render(<Scrollbar aria-label="Document" viewportRatio={0.4} />);
		expect(screen.getByRole('scrollbar')).toHaveAttribute('tabindex', '0');
	});

	describe('keyboard', () => {
		const setup = (props = {}) => {
			const onValueChange = vi.fn();
			render(
				<Scrollbar
					aria-label="Doc"
					value={0.5}
					viewportRatio={0.2}
					onValueChange={onValueChange}
					{...props}
				/>
			);
			return { onValueChange, bar: screen.getByRole('scrollbar') };
		};

		it('steps with the arrow keys', () => {
			const { onValueChange, bar } = setup();
			fireEvent.keyDown(bar, { key: 'ArrowDown' });
			expect(onValueChange).toHaveBeenCalledWith(0.6);

			fireEvent.keyDown(bar, { key: 'ArrowUp' });
			expect(onValueChange).toHaveBeenLastCalledWith(0.4);
		});

		it('honours a custom step', () => {
			const { onValueChange, bar } = setup({ step: 0.25 });
			fireEvent.keyDown(bar, { key: 'ArrowDown' });
			expect(onValueChange).toHaveBeenCalledWith(0.75);
		});

		it('pages by the viewport ratio', () => {
			const { onValueChange, bar } = setup();
			fireEvent.keyDown(bar, { key: 'PageDown' });
			expect(onValueChange).toHaveBeenCalledWith(0.7);

			fireEvent.keyDown(bar, { key: 'PageUp' });
			expect(onValueChange).toHaveBeenLastCalledWith(0.3);
		});

		it('jumps to the ends with Home and End', () => {
			const { onValueChange, bar } = setup();
			fireEvent.keyDown(bar, { key: 'Home' });
			expect(onValueChange).toHaveBeenCalledWith(0);

			fireEvent.keyDown(bar, { key: 'End' });
			expect(onValueChange).toHaveBeenLastCalledWith(1);
		});

		it('clamps at the ends rather than running past them', () => {
			const onValueChange = vi.fn();
			render(
				<Scrollbar aria-label="Doc" value={0} viewportRatio={0.2} onValueChange={onValueChange} />
			);

			fireEvent.keyDown(screen.getByRole('scrollbar'), { key: 'ArrowUp' });

			// Already at 0, so there is no new value to report.
			expect(onValueChange).not.toHaveBeenCalled();
		});

		it('uses left/right when horizontal', () => {
			const onValueChange = vi.fn();
			render(
				<Scrollbar
					orientation="horizontal"
					aria-label="Pan"
					value={0.5}
					viewportRatio={0.2}
					onValueChange={onValueChange}
				/>
			);
			fireEvent.keyDown(screen.getByRole('scrollbar'), { key: 'ArrowRight' });
			expect(onValueChange).toHaveBeenCalledWith(0.6);
		});

		it('ignores unrelated keys', () => {
			const { onValueChange, bar } = setup();
			fireEvent.keyDown(bar, { key: 'a' });
			expect(onValueChange).not.toHaveBeenCalled();
		});

		it('does nothing when disabled', () => {
			const { onValueChange, bar } = setup({ disabled: true });
			fireEvent.keyDown(bar, { key: 'ArrowDown' });
			expect(onValueChange).not.toHaveBeenCalled();
		});
	});

	describe('arrow buttons', () => {
		it('step the value', () => {
			const onValueChange = vi.fn();
			render(
				<Scrollbar aria-label="Doc" value={0.5} viewportRatio={0.2} onValueChange={onValueChange} />
			);

			fireEvent.click(screen.getByRole('button', { name: 'Scroll down' }));
			expect(onValueChange).toHaveBeenCalledWith(0.6);

			fireEvent.click(screen.getByRole('button', { name: 'Scroll up' }));
			expect(onValueChange).toHaveBeenLastCalledWith(0.4);
		});

		it('are labelled for the axis', () => {
			render(<Scrollbar orientation="horizontal" aria-label="Pan" viewportRatio={0.2} />);
			expect(screen.getByRole('button', { name: 'Scroll left' })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: 'Scroll right' })).toBeInTheDocument();
		});
	});

	describe('thumb', () => {
		it('drags, and reports through onValueChange', async () => {
			const restore = stubTrack(200);
			const onValueChange = vi.fn();
			const { container } = render(
				<Scrollbar aria-label="Doc" value={0} viewportRatio={0.2} onValueChange={onValueChange} />
			);

			const thumb = container.querySelector('[class*="thumb"]') as HTMLElement;
			fireEvent.pointerDown(thumb, { button: 0, isPrimary: true, clientY: 0 });
			fireEvent.pointerMove(document, { isPrimary: true, clientY: 40 });

			// The gesture hook coalesces moves into one animation frame, so the
			// callback lands on the next tick rather than synchronously.
			await waitFor(() => expect(onValueChange).toHaveBeenCalled());
			const calls = onValueChange.mock.calls;
			const reported = calls[calls.length - 1]?.[0];
			expect(reported).toBeGreaterThan(0);
			expect(reported).toBeLessThanOrEqual(1);

			fireEvent.pointerUp(document);
			restore();
		});

		it('does not drag when disabled', async () => {
			const restore = stubTrack(200);
			const onValueChange = vi.fn();
			const { container } = render(
				<Scrollbar
					aria-label="Doc"
					value={0}
					viewportRatio={0.2}
					disabled
					onValueChange={onValueChange}
				/>
			);

			const thumb = container.querySelector('[class*="thumb"]') as HTMLElement;
			fireEvent.pointerDown(thumb, { button: 0, isPrimary: true, clientY: 0 });
			fireEvent.pointerMove(document, { isPrimary: true, clientY: 40 });

			await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
			expect(onValueChange).not.toHaveBeenCalled();
			fireEvent.pointerUp(document);
			restore();
		});
	});

	it('warns when viewportRatio is omitted, rather than inventing a thumb size', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		render(<Scrollbar aria-label="Doc" />);
		expect(warn.mock.calls.some((c) => String(c[0]).includes('viewportRatio'))).toBe(true);
		warn.mockRestore();
	});

	it('has no automatically detectable accessibility violations', async () => {
		const { container } = render(
			<>
				<Scrollbar aria-label="Vertical" value={0.3} viewportRatio={0.4} />
				<Scrollbar orientation="horizontal" aria-label="Horizontal" value={0} viewportRatio={0.5} />
			</>
		);
		expect(await checkA11y(container)).toHaveNoViolations();
	});
});
