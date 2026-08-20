// Select Component Stories - Mac OS 9 UI Kit

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';
import type { SelectOption } from './Select';
import '../../styles/theme.css';

const meta = {
	title: 'Components/Select',
	component: Select,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'Classic Mac OS 9 style dropdown select with raised bevel effect. Supports options as props or children, labels, validation states, and full accessibility.',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		size: {
			control: 'select',
			options: ['sm', 'md', 'lg'],
			description: 'Select size',
		},
		label: {
			control: 'text',
			description: 'Label text for the select',
		},
		labelPosition: {
			control: 'select',
			options: ['top', 'left', 'right'],
			description: 'Position of label relative to select',
		},
		placeholder: {
			control: 'text',
			description: 'Placeholder text',
		},
		disabled: {
			control: 'boolean',
			description: 'Whether the select is disabled',
		},
		error: {
			control: 'boolean',
			description: 'Error state',
		},
		errorMessage: {
			control: 'text',
			description: 'Error message to display',
		},
		helperText: {
			control: 'text',
			description: 'Helper text to display',
		},
		fullWidth: {
			control: 'boolean',
			description: 'Whether select takes full width',
		},
	},
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data
const colorOptions: SelectOption[] = [
	{ value: 'red', label: 'Red' },
	{ value: 'blue', label: 'Blue' },
	{ value: 'green', label: 'Green' },
	{ value: 'yellow', label: 'Yellow' },
	{ value: 'purple', label: 'Purple' },
];

const sizeOptions: SelectOption[] = [
	{ value: 'xs', label: 'Extra Small' },
	{ value: 'sm', label: 'Small' },
	{ value: 'md', label: 'Medium' },
	{ value: 'lg', label: 'Large' },
	{ value: 'xl', label: 'Extra Large' },
];

const countryOptions: SelectOption[] = [
	{ value: 'us', label: 'United States' },
	{ value: 'ca', label: 'Canada' },
	{ value: 'mx', label: 'Mexico' },
	{ value: 'uk', label: 'United Kingdom' },
	{ value: 'fr', label: 'France' },
	{ value: 'de', label: 'Germany' },
	{ value: 'jp', label: 'Japan' },
	{ value: 'au', label: 'Australia' },
];

// ========================================
// Basic Examples
// ========================================

export const Default: Story = {
	args: {
		options: colorOptions,
		placeholder: 'Select a color...',
	},
};

export const WithLabel: Story = {
	args: {
		label: 'Choose a color',
		options: colorOptions,
		placeholder: 'Select...',
	},
};

export const WithChildren: Story = {
	render: () => (
		<Select label="Country">
			<option value="">Select a country...</option>
			<option value="us">United States</option>
			<option value="ca">Canada</option>
			<option value="mx">Mexico</option>
		</Select>
	),
	parameters: {
		docs: {
			description: {
				story: 'Select with option elements as children instead of options prop',
			},
		},
	},
};

// ========================================
// Size Variants
// ========================================

export const Small: Story = {
	args: {
		size: 'sm',
		label: 'Small select',
		options: sizeOptions,
		defaultValue: 'sm',
	},
};

export const Medium: Story = {
	args: {
		size: 'md',
		label: 'Medium select',
		options: sizeOptions,
		defaultValue: 'md',
	},
};

export const Large: Story = {
	args: {
		size: 'lg',
		label: 'Large select',
		options: sizeOptions,
		defaultValue: 'lg',
	},
};

export const AllSizes: Story = {
	render: () => (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
			<Select size="sm" label="Small" options={sizeOptions} defaultValue="sm" />
			<Select size="md" label="Medium" options={sizeOptions} defaultValue="md" />
			<Select size="lg" label="Large" options={sizeOptions} defaultValue="lg" />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Comparison of all three select sizes',
			},
		},
	},
};

// ========================================
// Label Positions
// ========================================

export const LabelTop: Story = {
	args: {
		label: 'Label on top',
		labelPosition: 'top',
		options: colorOptions,
		placeholder: 'Select...',
	},
};

export const LabelLeft: Story = {
	args: {
		label: 'Color:',
		labelPosition: 'left',
		options: colorOptions,
		placeholder: 'Select...',
	},
};

export const LabelRight: Story = {
	args: {
		label: '(required)',
		labelPosition: 'right',
		options: colorOptions,
		placeholder: 'Select...',
	},
};

export const LabelPositions: Story = {
	render: () => (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
			<Select label="Label on top" labelPosition="top" options={colorOptions} placeholder="Top" />
			<Select label="Size:" labelPosition="left" options={sizeOptions} placeholder="Left" />
			<Select label="(optional)" labelPosition="right" options={colorOptions} placeholder="Right" />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Select with different label positions',
			},
		},
	},
};

// ========================================
// States
// ========================================

export const Disabled: Story = {
	args: {
		label: 'Disabled select',
		options: colorOptions,
		defaultValue: 'blue',
		disabled: true,
	},
};

export const Error: Story = {
	args: {
		label: 'Country',
		options: countryOptions,
		error: true,
		errorMessage: 'Please select a country',
		placeholder: 'Select a country...',
	},
};

export const WithHelperText: Story = {
	args: {
		label: 'Preferred size',
		options: sizeOptions,
		helperText: 'Choose the size that fits you best',
		placeholder: 'Select size...',
	},
};

export const FullWidth: Story = {
	args: {
		label: 'Full width select',
		options: countryOptions,
		placeholder: 'Select a country...',
		fullWidth: true,
	},
	parameters: {
		layout: 'padded',
	},
};

// ========================================
// With Option Groups
// ========================================

export const WithOptgroups: Story = {
	render: () => (
		<Select label="Choose a location" fullWidth>
			<option value="">Select a location...</option>
			<optgroup label="North America">
				<option value="us">United States</option>
				<option value="ca">Canada</option>
				<option value="mx">Mexico</option>
			</optgroup>
			<optgroup label="Europe">
				<option value="uk">United Kingdom</option>
				<option value="fr">France</option>
				<option value="de">Germany</option>
			</optgroup>
			<optgroup label="Asia">
				<option value="jp">Japan</option>
				<option value="cn">China</option>
				<option value="in">India</option>
			</optgroup>
		</Select>
	),
	parameters: {
		docs: {
			description: {
				story: 'Select with option groups for categorization',
			},
		},
	},
};

// ========================================
// Controlled Select
// ========================================

export const Controlled: Story = {
	render: () => {
		const [value, setValue] = React.useState('');
		return (
			<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
				<Select
					label="Choose a color"
					value={value}
					onChange={(e) => setValue(e.target.value)}
					options={colorOptions}
					placeholder="Select a color..."
				/>
				<p style={{ fontSize: '11px' }}>Selected: {value || 'None'}</p>
			</div>
		);
	},
	parameters: {
		docs: {
			description: {
				story: 'Controlled select with React state',
			},
		},
	},
};

// ========================================
// Form Examples
// ========================================

export const InForm: Story = {
	render: () => {
		return (
			<form
				onSubmit={(e) => {
					e.preventDefault();
					const formData = new FormData(e.currentTarget);
					alert(
						`Country: ${formData.get('country')}\nSize: ${formData.get('size')}\nColor: ${formData.get('color')}`
					);
				}}
				style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '300px' }}
			>
				<h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontFamily: 'Geneva, sans-serif' }}>
					Preferences
				</h3>
				<Select
					name="country"
					label="Country"
					options={countryOptions}
					required
					placeholder="Select country..."
				/>
				<Select
					name="size"
					label="Shirt Size"
					options={sizeOptions}
					required
					placeholder="Select size..."
				/>
				<Select
					name="color"
					label="Favorite Color"
					options={colorOptions}
					placeholder="Select color..."
				/>
				<button
					type="submit"
					style={{
						padding: '8px',
						fontFamily: 'Geneva, sans-serif',
						cursor: 'pointer',
						marginTop: '8px',
					}}
				>
					Submit
				</button>
			</form>
		);
	},
	parameters: {
		docs: {
			description: {
				story: 'Select components integrated in a form',
			},
		},
	},
};

// ========================================
// Real-World Examples
// ========================================

export const ViewSelector: Story = {
	render: () => (
		<div
			style={{
				padding: '16px',
				border: '1px solid #262626',
				backgroundColor: '#eeeeee',
				width: '250px',
			}}
		>
			<h3 style={{ margin: '0 0 12px 0', fontSize: '13px', fontFamily: 'Geneva, sans-serif' }}>
				View Options
			</h3>
			<Select
				label="View as:"
				labelPosition="left"
				options={[
					{ value: 'icon', label: 'Icon View' },
					{ value: 'list', label: 'List View' },
					{ value: 'column', label: 'Column View' },
				]}
				defaultValue="icon"
				fullWidth
			/>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Mac OS 9 Finder-style view selector',
			},
		},
	},
};

export const PrinterDialog: Story = {
	render: () => (
		<div
			style={{
				padding: '16px',
				border: '1px solid #262626',
				backgroundColor: '#eeeeee',
				width: '350px',
			}}
		>
			<h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontFamily: 'Geneva, sans-serif' }}>
				Print Settings
			</h3>
			<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
				<Select
					label="Printer"
					options={[
						{ value: 'laser', label: 'HP LaserJet 4000' },
						{ value: 'inkjet', label: 'HP DeskJet 890C' },
						{ value: 'stylus', label: 'Epson Stylus Color 900' },
					]}
					defaultValue="laser"
					fullWidth
				/>
				<Select
					label="Paper Size"
					options={[
						{ value: 'letter', label: 'Letter (8.5 x 11 in)' },
						{ value: 'legal', label: 'Legal (8.5 x 14 in)' },
						{ value: 'a4', label: 'A4 (210 x 297 mm)' },
					]}
					defaultValue="letter"
					fullWidth
				/>
				<Select
					label="Quality"
					options={[
						{ value: 'draft', label: 'Draft' },
						{ value: 'normal', label: 'Normal' },
						{ value: 'best', label: 'Best' },
					]}
					defaultValue="normal"
					fullWidth
				/>
			</div>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Classic Mac OS 9 print dialog',
			},
		},
	},
};

export const FileSaveDialog: Story = {
	render: () => (
		<div
			style={{
				padding: '16px',
				border: '1px solid #262626',
				backgroundColor: '#eeeeee',
				width: '400px',
			}}
		>
			<h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontFamily: 'Geneva, sans-serif' }}>
				Save As
			</h3>
			<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
				<div>
					<label style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
						File name:
					</label>
					<input
						type="text"
						defaultValue="Untitled.txt"
						style={{
							width: '100%',
							padding: '4px 8px',
							fontFamily: 'Geneva, sans-serif',
							border: '1px solid #262626',
							boxSizing: 'border-box',
						}}
					/>
				</div>
				<Select
					label="Where:"
					options={[
						{ value: 'desktop', label: 'Desktop' },
						{ value: 'documents', label: 'Documents' },
						{ value: 'downloads', label: 'Downloads' },
						{ value: 'applications', label: 'Applications' },
					]}
					defaultValue="documents"
					fullWidth
				/>
				<Select
					label="Format:"
					options={[
						{ value: 'txt', label: 'Text Document (.txt)' },
						{ value: 'rtf', label: 'Rich Text (.rtf)' },
						{ value: 'html', label: 'HTML Document (.html)' },
					]}
					defaultValue="txt"
					fullWidth
				/>
			</div>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Mac OS 9 style save dialog',
			},
		},
	},
};

export const FontSelector: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
			<Select
				label="Font"
				options={[
					{ value: 'geneva', label: 'Geneva' },
					{ value: 'chicago', label: 'Chicago' },
					{ value: 'monaco', label: 'Monaco' },
					{ value: 'times', label: 'Times' },
					{ value: 'courier', label: 'Courier' },
				]}
				defaultValue="geneva"
			/>
			<Select
				label="Size"
				options={[
					{ value: '9', label: '9' },
					{ value: '10', label: '10' },
					{ value: '12', label: '12' },
					{ value: '14', label: '14' },
					{ value: '18', label: '18' },
					{ value: '24', label: '24' },
				]}
				defaultValue="12"
			/>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Font and size selectors (common in Mac OS 9 apps)',
			},
		},
	},
};

// ========================================
// Accessibility Testing
// ========================================

export const KeyboardNavigation: Story = {
	render: () => (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
			<p style={{ fontSize: '11px', marginBottom: '8px' }}>
				Use Tab to navigate, Arrow keys to select options, Enter to confirm
			</p>
			<Select label="First select" options={colorOptions} placeholder="Tab to next" />
			<Select label="Second select" options={sizeOptions} placeholder="Tab to next" />
			<Select
				label="Third select (disabled)"
				options={colorOptions}
				placeholder="Skipped"
				disabled
			/>
			<Select label="Fourth select" options={countryOptions} placeholder="Tab to next" />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Test keyboard navigation between select elements',
			},
		},
	},
};

// ========================================
// Interactive Playground
// ========================================

export const Playground: Story = {
	args: {
		label: 'Select field',
		options: colorOptions,
		placeholder: 'Choose an option...',
		size: 'md',
		fullWidth: false,
		disabled: false,
		error: false,
		labelPosition: 'top',
	},
};
