// Mac OS 9 UI Component Library
// Main export file for all components and utilities

// Note: Users must import '@liiift-studio/mac-os9-ui/styles' in their app entry point
// This import is for internal use during development/build only
import './styles/theme.css';

// Export components
export { Button, type ButtonProps } from './components/Button';
export {
	Icon,
	IconLibrary,
	type IconProps,
	type IconLibraryProps,
	type IconName,
} from './components/Icon';
export { IconButton, type IconButtonProps } from './components/IconButton';
export { Checkbox, type CheckboxProps } from './components/Checkbox';
export { Radio, RadioGroup, type RadioProps, type RadioGroupProps } from './components/Radio';
export { TextField, type TextFieldProps } from './components/TextField';
export { Select, type SelectProps, type SelectOption } from './components/Select';
export { Tabs, TabPanel, type TabsProps, type TabPanelProps } from './components/Tabs';
export { Window, type WindowProps, type WindowClasses } from './components/Window';
export { Dialog, type DialogProps, type FocusableElement } from './components/Dialog';
export {
	MenuBar,
	MenuItem,
	MenuDropdown,
	type MenuBarProps,
	type MenuItemProps,
	type Menu,
	type MenuItemData,
	type MenuDropdownProps,
} from './components/MenuBar';
export { Scrollbar, type ScrollbarProps } from './components/Scrollbar';
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

// Export utilities
export { mergeClasses, createClassBuilder } from './utils/classNames';

// Export types
export type * from './types';
