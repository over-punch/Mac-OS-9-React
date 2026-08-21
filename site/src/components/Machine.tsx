// The computer the whole site lives inside: a Bondi blue iMac G3.
//
// Drawn entirely in CSS rather than shipped as a PNG, and built as real 3D
// rather than a flat picture of one: the shell is a `preserve-3d` assembly
// with a back body, two flanks and a top, so turning it toward the cursor
// reveals actual depth instead of skewing a photograph.
//
// It is CSS and not three.js for one decisive reason: `children` here is the
// live, interactive desktop. Nothing interactive can live inside a WebGL
// canvas, so a WebGL iMac would mean going back to a screenshot of a desktop
// behind glass — which is the thing this page exists not to do.
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
			<div className="machine__solid">
				{/* The mass of the case behind the front panel. Set back in Z and
				 * inset, which is what gives the iMac its taper. */}
				<span className="machine__body" aria-hidden="true" />

				{/* The flanks, standing perpendicular to the front. Invisible
				 * head-on; they swing into view as the machine turns. */}
				<span className="machine__flank machine__flank--left" aria-hidden="true" />
				<span className="machine__flank machine__flank--right" aria-hidden="true" />
				<span className="machine__flank machine__flank--top" aria-hidden="true" />

				{/* The coloured shell, visible as a rim around the ice white
				 * front panel. This is the face of the assembly. */}
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
			</div>

			{/* The moulded foot the case sits on */}
			<div className="machine__foot" aria-hidden="true" />
		</div>
	);
}
