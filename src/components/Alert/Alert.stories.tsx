// Alert Component Stories - Mac OS 9 UI Kit

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Alert } from './Alert';
import { Button } from '../Button';
import '../../styles/theme.css';

const meta = {
	title: 'Components/Alert',
	component: Alert,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'Mac OS 9 alerts had a fixed anatomy, and it was fixed for a reason: the icon told you the severity before you read anything, and the buttons were always bottom-right with the default one rightmost, so your hand knew where to go.\n\nA thin compound over `Dialog` — the focus trap, scroll lock, Escape handling and focus restore all come from there unchanged. It renders as `role="alertdialog"` and focuses the confirming button, so Return commits and Escape cancels.',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		severity: {
			control: 'select',
			options: ['stop', 'caution', 'note', 'question'],
			description: 'Which icon shows, and what the alert claims',
		},
		heading: { control: 'text' },
		message: { control: 'text' },
		confirmLabel: { control: 'text' },
		cancelLabel: { control: 'text', description: 'Omit for a one-button alert' },
		destructive: { control: 'boolean' },
	},
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Opened from a button, the way it actually appears. */
export const Default: Story = {
	args: {
		severity: 'caution',
		heading: 'Are you sure you want to erase “Macintosh HD”?',
		message: 'This cannot be undone.',
		confirmLabel: 'Erase',
		cancelLabel: 'Cancel',
		destructive: true,
	},
	render: function Render(args) {
		const [open, setOpen] = React.useState(false);
		return (
			<>
				<Button onClick={() => setOpen(true)}>Erase Disk…</Button>
				<Alert {...args} open={open} onClose={() => setOpen(false)} />
			</>
		);
	},
};

/** The four severities. */
export const Severities: Story = {
	args: { heading: '' },
	render: function Render() {
		const [which, setWhich] = React.useState<null | 'stop' | 'caution' | 'note' | 'question'>(null);
		const COPY = {
			stop: ['The disk could not be ejected.', 'One or more files are still in use.'],
			caution: ['Are you sure you want to empty the Trash?', 'It contains 42 items.'],
			note: ['Your settings have been saved.', undefined],
			question: ['Do you want to save changes before closing?', 'Your changes will be lost otherwise.'],
		} as const;

		return (
			<div style={{ display: 'flex', gap: 8 }}>
				{(['stop', 'caution', 'note', 'question'] as const).map((s) => (
					<Button key={s} onClick={() => setWhich(s)}>
						{s}
					</Button>
				))}
				{which && (
					<Alert
						open
						severity={which}
						heading={COPY[which][0]}
						message={COPY[which][1]}
						cancelLabel={which === 'note' ? undefined : 'Cancel'}
						onClose={() => setWhich(null)}
					/>
				)}
			</div>
		);
	},
};

/** One button, for something that only needs acknowledging. */
export const SingleAction: Story = {
	args: {
		severity: 'note',
		heading: 'Your settings have been saved.',
		confirmLabel: 'OK',
	},
	render: function Render(args) {
		const [open, setOpen] = React.useState(false);
		return (
			<>
				<Button onClick={() => setOpen(true)}>Save</Button>
				<Alert {...args} open={open} onClose={() => setOpen(false)} />
			</>
		);
	},
};
