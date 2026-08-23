// The site: a Mac OS 9 machine you scroll into.
//
// The hero frames the whole computer with copy above and below. Scrolling
// dollies the camera in until the screen is the viewport — at which point the
// desktop inside it is at 1:1 and becomes interactive.
//
// There is exactly one desktop. It lives inside the machine's screen from the
// first frame, so what you scroll toward is the thing itself rather than a
// mock-up of it, and there is no second copy underneath to hand off to.

import { MachineStage } from './components/MachineStage';
import { Desktop } from './sections/Desktop';

export function App() {
	return (
		<>
			<a className="skipLink" href="#desktop">
				Skip to content
			</a>

			<MachineStage
				above={
					<>
						<p className="kicker">@liiift-studio/mac-os9-ui</p>
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
							Sixteen typed, keyboard-operable components. The desktop in the screen is the real
							thing — scroll in and use it.
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
