// The five iMac G3 flavours, as a live theme switch.
//
// The site claims the library is retargetable by overriding custom properties.
// Rather than say so in a paragraph, the flavour menu does it: picking one
// stamps `data-flavour` on <html>, and the stylesheet redefines the same
// --imac-* and --desktop-* properties a consumer would override. Nothing is
// recompiled and no component knows it happened, which is the point being
// made.

/** A flavour is only ever these; anything else is a typo. */
export const FLAVOURS = ['bondi', 'blueberry', 'grape', 'tangerine', 'lime'] as const;

export type Flavour = (typeof FLAVOURS)[number];

/** The default, and the one the machine in the hero was drawn from. */
export const DEFAULT_FLAVOUR: Flavour = 'bondi';

/** Display names for the menu, in the order Apple shipped them. */
export const FLAVOUR_LABELS: Record<Flavour, string> = {
	bondi: 'Bondi Blue',
	blueberry: 'Blueberry',
	grape: 'Grape',
	tangerine: 'Tangerine',
	lime: 'Lime',
};

const STORAGE_KEY = 'macos9ui:flavour';

/** Narrow an unknown string to a Flavour. */
function isFlavour(value: string | null): value is Flavour {
	return value !== null && (FLAVOURS as readonly string[]).includes(value);
}

/**
 * The flavour to start in: whatever was picked last, else Bondi.
 *
 * Reading storage can throw outright in a locked-down browser (Safari in
 * private mode historically, and any context where storage is blocked by
 * policy), so a failure here falls back rather than taking the page down.
 */
export function readFlavour(): Flavour {
	try {
		const stored = window.localStorage.getItem(STORAGE_KEY);
		return isFlavour(stored) ? stored : DEFAULT_FLAVOUR;
	} catch {
		return DEFAULT_FLAVOUR;
	}
}

/**
 * Apply a flavour to the document and remember it.
 *
 * @param flavour - The flavour to switch to.
 */
export function applyFlavour(flavour: Flavour): void {
	document.documentElement.dataset.flavour = flavour;
	try {
		window.localStorage.setItem(STORAGE_KEY, flavour);
	} catch {
		// Not being able to remember the choice is not a reason to refuse it.
	}
}
