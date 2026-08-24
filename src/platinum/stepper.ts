// Little-arrows behaviour, without a framework.
//
// Hold-to-repeat after a pause, and — the part that is easy to miss — stopping
// when the pointer leaves. A pointer released outside the button never fires
// pointerup on it, which is how that kind of repeat runs forever.

import { createRepeater } from '../core/repeat';
import type { Detachable } from './disclosure';

export interface StepperOptions {
	/** Called with 1 to step up and -1 to step down. */
	onStep: (direction: 1 | -1) => void;
}

/**
 * Wire a `.mac-littlearrows` pair. The first button steps up, the second down.
 *
 * @example
 * ```html
 * <span class="mac-littlearrows">
 *   <button class="mac-littlearrows__arrow" aria-label="Increase copies"></button>
 *   <button class="mac-littlearrows__arrow" aria-label="Decrease copies"></button>
 * </span>
 * ```
 */
export function stepper(element: HTMLElement, options: StepperOptions): Detachable {
	const buttons = [...element.querySelectorAll<HTMLButtonElement>('button')];
	// The timing lives in the shared core, so this and the React LittleArrows
	// cannot drift apart on how long a hold waits before it repeats.
	const repeater = createRepeater();
	const stop = () => repeater.stop();
	const start = (direction: 1 | -1) => repeater.start(() => options.onStep(direction));

	const listeners: Array<[HTMLElement, string, EventListener]> = [];
	const on = (node: HTMLElement, type: string, handler: EventListener) => {
		node.addEventListener(type, handler);
		listeners.push([node, type, handler]);
	};

	buttons.forEach((button, i) => {
		const direction: 1 | -1 = i === 0 ? 1 : -1;
		on(button, 'pointerdown', (event) => {
			// Keep focus where it is — usually the field these drive.
			event.preventDefault();
			if (button.disabled) return;
			start(direction);
		});
		on(button, 'pointerup', stop);
		on(button, 'pointerleave', stop);
		on(button, 'pointercancel', stop);
		// Keyboard gets a plain press: holding a key already repeats at the OS
		// level, so repeating again here would double it.
		on(button, 'keydown', (event) => {
			const key = (event as KeyboardEvent).key;
			if (key !== 'Enter' && key !== ' ') return;
			event.preventDefault();
			if (!button.disabled) options.onStep(direction);
		});
	});

	return {
		destroy() {
			stop();
			for (const [node, type, handler] of listeners) {
				node.removeEventListener(type, handler);
			}
		},
	};
}
