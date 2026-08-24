// WindowHeader Component Stories - Mac OS 9 UI Kit

import type { Meta, StoryObj } from '@storybook/react';
import { WindowHeader } from './WindowHeader';
import '../../styles/theme.css';

const meta = {
	title: 'Components/WindowHeader',
	component: WindowHeader,
	tags: ['autodocs'],
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component: `The beveled bar across the top of a Finder window saying what is in it. Deliberately not a heading — "12 items" in the document outline is noise, and headings are how screen-reader users navigate.`,
			},
		},
	},
} satisfies Meta<typeof WindowHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: { children: '12 items', trailing: '1.2 GB available' },
};

export const ContentOnly: Story = {
	args: { children: '3 items' },
};

/** List view ran the header into the column headings with no seam. */
export const ListVariant: Story = {
	args: { variant: 'list', children: '48 items', trailing: '210 MB available' },
};

export const LongContent: Story = {
	args: {
		children: 'Macintosh HD \u203a Applications \u203a Utilities \u203a Disk Tools',
		trailing: '4.1 GB available',
	},
};
