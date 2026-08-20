// README visual harness.
//
// Renders one `.scene` element per README image, using the real components.
// `scripts/capture.mjs` serves the built output and screenshots each scene,
// so every image in the README is reproducible with `npm run capture`.

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { Window } from '@lib/components/Window';
import { Dialog } from '@lib/components/Dialog';
import { Button } from '@lib/components/Button';
import { Checkbox } from '@lib/components/Checkbox';
import { Radio, RadioGroup } from '@lib/components/Radio';
import { TextField } from '@lib/components/TextField';
import { Select } from '@lib/components/Select';
import { Tabs, TabPanel } from '@lib/components/Tabs';
import { ListView, type ListItem } from '@lib/components/ListView';
import { MenuBar, MenuItem } from '@lib/components/MenuBar';
import { IconLibrary } from '@lib/components/Icon';
import { getAllIconNames } from '@lib/components/Icon/registry';

import '@lib/styles/theme.css';
import './styles/capture.css';

interface FileRow extends ListItem {
	name: string;
	kind: string;
	size: string;
}

const FILES: FileRow[] = [
	{ id: '1', name: 'Read Me', kind: 'SimpleText', size: '4 KB' },
	{ id: '2', name: 'System Folder', kind: 'Folder', size: '—' },
	{ id: '3', name: 'Sherlock', kind: 'Application', size: '2.1 MB' },
	{ id: '4', name: 'Startup Disk', kind: 'Control Panel', size: '112 KB' },
];

const COLUMNS = [
	{ key: 'name', label: 'Name', width: '44%' },
	{ key: 'kind', label: 'Kind', width: '32%' },
	{ key: 'size', label: 'Size', width: '24%' },
];

/** A scene is one output image. */
function Scene({ id, children, wide }: { id: string; children: React.ReactNode; wide?: boolean }) {
	return (
		<div className={wide ? 'scene scene--wide' : 'scene'} id={id}>
			{children}
		</div>
	);
}

function Capture() {
	return (
		<>
			{/* ---------- Components at a glance ---------- */}
			<Scene id="components" wide>
				<div className="grid">
					<Window title="Preferences" width={330}>
						<div className="stack">
							<Tabs ariaLabel="Preferences">
								<TabPanel label="General">
									<div className="stack">
										<TextField label="Your name" defaultValue="Quinn" />
										<Select
											label="Startup disk"
											options={[
												{ value: 'hd', label: 'Macintosh HD' },
												{ value: 'net', label: 'Network' },
											]}
											defaultValue="hd"
										/>
										<Checkbox label="Show hidden files" defaultChecked />
										<Checkbox label="Use relative dates" />
									</div>
								</TabPanel>
								<TabPanel label="Views">
									<p>Views settings.</p>
								</TabPanel>
							</Tabs>
						</div>
					</Window>

					<div className="stack">
						<Window title="Buttons" width={300}>
							<div className="stack">
								<div className="row">
									<Button variant="primary">OK</Button>
									<Button>Cancel</Button>
									<Button variant="danger">Erase</Button>
								</div>
								<div className="row">
									<Button size="sm">Small</Button>
									<Button size="md">Medium</Button>
									<Button size="lg">Large</Button>
								</div>
								<div className="row">
									<Button leftIcon={<IconLibrary icon="folder" size="sm" label={null} />}>
										Open
									</Button>
									<Button loading loadingText="Copying…">
										Copy
									</Button>
									<Button disabled>Disabled</Button>
								</div>
							</div>
						</Window>

						<Window title="Options" width={300}>
							<div className="stack">
								<RadioGroup name="view" ariaLabel="View as" defaultValue="icon">
									<Radio value="icon" label="as Icons" />
									<Radio value="list" label="as List" />
									<Radio value="button" label="as Buttons" />
								</RadioGroup>
							</div>
						</Window>
					</div>
				</div>
			</Scene>

			{/* ---------- Window + menus ---------- */}
			<Scene id="window" wide>
				<div className="appFrame">
					<MenuBar
						defaultOpenMenuIndex={0}
						menus={[
							{
								label: 'File',
								items: (
									<>
										<MenuItem label="New Folder" shortcut="⌘N" />
										<MenuItem label="Open" shortcut="⌘O" />
										<MenuItem label="Print…" shortcut="⌘P" separator />
										<MenuItem label="Get Info" shortcut="⌘I" checked />
									</>
								),
							},
							{ label: 'Edit', items: <MenuItem label="Undo" shortcut="⌘Z" /> },
							{ label: 'View', items: <MenuItem label="as List" /> },
							{ label: 'Special', items: <MenuItem label="Restart" /> },
						]}
						rightContent={[<span key="t">4:07 PM</span>]}
					/>
					<div className="appFrame__body">
						<Window title="Macintosh HD" width={430} resizable onClose={() => undefined}>
							<ListView<FileRow>
								columns={COLUMNS}
								items={FILES}
								selectedIds={['2']}
								ariaLabel="Files"
								height={190}
							/>
						</Window>
					</div>
				</div>
			</Scene>

			{/* ---------- Dialog ---------- */}
			<Scene id="dialog">
				<div className="dialogFrame">
					<Dialog open container={null} title="Save changes?" width={360}>
						<div className="stack">
							<p>
								Do you want to save the changes you made to “Read Me”? Your changes will be lost if
								you don’t save them.
							</p>
							<div className="row row--end">
								<Button>Don’t Save</Button>
								<Button>Cancel</Button>
								<Button variant="primary">Save</Button>
							</div>
						</div>
					</Dialog>
				</div>
			</Scene>

			{/* ---------- Icons ---------- */}
			<Scene id="icons" wide>
				<div className="iconSheet">
					{getAllIconNames().map((name) => (
						<span className="iconSheet__cell" key={name}>
							<IconLibrary icon={name} size="lg" label={null} />
							<code>{name}</code>
						</span>
					))}
				</div>
			</Scene>

			{/* ---------- Theming: same markup, retargeted tokens ---------- */}
			<Scene id="theming" wide>
				<div className="themeRow">
					<figure className="themeCase">
						<figcaption>Default tokens</figcaption>
						<Window title="Finder" width={300}>
							<div className="stack">
								<ListView<FileRow>
									columns={COLUMNS.slice(0, 2)}
									items={FILES.slice(0, 3)}
									selectedIds={['2']}
									ariaLabel="Files"
									height={110}
								/>
								<div className="row">
									<Button variant="primary">OK</Button>
									<Button>Cancel</Button>
								</div>
							</div>
						</Window>
					</figure>

					<figure className="themeCase themeCase--alt">
						<figcaption>Six overridden properties</figcaption>
						<Window title="Finder" width={300}>
							<div className="stack">
								<ListView<FileRow>
									columns={COLUMNS.slice(0, 2)}
									items={FILES.slice(0, 3)}
									selectedIds={['2']}
									ariaLabel="Files"
									height={110}
								/>
								<div className="row">
									<Button variant="primary">OK</Button>
									<Button>Cancel</Button>
								</div>
							</div>
						</Window>
					</figure>
				</div>
			</Scene>
		</>
	);
}

const root = document.getElementById('capture');
if (!root) throw new Error('missing #capture');
createRoot(root).render(
	<StrictMode>
		<Capture />
	</StrictMode>
);
