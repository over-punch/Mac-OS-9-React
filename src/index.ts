// Mac OS 9 UI Component Library
// Main export file for all components and utilities

// Note: Users must import '@liiift-studio/mac-os9-ui/styles' in their app entry point
// This import is for internal use during development/build only
import './styles/theme.css';

// Export components
export { Button, type ButtonProps, type ButtonClasses } from './components/Button';
export {
	Icon,
	IconLibrary,
	createPixelIcon,
	iconRegistry,
	getIcon,
	hasIcon,
	getAllIconNames,
	type IconProps,
	type IconLibraryProps,
	type IconName,
	type IconComponent,
	type IconCategory,
	type PixelMap,
	type PixelIconProps,
} from './components/Icon';
export { IconButton, type IconButtonProps, type IconButtonClasses } from './components/IconButton';
export { GroupBox } from './components/GroupBox';
export type { GroupBoxProps, GroupBoxClasses } from './components/GroupBox';

export { WindowHeader } from './components/WindowHeader';
export type { WindowHeaderProps, WindowHeaderClasses } from './components/WindowHeader';

export { Slider } from './components/Slider';
export type { SliderProps, SliderClasses } from './components/Slider';

export { LittleArrows } from './components/LittleArrows';
export type { LittleArrowsProps, LittleArrowsClasses } from './components/LittleArrows';

export { Checkbox, type CheckboxProps, type CheckboxClasses } from './components/Checkbox';
export { Alert, type AlertProps, type AlertClasses, type AlertSeverity } from './components/Alert';
export {
	DisclosureTriangle,
	type DisclosureTriangleProps,
	type DisclosureTriangleClasses,
} from './components/DisclosureTriangle';
export { Progress, type ProgressProps, type ProgressClasses } from './components/Progress';
export { Separator, type SeparatorProps } from './components/Separator';
export {
	Radio,
	RadioGroup,
	type RadioProps,
	type RadioGroupProps,
	type RadioClasses,
} from './components/Radio';
export { TextField, type TextFieldProps, type TextFieldClasses } from './components/TextField';
export {
	Select,
	type SelectProps,
	type SelectOption,
	type SelectClasses,
} from './components/Select';
export {
	Tabs,
	TabPanel,
	type TabsProps,
	type TabPanelProps,
	type TabsClasses,
} from './components/Tabs';
export { Window, type WindowProps, type WindowClasses } from './components/Window';
export {
	Dialog,
	type DialogProps,
	type DialogClasses,
	type FocusableElement,
} from './components/Dialog';
export {
	WindowManagerProvider,
	useWindowManager,
	type WindowManagerContextValue,
	type WindowManagerProviderProps,
} from './components/WindowManager';
export {
	MenuBar,
	MenuItem,
	MenuDropdown,
	type MenuBarProps,
	type MenuItemProps,
	type Menu,
	type MenuItemData,
	type MenuDropdownProps,
	type MenuBarClasses,
	type MenuItemClasses,
	type MenuDropdownClasses,
} from './components/MenuBar';
export { Scrollbar, type ScrollbarProps, type ScrollbarClasses } from './components/Scrollbar';
export {
	ListView,
	type ListViewProps,
	type ListColumn,
	type ListItem,
	type ListViewClasses,
	type RowRenderState,
	type RowDefaultProps,
	type CellRenderState,
	type HeaderCellRenderState,
	type HeaderCellDefaultProps,
} from './components/ListView';
export { FolderList, type FolderListProps, type FolderListClasses } from './components/FolderList';

// Export all icon components from Icon library
export * from './components/Icon/categories';

// Export design tokens
export * from './tokens';

// Export hooks — the primitives the components are built on
export * from './hooks';

// Export utilities
export { mergeClasses, createClassBuilder } from './utils/classNames';

// Export types
export type * from './types';
