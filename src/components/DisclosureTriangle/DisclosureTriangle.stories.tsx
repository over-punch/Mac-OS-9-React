// DisclosureTriangle Component Stories - Mac OS 9 UI Kit

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DisclosureTriangle } from './DisclosureTriangle';
import '../../styles/theme.css';

const meta = {
	title: 'Components/DisclosureTriangle',
	component: DisclosureTriangle,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'The little triangle that expands a row in a Finder list or a section in a dialog.\n\nIt is a real `<button>` rather than a clickable span: it is operated by keyboard, it toggles, and it owns the expanded state of something else — so it needs the role, the focus behaviour and `aria-expanded` that come with one. Point `controls` at the region it opens so assistive tech can associate the two.',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		expanded: { control: 'boolean', description: 'Controlled open state' },
		defaultExpanded: { control: 'boolean', description: 'Starting state when uncontrolled' },
		label: { control: 'text' },
		size: { control: 'select', options: ['sm', 'md', 'lg'] },
		disabled: { control: 'boolean' },
	},
} satisfies Meta<typeof DisclosureTriangle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: { label: 'Documents' },
};

export const Expanded: Story = {
	args: { label: 'Documents', defaultExpanded: true },
};

export const Sizes: Story = {
	args: {},
	render: () => (
		<div style={{ display: 'grid', gap: 10 }}>
			{(['sm', 'md', 'lg'] as const).map((size) => (
				<DisclosureTriangle key={size} size={size} label={size} defaultExpanded />
			))}
		</div>
	),
};

/** Driving a region, which is what it is for. */
export const RevealingContent: Story = {
	args: { label: 'Sharing' },
	render: function Render(args) {
		const [open, setOpen] = React.useState(false);
		return (
			<div style={{ maxWidth: 320 }}>
				<DisclosureTriangle
					{...args}
					expanded={open}
					onExpandedChange={setOpen}
					controls="sharing-panel"
				/>
				<div
					id="sharing-panel"
					hidden={!open}
					style={{ padding: '8px 0 0 20px', fontSize: 12 }}
				>
					File sharing is off. Turn it on to let other computers see this Macintosh.
				</div>
			</div>
		);
	},
};

/** Nested, the way an outline view uses them. */
export const AsAnOutline: Story = {
	args: {},
	render: function Render() {
		const [open, setOpen] = React.useState<string[]>(['Macintosh HD']);
		const toggle = (name: string) =>
			setOpen((c) => (c.includes(name) ? c.filter((n) => n !== name) : [...c, name]));

		return (
			<div style={{ display: 'grid', gap: 4, fontSize: 12 }}>
				<DisclosureTriangle
					label="Macintosh HD"
					expanded={open.includes('Macintosh HD')}
					onExpandedChange={() => toggle('Macintosh HD')}
				/>
				{open.includes('Macintosh HD') && (
					<div style={{ paddingLeft: 20, display: 'grid', gap: 4 }}>
						<DisclosureTriangle
							label="System Folder"
							size="sm"
							expanded={open.includes('System Folder')}
							onExpandedChange={() => toggle('System Folder')}
						/>
						{open.includes('System Folder') && (
							<div style={{ paddingLeft: 20 }}>Extensions</div>
						)}
						<span style={{ paddingLeft: 14 }}>Applications</span>
					</div>
				)}
			</div>
		);
	},
};
