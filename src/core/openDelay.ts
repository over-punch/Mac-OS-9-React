// Delayed open, immediate close — with no framework and no DOM.
//
// The pattern behind balloon help, and the reason it has a delay at all: a
// pointer crossing a control on its way somewhere else should not summon a
// balloon. Focus is different — it arrives all at once, so there is nothing to
// wait for, which is why `open` takes an `immediate` flag rather than the
// caller reaching around the delay with its own timer.
//
// Closing is never deferred. A balloon that lingers after you leave is worse
// than one that never appeared.

/** Delay before a hovered control opens, in milliseconds. */
export const OPEN_DELAY = 400;

export interface DelayedOpen {
	/** Open after the delay, or at once when `immediate` is set. */
	open(immediate?: boolean): void;

	/** Close now, cancelling any pending open. */
	close(): void;

	/** Cancel a pending open without closing what is already open. */
	cancel(): void;
}

export interface DelayedOpenOptions {
	/** Called when it should become visible. */
	onOpen: () => void;

	/** Called when it should stop being visible. */
	onClose: () => void;

	/** @default OPEN_DELAY */
	delay?: number;
}

/**
 * Build a delayed-open controller.
 *
 * `onOpen` and `onClose` are called at most once per transition, so a caller
 * can drive React state or DOM directly without guarding against repeats.
 */
export function createDelayedOpen(options: DelayedOpenOptions): DelayedOpen {
	const { onOpen, onClose, delay = OPEN_DELAY } = options;

	let timer: ReturnType<typeof setTimeout> | undefined;
	let isOpen = false;

	const cancel = () => {
		if (timer !== undefined) clearTimeout(timer);
		timer = undefined;
	};

	return {
		open(immediate = false) {
			if (isOpen) return;
			cancel();
			if (immediate) {
				isOpen = true;
				onOpen();
				return;
			}
			timer = setTimeout(() => {
				timer = undefined;
				isOpen = true;
				onOpen();
			}, delay);
		},
		close() {
			cancel();
			if (!isOpen) return;
			isOpen = false;
			onClose();
		},
		cancel,
	};
}
