// ChasingArrows Component Stories - Mac OS 9 UI Kit

import type { Meta, StoryObj } from '@storybook/react';
import { ChasingArrows } from './ChasingArrows';
import '../../styles/theme.css';

const meta = {
	title: 'Components/ChasingArrows',
	component: ChasingArrows,
	tags: ['autodocs'],
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component: `Apple's asynchronous arrows: the spinner for background work with no dialog to hold a progress bar. It claims no progress value, and renders nothing when inactive — a still spinner reads as stalled work. Under prefers-reduced-motion it pulses rather than freezing, because the animation is the control.`,
			},
		},
	},
} satisfies Meta<typeof ChasingArrows>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: { label: 'Updating window contents' },
};

export const Sizes: Story = {
	render: () => (
		<div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
			<ChasingArrows size="sm" label="Small" />
			<ChasingArrows size="md" label="Medium" />
			<ChasingArrows size="lg" label="Large" />
		</div>
	),
};

/** In context: beside the thing it is working on. */
export const InAHeader: Story = {
	render: () => (
		<div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10 }}>
			<ChasingArrows size="sm" label="Updating window contents" />
			<span>Searching &ldquo;Macintosh HD&rdquo;&hellip;</span>
		</div>
	),
};

/** Inactive renders nothing at all, rather than a frozen wheel. */
export const Inactive: Story = {
	args: { active: false, label: 'Updating window contents' },
};
