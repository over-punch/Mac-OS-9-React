// BevelButton Component Stories - Mac OS 9 UI Kit

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { BevelButton } from './BevelButton';
import '../../styles/theme.css';

const meta = {
	title: 'Components/BevelButton',
	component: BevelButton,
	tags: ['autodocs'],
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component: `A beveled surface whose behaviour is chosen: push, toggle, radio or pop-up. The behaviour picks the semantics, so a radio announces as a radio rather than as a button that looks pressed. For a plain push button with an icon, IconButton is the smaller thing.`,
			},
		},
	},
} satisfies Meta<typeof BevelButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Push: Story = {
	args: { children: 'Apply' },
};

export const Toggle: Story = {
	render: () => {
		const [bold, setBold] = useState(false);
		return (
			<BevelButton behaviour="toggle" selected={bold} onClick={() => setBold(!bold)}>
				<strong>B</strong>
			</BevelButton>
		);
	},
};

/** A palette of mutually exclusive tools — the classic use. */
export const RadioSet: Story = {
	render: () => {
		const [tool, setTool] = useState('pen');
		const tools = [
			['pen', 'Pen'],
			['brush', 'Brush'],
			['fill', 'Fill'],
		] as const;
		return (
			<div role="radiogroup" aria-label="Tools" style={{ display: 'flex', gap: 2 }}>
				{tools.map(([value, name]) => (
					<BevelButton
						key={value}
						behaviour="radio"
						selected={tool === value}
						aria-label={name}
						onClick={() => setTool(value)}
					>
						{name[0]}
					</BevelButton>
				))}
			</div>
		);
	},
};

export const Popup: Story = {
	args: { behaviour: 'popup', children: 'Style' },
};

/** The bevel depth is the control's whole character, so sizes differ in edge
 *  weight rather than only in padding. */
export const Bevels: Story = {
	render: () => (
		<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
			<BevelButton bevel="sm">Small</BevelButton>
			<BevelButton bevel="md">Medium</BevelButton>
			<BevelButton bevel="lg">Large</BevelButton>
		</div>
	),
};

export const Disabled: Story = {
	args: { children: 'Apply', disabled: true },
};
