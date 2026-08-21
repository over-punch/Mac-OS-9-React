// The computer the whole site lives inside: a Bondi blue iMac G3.
//
// Drawn entirely in CSS rather than shipped as a PNG: it stays crisp at the
// large scales the zoom reaches, it recolours from the same design tokens the
// components use, and there is no asset to keep in sync with the palette.
//
// The anatomy follows the real machine, because those parts are what make the
// silhouette readable at a glance: a translucent coloured shell behind an ice
// white front, the recessed screen, the `iMac` wordmark, a slot-loading drive
// flanked by two round speakers, and the ring-lit power button.
//
// `children` render inside the screen aperture.

import type { ReactNode } from 'react';

export interface MachineProps {
	/** Rendered inside the screen. */
	children: ReactNode;
	/** Marks the machine as powered on (screen lit rather than dark). */
	on?: boolean;
}

export function Machine({ children, on = true }: MachineProps) {
	return (
		<div className="machine" data-on={on || undefined}>
			{/* The coloured translucent shell, visible as a rim around the ice
			 * white front panel and flaring out behind it. */}
			<div className="machine__shell">
				<span className="machine__handle" aria-hidden="true" />

				<div className="machine__front">
					<span className="machine__apple" aria-hidden="true" />

					{/* The recessed bezel the tube sits in */}
					<div className="machine__bezel">
						<div className="machine__screen">
							<div className="machine__screenInner">{children}</div>
							{/* Scanlines and glass curvature, purely decorative */}
							<div className="machine__scanlines" aria-hidden="true" />
							<div className="machine__glare" aria-hidden="true" />
						</div>
					</div>

					<p className="machine__wordmark" aria-hidden="true">
						iMac
					</p>

					{/* Chin: speakers either side of the optical drive, with the
					 * power button and headphone jacks to the right. */}
					<div className="machine__chin">
						<span className="machine__speaker" aria-hidden="true" />

						<span className="machine__drive" aria-hidden="true">
							<span className="machine__driveSlot" />
							<span className="machine__driveEject" />
						</span>

						<span className="machine__controls" aria-hidden="true">
							<span className="machine__power" />
							<span className="machine__ports">
								<span />
								<span />
							</span>
						</span>

						<span className="machine__speaker" aria-hidden="true" />
					</div>
				</div>
			</div>

			{/* The moulded foot the case sits on */}
			<div className="machine__foot" aria-hidden="true" />
		</div>
	);
}
