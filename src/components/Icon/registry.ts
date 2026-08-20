// Icon Registry - Mac OS 9 React UI
// Central registry of all available icons with type-safe names

import { CloseIcon, TrashIcon, SearchIcon, CopyIcon, PrintIcon } from './categories/actions';
import {
	FolderIcon,
	FolderOpenIcon,
	DocumentIcon,
	ApplicationIcon,
	DiskIcon,
	HardDriveIcon,
} from './categories/files';
import {
	ArrowUpIcon,
	ArrowDownIcon,
	ArrowLeftIcon,
	ArrowRightIcon,
	HomeIcon,
} from './categories/navigation';
import { PlayIcon, PauseIcon, StopIcon, VolumeIcon, VolumeMuteIcon } from './categories/media';
import { AlertIcon, InfoIcon, ErrorIcon, CheckIcon, QuestionIcon } from './categories/status';
import {
	DividerIcon,
	ResizeHandleIcon,
	GrabberIcon,
	ChevronRightIcon,
	ChevronDownIcon,
} from './categories/ui';

/**
 * Central icon registry
 * Maps icon names to their components
 */
export const iconRegistry = {
	// Actions
	close: CloseIcon,
	trash: TrashIcon,
	search: SearchIcon,
	copy: CopyIcon,
	print: PrintIcon,

	// Files
	folder: FolderIcon,
	folderOpen: FolderOpenIcon,
	document: DocumentIcon,
	application: ApplicationIcon,
	disk: DiskIcon,
	hardDrive: HardDriveIcon,

	// Navigation
	arrowUp: ArrowUpIcon,
	arrowDown: ArrowDownIcon,
	arrowLeft: ArrowLeftIcon,
	arrowRight: ArrowRightIcon,
	home: HomeIcon,

	// Media
	play: PlayIcon,
	pause: PauseIcon,
	stop: StopIcon,
	volume: VolumeIcon,
	volumeMute: VolumeMuteIcon,

	// Status
	alert: AlertIcon,
	info: InfoIcon,
	error: ErrorIcon,
	check: CheckIcon,
	question: QuestionIcon,

	// UI
	divider: DividerIcon,
	resizeHandle: ResizeHandleIcon,
	grabber: GrabberIcon,
	chevronRight: ChevronRightIcon,
	chevronDown: ChevronDownIcon,
} as const;

/**
 * Type-safe icon names
 * Auto-generated from the icon registry
 */
export type IconName = keyof typeof iconRegistry;

/**
 * Get icon component by name
 * @param name - The icon name from the registry
 * @returns The icon component
 */
export function getIcon(name: IconName) {
	return iconRegistry[name];
}

/**
 * Check if an icon exists in the registry
 * @param name - The icon name to check
 * @returns True if the icon exists
 */
export function hasIcon(name: string): name is IconName {
	return name in iconRegistry;
}

/**
 * Get all available icon names
 * @returns Array of all icon names
 */
export function getAllIconNames(): IconName[] {
	return Object.keys(iconRegistry) as IconName[];
}
