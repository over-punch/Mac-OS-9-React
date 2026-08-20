// The computer the whole site lives inside.
//
// Drawn entirely in CSS rather than shipped as a PNG: it stays crisp at the
// large scales the zoom reaches, it recolours from the same design tokens the
// components use, and there is no asset to keep in sync with the palette.
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
			<div className="machine__case">
				{/* The recessed bezel the tube sits in */}
				<div className="machine__bezel">
					<div className="machine__screen">
						<div className="machine__screenInner">{children}</div>
						{/* Scanlines and glass curvature, purely decorative */}
						<div className="machine__scanlines" aria-hidden="true" />
						<div className="machine__glare" aria-hidden="true" />
					</div>
				</div>

				{/* Chin: badge, vents, power light */}
				<div className="machine__chin">
					<div className="machine__badge">
						<span className="machine__logo" aria-hidden="true" />
						<span className="machine__badgeText">Macintosh</span>
					</div>
					<div className="machine__vents" aria-hidden="true">
						{Array.from({ length: 7 }, (_, i) => (
							<span key={i} />
						))}
					</div>
					<div className="machine__power" aria-hidden="true" />
				</div>
			</div>

			{/* Stand */}
			<div className="machine__neck" aria-hidden="true" />
			<div className="machine__foot" aria-hidden="true" />
		</div>
	);
}
