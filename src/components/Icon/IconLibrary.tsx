// IconLibrary component - Mac OS 9 React UI
// Select icons by name from the registry

import React from 'react';
import { IconName, getIcon } from './registry';
import type { PixelIconProps } from './pixel';

export interface IconLibraryProps extends Omit<PixelIconProps, 'label'> {
	/**
	 * Icon name from the registry
	 */
	icon: IconName;

	/**
	 * Accessible name. Each icon carries a sensible default — `folder`
	 * announces as "Folder" — so this is only needed when the icon means
	 * something more specific in context. Pass `null` for a decorative icon
	 * that sits beside its own text label.
	 */
	label?: string | null;
}

/**
 * IconLibrary component for Mac OS 9 UI
 *
 * Provides a convenient way to use icons by name rather than importing each
 * one individually. All icons are registered in the icon registry and can be
 * accessed by their string names; `IconName` is derived from the registry, so
 * an unknown name is a compile error rather than a blank space.
 *
 * Use {@link getAllIconNames} to enumerate what is available.
 *
 * @example
 * ```tsx
 * <IconLibrary icon="folder" size="lg" />
 * <IconLibrary icon="arrowRight" size="sm" />
 * <IconLibrary icon="trash" label="Move to Trash" />
 * ```
 */
export const IconLibrary: React.FC<IconLibraryProps> = ({ icon, ...props }) => {
	const IconComponent = getIcon(icon);

	if (!IconComponent) {
		if (process.env.NODE_ENV !== 'production') {
			console.warn(`IconLibrary: no icon named "${icon}" in the registry.`);
		}
		return null;
	}

	// Render the icon component with any additional props
	return <IconComponent {...props} />;
};

IconLibrary.displayName = 'IconLibrary';

export default IconLibrary;
