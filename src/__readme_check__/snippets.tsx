// Compile check for the README's code samples.
//
// Every TSX snippet in README.md is reproduced here verbatim and type-checked
// against the real source by `npm run typecheck`, so a README example cannot
// silently stop compiling when a prop is renamed. It caught two on the pass
// that introduced it: `getAllIconNames` was documented as a root export but
// wasn't one, and the Select example still used the pre-listbox `onChange`.
//
// Excluded from the build — it exists only for the compiler.
import { useState } from 'react';
import Link from './fake-next-link';
import {
	Window,
	Button,
	Checkbox,
	TextField,
	Select,
	MenuBar,
	MenuItem,
	Dialog,
	ListView,
	Tabs,
	TabPanel,
	IconLibrary,
	WindowManagerProvider,
	getAllIconNames,
	tokens,
	colors,
	spacing,
	type ListItem,
	type ButtonProps,
	type WindowProps,
} from '../index';

const onNew = () => {};
const onOpen = () => {};
const onRecent = () => {};

export function QuickStart() {
	return (
		<Window title="My Application">
			<div style={{ padding: '16px' }}>
				<Button variant="primary">Click Me</Button>
			</div>
		</Window>
	);
}

export function MyApp() {
	const [openMenu, setOpenMenu] = useState<number | undefined>();
	return (
		<Window title="My Application">
			<MenuBar
				openMenuIndex={openMenu}
				onMenuOpen={setOpenMenu}
				onMenuClose={() => setOpenMenu(undefined)}
				menus={[
					{
						label: 'File',
						items: (
							<>
								<MenuItem label="New" shortcut="⌘N" onClick={() => console.log('New')} />
								<MenuItem
									label="Open..."
									shortcut="⌘O"
									separator
									onClick={() => console.log('Open')}
								/>
								<MenuItem label="Quit" shortcut="⌘Q" onClick={() => console.log('Quit')} />
							</>
						),
					},
				]}
			/>
		</Window>
	);
}

export function DataMenus() {
	return (
		<MenuBar
			menus={[
				{
					label: 'File',
					items: [
						{ label: 'New', shortcut: '⌘N', onClick: onNew },
						{ label: 'Open…', shortcut: '⌘O', onClick: onOpen, separator: true },
						{ label: 'Recent', submenu: [{ label: 'report.txt', onClick: onRecent }] },
					],
				},
			]}
		/>
	);
}

export function MyForm() {
	const [checked, setChecked] = useState(false);
	const [text, setText] = useState('');
	const [selected, setSelected] = useState('');
	return (
		<div>
			<TextField label="Name" value={text} onChange={(e) => setText(e.target.value)} />
			<TextField label="Notes" multiline rows={4} />
			<Checkbox label="I agree" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
			<Select
				label="Choose an option"
				value={selected}
				onValueChange={setSelected}
				options={[
					{ value: 'option1', label: 'Option 1' },
					{ value: 'option2', label: 'Option 2' },
				]}
			/>
			<Button variant="primary" onClick={() => console.log('Submit')}>
				Submit
			</Button>
		</div>
	);
}

export function MyDialog() {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button onClick={() => setOpen(true)}>Open Dialog</Button>
			<Dialog
				open={open}
				onClose={() => setOpen(false)}
				title="Confirm Action"
				ariaDescribedBy="confirm-copy"
			>
				<p id="confirm-copy">Are you sure?</p>
				<div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
					<Button variant="primary" onClick={() => setOpen(false)}>
						OK
					</Button>
					<Button onClick={() => setOpen(false)}>Cancel</Button>
				</div>
			</Dialog>
		</>
	);
}

export function AsChild() {
	return (
		<Button asChild variant="primary">
			<Link href="/dashboard">Go to Dashboard</Link>
		</Button>
	);
}

export function Windows() {
	return (
		<WindowManagerProvider>
			<Window id="finder" title="Finder" draggable>
				a
			</Window>
			<Window id="notes" title="Notes" draggable>
				b
			</Window>
		</WindowManagerProvider>
	);
}

export function Icons() {
	return (
		<>
			<IconLibrary icon="folder" size="lg" />
			<IconLibrary icon="trash" label="Move to Trash" />
			{getAllIconNames().length}
		</>
	);
}

interface FileRow extends ListItem {
	name: string;
	size: number;
}
const files: FileRow[] = [{ id: '1', name: 'a', size: 1 }];
const columns = [{ key: 'name', label: 'Name' }];

export function Generics() {
	return (
		<>
			<ListView<FileRow> items={files} columns={columns} onItemOpen={(row) => row.size} />
			<Tabs<'general' | 'advanced'> onChange={(index, value) => console.log(index, value)}>
				<TabPanel label="General" value="general">
					g
				</TabPanel>
				<TabPanel label="Advanced" value="advanced">
					a
				</TabPanel>
			</Tabs>
		</>
	);
}

export const readTokens = [tokens, colors.gray500, spacing['2']];
export type Props = [ButtonProps, WindowProps];

export function Slots() {
	return (
		<Window
			title="Finder"
			classes={{
				titleBar: 'my-title-bar',
				content: 'my-content',
				resizeHandle: 'my-grow-box',
			}}
		>
			content
		</Window>
	);
}

interface TaskRow extends ListItem {
	name: string;
	overdue: boolean;
}
const tasks: TaskRow[] = [{ id: '1', name: 'a', overdue: true }];

export function RenderProps() {
	return (
		<ListView<TaskRow>
			columns={columns}
			items={tasks}
			renderRow={(item, _state, defaultProps) => {
				const { key, ...rowProps } = defaultProps;
				return (
					<div key={key} {...rowProps} data-overdue={item.overdue}>
						{item.name}
					</div>
				);
			}}
			renderCell={(value, item, column, _state) =>
				column.key === 'size' ? <code>{String(value)}</code> : String(value)
			}
		/>
	);
}
