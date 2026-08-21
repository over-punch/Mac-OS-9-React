// Dialog Component Tests
//
// Covers the modal contract: portalling, accessible naming, initial focus,
// the focus trap, Escape handling across a stack, and the reference-counted
// body scroll lock.

import { describe, it, expect, vi, afterEach, beforeAll } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef, useState } from 'react';
import { Dialog } from './Dialog';
import { Button } from '../Button/Button';
import { checkA11y } from '../../test/axe';

// jsdom performs no layout, so getClientRects() returns an empty list for
// every element — including plainly visible ones. Dialog's focusable filter
// uses that list to skip elements that are not rendered, which in jsdom would
// reject the entire document. Report a rect for anything not explicitly
// hidden, which is what a real browser does.
beforeAll(() => {
	Element.prototype.getClientRects = function () {
		const hidden =
			(this as HTMLElement).hidden ||
			(this as HTMLElement).style?.display === 'none' ||
			(this as HTMLElement).style?.visibility === 'hidden';
		const rects = hidden ? [] : [{ width: 10, height: 10 } as DOMRect];
		return Object.assign(rects, {
			item: (i: number) => rects[i] ?? null,
		}) as unknown as DOMRectList;
	};
});

afterEach(() => {
	cleanup();
	// The scroll lock is module-level state; make sure nothing leaks between tests.
	document.body.style.overflow = '';
	document.body.style.paddingRight = '';
});

describe('Dialog', () => {
	it('renders nothing when closed', () => {
		render(
			<Dialog open={false} title="Hidden">
				<p>body</p>
			</Dialog>
		);
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
	});

	it('portals to document.body by default, escaping ancestor stacking contexts', () => {
		const { container } = render(
			<div style={{ transform: 'translateZ(0)' }}>
				<Dialog open title="Portalled">
					<p>body</p>
				</Dialog>
			</div>
		);

		const dialog = screen.getByRole('dialog');
		expect(dialog).toBeInTheDocument();
		// Rendered outside the transformed ancestor.
		expect(container.contains(dialog)).toBe(false);
		expect(document.body.contains(dialog)).toBe(true);
	});

	it('renders inline when container is null', () => {
		const { container } = render(
			<Dialog open title="Inline" container={null}>
				<p>body</p>
			</Dialog>
		);
		expect(container.contains(screen.getByRole('dialog'))).toBe(true);
	});

	it('portals into a supplied container', () => {
		const host = document.createElement('div');
		document.body.appendChild(host);

		render(
			<Dialog open title="Hosted" container={host}>
				<p>body</p>
			</Dialog>
		);

		expect(host.contains(screen.getByRole('dialog'))).toBe(true);
		host.remove();
	});

	describe('accessible name', () => {
		it('falls back to the window title', () => {
			render(
				<Dialog open title="Save changes">
					<p>body</p>
				</Dialog>
			);
			expect(screen.getByRole('dialog')).toHaveAccessibleName('Save changes');
		});

		it('prefers an explicit ariaLabel', () => {
			render(
				<Dialog open title="Save changes" aria-label="Confirm before quitting">
					<p>body</p>
				</Dialog>
			);
			expect(screen.getByRole('dialog')).toHaveAccessibleName('Confirm before quitting');
		});

		it('prefers aria-labelledby over everything', () => {
			render(
				<Dialog open title="Save changes" aria-label="ignored" aria-labelledby="heading">
					<h2 id="heading">Unsaved work</h2>
				</Dialog>
			);
			expect(screen.getByRole('dialog')).toHaveAccessibleName('Unsaved work');
		});
	});

	it('supports the alertdialog role for destructive confirmations', () => {
		render(
			<Dialog open title="Erase disk" role="alertdialog">
				<p>This cannot be undone.</p>
			</Dialog>
		);
		expect(screen.getByRole('alertdialog')).toBeInTheDocument();
	});

	it('puts aria-modal on the dialog, not the backdrop', () => {
		render(
			<Dialog open title="Modal">
				<p>body</p>
			</Dialog>
		);
		const dialog = screen.getByRole('dialog');
		expect(dialog).toHaveAttribute('aria-modal', 'true');
		expect(dialog.parentElement).not.toHaveAttribute('aria-modal');
	});

	describe('initial focus', () => {
		it('focuses the first focusable element by default', () => {
			render(
				<Dialog open title="Focus">
					<Button>First</Button>
					<Button>Second</Button>
				</Dialog>
			);
			expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();
		});

		it('honours a selector', () => {
			render(
				<Dialog open title="Focus" initialFocus="#confirm">
					<Button>Cancel</Button>
					<button id="confirm">OK</button>
				</Dialog>
			);
			expect(screen.getByRole('button', { name: 'OK' })).toHaveFocus();
		});

		it('honours a ref', () => {
			function Harness() {
				const ref = useRef<HTMLButtonElement>(null);
				return (
					<Dialog open title="Focus" initialFocus={ref}>
						<button>Cancel</button>
						<button ref={ref}>OK</button>
					</Dialog>
				);
			}
			render(<Harness />);
			expect(screen.getByRole('button', { name: 'OK' })).toHaveFocus();
		});

		it('falls back to the container when nothing inside can take focus', () => {
			render(
				<Dialog open title="Focus">
					<p>Just text.</p>
				</Dialog>
			);
			expect(screen.getByRole('dialog')).toHaveFocus();
		});

		it('ignores a malformed selector rather than throwing', () => {
			expect(() =>
				render(
					<Dialog open title="Focus" initialFocus=":::not-a-selector">
						<button>OK</button>
					</Dialog>
				)
			).not.toThrow();
			expect(screen.getByRole('button', { name: 'OK' })).toHaveFocus();
		});
	});

	describe('focus trap', () => {
		it('wraps from the last element back to the first', async () => {
			const user = userEvent.setup();
			render(
				<Dialog open title="Trap">
					<button>First</button>
					<button>Last</button>
				</Dialog>
			);

			const first = screen.getByRole('button', { name: 'First' });
			const last = screen.getByRole('button', { name: 'Last' });

			last.focus();
			await user.tab();

			expect(first).toHaveFocus();
		});

		it('wraps backwards from the first element to the last', async () => {
			const user = userEvent.setup();
			render(
				<Dialog open title="Trap">
					<button>First</button>
					<button>Last</button>
				</Dialog>
			);

			screen.getByRole('button', { name: 'First' }).focus();
			await user.tab({ shift: true });

			expect(screen.getByRole('button', { name: 'Last' })).toHaveFocus();
		});
	});

	describe('closing', () => {
		it('closes on Escape', () => {
			const onClose = vi.fn();
			render(
				<Dialog open title="Esc" onClose={onClose}>
					<p>body</p>
				</Dialog>
			);

			fireEvent.keyDown(document, { key: 'Escape' });

			expect(onClose).toHaveBeenCalledTimes(1);
		});

		it('does not close on Escape when closeOnEscape is false', () => {
			const onClose = vi.fn();
			render(
				<Dialog open title="Esc" closeOnEscape={false} onClose={onClose}>
					<p>body</p>
				</Dialog>
			);

			fireEvent.keyDown(document, { key: 'Escape' });

			expect(onClose).not.toHaveBeenCalled();
		});

		it('closes only the topmost dialog when stacked', () => {
			const onCloseOuter = vi.fn();
			const onCloseInner = vi.fn();

			render(
				<>
					<Dialog open title="Outer" onClose={onCloseOuter}>
						<p>outer</p>
					</Dialog>
					<Dialog open title="Inner" onClose={onCloseInner}>
						<p>inner</p>
					</Dialog>
				</>
			);

			fireEvent.keyDown(document, { key: 'Escape' });

			expect(onCloseInner).toHaveBeenCalledTimes(1);
			expect(onCloseOuter).not.toHaveBeenCalled();
		});

		it('closes on backdrop click but not on content click', () => {
			const onClose = vi.fn();
			render(
				<Dialog open title="Backdrop" onClose={onClose}>
					<p>inside</p>
				</Dialog>
			);

			fireEvent.click(screen.getByText('inside'));
			expect(onClose).not.toHaveBeenCalled();

			const backdrop = screen.getByRole('dialog').parentElement as HTMLElement;
			fireEvent.click(backdrop);
			expect(onClose).toHaveBeenCalledTimes(1);
		});

		it('does not close on backdrop click when disabled', () => {
			const onClose = vi.fn();
			render(
				<Dialog open title="Backdrop" closeOnBackdropClick={false} onClose={onClose}>
					<p>inside</p>
				</Dialog>
			);

			fireEvent.click(screen.getByRole('dialog').parentElement as HTMLElement);

			expect(onClose).not.toHaveBeenCalled();
		});
	});

	describe('body scroll lock', () => {
		it('locks while open and restores the original value on close', () => {
			document.body.style.overflow = 'scroll';

			function Harness() {
				const [open, setOpen] = useState(true);
				return (
					<>
						<button onClick={() => setOpen(false)}>close</button>
						<Dialog open={open} title="Lock">
							<p>body</p>
						</Dialog>
					</>
				);
			}

			render(<Harness />);
			expect(document.body.style.overflow).toBe('hidden');

			fireEvent.click(screen.getByText('close'));
			expect(document.body.style.overflow).toBe('scroll');
		});

		it('stays locked while a second stacked dialog closes', () => {
			function Harness() {
				const [innerOpen, setInnerOpen] = useState(true);
				return (
					<>
						<button onClick={() => setInnerOpen(false)}>close inner</button>
						<Dialog open title="Outer">
							<p>outer</p>
						</Dialog>
						<Dialog open={innerOpen} title="Inner">
							<p>inner</p>
						</Dialog>
					</>
				);
			}

			render(<Harness />);
			expect(document.body.style.overflow).toBe('hidden');

			fireEvent.click(screen.getByText('close inner'));

			// The outer dialog is still open, so the page must stay locked.
			expect(document.body.style.overflow).toBe('hidden');
		});
	});

	it('has no automatically detectable accessibility violations', async () => {
		render(
			<Dialog open title="Accessible dialog" aria-describedby="desc">
				<p id="desc">Are you sure?</p>
				<Button>Cancel</Button>
				<Button variant="primary">OK</Button>
			</Dialog>
		);
		expect(await checkA11y(screen.getByRole('dialog'))).toHaveNoViolations();
	});
});

describe('classes', () => {
	it('covers the Dialog and Window slots through one prop', () => {
		// `dialogClasses` existed in 1.x only because Dialog extends
		// WindowProps, where `classes` already meant the Window slots.
		// `DialogClasses` now extends `WindowClasses`, so `classes` reaches
		// both halves and the second prop was removed in 2.0.
		render(
			<Dialog open title="D" classes={{ backdrop: 'my-backdrop', titleBar: 'my-title-bar' }}>
				body
			</Dialog>
		);

		expect(document.querySelector('.my-backdrop')).not.toBeNull();
		expect(document.querySelector('.my-title-bar')).not.toBeNull();
	});
});
