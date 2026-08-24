// ContextualMenu Component Stories - Mac OS 9 UI Kit

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ContextualMenu } from './ContextualMenu';
import '../../styles/theme.css';

const meta = {
	title: 'Components/ContextualMenu',
	component: ContextualMenu,
	tags: ['autodocs'],
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component: `Right-click menus, which arrived in Mac OS 8. Also opens with the ContextMenu key or Shift+F10, anchored to the focused element — a menu reachable only by right-click is unreachable without a pointer.`,
			},
		},
	},
} satisfies Meta<typeof ContextualMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

const FILE_ACTIONS = [
	{ label: 'Open' },
	{ label: 'Get Info', shortcut: '\u2318I' },
	{ label: 'Duplicate', shortcut: '\u2318D' },
	{ label: '', separator: true },
	{ label: 'Make Alias' },
	{ label: 'Add to Favorites', disabled: true },
	{ label: '', separator: true },
	{ label: 'Move to Trash' },
];

export const Default: Story = {
	render: () => (
		<ContextualMenu aria-label="File actions" items={FILE_ACTIONS}>
			<div
				style={{
					padding: 24,
					border: '1px solid var(--color-border)',
					background: 'var(--color-surface-inset)',
					fontSize: 11,
				}}
			>
				Right-click here — or focus it and press Shift+F10.
			</div>
		</ContextualMenu>
	),
};

export const ReportsTheChoice: Story = {
	render: () => {
		const [last, setLast] = useState<string | null>(null);
		return (
			<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
				<ContextualMenu
					aria-label="File actions"
					items={FILE_ACTIONS}
					onSelect={(item) => setLast(item.label)}
				>
					<div
						style={{
							padding: 24,
							border: '1px solid var(--color-border)',
							background: 'var(--color-surface-inset)',
							fontSize: 11,
						}}
					>
						Read Me
					</div>
				</ContextualMenu>
				<span style={{ fontSize: 10 }}>Chose: {last ?? 'nothing yet'}</span>
			</div>
		);
	},
};

export const Disabled: Story = {
	render: () => (
		<ContextualMenu aria-label="File actions" items={FILE_ACTIONS} disabled>
			<div style={{ padding: 24, border: '1px solid var(--color-border)', fontSize: 11 }}>
				No menu here.
			</div>
		</ContextualMenu>
	),
};
