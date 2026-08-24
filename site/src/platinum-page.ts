// The Platinum demo page's script.
//
// Deliberately imports nothing but the framework-free layer. If a React import
// ever appears here, the page stops being a demonstration of anything — which
// is what `site/src/platinum-page.test.ts` asserts.

import { disclosure, menu, balloon, stepper } from '@lib/platinum';

const status = document.getElementById('status');

// Disclosure: toggles the button and the region's `hidden` together.
const trigger = document.getElementById('disclosure-trigger');
if (trigger) disclosure(trigger);

// Stepper: hold-to-repeat, driving the field beside it.
const arrows = document.getElementById('copies-arrows');
const copies = document.getElementById('copies') as HTMLInputElement | null;
if (arrows && copies) {
	let value = Number(copies.value);
	stepper(arrows, {
		onStep: (direction) => {
			value = Math.min(99, Math.max(1, value + direction));
			copies.value = String(value);
		},
	});
}

// Balloon help: opens on focus as well as hover.
const trash = document.getElementById('trash');
if (trash) {
	balloon(trash, { content: 'Throws away the items you drag here.' });
}

// Menu: arrow navigation that skips the separator and the disabled item.
const demoMenu = document.getElementById('demo-menu');
if (demoMenu && status) {
	menu(demoMenu, {
		onSelect: (item) => {
			status.textContent = item.dataset.action ?? '—';
		},
		onDismiss: () => {
			// Nothing to dismiss on this page: the menu is always shown, so the
			// arrow keys can be tried without opening anything first.
		},
	});
}

// The claim the page makes about itself, checkable from the console.
console.log('[platinum] React on this page:', typeof (window as { React?: unknown }).React);
