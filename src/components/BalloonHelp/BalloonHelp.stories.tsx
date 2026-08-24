// BalloonHelp Component Stories - Mac OS 9 UI Kit

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { BalloonHelpProvider } from './BalloonHelp';
import { Button } from '../Button';
import { Checkbox } from '../Checkbox';
import { BalloonHelp } from './BalloonHelp';
import '../../styles/theme.css';

const meta = {
	title: 'Components/BalloonHelp',
	component: BalloonHelp,
	tags: ['autodocs'],
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component: `The rounded speech balloon from Help \u203a Show Balloons. Shows on focus as well as hover, describes its trigger rather than renaming it, and dismisses on Escape — the parts the original had no answer for.`,
			},
		},
	},
} satisfies Meta<typeof BalloonHelp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: { content: 'Throws away the items you drag here.' },
	render: (args) => (
		<BalloonHelp {...args}>
			<Button>Trash</Button>
		</BalloonHelp>
	),
};

export const Sides: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: 48, padding: 64, flexWrap: 'wrap' }}>
			{(['top', 'bottom', 'left', 'right'] as const).map((side) => (
				<BalloonHelp key={side} side={side} content={`The balloon sits ${side}.`}>
					<Button>{side}</Button>
				</BalloonHelp>
			))}
		</div>
	),
};

/** The Help menu's global switch, which is how Mac OS 9 gated these. */
export const GlobalSwitch: Story = {
	render: () => {
		const [on, setOn] = useState(true);
		return (
			<BalloonHelpProvider enabled={on}>
				<div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
					<Checkbox label="Show Balloons" checked={on} onChange={(e) => setOn(e.target.checked)} />
					<BalloonHelp content="Throws away the items you drag here.">
						<Button>Trash</Button>
					</BalloonHelp>
				</div>
			</BalloonHelpProvider>
		);
	},
};
