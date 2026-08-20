// TypeScript types for Icon Library - Mac OS 9 React UI

import React from 'react';
import type { PixelIconProps } from './pixel';

/**
 * Icon component type.
 *
 * Every icon accepts the presentational props of the base Icon — `size`,
 * `className`, `label`, and any SVG attribute. It was previously declared as
 * a bare `React.FC`, which said icons took no props at all and made
 * forwarding `size` through IconLibrary a type error.
 */
export type IconComponent = React.FC<PixelIconProps>;

/**
 * Icon category types
 * Used to organize icons into logical groups
 */
export type IconCategory =
	| 'actions'
	| 'files'
	| 'navigation'
	| 'media'
	| 'status'
	| 'ui';

/**
 * Icon metadata for documentation and discovery
 */
export interface IconMetadata {
	/**
	 * The icon component
	 */
	component: IconComponent;

	/**
	 * Category the icon belongs to
	 */
	category: IconCategory;

	/**
	 * Keywords for search/discovery
	 */
	keywords?: string[];

	/**
	 * Optional description
	 */
	description?: string;
}