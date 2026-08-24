// Separator Component Stories - Mac OS 9 UI Kit

import type { Meta, StoryObj } from '@storybook/react';
import { Separator } from './Separator';
import '../../styles/theme.css';

const meta = {
	title: 'Components/Separator',
	component: Separator,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'The engraved rule that divided a Mac OS 9 dialog into sections. Two 1px lines rather than one — a dark line with a light line beneath it, which is what makes it read as cut into the surface rather than drawn on top.\n\n`decorative` defaults to true. A rule that merely groups things visually is decoration, and announcing every one of those is noise; set it false when the rule genuinely separates unrelated groups.',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		orientation: { control: 'radio', options: ['horizontal', 'vertical'] },
		decorative: { control: 'boolean' },
	},
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {},
	render: (args) => (
		<div style={{ maxWidth: 300 }}>
			<p style={{ margin: '0 0 12px' }}>General settings</p>
			<Separator {...args} />
			<p style={{ margin: '12px 0 0' }}>Advanced settings</p>
		</div>
	),
};

export const Vertical: Story = {
	args: { orientation: 'vertical' },
	render: (args) => (
		<div style={{ display: 'flex', alignItems: 'center', gap: 12, height: 40 }}>
			<span>Left</span>
			<Separator {...args} />
			<span>Right</span>
		</div>
	),
};
