// Disclosure behaviour, without a framework.
//
// The markup is already correct HTML: a <button aria-expanded> that names the
// region it controls with aria-controls. All this adds is the toggle, and
// keeping the region's hidden state in step with the attribute — which is the
// bit people forget, leaving a collapsed region still reachable by Tab.

/** What every behaviour returns: the way to detach it again. */
export interface Detachable {
	/** Remove listeners and leave the DOM as it was found. */
	destroy(): void;
}

export interface DisclosureOptions {
	/** Called with the new state whenever it changes. */
	onToggle?: (expanded: boolean) => void;
}

/**
 * Wire a disclosure triangle to the region it controls.
 *
 * @example
 * ```html
 * <button class="mac-disclosure" aria-expanded="false" aria-controls="advanced">
 *   <span class="mac-disclosure__triangle"></span>Advanced
 * </button>
 * <div id="advanced" hidden>…</div>
 * ```
 * ```js
 * disclosure(document.querySelector('.mac-disclosure'));
 * ```
 */
export function disclosure(button: HTMLElement, options: DisclosureOptions = {}): Detachable {
	const regionId = button.getAttribute('aria-controls');
	const region = regionId ? document.getElementById(regionId) : null;

	const apply = (expanded: boolean) => {
		button.setAttribute('aria-expanded', String(expanded));
		// `hidden` rather than display:none, so a collapsed region is out of
		// the tab order as well as out of sight.
		if (region) region.hidden = !expanded;
		options.onToggle?.(expanded);
	};

	// Adopt whatever the markup already says, so the server-rendered state
	// survives hydration rather than being reset to closed.
	apply(button.getAttribute('aria-expanded') === 'true');

	const onClick = () => apply(button.getAttribute('aria-expanded') !== 'true');
	button.addEventListener('click', onClick);

	return {
		destroy() {
			button.removeEventListener('click', onClick);
		},
	};
}
