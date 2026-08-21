// Shared desktop furniture: the menu bar and wallpaper that both the
// screen-inside-the-machine and the full-page desktop section render, so the
// handoff between them at the end of the zoom is seamless.

import { MenuBar, type Menu } from '@lib/components/MenuBar';
import { IconLibrary } from '@lib/components/Icon';
import { FLAVOURS, FLAVOUR_LABELS, applyFlavour, type Flavour } from '../flavours';

const PKG = '@liiift-studio/mac-os9-ui';

// Injected by Vite from package.json, so the menu bar can't show a stale
// version after a release.
const VERSION = __PKG_VERSION__;

/**
 * A place on the desktop a menu item can send you.
 *
 * The menu used to jump to element ids with `scrollIntoView`. Three of those
 * ids — `tokens`, `a11y`, `footprint` — are props on `TabPanel`, which does
 * not forward them to the DOM, and an inactive panel's children aren't
 * rendered at all. So those items silently did nothing. Naming destinations
 * instead lets the desktop reopen the right window and select the right tab.
 */
export type DesktopSection =
	| 'start'
	| 'components'
	| 'tokens'
	| 'footprint'
	| 'a11y'
	| 'whatsnew';

export interface DesktopMenuBarProps {
	/** The flavour currently applied, so the menu can tick it. */
	flavour?: Flavour;
	/** Called when a flavour is picked. */
	onFlavourChange?: (flavour: Flavour) => void;
	/** Called to bring closed windows back. Omitted inside the machine. */
	onRestoreWindows?: () => void;
	/** How many windows are currently closed, for the menu label. */
	closedWindowCount?: number;
	/** Reveal a part of the desktop — reopening and scrolling as needed. */
	onShowSection?: (section: DesktopSection) => void;
}

/** The menu bar shown across the top of the desktop. */
export function DesktopMenuBar({
	flavour,
	onFlavourChange,
	onRestoreWindows,
	closedWindowCount = 0,
	onShowSection,
}: DesktopMenuBarProps) {
	const show = (section: DesktopSection) => () => onShowSection?.(section);
	const menus: Menu[] = [
		{
			label: 'File',
			// Menu.items is the data form; Menu.content takes JSX. No JSX needed here.
			items: [
				{ label: 'Install…', shortcut: '⌘I', onClick: () => copy(`npm install ${PKG}`) },
				{ label: 'View on npm', onClick: () => open(`https://www.npmjs.com/package/${PKG}`) },
				{ label: 'View on GitHub', separator: true, onClick: () => open(REPO) },
				{ label: 'Report an issue', onClick: () => open(`${REPO}/issues`) },
			],
		},
		{
			label: 'Components',
			items: [
				{ label: 'Storybook', shortcut: '⌘S', onClick: () => open(STORYBOOK) },
				{ label: 'All components', onClick: show('components') },
				{ label: 'Design tokens', onClick: show('tokens') },
			],
		},
		{
			label: 'View',
			items: [
				// Each entry retargets the same custom properties a consumer
				// would override, which is the claim the menu exists to prove.
				...FLAVOURS.map((name, index) => ({
					label: FLAVOUR_LABELS[name],
					checked: flavour === name,
					// Exactly one flavour is on, so these are radios: checkbox
					// semantics would tell a screen-reader user they can switch
					// several on at once.
					selection: 'radio' as const,
					// `separator` draws the divider AFTER its item, so it belongs
					// on the last flavour rather than on what follows them.
					separator: index === FLAVOURS.length - 1,
					onClick: () => onFlavourChange?.(name),
				})),
				{
					label:
						closedWindowCount > 0
							? `Restore ${closedWindowCount} window${closedWindowCount > 1 ? 's' : ''}`
							: 'Restore windows',
					disabled: closedWindowCount === 0,
					onClick: () => onRestoreWindows?.(),
				},
			],
		},
		{
			label: 'Help',
			items: [
				{ label: 'Getting started', shortcut: '⌘G', onClick: show('start') },
				{ label: 'Upgrading to 2.0', separator: true, onClick: show('whatsnew') },
				{ label: 'Footprint', onClick: show('footprint') },
				{ label: 'Accessibility', onClick: show('a11y') },
			],
		},
	];

	return (
		<MenuBar
			className="desktopMenuBar"
			menus={menus}
			leftContent={
				<span className="desktopMenuBar__logo" aria-hidden="true">
					<IconLibrary icon="application" size="sm" label={null} />
				</span>
			}
			rightContent={[
				<span key="ver" className="desktopMenuBar__status">
					v{VERSION}
				</span>,
			]}
		/>
	);
}

/** Desktop icons down the right edge, as Mac OS 9 arranged them. */
export function DesktopIcons() {
	return (
		<div className="desktopIcons">
			<a className="desktopIcon" href={STORYBOOK} target="_blank" rel="noreferrer noopener">
				<IconLibrary icon="hardDrive" size="xl" label={null} />
				<span>Storybook</span>
			</a>
			<a className="desktopIcon" href={REPO} target="_blank" rel="noreferrer noopener">
				<IconLibrary icon="folder" size="xl" label={null} />
				<span>Source</span>
			</a>
			<a
				className="desktopIcon"
				href={`https://www.npmjs.com/package/${PKG}`}
				target="_blank"
				rel="noreferrer noopener"
			>
				<IconLibrary icon="disk" size="xl" label={null} />
				<span>npm</span>
			</a>
		</div>
	);
}

export const REPO = 'https://github.com/Liiift-Studio/Mac-OS-9-React';
export const STORYBOOK = 'https://liiift-studio.github.io/Mac-OS-9-React/storybook/';
export const PACKAGE = PKG;

function open(url: string) {
	window.open(url, '_blank', 'noreferrer,noopener');
}

export function copy(text: string) {
	void navigator.clipboard?.writeText(text);
}
