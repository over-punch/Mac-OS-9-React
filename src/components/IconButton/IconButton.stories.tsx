// IconButton Component Stories - Mac OS 9 UI Kit

import type { Meta, StoryObj } from '@storybook/react';
import { IconButton } from './IconButton';
import { IconLibrary } from '../Icon';
import '../../styles/theme.css';

const meta = {
	title: 'Components/IconButton',
	component: IconButton,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'A button whose content is an icon. It renders a `Button` internally, so it inherits the same variants, sizes, focus handling and disabled semantics.\n\nAn icon is not an accessible name. With no visible `label`, supply `aria-label` — development builds log an error when neither is present, because a button screen readers announce as "button" is unusable rather than merely untidy.',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		label: {
			control: 'text',
			description: 'Optional visible text alongside the icon',
		},
		labelPosition: {
			control: 'select',
			options: ['left', 'right', 'top', 'bottom'],
			description: 'Label position relative to the icon',
		},
		variant: {
			control: 'select',
			options: ['default', 'primary', 'danger'],
			description: 'Button variant',
		},
		size: {
			control: 'select',
			options: ['sm', 'md', 'lg'],
			description: 'Button size',
		},
		disabled: {
			control: 'boolean',
			description: 'Whether the button is disabled',
		},
	},
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Icon only — so `aria-label` carries the accessible name. */
export const Default: Story = {
	args: {
		icon: <IconLibrary icon="folder" size="md" label={null} />,
		'aria-label': 'Open folder',
	},
};

/** With a visible label, which becomes the accessible name on its own. */
export const WithLabel: Story = {
	args: {
		icon: <IconLibrary icon="document" size="md" label={null} />,
		label: 'New document',
	},
};

/** Label position, for toolbars and palettes. */
export const LabelPositions: Story = {
	args: { icon: <IconLibrary icon="disk" size="md" label={null} /> },
	render: (args) => (
		<div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
			{(['left', 'right', 'top', 'bottom'] as const).map((position) => (
				<IconButton key={position} {...args} label={position} labelPosition={position} />
			))}
		</div>
	),
};

/** The variants and sizes it inherits from Button. */
export const VariantsAndSizes: Story = {
	args: { icon: <IconLibrary icon="application" size="md" label={null} /> },
	render: (args) => (
		<div style={{ display: 'grid', gap: 16 }}>
			<div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
				{(['default', 'primary', 'danger'] as const).map((variant) => (
					<IconButton key={variant} {...args} variant={variant} aria-label={variant} />
				))}
			</div>
			<div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
				{(['sm', 'md', 'lg'] as const).map((size) => (
					<IconButton key={size} {...args} size={size} aria-label={size} />
				))}
			</div>
		</div>
	),
};

/** Disabled, using the native attribute rather than `aria-disabled`. */
export const Disabled: Story = {
	args: {
		icon: <IconLibrary icon="trash" size="md" label={null} />,
		'aria-label': 'Empty trash',
		disabled: true,
	},
};
