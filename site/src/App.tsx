// The site: a Mac OS 9 machine you scroll into.
//
// The hero frames the whole computer with copy above and below. Scrolling
// zooms into the screen until it fills the viewport, at which point the
// desktop section takes over — same menu bar, same wallpaper, so the seam
// doesn't read.

import { Machine } from './components/Machine';
import { ZoomStage } from './components/ZoomStage';
import { DesktopMenuBar } from './components/DesktopChrome';
import { Inert } from './components/Inert';
import { Desktop } from './sections/Desktop';

export function App() {
	return (
		<>
			<a className="skipLink" href="#desktop">
				Skip to content
			</a>

			<ZoomStage
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
							Sixteen typed, keyboard-operable components. Everything below lives inside the
							machine.
						</p>
						<p className="scrollHint" aria-hidden="true">
							Scroll to boot
						</p>
					</>
				}
			>
				<Machine>
					{/* A still of the desktop, so the zoom lands on something
					    identical to the section that follows it. */}
					<Inert className="screenPreview">
						<DesktopMenuBar compact />
						<div className="screenPreview__surface">
							<div className="screenPreview__window">
								<div className="screenPreview__titleBar">
									<span className="screenPreview__close" />
									<span className="screenPreview__title">About This Library</span>
								</div>
								<div className="screenPreview__body">
									<span className="screenPreview__line screenPreview__line--head" />
									<span className="screenPreview__line" />
									<span className="screenPreview__line" />
									<span className="screenPreview__line screenPreview__line--short" />
									<span className="screenPreview__buttons">
										<span className="screenPreview__button" />
										<span className="screenPreview__button" />
									</span>
								</div>
							</div>
							<div className="screenPreview__icons">
								<span className="screenPreview__icon" />
								<span className="screenPreview__icon" />
								<span className="screenPreview__icon" />
							</div>
						</div>
					</Inert>
				</Machine>
			</ZoomStage>

			<Desktop />
		</>
	);
}
