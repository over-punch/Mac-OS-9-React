// Window Component Tests
//
// Focused on the behaviour the panel review flagged: keyboard drag and
// resize, boundary clamping, controlled position arriving after mount, and
// resize persistence after the gesture ends.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import { Window } from './Window';
import { checkA11y } from '../../test/axe';
import { resetDeprecationWarnings } from '../../utils/deprecation';

/** jsdom reports every element as 0x0, so layout reads need stubbing. */
function stubLayout({
	width = 300,
	height = 200,
	parentWidth = 1000,
	parentHeight = 800,
}: { width?: number; height?: number; parentWidth?: number; parentHeight?: number } = {}) {
	Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
		configurable: true,
		get() {
			return this.className?.includes?.('window') ? width : parentWidth;
		},
	});
	Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
		configurable: true,
		get() {
			return this.className?.includes?.('window') ? height : parentHeight;
		},
	});
	Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
		configurable: true,
		get: () => parentWidth,
	});
	Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
		configurable: true,
		get: () => parentHeight,
	});
	// Reflect any inline width/height the component has applied, so successive
	// keyboard resizes accumulate the way they do in a real browser rather
	// than re-reading the same frozen size every time.
	HTMLElement.prototype.getBoundingClientRect = function () {
		const styleWidth = parseFloat(this.style.width);
		const styleHeight = parseFloat(this.style.height);
		const w = Number.isFinite(styleWidth) ? styleWidth : width;
		const h = Number.isFinite(styleHeight) ? styleHeight : height;
		return {
			x: 0,
			y: 0,
			left: 0,
			top: 0,
			right: w,
			bottom: h,
			width: w,
			height: h,
			toJSON: () => ({}),
		} as DOMRect;
	};
}

beforeEach(() => {
	stubLayout();
});

describe('Window', () => {
	it('renders its title and content', () => {
		render(<Window title="My Window">content here</Window>);
		expect(screen.getByText('My Window')).toBeInTheDocument();
		expect(screen.getByText('content here')).toBeInTheDocument();
	});

	it('only renders the controls that have handlers', () => {
		const { rerender } = render(<Window title="W">c</Window>);
		expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();

		rerender(
			<Window title="W" onClose={() => {}} onCollapse={() => {}}>
				c
			</Window>
		);
		expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Collapse' })).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'Zoom' })).not.toBeInTheDocument();
	});

	describe('collapse and zoom', () => {
		it('names the boxes what Mac OS 9 called them', () => {
			render(
				<Window title="W" onCollapse={() => {}} onZoom={() => {}}>
					c
				</Window>
			);
			// Mac OS 9 had no dock and no taskbar, so nothing was ever
			// minimised: the collapse box rolled a window into its own title
			// bar, and the zoom box fitted it to its contents. A screen reader
			// announcing "Minimize" was describing behaviour that never existed.
			expect(screen.getByRole('button', { name: 'Collapse' })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: 'Zoom' })).toBeInTheDocument();
			expect(screen.queryByRole('button', { name: 'Minimize' })).not.toBeInTheDocument();
			expect(screen.queryByRole('button', { name: 'Maximize' })).not.toBeInTheDocument();
		});

		it('still accepts the old names, and warns', () => {
			const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
			const onMinimize = vi.fn();
			const onMaximize = vi.fn();

			render(
				<Window title="W" onMinimize={onMinimize} onMaximize={onMaximize}>
					c
				</Window>
			);

			// The buttons appear under the corrected names but keep calling
			// the handlers that were passed.
			fireEvent.click(screen.getByRole('button', { name: 'Collapse' }));
			fireEvent.click(screen.getByRole('button', { name: 'Zoom' }));
			expect(onMinimize).toHaveBeenCalled();
			expect(onMaximize).toHaveBeenCalled();
			expect(warn).toHaveBeenCalledWith(expect.stringContaining('onCollapse'));
			expect(warn).toHaveBeenCalledWith(expect.stringContaining('onZoom'));
			warn.mockRestore();
		});

		it('prefers the new name when both are given', () => {
			const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
			const onCollapse = vi.fn();
			const onMinimize = vi.fn();

			render(
				<Window title="W" onCollapse={onCollapse} onMinimize={onMinimize}>
					c
				</Window>
			);
			fireEvent.click(screen.getByRole('button', { name: 'Collapse' }));
			expect(onCollapse).toHaveBeenCalled();
			expect(onMinimize).not.toHaveBeenCalled();
			warn.mockRestore();
		});
	});

	describe('keyboard drag (WCAG 2.1.1)', () => {
		it('exposes the title bar to the keyboard only when draggable', () => {
			const { rerender, container } = render(<Window title="W">c</Window>);
			expect(container.querySelector('[tabindex="0"]')).toBeNull();

			rerender(
				<Window title="W" draggable>
					c
				</Window>
			);
			expect(screen.getByLabelText('Move W window')).toHaveAttribute('tabindex', '0');
		});

		it('moves the window with the arrow keys', () => {
			const onPositionChange = vi.fn();
			render(
				<Window
					title="W"
					draggable
					defaultPosition={{ x: 100, y: 100 }}
					onPositionChange={onPositionChange}
				>
					c
				</Window>
			);

			const titleBar = screen.getByLabelText('Move W window');
			fireEvent.keyDown(titleBar, { key: 'ArrowRight' });

			expect(onPositionChange).toHaveBeenCalledWith({ x: 101, y: 100 });
		});

		it('takes a 10x step when Shift is held', () => {
			const onPositionChange = vi.fn();
			render(
				<Window
					title="W"
					draggable
					defaultPosition={{ x: 100, y: 100 }}
					onPositionChange={onPositionChange}
				>
					c
				</Window>
			);

			fireEvent.keyDown(screen.getByLabelText('Move W window'), {
				key: 'ArrowDown',
				shiftKey: true,
			});

			expect(onPositionChange).toHaveBeenCalledWith({ x: 100, y: 110 });
		});

		it('honours a custom keyboardStep', () => {
			const onPositionChange = vi.fn();
			render(
				<Window
					title="W"
					draggable
					keyboardStep={25}
					defaultPosition={{ x: 100, y: 100 }}
					onPositionChange={onPositionChange}
				>
					c
				</Window>
			);

			fireEvent.keyDown(screen.getByLabelText('Move W window'), { key: 'ArrowLeft' });

			expect(onPositionChange).toHaveBeenCalledWith({ x: 75, y: 100 });
		});

		it('ignores keys that are not arrows', () => {
			const onPositionChange = vi.fn();
			render(
				<Window
					title="W"
					draggable
					defaultPosition={{ x: 10, y: 10 }}
					onPositionChange={onPositionChange}
				>
					c
				</Window>
			);

			fireEvent.keyDown(screen.getByLabelText('Move W window'), { key: 'a' });

			expect(onPositionChange).not.toHaveBeenCalled();
		});
	});

	describe('boundary clamping', () => {
		it('will not let the window be pushed off the top of the parent', () => {
			const onPositionChange = vi.fn();
			render(
				<Window
					title="W"
					draggable
					defaultPosition={{ x: 50, y: 0 }}
					onPositionChange={onPositionChange}
				>
					c
				</Window>
			);

			fireEvent.keyDown(screen.getByLabelText('Move W window'), { key: 'ArrowUp', shiftKey: true });

			expect(onPositionChange).toHaveBeenCalledWith({ x: 50, y: 0 });
		});

		it('keeps a grabbable strip on screen at the right edge', () => {
			const onPositionChange = vi.fn();
			// jsdom gives elements no offsetParent, so the clamp falls back to
			// the viewport — which is the same path a window dragged directly
			// in the body takes. The buffer keeps 24px inside, so with a
			// 1024px viewport x maxes out at 1000.
			window.innerWidth = 1024;
			render(
				<Window
					title="W"
					draggable
					defaultPosition={{ x: 995, y: 10 }}
					onPositionChange={onPositionChange}
				>
					c
				</Window>
			);

			fireEvent.keyDown(screen.getByLabelText('Move W window'), {
				key: 'ArrowRight',
				shiftKey: true,
			});

			expect(onPositionChange).toHaveBeenCalledWith({ x: 1000, y: 10 });
		});

		it('does not clamp when boundary is none', () => {
			const onPositionChange = vi.fn();
			render(
				<Window
					title="W"
					draggable
					boundary="none"
					defaultPosition={{ x: 50, y: 0 }}
					onPositionChange={onPositionChange}
				>
					c
				</Window>
			);

			fireEvent.keyDown(screen.getByLabelText('Move W window'), { key: 'ArrowUp' });

			expect(onPositionChange).toHaveBeenCalledWith({ x: 50, y: -1 });
		});
	});

	describe('controlled position', () => {
		it('positions the window when `position` arrives after mount', () => {
			function Harness() {
				const [pos, setPos] = useState<{ x: number; y: number } | undefined>(undefined);
				return (
					<>
						<button onClick={() => setPos({ x: 40, y: 60 })}>place</button>
						<Window title="W" draggable position={pos} onPositionChange={setPos}>
							c
						</Window>
					</>
				);
			}

			const { container } = render(<Harness />);
			const windowEl = container.querySelector('[class*="window"]') as HTMLElement;
			expect(windowEl.style.position).toBe('');

			fireEvent.click(screen.getByText('place'));

			expect(windowEl.style.position).toBe('absolute');
			expect(windowEl.style.left).toBe('40px');
			expect(windowEl.style.top).toBe('60px');
		});
	});

	describe('resize', () => {
		it('exposes a keyboard-operable grow box only when resizable', () => {
			const { rerender } = render(<Window title="W">c</Window>);
			expect(screen.queryByRole('button', { name: 'Resize window' })).not.toBeInTheDocument();

			rerender(
				<Window title="W" resizable>
					c
				</Window>
			);
			expect(screen.getByRole('button', { name: 'Resize window' })).toBeInTheDocument();
		});

		it('resizes with the arrow keys and keeps the new size', () => {
			const onResize = vi.fn();
			const { container } = render(
				<Window title="W" resizable onResize={onResize} width={300} height={200}>
					c
				</Window>
			);

			fireEvent.keyDown(screen.getByRole('button', { name: 'Resize window' }), {
				key: 'ArrowRight',
				shiftKey: true,
			});

			expect(onResize).toHaveBeenCalledWith({ width: 310, height: 200 });

			// The size persists in the DOM after the gesture, rather than
			// snapping back to the width prop.
			const windowEl = container.querySelector('[class*="window"]') as HTMLElement;
			expect(windowEl.style.width).toBe('310px');
		});

		it('clamps to minWidth and minHeight', () => {
			const onResize = vi.fn();
			render(
				<Window title="W" resizable minWidth={280} minHeight={190} onResize={onResize}>
					c
				</Window>
			);

			fireEvent.keyDown(screen.getByRole('button', { name: 'Resize window' }), {
				key: 'ArrowLeft',
				shiftKey: true,
			});

			expect(onResize).toHaveBeenCalledWith({ width: 290, height: 200 });

			fireEvent.keyDown(screen.getByRole('button', { name: 'Resize window' }), {
				key: 'ArrowUp',
				shiftKey: true,
			});
			expect(onResize).toHaveBeenLastCalledWith({ width: 290, height: 190 });
		});

		it('clamps to maxWidth', () => {
			const onResize = vi.fn();
			render(
				<Window title="W" resizable maxWidth={305} onResize={onResize}>
					c
				</Window>
			);

			fireEvent.keyDown(screen.getByRole('button', { name: 'Resize window' }), {
				key: 'ArrowRight',
				shiftKey: true,
			});

			expect(onResize).toHaveBeenCalledWith({ width: 305, height: 200 });
		});
	});

	describe('activation', () => {
		it('fires onActivate on pointer down anywhere in the window', () => {
			const onActivate = vi.fn();
			render(
				<Window title="W" onActivate={onActivate}>
					<span>body</span>
				</Window>
			);

			fireEvent.pointerDown(screen.getByText('body'));

			expect(onActivate).toHaveBeenCalled();
		});

		it('applies zIndex to the root element', () => {
			const { container } = render(
				<Window title="W" zIndex={7}>
					c
				</Window>
			);
			const windowEl = container.querySelector('[class*="window"]') as HTMLElement;
			expect(windowEl.style.zIndex).toBe('7');
		});
	});

	describe('size on drag', () => {
		it('keeps the size it already had when the drag starts', () => {
			// Grabbing a window switches it to position: absolute. Any width it
			// was inheriting from a grid cell or a `width: 100%` rule then
			// resolves against the positioned ancestor instead, so the window
			// jumped to a different size the moment you touched the title bar.
			stubLayout({ width: 420, height: 260 });

			const { container } = render(
				<Window title="W" draggable>
					c
				</Window>
			);
			const windowEl = container.querySelector('[class*="window"]') as HTMLElement;
			const titleBar = container.querySelector('[class*="titleBar"]') as HTMLElement;

			expect(windowEl.style.width).toBe('');

			fireEvent.pointerDown(titleBar, { clientX: 10, clientY: 10, isPrimary: true });

			expect(windowEl.style.width).toBe('420px');
			expect(windowEl.style.height).toBe('260px');

			fireEvent.pointerUp(document);
		});

		it('leaves an explicit width alone', () => {
			stubLayout({ width: 420, height: 260 });

			const { container } = render(
				<Window title="W" draggable width={300}>
					c
				</Window>
			);
			const titleBar = container.querySelector('[class*="titleBar"]') as HTMLElement;
			const windowEl = container.querySelector('[class*="window"]') as HTMLElement;

			fireEvent.pointerDown(titleBar, { clientX: 10, clientY: 10, isPrimary: true });

			expect(windowEl.style.width).toBe('300px');

			fireEvent.pointerUp(document);
		});
	});

	describe('size bounds', () => {
		it('applies maxWidth and maxHeight to layout, not just to resizing', () => {
			// These used to be handed to the resize hook and nowhere else, so
			// the prop only took effect once you dragged the grow box.
			const { container } = render(
				<Window title="W" maxWidth={480} maxHeight={320}>
					c
				</Window>
			);
			const windowEl = container.querySelector('[class*="window"]') as HTMLElement;

			expect(windowEl.style.maxWidth).toBe('480px');
			expect(windowEl.style.maxHeight).toBe('320px');
		});
	});

	describe('contentClassName', () => {
		// The last surviving single-purpose `*ClassName` prop. It was never
		// marked deprecated in 1.x, so it could not be removed with the rest
		// in 2.0 — it warns through 2.x instead.
		beforeEach(() => {
			resetDeprecationWarnings();
		});

		it('still styles the content area', () => {
			const { container } = render(
				<Window title="W" contentClassName="legacy-content">
					c
				</Window>
			);
			expect(container.querySelector('.legacy-content')).not.toBeNull();
		});

		it('warns once, naming classes.content and the 3.0 removal', () => {
			const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

			const { rerender } = render(
				<Window title="W" contentClassName="legacy-content">
					c
				</Window>
			);
			rerender(
				<Window title="W" contentClassName="legacy-content">
					c
				</Window>
			);

			const matching = warn.mock.calls.filter((call) =>
				String(call[0]).includes('`contentClassName`')
			);
			expect(matching).toHaveLength(1);
			expect(String(matching[0]?.[0])).toContain('classes.content');
			expect(String(matching[0]?.[0])).toContain('3.0');
			warn.mockRestore();
		});

		it('stays quiet when classes.content is used instead', () => {
			const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

			render(
				<Window title="W" classes={{ content: 'current-content' }}>
					c
				</Window>
			);

			expect(
				warn.mock.calls.filter((call) => String(call[0]).includes('`contentClassName`'))
			).toHaveLength(0);
			warn.mockRestore();
		});
	});

	it('has no automatically detectable accessibility violations', async () => {
		const { container } = render(
			<Window title="Accessible" draggable resizable onClose={() => {}}>
				<p>Body copy</p>
			</Window>
		);
		expect(await checkA11y(container)).toHaveNoViolations();
	});
});
