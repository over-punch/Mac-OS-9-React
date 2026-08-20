// WindowManager Tests
//
// The manager is additive: Window must behave exactly as before when no
// provider is present, and defer to the stack when one is.

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WindowManagerProvider } from './WindowManager';
import { Window } from '../Window/Window';

const windowEl = (container: HTMLElement, title: string) =>
	screen.getByText(title).closest('[class*="window"]') as HTMLElement;

describe('WindowManager', () => {
	it('assigns z-index by stack position', () => {
		const { container } = render(
			<WindowManagerProvider>
				<Window id="a" title="Alpha">
					a
				</Window>
				<Window id="b" title="Bravo">
					b
				</Window>
			</WindowManagerProvider>
		);

		const a = windowEl(container, 'Alpha');
		const b = windowEl(container, 'Bravo');

		expect(Number(b.style.zIndex)).toBeGreaterThan(Number(a.style.zIndex));
	});

	it('raises a window to the top when it is interacted with', () => {
		const { container } = render(
			<WindowManagerProvider>
				<Window id="a" title="Alpha">
					a
				</Window>
				<Window id="b" title="Bravo">
					b
				</Window>
			</WindowManagerProvider>
		);

		const a = windowEl(container, 'Alpha');
		const b = windowEl(container, 'Bravo');
		expect(Number(a.style.zIndex)).toBeLessThan(Number(b.style.zIndex));

		fireEvent.pointerDown(screen.getByText('a'));

		expect(Number(a.style.zIndex)).toBeGreaterThan(Number(b.style.zIndex));
	});

	it('marks only the topmost window active', () => {
		const { container } = render(
			<WindowManagerProvider>
				<Window id="a" title="Alpha">
					a
				</Window>
				<Window id="b" title="Bravo">
					b
				</Window>
			</WindowManagerProvider>
		);

		expect(windowEl(container, 'Bravo').className).toMatch(/active/);
		expect(windowEl(container, 'Alpha').className).toMatch(/inactive/);

		fireEvent.pointerDown(screen.getByText('a'));

		expect(windowEl(container, 'Alpha').className).toMatch(/active/);
		expect(windowEl(container, 'Bravo').className).toMatch(/inactive/);
	});

	it('honours baseZIndex', () => {
		const { container } = render(
			<WindowManagerProvider baseZIndex={500}>
				<Window id="a" title="Alpha">
					a
				</Window>
			</WindowManagerProvider>
		);
		expect(windowEl(container, 'Alpha').style.zIndex).toBe('500');
	});

	it('leaves Window on its own props when there is no provider', () => {
		const { container } = render(
			<Window title="Solo" zIndex={7} active={false}>
				solo
			</Window>
		);
		const solo = windowEl(container, 'Solo');
		expect(solo.style.zIndex).toBe('7');
		expect(solo.className).toMatch(/inactive/);
	});

	it('still calls the caller onActivate inside a provider', () => {
		let calls = 0;
		render(
			<WindowManagerProvider>
				<Window id="a" title="Alpha" onActivate={() => (calls += 1)}>
					a
				</Window>
			</WindowManagerProvider>
		);

		fireEvent.pointerDown(screen.getByText('a'));

		expect(calls).toBeGreaterThan(0);
	});
});
