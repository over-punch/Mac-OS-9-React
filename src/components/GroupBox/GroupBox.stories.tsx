// GroupBox Component Stories - Mac OS 9 UI Kit

import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from '../Checkbox';
import { Radio, RadioGroup } from '../Radio';
import { GroupBox } from './GroupBox';
import '../../styles/theme.css';

const meta = {
	title: 'Components/GroupBox',
	component: GroupBox,
	tags: ['autodocs'],
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component: `The etched border that groups related settings — the most common structure in a Mac OS 9 control panel. Renders a real fieldset and legend, which is what gives assistive technology the grouping; a div with a heading looks the same and announces nothing.`,
			},
		},
	},
} satisfies Meta<typeof GroupBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
	args: { title: 'Sharing' },
	render: (args) => (
		<GroupBox {...args}>
			<Checkbox label="Share this folder" defaultChecked />
			<Checkbox label="Allow guests to write" />
		</GroupBox>
	),
};

export const Secondary: Story = {
	args: { title: 'Privileges', variant: 'secondary' },
	render: (args) => (
		<GroupBox {...args}>
			<Checkbox label="See folders" defaultChecked />
		</GroupBox>
	),
};

export const Untitled: Story = {
	render: () => (
		<GroupBox>
			<RadioGroup name="view" aria-label="View as" defaultValue="icon">
				<Radio value="icon" label="as Icons" />
				<Radio value="list" label="as List" />
			</RadioGroup>
		</GroupBox>
	),
};

/** A checkbox title says the whole group can be switched off. */
export const CheckboxTitle: Story = {
	render: () => (
		<GroupBox control={<Checkbox label="Use a proxy server" defaultChecked />}>
			<Checkbox label="Bypass for local addresses" />
		</GroupBox>
	),
};

/**
 * A disabled group keeps its title operable — the checkbox is how you switch
 * the group back on, so disabling it along with the contents would strand it.
 */
export const Disabled: Story = {
	render: () => (
		<GroupBox disabled control={<Checkbox label="Use a proxy server" />}>
			<Checkbox label="Bypass for local addresses" />
		</GroupBox>
	),
};

export const Nested: Story = {
	render: () => (
		<GroupBox title="File Sharing">
			<Checkbox label="Share this folder" defaultChecked />
			<GroupBox variant="secondary" title="Privileges">
				<Checkbox label="See folders" defaultChecked />
				<Checkbox label="Make changes" />
			</GroupBox>
		</GroupBox>
	),
};
