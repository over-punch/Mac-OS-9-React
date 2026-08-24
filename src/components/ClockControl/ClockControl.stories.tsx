// ClockControl Component Stories - Mac OS 9 UI Kit

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ClockControl } from './ClockControl';
import '../../styles/theme.css';

const meta = {
	title: 'Components/ClockControl',
	component: ClockControl,
	tags: ['autodocs'],
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component: `The time field with little arrows, as the Date & Time control panel used. Edited a segment at a time, with one pair of arrows driving whichever segment is selected. 12-hour display never changes the stored value, so toggling it cannot move the clock.`,
			},
		},
	},
} satisfies Meta<typeof ClockControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => {
		const [time, setTime] = useState({ hours: 7, minutes: 30, seconds: 0 });
		return <ClockControl label="Alarm time" value={time} onValueChange={setTime} />;
	},
};

export const WithSeconds: Story = {
	render: () => {
		const [time, setTime] = useState({ hours: 13, minutes: 5, seconds: 42 });
		return <ClockControl label="Current time" value={time} showSeconds onValueChange={setTime} />;
	},
};

/** Midnight reads as 12 AM, not 00 — and the value stays 0. */
export const TwelveHour: Story = {
	render: () => {
		const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
		return <ClockControl label="Alarm time" value={time} hour12 onValueChange={setTime} />;
	},
};

export const Disabled: Story = {
	args: { label: 'Alarm time', value: { hours: 7, minutes: 30 }, disabled: true },
};
