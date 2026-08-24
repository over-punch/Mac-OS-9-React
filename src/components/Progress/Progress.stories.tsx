// Progress Component Stories - Mac OS 9 UI Kit

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Progress } from './Progress';
import '../../styles/theme.css';

const meta = {
	title: 'Components/Progress',
	component: Progress,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'Mac OS 9 progress indicator. Pass `value` for a determinate bar; omit it for the indeterminate barber pole — the diagonal stripes Mac OS 9 showed when the length of the work was unknown.\n\nThere is no default `value` on purpose. A default would render a specific claim about progress that nobody made, and an indeterminate bar sitting at some arbitrary fraction is a lie in the other direction.',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		value: {
			control: { type: 'range', min: 0, max: 100, step: 1 },
			description: 'Progress from 0 to max. Omit for indeterminate.',
		},
		max: { control: 'number', description: 'The value representing complete' },
		size: { control: 'select', options: ['sm', 'md', 'lg'], description: 'Track thickness' },
		showValue: { control: 'boolean', description: 'Show the percentage beside the label' },
		label: { control: 'text', description: 'Visible label, which also names the control' },
	},
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Determinate: you know how much is left. */
export const Default: Story = {
	args: { value: 62, label: 'Copying files', showValue: true },
};

/** Indeterminate: you do not. The barber pole. */
export const Indeterminate: Story = {
	args: { 'aria-label': 'Connecting to server' },
};

/** Three track thicknesses. */
export const Sizes: Story = {
	args: { value: 45 },
	render: (args) => (
		<div style={{ display: 'grid', gap: 20, maxWidth: 360 }}>
			{(['sm', 'md', 'lg'] as const).map((size) => (
				<Progress key={size} {...args} size={size} label={size} showValue />
			))}
		</div>
	),
};

/** A custom scale — steps through a wizard, not percent. */
export const CustomMax: Story = {
	args: { value: 3, max: 5, label: 'Step 3 of 5' },
};

/** Ticking along, the way it looks in use. */
export const Running: Story = {
	args: { label: 'Downloading', showValue: true },
	render: function Render(args) {
		const [value, setValue] = React.useState(0);
		React.useEffect(() => {
			const id = window.setInterval(() => setValue((v) => (v >= 100 ? 0 : v + 2)), 120);
			return () => window.clearInterval(id);
		}, []);
		return <Progress {...args} value={value} />;
	},
};
