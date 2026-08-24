// BalloonHelp Component Tests
//
// The original was hover-only, which made it invisible to keyboard and screen
// reader users. The assertions that matter are the ones covering what Mac OS 9
// did not: focus opens it, it describes rather than renames its trigger, and
// Escape gets rid of it.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BalloonHelp, BalloonHelpProvider } from './BalloonHelp';
import { checkA11y } from '../../test/axe';

const TRIGGER = <button type="button">Trash</button>;

describe('BalloonHelp', () => {
	it('opens on focus, without waiting', () => {
		render(<BalloonHelp content="Throws things away.">{TRIGGER}</BalloonHelp>);
		// Focus arrives all at once, so there is nothing to wait for — unlike
		// a pointer, which may only be passing over.
		fireEvent.focus(screen.getByRole('button'));
		expect(screen.getByRole('tooltip')).toHaveTextContent('Throws things away.');
	});

	it('describes its trigger rather than renaming it', () => {
		render(<BalloonHelp content="Throws things away.">{TRIGGER}</BalloonHelp>);
		fireEvent.focus(screen.getByRole('button'));
		// The button is still "Trash"; the balloon is extra detail about it.
		const button = screen.getByRole('button', { name: 'Trash' });
		expect(button).toBeInTheDocument();
		expect(screen.getByRole('tooltip').id).toBe(
			button.closest('[aria-describedby]')?.getAttribute('aria-describedby')
		);
	});

	it('closes on blur', () => {
		render(<BalloonHelp content="Throws things away.">{TRIGGER}</BalloonHelp>);
		fireEvent.focus(screen.getByRole('button'));
		expect(screen.getByRole('tooltip')).toBeInTheDocument();
		fireEvent.blur(screen.getByRole('button'));
		expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
	});

	it('closes on Escape without moving focus', () => {
		render(<BalloonHelp content="Throws things away.">{TRIGGER}</BalloonHelp>);
		const button = screen.getByRole('button');
		fireEvent.focus(button);
		button.focus();

		fireEvent.keyDown(document, { key: 'Escape' });

		expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
		// Dismissing a balloon must not cost you your place.
		expect(document.activeElement).toBe(button);
	});

	describe('hover', () => {
		beforeEach(() => vi.useFakeTimers());
		afterEach(() => vi.useRealTimers());

		it('waits before opening, so passing over does not trigger it', () => {
			render(<BalloonHelp content="Throws things away.">{TRIGGER}</BalloonHelp>);
			const anchor = screen.getByRole('button').parentElement!.parentElement!;

			fireEvent.pointerEnter(anchor);
			expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

			act(() => void vi.advanceTimersByTime(500));
			expect(screen.getByRole('tooltip')).toBeInTheDocument();
		});

		it('never opens if the pointer leaves first', () => {
			render(<BalloonHelp content="Throws things away.">{TRIGGER}</BalloonHelp>);
			const anchor = screen.getByRole('button').parentElement!.parentElement!;

			fireEvent.pointerEnter(anchor);
			fireEvent.pointerLeave(anchor);
			act(() => void vi.advanceTimersByTime(1000));

			expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
		});
	});

	describe('the global switch', () => {
		it('shows nothing while balloons are off', () => {
			render(
				<BalloonHelpProvider enabled={false}>
					<BalloonHelp content="Throws things away.">{TRIGGER}</BalloonHelp>
				</BalloonHelpProvider>
			);
			fireEvent.focus(screen.getByRole('button'));
			expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
		});

		it('takes down an open balloon when switched off', () => {
			const { rerender } = render(
				<BalloonHelpProvider enabled>
					<BalloonHelp content="Throws things away.">{TRIGGER}</BalloonHelp>
				</BalloonHelpProvider>
			);
			fireEvent.focus(screen.getByRole('button'));
			expect(screen.getByRole('tooltip')).toBeInTheDocument();

			rerender(
				<BalloonHelpProvider enabled={false}>
					<BalloonHelp content="Throws things away.">{TRIGGER}</BalloonHelp>
				</BalloonHelpProvider>
			);
			// Otherwise the last balloon is stranded on screen.
			expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
		});

		it('is on when there is no provider at all', () => {
			render(<BalloonHelp content="Throws things away.">{TRIGGER}</BalloonHelp>);
			fireEvent.focus(screen.getByRole('button'));
			expect(screen.getByRole('tooltip')).toBeInTheDocument();
		});
	});

	it('has no automatically detectable accessibility violations', async () => {
		const { container } = render(
			<BalloonHelp content="Throws away the items you drag here.">{TRIGGER}</BalloonHelp>
		);
		fireEvent.focus(screen.getByRole('button'));
		expect(await checkA11y(container)).toHaveNoViolations();
	});
});
