// Scrollbar Component Stories - Mac OS 9 UI Kit

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Scrollbar } from './Scrollbar';
import '../../styles/theme.css';

const meta = {
	title: 'Components/Scrollbar',
	component: Scrollbar,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'Classic Mac OS 9 scrollbar with arrow buttons and a draggable thumb. Implements the WAI-ARIA scrollbar pattern: the track is focusable, arrow keys step by `step`, PageUp/PageDown step by `viewportRatio`, and Home/End jump to the extremes.\n\n`viewportRatio` has no default on purpose — it is what makes a scrollbar meaningful, and a default would render a confident but fictional thumb. Omitting it logs a development warning and falls back to a full-length thumb.',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		orientation: {
			control: 'select',
			options: ['vertical', 'horizontal'],
			description: 'Scrollbar orientation',
		},
		value: {
			control: { type: 'range', min: 0, max: 1, step: 0.01 },
			description: 'Current scroll position, 0 to 1',
		},
		viewportRatio: {
			control: { type: 'range', min: 0.05, max: 1, step: 0.05 },
			description: 'Viewport size relative to content — clientHeight / scrollHeight',
		},
		step: {
			control: { type: 'range', min: 0.01, max: 0.5, step: 0.01 },
			description: 'Arrow-key increment, as a fraction of the track',
		},
		disabled: {
			control: 'boolean',
			description: 'Whether the scrollbar is disabled',
		},
	},
} satisfies Meta<typeof Scrollbar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A vertical scrollbar wired to local state, as a consumer would use it. */
export const Default: Story = {
	args: {
		orientation: 'vertical',
		value: 0.25,
		viewportRatio: 0.3,
		'aria-label': 'Document scroll',
	},
	render: function Render(args) {
		const [value, setValue] = React.useState(args.value ?? 0);
		return (
			<div style={{ height: 240 }}>
				<Scrollbar {...args} value={value} onValueChange={setValue} />
			</div>
		);
	},
};

/** The same control laid on its side. */
export const Horizontal: Story = {
	args: {
		orientation: 'horizontal',
		value: 0.4,
		viewportRatio: 0.25,
		'aria-label': 'Pan document',
	},
	render: function Render(args) {
		const [value, setValue] = React.useState(args.value ?? 0);
		return (
			<div style={{ width: 320 }}>
				<Scrollbar {...args} value={value} onValueChange={setValue} />
			</div>
		);
	},
};

/** Thumb length is `viewportRatio`: a long document gives a short thumb. */
export const ThumbSizes: Story = {
	args: { 'aria-label': 'Scroll' },
	render: () => (
		<div style={{ display: 'flex', gap: 32, height: 240 }}>
			{[0.1, 0.35, 0.75].map((ratio) => (
				<div key={ratio} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
					<Scrollbar
						aria-label={`Scroll, viewport ratio ${ratio}`}
						value={0.3}
						viewportRatio={ratio}
					/>
					<code style={{ fontSize: 11 }}>{ratio}</code>
				</div>
			))}
		</div>
	),
};

/** Disabled: not focusable, and the arrows and thumb do nothing. */
export const Disabled: Story = {
	args: {
		value: 0.5,
		viewportRatio: 0.3,
		disabled: true,
		'aria-label': 'Document scroll',
	},
	render: (args) => (
		<div style={{ height: 240 }}>
			<Scrollbar {...args} />
		</div>
	),
};
