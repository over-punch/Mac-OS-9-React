// Slider Component Stories - Mac OS 9 UI Kit

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Slider } from './Slider';
import '../../styles/theme.css';

const meta = {
	title: 'Components/Slider',
	component: Slider,
	tags: ['autodocs'],
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component: `A value dragged along a track. Ticks are behaviour, not decoration: a ticked slider snaps to its ticks, and the thumb is pointed rather than rounded to say so.`,
			},
		},
	},
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: { label: 'Volume', defaultValue: 40 },
};

export const Controlled: Story = {
	render: () => {
		const [value, setValue] = useState(60);
		return <Slider label={`Volume — ${value}%`} value={value} onValueChange={setValue} />;
	},
};

/** Five ticks over 1..5 puts one at every whole number, and it snaps to them. */
export const WithTicks: Story = {
	args: { label: 'Speed', min: 1, max: 5, ticks: 5, defaultValue: 3 },
};

/** Where a bare number would not communicate, give it words. */
export const WithValueText: Story = {
	args: { label: 'Quality', min: 1, max: 3, ticks: 3, defaultValue: 2, valueText: 'Medium' },
};

export const Vertical: Story = {
	args: { label: 'Level', orientation: 'vertical', defaultValue: 70 },
};

export const Sizes: Story = {
	render: () => (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
			<Slider label="Small" size="sm" defaultValue={30} />
			<Slider label="Medium" size="md" defaultValue={50} />
			<Slider label="Large" size="lg" defaultValue={70} />
		</div>
	),
};

export const Disabled: Story = {
	args: { label: 'Volume', defaultValue: 40, disabled: true },
};
