// The desktop — where the meaningful content lives.
//
// Everything here is built out of the library's own components: the windows
// are <Window>, the component index is a <ListView>, the install line is a
// <TextField>, the tabs are <Tabs>. The page is the demo.
//
// Which is why the windows really close, and the component rows really open
// their Storybook page. A page arguing that the chrome works, not just looks,
// cannot afford a control that does nothing when you click it.

import { useCallback, useState } from 'react';
import { Window } from '@lib/components/Window';
import { WindowManagerProvider } from '@lib/components/WindowManager';
import { Button } from '@lib/components/Button';
import { ListView, type ListItem } from '@lib/components/ListView';
import { Tabs, TabPanel } from '@lib/components/Tabs';
import { Dialog } from '@lib/components/Dialog';
import { Checkbox } from '@lib/components/Checkbox';
import { Select } from '@lib/components/Select';
import { Progress } from '@lib/components/Progress';
import { Alert } from '@lib/components/Alert';
import { DisclosureTriangle } from '@lib/components/DisclosureTriangle';
import { Separator } from '@lib/components/Separator';
import { TextField } from '@lib/components/TextField';
import { IconLibrary } from '@lib/components/Icon';
import { getAllIconNames } from '@lib/components/Icon/registry';
import {
	DesktopMenuBar,
	DesktopIcons,
	REPO,
	STORYBOOK,
	PACKAGE,
	copy,
	type DesktopSection,
} from '../components/DesktopChrome';
import { applyFlavour, readFlavour, type Flavour } from '../flavours';

interface ComponentRow extends ListItem {
	name: string;
	role: string;
	keyboard: string;
	/**
	 * Storybook story id, from the story's `title` lowercased and slugified.
	 * Absent where the component has no story of its own yet — those rows
	 * simply don't open, rather than opening a 404.
	 */
	story?: string;
}

const COMPONENTS: ComponentRow[] = [
	{
		id: 'window',
		name: 'Window',
		role: 'Chrome',
		keyboard: 'Arrow keys move & resize',
		story: 'components-window',
	},
	{
		id: 'dialog',
		name: 'Dialog',
		role: 'Chrome',
		keyboard: 'Focus trap, Escape',
		story: 'components-dialog',
	},
	{
		id: 'menubar',
		name: 'MenuBar',
		role: 'Chrome',
		keyboard: 'Roving tabindex',
		story: 'components-menubar',
	},
	{
		id: 'menuitem',
		name: 'MenuItem',
		role: 'Chrome',
		keyboard: 'Arrow into submenus',
		story: 'components-menubar',
	},
	{
		id: 'menudropdown',
		name: 'MenuDropdown',
		role: 'Chrome',
		keyboard: 'Escape to close',
		story: 'components-menudropdown',
	},
	{
		id: 'tabs',
		name: 'Tabs',
		role: 'Navigation',
		keyboard: 'Arrows, Home / End',
		story: 'components-tabs',
	},
	{
		id: 'listview',
		name: 'ListView',
		role: 'Navigation',
		keyboard: 'Click & shift-range',
		story: 'components-listview',
	},
	{
		id: 'folderlist',
		name: 'FolderList',
		role: 'Navigation',
		keyboard: 'Window + ListView',
		story: 'components-folderlist',
	},
	{
		id: 'scrollbar',
		name: 'Scrollbar',
		role: 'Navigation',
		keyboard: 'Arrows, Page Up / Down',
		story: 'components-scrollbar',
	},
	{
		id: 'button',
		name: 'Button',
		role: 'Form',
		keyboard: 'Native button or link',
		story: 'components-button',
	},
	{
		id: 'iconbutton',
		name: 'IconButton',
		role: 'Form',
		keyboard: 'Native button',
		story: 'components-iconbutton',
	},
	{
		id: 'textfield',
		name: 'TextField',
		role: 'Form',
		keyboard: 'Native input / textarea',
		story: 'components-textfield',
	},
	{
		id: 'select',
		name: 'Select',
		role: 'Form',
		keyboard: 'Listbox, type-ahead',
		story: 'components-select',
	},
	{
		id: 'checkbox',
		name: 'Checkbox',
		role: 'Form',
		keyboard: 'Space toggles',
		story: 'components-checkbox',
	},
	{
		id: 'radio',
		name: 'Radio',
		role: 'Form',
		keyboard: 'Arrows within group',
		story: 'components-radio',
	},
	{
		id: 'progress',
		name: 'Progress',
		role: 'Feedback',
		keyboard: 'Not focusable',
		story: 'components-progress',
	},
	{
		id: 'alert',
		name: 'Alert',
		role: 'Feedback',
		keyboard: 'Return commits, Escape cancels',
		story: 'components-alert',
	},
	{
		id: 'disclosuretriangle',
		name: 'DisclosureTriangle',
		role: 'Chrome',
		keyboard: 'Space / Return toggles',
		story: 'components-disclosuretriangle',
	},
	{
		id: 'separator',
		name: 'Separator',
		role: 'Chrome',
		keyboard: 'Not focusable',
		story: 'components-separator',
	},
	{
		id: 'icon',
		name: 'Icon / IconLibrary',
		role: 'Content',
		keyboard: `${getAllIconNames().length} pixel icons`,
		story: 'components-icon',
	},
];

/**
 * How many components the site claims. Derived from the index below, because
 * the hero and the About window both used to spell it out — and both still
 * said "Sixteen" after 2.2.0 took the library to twenty.
 */
export const COMPONENT_COUNT = () => COMPONENTS.length;

const COLUMNS = [
	{ key: 'name', label: 'Name', width: '38%' },
	{ key: 'role', label: 'Kind', width: '24%' },
	{ key: 'keyboard', label: 'Keyboard', width: '38%' },
] as const;

/** Every window on the desktop, in the order they are laid out. */
const WINDOW_IDS = [
	'about',
	'start',
	'components',
	'why',
	'icons',
	'controls',
	'whatsnew',
] as const;

type WindowId = (typeof WINDOW_IDS)[number];

/**
 * Where each menu destination lives: which window holds it, and which tab of
 * the "Why This One" window if it is one of those.
 */
const SECTIONS: Record<DesktopSection, { window: WindowId; tab?: number }> = {
	start: { window: 'start' },
	components: { window: 'components' },
	whatsnew: { window: 'whatsnew' },
	tokens: { window: 'why', tab: 1 },
	footprint: { window: 'why', tab: 2 },
	a11y: { window: 'why', tab: 3 },
};

/** The four lines that actually get you running. */
const QUICKSTART = `import '@liiift-studio/mac-os9-ui/styles';
import { Window, Button } from '@liiift-studio/mac-os9-ui';

<Window title="Untitled" draggable resizable>
  <Button variant="primary">Save</Button>
</Window>`;

export function Desktop() {
	const [selected, setSelected] = useState<string[]>(['window']);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [copied, setCopied] = useState<string | null>(null);
	const [flavour, setFlavour] = useState<Flavour>(readFlavour);
	const [closed, setClosed] = useState<WindowId[]>([]);
	const [whyTab, setWhyTab] = useState(0);
	const [advancedOpen, setAdvancedOpen] = useState(false);
	const [alertOpen, setAlertOpen] = useState(false);

	const install = `npm install ${PACKAGE}`;

	// One transient "Copied" acknowledgement, keyed by what was copied, so the
	// install button and an icon name can't light each other up.
	const flash = useCallback((token: string, text: string) => {
		copy(text);
		setCopied(token);
		window.setTimeout(() => setCopied((current) => (current === token ? null : current)), 1600);
	}, []);

	const onFlavourChange = useCallback((next: Flavour) => {
		setFlavour(next);
		applyFlavour(next);
	}, []);

	const close = useCallback((id: WindowId) => {
		setClosed((current) => (current.includes(id) ? current : [...current, id]));
	}, []);

	const isOpen = (id: WindowId) => !closed.includes(id);

	/**
	 * Reveal a menu destination: reopen its window if it was closed, select
	 * its tab if it is one, then scroll it into view. The scroll is deferred a
	 * frame because a window that was closed is not in the DOM to scroll to
	 * until React has committed the reopen.
	 */
	const showSection = useCallback((section: DesktopSection) => {
		const target = SECTIONS[section];
		setClosed((current) => current.filter((id) => id !== target.window));
		if (target.tab !== undefined) setWhyTab(target.tab);
		requestAnimationFrame(() => {
			document
				.getElementById(`window-${target.window}`)
				?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		});
	}, []);

	const openStory = useCallback((row: ComponentRow) => {
		if (!row.story) return;
		window.open(`${STORYBOOK}?path=/docs/${row.story}--docs`, '_blank', 'noreferrer,noopener');
	}, []);

	return (
		<div className="desktop" id="desktop">
			<DesktopMenuBar
				flavour={flavour}
				onFlavourChange={onFlavourChange}
				onRestoreWindows={() => setClosed([])}
				closedWindowCount={closed.length}
				onShowSection={showSection}
			/>

			<div className="desktop__surface">
				<DesktopIcons />

				<WindowManagerProvider>
					<div className="desktop__windows">
						{/* ---------- What it is ---------- */}
						{isOpen('about') && (
							<Window
								id="about"
								maxWidth={940}
								title="About This Library"
								className="deskWindow deskWindow--about"
								draggable
								onClose={() => close('about')}
							>
								<div className="pane">
									<h2 className="pane__title">Mac OS 9, as React components.</h2>
									<p className="pane__lead">
										{COMPONENTS.length} components that render the Mac OS 9 interface — windows you
										can drag and resize, menus that behave like menus, list views, progress and
										alerts, and the full set of form controls. Typed, keyboard-operable, and built
										from design tokens you can retarget.
									</p>

									<div className="installRow">
										<TextField
											label="Install"
											value={install}
											readOnly
											fullWidth
											className="installRow__field"
											onFocus={(event) => event.currentTarget.select()}
										/>
										<Button variant="primary" onClick={() => flash('install', install)}>
											{copied === 'install' ? 'Copied' : 'Copy'}
										</Button>
									</div>

									<div className="pane__actions">
										<Button as="a" href={STORYBOOK} target="_blank">
											Open Storybook
										</Button>
										<Button as="a" href={REPO} target="_blank">
											Source on GitHub
										</Button>
										<Button onClick={() => setDialogOpen(true)}>What&rsquo;s a Dialog?</Button>
									</div>
								</div>
							</Window>
						)}

						{/* ---------- Getting started ---------- */}
						{isOpen('start') && (
							<Window
								id="start"
								maxWidth={1180}
								title="Getting Started"
								className="deskWindow deskWindow--start"
								draggable
								onClose={() => close('start')}
							>
								<div className="pane" id="window-start">
									<p className="pane__note">
										Three imports and you have a draggable window. The stylesheet is a side-effect
										import and is the one people forget — without it you get unstyled native
										controls.
									</p>

									<pre className="code" tabIndex={0}>
										<code>{QUICKSTART}</code>
									</pre>

									<div className="pane__actions">
										<Button onClick={() => flash('quickstart', QUICKSTART)}>
											{copied === 'quickstart' ? 'Copied' : 'Copy snippet'}
										</Button>
									</div>

									<p className="pane__note">
										React 18 and 19, both exercised in CI. The <code>&quot;use client&quot;</code>{' '}
										boundary is declared inside the package, so a Next.js App Router server
										component can import it directly — put the stylesheet in your root layout.
									</p>
								</div>
							</Window>
						)}

						{/* ---------- The component index ---------- */}
						{isOpen('components') && (
							<Window
								id="components"
								maxWidth={600}
								title="Components"
								className="deskWindow deskWindow--components"
								draggable
								resizable
								onClose={() => close('components')}
							>
								<div className="pane pane--flush" id="window-components">
									<ListView<ComponentRow>
										columns={COLUMNS}
										items={COMPONENTS}
										selectedIds={selected}
										onSelectionChange={setSelected}
										onItemOpen={openStory}
										height={272}
									/>
									<p className="pane__note pane__note--footer">
										Open a row — double-click, or Enter — for its Storybook page.
									</p>
								</div>
							</Window>
						)}

						{/* ---------- Why you'd use it ---------- */}
						{isOpen('why') && (
							<Window
								id="why"
								maxWidth={600}
								title="Why This One"
								className="deskWindow deskWindow--why"
								draggable
								onClose={() => close('why')}
							>
								<div className="pane" id="window-why">
									<Tabs
										aria-label="Reasons to use this library"
										activeTab={whyTab}
										onValueChange={(_value, index) => setWhyTab(index)}
									>
										<TabPanel label="Real behaviour">
											<p>
												The chrome works, not just looks. Windows drag and resize with the pointer
												<em> and</em> the arrow keys. Dialog traps focus, stacks, and restores it on
												close. MenuBar is one tab stop with a roving tabindex. Select is a real
												listbox with type-ahead, not a native control the OS repaints.
											</p>
										</TabPanel>
										<TabPanel label="Yours to theme">
											<p>
												Every value is a CSS custom property in three tiers — primitives, semantic
												roles, then per-component hooks like <code>--window-titlebar-bg</code> and{' '}
												<code>--menu-highlight-bg</code>. Override one component without touching
												the palette.
											</p>
											<p className="pane__note">
												The View menu is that mechanism, live: each flavour restamps the same
												properties you would override, and nothing recompiles.
											</p>
										</TabPanel>
										<TabPanel label="Footprint">
											<dl className="facts">
												<div>
													<dt>Runtime dependencies</dt>
													<dd>None</dd>
												</div>
												<div>
													<dt>A Button-only import</dt>
													<dd>
														~3 KB <span className="facts__aside">of 77 KB for everything</span>
													</dd>
												</div>
												<div>
													<dt>Whole library</dt>
													<dd>
														186 KB ESM <span className="facts__aside">46 KB gzipped</span>
													</dd>
												</div>
												<div>
													<dt>Stylesheet</dt>
													<dd>
														100 KB <span className="facts__aside">17 KB gzipped</span>
													</dd>
												</div>
												<div>
													<dt>React</dt>
													<dd>18 or 19, both in CI</dd>
												</div>
												<div>
													<dt>Formats</dt>
													<dd>ESM and CJS, bundled types</dd>
												</div>
											</dl>
											<p className="pane__note">
												Tree-shaking is real because the package ships preserved modules, one file
												per source module. A flattened bundle could not be shaken here at all.
											</p>
										</TabPanel>
										<TabPanel label="Accessibility">
											<p>
												Every exported component is rendered and scanned against the axe-core WCAG
												2.1 A and AA rule sets on each run, alongside keyboard and focus suites for
												the interactive ones. Automated rules cover roughly a third of WCAG, so that
												is a floor and not a certificate — the README says exactly what is and
												isn&rsquo;t verified.
											</p>
										</TabPanel>
									</Tabs>
								</div>
							</Window>
						)}

						{/* ---------- What changed in 2.0 ---------- */}
						{isOpen('whatsnew') && (
							<Window
								id="whatsnew"
								maxWidth={600}
								title="Upgrading to 2.0"
								className="deskWindow deskWindow--whatsnew"
								draggable
								onClose={() => close('whatsnew')}
							>
								<div className="pane" id="window-whatsnew">
									<p className="pane__note">
										2.0 removes every name 1.x deprecated. If your app builds without deprecation
										warnings on the latest 1.x, it builds on 2.0 unchanged.
									</p>
									<ul className="changes">
										<li>
											camelCase ARIA props — <code>ariaLabel</code> and friends — are gone; use the
											standard hyphenated attributes.
										</li>
										<li>
											The value-shaped <code>onChange</code> is gone from RadioGroup, Scrollbar and
											Tabs. <code>onValueChange</code> is the only name they answer to.
										</li>
										<li>
											Single-purpose <code>*ClassName</code> props fold into the typed{' '}
											<code>classes</code> object.
										</li>
										<li>
											<code>Menu.items</code> splits into <code>items</code> for data and{' '}
											<code>content</code> for JSX, so the type tells them apart instead of a
											runtime guess.
										</li>
									</ul>
									<div className="pane__actions">
										<Button as="a" href={`${REPO}#migrating-to-20`} target="_blank">
											Migration guide
										</Button>
										<Button as="a" href={`${REPO}/blob/main/CHANGELOG.md`} target="_blank">
											Changelog
										</Button>
									</div>
								</div>
							</Window>
						)}

						{/* ---------- The icon set ---------- */}
						{isOpen('icons') && (
							<Window
								id="icons"
								maxWidth={560}
								title="Icons"
								className="deskWindow deskWindow--icons"
								draggable
								onClose={() => close('icons')}
							>
								<div className="pane">
									<p className="pane__note">
										{/* Counted from the registry rather than written down, so it
										    can't go stale the way "38" did when icons were added. */}
										{getAllIconNames().length} icons, drawn as pixel maps rather than traced paths,
										so they stay sharp. Click one to copy its name.
									</p>
									<div className="iconGrid">
										{getAllIconNames().map((name) => (
											<button
												type="button"
												className="iconGrid__cell"
												key={name}
												onClick={() => flash(`icon:${name}`, name)}
												aria-label={
													copied === `icon:${name}` ? `Copied ${name}` : `Copy icon name ${name}`
												}
											>
												<IconLibrary icon={name} size="lg" label={null} />
												<span className="iconGrid__name">
													{copied === `icon:${name}` ? 'Copied' : name}
												</span>
											</button>
										))}
									</div>
								</div>
							</Window>
						)}

						{/* ---------- A form, because every kit needs one ---------- */}
						{isOpen('controls') && (
							<Window
								id="controls"
								maxWidth={520}
								title="Controls"
								className="deskWindow deskWindow--controls"
								draggable
								onClose={() => close('controls')}
							>
								<div className="pane">
									<Select
										label="Sort by"
										options={[
											{ value: 'name', label: 'Name' },
											{ value: 'kind', label: 'Kind' },
											{ value: 'date', label: 'Date Modified' },
										]}
										defaultValue="name"
									/>
									<Checkbox label="Show hidden files" />
									<Checkbox label="Use relative dates" defaultChecked />
									<TextField label="Find" placeholder="Search…" />

									<Separator />

									{/* Determinate and indeterminate side by side, because the
									    difference between them is the whole API. */}
									<Progress value={62} max={100} label="Copying files" showValue />
									<Progress label="Connecting to server" />

									<Separator />

									{/* A real disclosure: the triangle owns the section below it. */}
									<DisclosureTriangle
										label="Advanced"
										expanded={advancedOpen}
										onExpandedChange={setAdvancedOpen}
										controls="desktop-advanced"
									/>
									{advancedOpen && (
										<div className="pane__disclosure" id="desktop-advanced">
											<Checkbox label="Rebuild the desktop database on eject" />
											<Button variant="danger" onClick={() => setAlertOpen(true)}>
												Erase Disk…
											</Button>
										</div>
									)}

									<Alert
										open={alertOpen}
										severity="caution"
										heading='Erase the disk named "Backup"?'
										message="This cannot be undone."
										confirmLabel="Erase"
										cancelLabel="Cancel"
										destructive
										onClose={() => setAlertOpen(false)}
										onConfirm={() => setAlertOpen(false)}
									/>
								</div>
							</Window>
						)}
					</div>

					{/* Closing every window would otherwise leave a blank desktop with
					    the only way back buried in a menu. */}
					{closed.length === WINDOW_IDS.length && (
						<p className="desktop__empty">
							Every window is closed. <Button onClick={() => setClosed([])}>Restore windows</Button>
						</p>
					)}
				</WindowManagerProvider>

				<Dialog
					open={dialogOpen}
					onClose={() => setDialogOpen(false)}
					title="Dialog"
					width={380}
					aria-describedby="dialog-copy"
				>
					<div className="pane">
						<p id="dialog-copy">
							This is the real <code>&lt;Dialog&gt;</code>. It portals to the body, traps focus,
							closes on Escape, restores focus to the button that opened it, and locks page scroll
							without the layout jumping.
						</p>
						<div className="pane__actions">
							<Button variant="primary" onClick={() => setDialogOpen(false)}>
								OK
							</Button>
						</div>
					</div>
				</Dialog>
			</div>

			<footer className="desktop__footer">
				<span>
					MIT licensed. Design after the{' '}
					<a
						href="https://swallowmygraphicdesign.com/project/macostalgia"
						target="_blank"
						rel="noreferrer noopener"
					>
						Mac OS 9 UI Kit
					</a>{' '}
					by Michael Feeney, CC BY 4.0.
				</span>
				<span>
					Built with{' '}
					<a href={REPO} target="_blank" rel="noreferrer noopener">
						the library itself
					</a>
					.
				</span>
			</footer>
		</div>
	);
}
