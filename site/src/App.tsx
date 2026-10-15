// The site: a Mac OS 9 machine you scroll into.
//
// The hero frames the whole computer with copy above and below. Scrolling
// dollies the camera in until the screen is the viewport — at which point the
// desktop inside it is at 1:1 and becomes interactive.
//
// There is exactly one desktop. It lives inside the machine's screen from the
// first frame, so what you scroll toward is the thing itself rather than a
// mock-up of it, and there is no second copy underneath to hand off to.
//
// `?boot=1` plays the zoom for the visitor, for links (overpunch.ca's Loose
// Parts page) that promise to open straight into the desktop.

import { MachineStage } from './components/MachineStage';
import { Desktop, COMPONENT_COUNT } from './sections/Desktop';

/** Query parameter that asks the page to boot into the desktop on its own. */
const BOOT_PARAM = 'boot';

/**
 * Reads `?boot=1` once, then removes it from the address bar so a reload or a
 * copied link opens the page normally rather than replaying the boot.
 */
function takeBootParam(): boolean {
	const url = new URL(window.location.href);
	if (url.searchParams.get(BOOT_PARAM) !== '1') return false;

	url.searchParams.delete(BOOT_PARAM);
	window.history.replaceState(window.history.state, '', url);
	return true;
}

/** Whether this page load asked to boot. Read at module load, before React. */
const AUTO_BOOT = takeBootParam();

export function App() {
	return (
		<>
			<a className="skipLink" href="#desktop">
				Skip to content
			</a>

			<MachineStage
				autoBoot={AUTO_BOOT}
				above={
					<>
						<p className="kicker">@overpunch/mac-os9-ui</p>
						<h1 className="heroTitle">
							The Mac OS 9 interface,
							<br />
							rebuilt as React components.
						</h1>
					</>
				}
				below={
					<>
						<p className="heroSub">
							{COMPONENT_COUNT()} typed, keyboard-operable components. The desktop in the screen is
							the real thing — scroll in and use it.
						</p>
						<p className="scrollHint" aria-hidden="true">
							Scroll to boot
						</p>
					</>
				}
			>
				<Desktop />
			</MachineStage>
		</>
	);
}
