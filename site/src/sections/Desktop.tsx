// The desktop — where the meaningful content lives.
//
// Everything here is built out of the library's own components: the windows
// are <Window>, the component index is a <ListView>, the install line is a
// <TextField>, the tabs are <Tabs>. The page is the demo.

import { useState } from 'react';
import { Window } from '@lib/components/Window';
import { WindowManagerProvider } from '@lib/components/WindowManager';
import { Button } from '@lib/components/Button';
import { ListView, type ListItem } from '@lib/components/ListView';
import { Tabs, TabPanel } from '@lib/components/Tabs';
import { Dialog } from '@lib/components/Dialog';
import { Checkbox } from '@lib/components/Checkbox';
import { Select } from '@lib/components/Select';
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
} from '../components/DesktopChrome';

interface ComponentRow extends ListItem {
	name: string;
	role: string;
	keyboard: string;
}

const COMPONENTS: ComponentRow[] = [
	{ id: 'window', name: 'Window', role: 'Chrome', keyboard: 'Arrow keys move & resize' },
	{ id: 'dialog', name: 'Dialog', role: 'Chrome', keyboard: 'Focus trap, Escape' },
	{ id: 'menubar', name: 'MenuBar', role: 'Chrome', keyboard: 'Roving tabindex' },
	{ id: 'menuitem', name: 'MenuItem', role: 'Chrome', keyboard: 'Arrow into submenus' },
	{ id: 'menudropdown', name: 'MenuDropdown', role: 'Chrome', keyboard: 'Escape to close' },
	{ id: 'tabs', name: 'Tabs', role: 'Navigation', keyboard: 'Arrows, Home / End' },
	{ id: 'listview', name: 'ListView', role: 'Navigation', keyboard: 'Click & shift-range' },
	{ id: 'folderlist', name: 'FolderList', role: 'Navigation', keyboard: 'Window + ListView' },
	{ id: 'scrollbar', name: 'Scrollbar', role: 'Navigation', keyboard: 'Arrows, Page Up / Down' },
	{ id: 'button', name: 'Button', role: 'Form', keyboard: 'Native button or link' },
	{ id: 'iconbutton', name: 'IconButton', role: 'Form', keyboard: 'Native button' },
	{ id: 'textfield', name: 'TextField', role: 'Form', keyboard: 'Native input / textarea' },
	{ id: 'select', name: 'Select', role: 'Form', keyboard: 'Listbox, type-ahead' },
	{ id: 'checkbox', name: 'Checkbox', role: 'Form', keyboard: 'Space toggles' },
	{ id: 'radio', name: 'Radio', role: 'Form', keyboard: 'Arrows within group' },
	{ id: 'icon', name: 'Icon / IconLibrary', role: 'Content', keyboard: '38 pixel icons' },
];

const COLUMNS = [
	{ key: 'name', label: 'Name', width: '38%' },
	{ key: 'role', label: 'Kind', width: '24%' },
	{ key: 'keyboard', label: 'Keyboard', width: '38%' },
] as const;

export function Desktop() {
	const [selected, setSelected] = useState<string[]>(['window']);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [copied, setCopied] = useState(false);

	const install = `npm install ${PACKAGE}`;

	const onCopy = () => {
		copy(install);
		setCopied(true);
		window.setTimeout(() => setCopied(false), 1600);
	};

	return (
		<div className="desktop" id="desktop">
			<DesktopMenuBar />

			<div className="desktop__surface">
				<DesktopIcons />

				<WindowManagerProvider>
					<div className="desktop__windows">
						{/* ---------- What it is ---------- */}
						<Window
							id="about"
							title="About This Library"
							className="deskWindow deskWindow--about"
							draggable
							onClose={() => undefined}
						>
							<div className="pane" id="start">
								<h2 className="pane__title">Mac OS 9, as React components.</h2>
								<p className="pane__lead">
									Sixteen components that render the Mac OS 9 interface — windows you can drag and
									resize, menus that behave like menus, list views, and the full set of form
									controls. Typed, keyboard-operable, and built from design tokens you can retarget.
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
									<Button variant="primary" onClick={onCopy}>
										{copied ? 'Copied' : 'Copy'}
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

						{/* ---------- The component index ---------- */}
						<Window
							id="components"
							title="Components"
							className="deskWindow deskWindow--components"
							draggable
							resizable
							onClose={() => undefined}
						>
							<div className="pane pane--flush" id="components">
								<ListView<ComponentRow>
									columns={COLUMNS}
									items={COMPONENTS}
									selectedIds={selected}
									onSelectionChange={setSelected}
									height={272}
								/>
							</div>
						</Window>

						{/* ---------- Why you'd use it ---------- */}
						<Window
							id="why"
							title="Why This One"
							className="deskWindow deskWindow--why"
							draggable
							onClose={() => undefined}
						>
							<div className="pane">
								<Tabs ariaLabel="Reasons to use this library">
									<TabPanel label="Real behaviour">
										<p>
											The chrome works, not just looks. Windows drag and resize with the pointer
											<em> and</em> the arrow keys. Dialog traps focus, stacks, and restores it on
											close. MenuBar is one tab stop with a roving tabindex. Select is a real
											listbox with type-ahead, not a native control the OS repaints.
										</p>
									</TabPanel>
									<TabPanel label="Yours to theme" id="tokens">
										<p>
											Every value is a CSS custom property in three tiers — primitives, semantic
											roles, then per-component hooks like <code>--window-titlebar-bg</code> and{' '}
											<code>--menu-highlight-bg</code>. Override one component without touching the
											palette.
										</p>
									</TabPanel>
									<TabPanel label="Accessibility" id="a11y">
										<p>
											Every exported component is rendered and scanned against the axe-core WCAG 2.1
											A and AA rule sets on each run, alongside keyboard and focus suites for the
											interactive ones. Automated rules cover roughly a third of WCAG, so that is a
											floor and not a certificate — the README says exactly what is and isn&rsquo;t
											verified.
										</p>
									</TabPanel>
								</Tabs>
							</div>
						</Window>

						{/* ---------- The icon set ---------- */}
						<Window
							id="icons"
							title="Icons"
							className="deskWindow deskWindow--icons"
							draggable
							onClose={() => undefined}
						>
							<div className="pane">
								<p className="pane__note">
									38 icons, drawn as pixel maps rather than traced paths, so they stay sharp.
								</p>
								<div className="iconGrid">
									{getAllIconNames().map((name) => (
										<span className="iconGrid__cell" key={name} title={name}>
											<IconLibrary icon={name} size="lg" label={null} />
										</span>
									))}
								</div>
							</div>
						</Window>

						{/* ---------- A form, because every kit needs one ---------- */}
						<Window
							id="controls"
							title="Controls"
							className="deskWindow deskWindow--controls"
							draggable
							onClose={() => undefined}
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
							</div>
						</Window>
					</div>
				</WindowManagerProvider>

				<Dialog
					open={dialogOpen}
					onClose={() => setDialogOpen(false)}
					title="Dialog"
					width={380}
					ariaDescribedBy="dialog-copy"
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
