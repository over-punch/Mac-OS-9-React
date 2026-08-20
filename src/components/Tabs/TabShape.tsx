// TabShape.tsx - SVG trapezoid shape for Mac OS 9 tabs
// Authentic border pattern extracted from Figma: vy2T5MCXFz7QWf4Ba86eqN

import React from 'react';

interface TabShapeProps {
	/** Width of the tab content area (excluding 12px edges on each side) */
	width: number;
	/** Height of the tab (22px large, 16px small) */
	height: number;
	/** Stroke color */
	stroke?: string;
	/** Additional CSS class */
	className?: string;
}

/**
 * Mac OS 9 trapezoid tab shape with authentic pixelated border
 * Border only - fill color comes from CSS background
 */
export const TabShape: React.FC<TabShapeProps> = ({
	width,
	height,
	stroke = '#262626',
	className,
}) => {
	// For large tabs (22px height) - use full Figma pattern
	const isLarge = height === 22;
	const edgeWidth = 12;
	const totalWidth = width + edgeWidth * 2;

	if (!isLarge) {
		// For small tabs, simplified border
		return (
			<svg
				width="100%"
				height="100%"
				viewBox={`0 0 ${totalWidth} ${height}`}
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				className={className}
				preserveAspectRatio="none"
				style={{
					display: 'block',
					position: 'absolute',
					top: 0,
					left: 0,
					pointerEvents: 'none',
				}}
			>
				{/* Just border, no fill */}
				<path
					d={`M 10 0 L ${totalWidth - 10} 0 L ${totalWidth} ${height - 1} L ${totalWidth - 1} ${height - 1} L ${totalWidth - 1} ${height} L 0 ${height} L 0 ${height - 1} L 1 ${height - 1} L 1 ${height - 2} Z`}
					fill="none"
					stroke={stroke}
					strokeWidth={1}
				/>
			</svg>
		);
	}

	// Large tabs (22px) - use authentic Figma border pattern (border only, no fill)
	return (
		<svg
			width="100%"
			height="100%"
			viewBox={`0 0 ${totalWidth} 22`}
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			preserveAspectRatio="none"
			style={{
				display: 'block',
				position: 'absolute',
				top: 0,
				left: 0,
				pointerEvents: 'none',
			}}
		>
			{/* Left pixelated edge border */}
			<rect y="20" width="1" height="1" fill={stroke} />
			<rect x="1" y="17" width="1" height="3" fill={stroke} />
			<rect x="2" y="14" width="1" height="3" fill={stroke} />
			<rect x="3" y="11" width="1" height="3" fill={stroke} />
			<rect x="4" y="8" width="1" height="3" fill={stroke} />
			<rect x="5" y="5" width="1" height="3" fill={stroke} />
			<rect x="6" y="3" width="1" height="2" fill={stroke} />
			<rect x="7" y="2" width="1" height="1" fill={stroke} />
			<rect x="8" y="1" width="2" height="1" fill={stroke} />
			<rect x="10" y="0" width="2" height="1" fill={stroke} />
			<rect y="21" width="12" height="1" fill={stroke} />

			{/* Top border */}
			<rect x="12" y="0" width={width} height="1" fill={stroke} />

			{/* Bottom border */}
			<rect x="12" y="21" width={width} height="1" fill={stroke} />

			{/* Right pixelated edge border */}
			<rect x={12 + width + 11} y="20" width="1" height="1" fill={stroke} />
			<rect x={12 + width + 10} y="17" width="1" height="3" fill={stroke} />
			<rect x={12 + width + 9} y="14" width="1" height="3" fill={stroke} />
			<rect x={12 + width + 8} y="11" width="1" height="3" fill={stroke} />
			<rect x={12 + width + 7} y="8" width="1" height="3" fill={stroke} />
			<rect x={12 + width + 6} y="5" width="1" height="3" fill={stroke} />
			<rect x={12 + width + 5} y="3" width="1" height="2" fill={stroke} />
			<rect x={12 + width + 4} y="2" width="1" height="1" fill={stroke} />
			<rect x={12 + width + 2} y="1" width="2" height="1" fill={stroke} />
			<rect x={12 + width} y="0" width="2" height="1" fill={stroke} />
			<rect x={12 + width} y="21" width="12" height="1" fill={stroke} />
		</svg>
	);
};

export default TabShape;
