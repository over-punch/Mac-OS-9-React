// Export Icon component, library, and all icons - Mac OS 9 React UI

// Base Icon component
export { Icon, type IconProps } from './Icon';
export { default } from './Icon';

// Icon Library component (name-based selection)
export { IconLibrary, type IconLibraryProps } from './IconLibrary';

// Icon registry and utilities
export { iconRegistry, getIcon, hasIcon, getAllIconNames, type IconName } from './registry';

// Icon types
export type { IconComponent, IconCategory, IconMetadata } from './types';

// Pixel-map icon factory, for defining your own icons in the same style
export { createPixelIcon, type PixelMap, type PixelIconProps } from './pixel';

// Export all icon components from categories
export * from './categories';
