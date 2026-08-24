// LittleArrows Component Stories - Mac OS 9 UI Kit

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { TextField } from '../TextField';
import { LittleArrows } from './LittleArrows';
import '../../styles/theme.css';

const meta = {
	title: 'Components/LittleArrows',
	component: LittleArrows,
	tags: ['autodocs'],
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component: `Apple's little arrows — a stepper, almost always driving a field beside it. Two buttons rather than one control with halves, so each direction is separately reachable and separately named. Holding repeats after a pause.`,
			},
		},
	},
} satisfies Meta<typeof LittleArrows>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: { onStep: () => {}, stepLabel: 'value' },
};

/** What they are for: driving the field next to them. */
export const DrivingAField: Story = {
	render: () => {
		const [count, setCount] = useState(12);
		return (
			<div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
				<TextField id="copies" label="Copies" value={String(count)} readOnly />
				<LittleArrows
					controls="copies"
					stepLabel="copies"
					onStep={(d) => setCount((n) => Math.max(1, n + d))}
					downDisabled={count <= 1}
				/>
			</div>
		);
	},
};

export const Sizes: Story = {
	render: () => (
		<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
			<LittleArrows size="sm" onStep={() => {}} stepLabel="small" />
			<LittleArrows size="md" onStep={() => {}} stepLabel="medium" />
			<LittleArrows size="lg" onStep={() => {}} stepLabel="large" />
		</div>
	),
};

/** Each end stops on its own, so you can pin one bound without the other. */
export const AtTheTop: Story = {
	args: { onStep: () => {}, stepLabel: 'value', upDisabled: true },
};

export const Disabled: Story = {
	args: { onStep: () => {}, stepLabel: 'value', disabled: true },
};
