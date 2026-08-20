// UI control icons - Mac OS 9 React UI
// User interface controls and elements

import React from 'react';
import { Icon } from '../Icon';
import { createPixelIcon, type PixelIconProps } from '../pixel';

/**
 * Divider icon
 * Vertical divider for menu bars and toolbars
 * Note: Uses a 10x32 viewBox instead of standard 24x24
 */
export const DividerIcon: React.FC<PixelIconProps> = ({ label = 'Divider', ...props }) => (
	<Icon label={label === null ? undefined : label} size="sm" viewBox="0 0 10 32" {...props}>
		<g clipPath="url(#clip0_529_36832)">
			<path d="M8 4H10V32H8V4Z" fill="#999999" />
			<path d="M8 0H10V4H8V0Z" fill="#999999" />
			<path d="M0 4H2V32H0V4Z" fill="white" />
			<path d="M0 0H2V4H0V0Z" fill="white" />
			<path d="M5 28H7V30H5V28Z" fill="#BBBBBB" />
			<path d="M5 21H7V23H5V21Z" fill="#BBBBBB" />
			<path d="M5 14H7V16H5V14Z" fill="#BBBBBB" />
			<path d="M5 7H7V9H5V7Z" fill="#BBBBBB" />
			<path d="M5 4H7V2H5V4Z" fill="#BBBBBB" />
			<path d="M5 30H7V32H5V30Z" fill="white" />
			<path d="M5 23H7V25H5V23Z" fill="white" />
			<path d="M5 16H7V18H5V16Z" fill="white" />
			<path d="M5 9H7V11H5V9Z" fill="white" />
			<path d="M5 2H7V0H5V2Z" fill="white" />
			<path d="M3 28H5V30H3V28Z" fill="#999999" />
			<path d="M3 21H5V23H3V21Z" fill="#999999" />
			<path d="M3 14H5V16H3V14Z" fill="#999999" />
			<path d="M3 7H5V9H3V7Z" fill="#999999" />
			<path d="M3 4H5V2H3V4Z" fill="#999999" />
			<path d="M3 30H5V32H3V30Z" fill="#BBBBBB" />
			<path d="M3 23H5V25H3V23Z" fill="#BBBBBB" />
			<path d="M3 16H5V18H3V16Z" fill="#BBBBBB" />
			<path d="M3 9H5V11H3V9Z" fill="#BBBBBB" />
			<path d="M3 2H5V0H3V2Z" fill="#BBBBBB" />
		</g>
		<defs>
			<clipPath id="clip0_529_36832">
				<rect width="10" height="32" fill="white" />
			</clipPath>
		</defs>
	</Icon>
);

/** Bevelled grow box, matching the Window resize handle. */
export const ResizeHandleIcon = createPixelIcon('ResizeHandleIcon', 'Resize', [
	'................',
	'................',
	'................',
	'................',
	'............##..',
	'............##..',
	'................',
	'........##..##..',
	'........##..##..',
	'................',
	'....##..##..##..',
	'....##..##..##..',
	'................',
	'................',
	'................',
	'................',
]);

/** Textured drag grip, for title bars and splitters. */
export const GrabberIcon = createPixelIcon('GrabberIcon', 'Drag handle', [
	'................',
	'................',
	'..##..##..##..#.',
	'..oo..oo..oo..o.',
	'................',
	'..##..##..##..#.',
	'..oo..oo..oo..o.',
	'................',
	'..##..##..##..#.',
	'..oo..oo..oo..o.',
	'................',
	'..##..##..##..#.',
	'..oo..oo..oo..o.',
	'................',
	'................',
	'................',
]);

/** Small disclosure triangle, pointing right (collapsed). */
export const ChevronRightIcon = createPixelIcon('ChevronRightIcon', 'Expand', [
	'................',
	'................',
	'................',
	'......#.........',
	'......##........',
	'......###.......',
	'......####......',
	'......#####.....',
	'......####......',
	'......###.......',
	'......##........',
	'......#.........',
	'................',
	'................',
	'................',
	'................',
]);

/** Small disclosure triangle, pointing down (expanded). */
export const ChevronDownIcon = createPixelIcon('ChevronDownIcon', 'Collapse', [
	'................',
	'................',
	'................',
	'................',
	'................',
	'...##########...',
	'....########....',
	'.....######.....',
	'......####......',
	'.......##.......',
	'................',
	'................',
	'................',
	'................',
	'................',
	'................',
]);
