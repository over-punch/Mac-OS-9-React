// FolderList Storybook Stories
// Demonstrates the FolderList component in various configurations

import type { Meta, StoryObj } from '@storybook/react';
import { FolderList } from './FolderList';
import { FolderIcon, DocumentIcon, DocumentIcon, ImageIcon, MusicIcon } from '../Icon/categories';

const meta: Meta<typeof FolderList> = {
	title: 'Components/FolderList',
	component: FolderList,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FolderList>;

// Sample data
const sampleItems = [
	{
		id: '1',
		name: 'Documents',
		modified: 'Today, 9:30 AM',
		size: '--',
		icon: <FolderIcon />,
	},
	{
		id: '2',
		name: 'Photos',
		modified: 'Yesterday',
		size: '--',
		icon: <FolderIcon />,
	},
	{
		id: '3',
		name: 'Music',
		modified: 'Jan 10, 2026',
		size: '--',
		icon: <FolderIcon />,
	},
	{
		id: '4',
		name: 'Resume.txt',
		modified: 'Today, 11:15 AM',
		size: '2 KB',
		icon: <DocumentIcon />,
	},
	{
		id: '5',
		name: 'Vacation.jpg',
		modified: 'Yesterday',
		size: '1.2 MB',
		icon: <ImageIcon />,
	},
	{
		id: '6',
		name: 'Song.mp3',
		modified: 'Jan 8, 2026',
		size: '4.5 MB',
		icon: <MusicIcon />,
	},
	{
		id: '7',
		name: 'Project Proposal.doc',
		modified: 'Jan 5, 2026',
		size: '128 KB',
		icon: <DocumentIcon />,
	},
];

// Basic folder list
export const Default: Story = {
	args: {
		title: 'My Documents',
		items: sampleItems,
		width: 600,
		height: 400,
	},
};

// With items selected
export const WithSelection: Story = {
	args: {
		title: 'My Documents',
		items: sampleItems,
		selectedIds: ['4', '5'],
		width: 600,
		height: 400,
	},
};

// With callbacks
export const Interactive: Story = {
	args: {
		title: 'My Documents',
		items: sampleItems,
		onSelectionChange: (ids) => console.log('Selected IDs:', ids),
		onItemOpen: (item) => console.log('Opening:', item.name),
		onSort: (key, direction) => console.log('Sort by:', key, direction),
		width: 600,
		height: 400,
	},
};

// Small window
export const SmallWindow: Story = {
	args: {
		title: 'Documents',
		items: sampleItems.slice(0, 4),
		width: 400,
		height: 300,
	},
};

// Large window
export const LargeWindow: Story = {
	args: {
		title: 'All Files',
		items: sampleItems,
		width: 800,
		height: 600,
	},
};

// Custom columns
export const CustomColumns: Story = {
	args: {
		title: 'Custom View',
		items: sampleItems.map((item) => ({
			...item,
			type: item.icon ? 'Folder' : 'File',
			kind: 'Document',
		})),
		columns: [
			{ key: 'name', label: 'Name', width: '35%' },
			{ key: 'type', label: 'Type', width: '20%' },
			{ key: 'modified', label: 'Modified', width: '25%' },
			{ key: 'size', label: 'Size', width: '20%' },
		],
		width: 700,
		height: 400,
	},
};

// With close button
export const WithCloseButton: Story = {
	args: {
		title: 'My Documents',
		items: sampleItems,
		onClose: () => console.log('Close clicked'),
		width: 600,
		height: 400,
	},
};

// Compact window
export const Compact: Story = {
	args: {
		title: 'Files',
		items: sampleItems.slice(0, 5),
		width: 500,
		height: 350,
	},
};

// Empty state
export const Empty: Story = {
	args: {
		title: 'Empty Folder',
		items: [],
		width: 500,
		height: 300,
	},
};

// Many items (scrollable)
export const ManyItems: Story = {
	args: {
		title: 'Large Folder',
		items: Array.from({ length: 50 }, (_, i) => ({
			id: `item-${i}`,
			name: `Document ${i + 1}.txt`,
			modified: `Jan ${(i % 31) + 1}, 2026`,
			size: `${Math.floor(Math.random() * 1000)} KB`,
			icon: <DocumentIcon />,
		})),
		width: 600,
		height: 400,
	},
};
