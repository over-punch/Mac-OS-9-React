// TreeView Component Stories - Mac OS 9 UI Kit

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { IconLibrary } from '../Icon';
import { TreeView } from './TreeView';
import '../../styles/theme.css';

const meta = {
	title: 'Components/TreeView',
	component: TreeView,
	tags: ['autodocs'],
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component: `Finder's list view: rows nested under disclosure triangles. A separate component from ListView because the two are different ARIA patterns — ListView is a multi-selectable listbox with no notion of depth, while this is a tree with aria-level and nested groups.`,
			},
		},
	},
} satisfies Meta<typeof TreeView>;

export default meta;
type Story = StoryObj<typeof meta>;

const DISK = [
	{
		id: 'apps',
		label: 'Applications',
		icon: <IconLibrary icon="folder" size="sm" label={null} />,
		children: [
			{
				id: 'sherlock',
				label: 'Sherlock 2',
				icon: <IconLibrary icon="search" size="sm" label={null} />,
			},
			{
				id: 'simpletext',
				label: 'SimpleText',
				icon: <IconLibrary icon="document" size="sm" label={null} />,
			},
		],
	},
	{
		id: 'system',
		label: 'System Folder',
		icon: <IconLibrary icon="folder" size="sm" label={null} />,
		children: [
			{
				id: 'extensions',
				label: 'Extensions',
				icon: <IconLibrary icon="folder" size="sm" label={null} />,
				children: [
					{
						id: 'quicktime',
						label: 'QuickTime',
						icon: <IconLibrary icon="document" size="sm" label={null} />,
					},
				],
			},
			{
				id: 'prefs',
				label: 'Preferences',
				icon: <IconLibrary icon="folder" size="sm" label={null} />,
				children: [],
			},
		],
	},
	{ id: 'readme', label: 'Read Me', icon: <IconLibrary icon="document" size="sm" label={null} /> },
];

export const Default: Story = {
	args: { 'aria-label': 'Macintosh HD', items: DISK, defaultExpanded: ['apps'] },
};

export const Collapsed: Story = {
	args: { 'aria-label': 'Macintosh HD', items: DISK },
};

/** Nested folders, and an empty one — which keeps its triangle. */
export const DeepAndEmpty: Story = {
	args: {
		'aria-label': 'Macintosh HD',
		items: DISK,
		defaultExpanded: ['system', 'extensions'],
	},
};

export const Controlled: Story = {
	render: () => {
		const [expanded, setExpanded] = useState<string[]>(['apps']);
		const [selected, setSelected] = useState<string | null>('sherlock');
		return (
			<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
				<TreeView
					aria-label="Macintosh HD"
					items={DISK}
					expanded={expanded}
					onExpandedChange={setExpanded}
					selected={selected}
					onSelectedChange={setSelected}
				/>
				<span style={{ fontSize: 10 }}>Selected: {selected ?? 'nothing'}</span>
			</div>
		);
	},
};
