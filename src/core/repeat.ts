// Hold-to-repeat, with no framework and no DOM.
//
// Two things implemented this twice — the React LittleArrows and the
// framework-free stepper — with the same two constants copied into both. The
// timings are not arbitrary: too short a delay and a single click fires twice,
// too long and holding feels broken. Having one copy is the point of this file.

/** Delay before a held control starts repeating, in milliseconds. */
export const REPEAT_DELAY = 400;

/** Interval between repeats once started, in milliseconds. */
export const REPEAT_INTERVAL = 60;

export interface Repeater {
	/**
	 * Fire `action` once, then again on an interval after the initial delay.
	 * Starting while already running restarts from the beginning.
	 */
	start(action: () => void): void;

	/** Stop, whether or not the interval has begun. */
	stop(): void;
}

export interface RepeatOptions {
	/** @default REPEAT_DELAY */
	delay?: number;
	/** @default REPEAT_INTERVAL */
	interval?: number;
}

/**
 * Build a repeater.
 *
 * The handle owns its own timers, so two controls on a page cannot cancel each
 * other — which is what a module-level timer would do.
 */
export function createRepeater(options: RepeatOptions = {}): Repeater {
	const { delay = REPEAT_DELAY, interval = REPEAT_INTERVAL } = options;

	let delayTimer: ReturnType<typeof setTimeout> | undefined;
	let repeatTimer: ReturnType<typeof setInterval> | undefined;

	const stop = () => {
		if (delayTimer !== undefined) clearTimeout(delayTimer);
		if (repeatTimer !== undefined) clearInterval(repeatTimer);
		delayTimer = undefined;
		repeatTimer = undefined;
	};

	return {
		start(action) {
			stop();
			action();
			delayTimer = setTimeout(() => {
				repeatTimer = setInterval(action, interval);
			}, delay);
		},
		stop,
	};
}
