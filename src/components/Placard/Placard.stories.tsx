// Placard Component Stories - Mac OS 9 UI Kit

import type { Meta, StoryObj } from '@storybook/react';
import { Placard } from './Placard';
import '../../styles/theme.css';

const meta = {
	title: 'Components/Placard',
	component: Placard,
	tags: ['autodocs'],
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component: `The small sunken nub at the bottom of a window, beside the horizontal scroll bar. A plain readout by default; give it an onClick and it becomes a real button, the way a magnification placard was.`,
			},
		},
	},
} satisfies Meta<typeof Placard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Readout: Story = {
	args: { children: 'Page 3 of 12' },
};

/** Pressable, as a magnification placard was. */
export const Pressable: Story = {
	args: { children: '100%', onClick: () => {}, 'aria-label': 'Change magnification' },
};

export const Disabled: Story = {
	args: {
		children: '100%',
		onClick: () => {},
		disabled: true,
		'aria-label': 'Change magnification',
	},
};
