// Shared desktop furniture: the menu bar and wallpaper that both the
// screen-inside-the-machine and the full-page desktop section render, so the
// handoff between them at the end of the zoom is seamless.

import { MenuBar, type Menu } from '@lib/components/MenuBar';
import { IconLibrary } from '@lib/components/Icon';

const PKG = '@liiift-studio/mac-os9-ui';

// Injected by Vite from package.json, so the menu bar can't show a stale
// version after a release.
const VERSION = __PKG_VERSION__;

/** The menu bar shown across the top of the desktop. */
export function DesktopMenuBar({ compact = false }: { compact?: boolean }) {
	const menus: Menu[] = [
		{
			label: 'File',
			// The data form of Menu.items — no JSX needed for the dropdown.
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
				{ label: 'All components', onClick: () => jump('components') },
				{ label: 'Design tokens', onClick: () => jump('tokens') },
			],
		},
		{
			label: 'Help',
			items: [
				{ label: 'Getting started', onClick: () => jump('start') },
				{ label: 'Accessibility', onClick: () => jump('a11y') },
			],
		},
	];

	return (
		<MenuBar
			className={compact ? 'desktopMenuBar desktopMenuBar--compact' : 'desktopMenuBar'}
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

function jump(id: string) {
	document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function copy(text: string) {
	void navigator.clipboard?.writeText(text);
}
