// Radio Component Stories - Mac OS 9 UI Kit

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Radio } from './Radio';
import '../../styles/theme.css';

const meta = {
	title: 'Components/Radio',
	component: Radio,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'Classic Mac OS 9 style radio button with inset bevel effect. Radio buttons work in groups where only one option can be selected at a time.',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		checked: {
			control: 'boolean',
			description: 'Whether the radio is checked (controlled)',
		},
		defaultChecked: {
			control: 'boolean',
			description: 'Default checked state (uncontrolled)',
		},
		disabled: {
			control: 'boolean',
			description: 'Whether the radio is disabled',
		},
		size: {
			control: 'select',
			options: ['sm', 'md', 'lg'],
			description: 'Radio size',
		},
		label: {
			control: 'text',
			description: 'Label text for the radio',
		},
		labelPosition: {
			control: 'select',
			options: ['left', 'right'],
			description: 'Position of label relative to radio',
		},
		error: {
			control: 'boolean',
			description: 'Error state for form validation',
		},
		value: {
			control: 'text',
			description: 'Value for the radio (used in groups)',
		},
		name: {
			control: 'text',
			description: 'Name for the radio group',
		},
	},
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

// ========================================
// Basic Examples
// ========================================

export const Default: Story = {
	args: {
		label: 'Radio button',
		name: 'example',
		value: 'option',
	},
};

export const Checked: Story = {
	args: {
		defaultChecked: true,
		label: 'Checked radio',
		name: 'example2',
		value: 'option',
	},
};

export const WithoutLabel: Story = {
	args: {
		ariaLabel: 'Radio without visible label',
		name: 'example3',
		value: 'option',
	},
};

// ========================================
// Size Variants
// ========================================

export const Small: Story = {
	args: {
		size: 'sm',
		label: 'Small radio',
		name: 'size-sm',
		value: 'small',
	},
};

export const Medium: Story = {
	args: {
		size: 'md',
		label: 'Medium radio',
		name: 'size-md',
		value: 'medium',
	},
};

export const Large: Story = {
	args: {
		size: 'lg',
		label: 'Large radio',
		name: 'size-lg',
		value: 'large',
	},
};

export const AllSizes: Story = {
	render: () => (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
			<Radio size="sm" name="sizes" value="sm" label="Small radio" />
			<Radio size="md" name="sizes" value="md" label="Medium radio" defaultChecked />
			<Radio size="lg" name="sizes" value="lg" label="Large radio" />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Comparison of all three radio sizes',
			},
		},
	},
};

// ========================================
// States
// ========================================

export const Disabled: Story = {
	args: {
		disabled: true,
		label: 'Disabled radio',
		name: 'disabled',
		value: 'option',
	},
};

export const DisabledChecked: Story = {
	args: {
		disabled: true,
		defaultChecked: true,
		label: 'Disabled checked radio',
		name: 'disabled2',
		value: 'option',
	},
};

export const Error: Story = {
	args: {
		error: true,
		label: 'Radio with error',
		name: 'error',
		value: 'option',
	},
};

export const AllStates: Story = {
	render: () => (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
			<Radio name="states1" value="unchecked" label="Unchecked" />
			<Radio name="states2" value="checked" defaultChecked label="Checked" />
			<Radio name="states3" value="disabled" disabled label="Disabled" />
			<Radio
				name="states4"
				value="disabled-checked"
				disabled
				defaultChecked
				label="Disabled checked"
			/>
			<Radio name="states5" value="error" error label="Error state" />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'All radio states side by side',
			},
		},
	},
};

// ========================================
// Label Positioning
// ========================================

export const LabelRight: Story = {
	args: {
		label: 'Label on the right',
		labelPosition: 'right',
		name: 'position1',
		value: 'right',
	},
};

export const LabelLeft: Story = {
	args: {
		label: 'Label on the left',
		labelPosition: 'left',
		name: 'position2',
		value: 'left',
	},
};

export const LabelPositions: Story = {
	render: () => (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
			<Radio name="positions1" value="right" label="Label on the right" labelPosition="right" />
			<Radio name="positions2" value="left" label="Label on the left" labelPosition="left" />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Radio with label on different sides',
			},
		},
	},
};

// ========================================
// Radio Groups
// ========================================

export const UncontrolledGroup: Story = {
	render: () => (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
			<p style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Choose a size:</p>
			<Radio name="size" value="small" label="Small" />
			<Radio name="size" value="medium" label="Medium" defaultChecked />
			<Radio name="size" value="large" label="Large" />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Uncontrolled radio group. Only one can be selected at a time.',
			},
		},
	},
};

export const ControlledGroup: Story = {
	render: () => {
		const [selectedColor, setSelectedColor] = React.useState('blue');
		return (
			<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
				<p style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Choose a color:</p>
				<Radio
					name="color"
					value="red"
					checked={selectedColor === 'red'}
					onChange={(e) => setSelectedColor(e.target.value)}
					label="Red"
				/>
				<Radio
					name="color"
					value="blue"
					checked={selectedColor === 'blue'}
					onChange={(e) => setSelectedColor(e.target.value)}
					label="Blue"
				/>
				<Radio
					name="color"
					value="green"
					checked={selectedColor === 'green'}
					onChange={(e) => setSelectedColor(e.target.value)}
					label="Green"
				/>
				<p style={{ fontSize: '11px', marginTop: '8px' }}>Selected: {selectedColor}</p>
			</div>
		);
	},
	parameters: {
		docs: {
			description: {
				story: 'Controlled radio group with React state',
			},
		},
	},
};

export const HorizontalGroup: Story = {
	render: () => (
		<div>
			<p style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>Choose an option:</p>
			<div style={{ display: 'flex', gap: '16px' }}>
				<Radio name="horizontal" value="yes" label="Yes" defaultChecked />
				<Radio name="horizontal" value="no" label="No" />
				<Radio name="horizontal" value="maybe" label="Maybe" />
			</div>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Radio group arranged horizontally',
			},
		},
	},
};

// ========================================
// Form Integration
// ========================================

export const InForm: Story = {
	render: () => {
		return (
			<form
				onSubmit={(e) => {
					e.preventDefault();
					const formData = new FormData(e.currentTarget);
					alert(
						`Shipping method: ${formData.get('shipping')}\nPayment: ${formData.get('payment')}`
					);
				}}
				style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '300px' }}
			>
				<fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
					<legend style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
						Shipping Method:
					</legend>
					<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
						<Radio name="shipping" value="standard" label="Standard (5-7 days)" defaultChecked />
						<Radio name="shipping" value="express" label="Express (2-3 days)" />
						<Radio name="shipping" value="overnight" label="Overnight" />
					</div>
				</fieldset>

				<fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
					<legend style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
						Payment Method:
					</legend>
					<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
						<Radio name="payment" value="credit" label="Credit Card" defaultChecked />
						<Radio name="payment" value="debit" label="Debit Card" />
						<Radio name="payment" value="paypal" label="PayPal" />
					</div>
				</fieldset>

				<button
					type="submit"
					style={{
						padding: '8px 16px',
						fontFamily: 'Geneva, sans-serif',
						cursor: 'pointer',
					}}
				>
					Continue
				</button>
			</form>
		);
	},
	parameters: {
		docs: {
			description: {
				story: 'Radio buttons integrated in a form with multiple groups',
			},
		},
	},
};

// ========================================
// Real-World Examples
// ========================================

export const ViewOptions: Story = {
	render: () => (
		<div
			style={{
				padding: '16px',
				border: '1px solid #262626',
				backgroundColor: '#eeeeee',
				maxWidth: '250px',
			}}
		>
			<h3 style={{ margin: '0 0 12px 0', fontSize: '13px', fontFamily: 'Geneva, sans-serif' }}>
				View Options
			</h3>
			<div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
				<Radio name="view" value="icon" label="Icon View" defaultChecked />
				<Radio name="view" value="list" label="List View" />
				<Radio name="view" value="column" label="Column View" />
			</div>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Mac OS 9 style view selector (common in Finder)',
			},
		},
	},
};

export const PrinterSelection: Story = {
	render: () => (
		<div
			style={{
				padding: '16px',
				border: '1px solid #262626',
				backgroundColor: '#eeeeee',
				maxWidth: '300px',
			}}
		>
			<h3 style={{ margin: '0 0 12px 0', fontSize: '13px', fontFamily: 'Geneva, sans-serif' }}>
				Select Printer
			</h3>
			<div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
				<Radio name="printer" value="laserjet" label="HP LaserJet 4000" defaultChecked />
				<Radio name="printer" value="deskjet" label="HP DeskJet 890C" />
				<Radio name="printer" value="epson" label="Epson Stylus Color 900" />
				<Radio name="printer" value="none" label="No Printer" disabled />
			</div>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Printer selection dialog (classic Mac OS 9 pattern)',
			},
		},
	},
};

export const QualitySettings: Story = {
	render: () => (
		<div
			style={{
				padding: '16px',
				border: '1px solid #262626',
				backgroundColor: '#eeeeee',
				maxWidth: '280px',
			}}
		>
			<h3 style={{ margin: '0 0 12px 0', fontSize: '13px', fontFamily: 'Geneva, sans-serif' }}>
				Export Quality
			</h3>
			<div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
				<Radio name="quality" value="low" label="Low (Faster)" />
				<Radio name="quality" value="medium" label="Medium (Balanced)" defaultChecked />
				<Radio name="quality" value="high" label="High (Better Quality)" />
				<Radio name="quality" value="maximum" label="Maximum (Slower)" />
			</div>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Quality settings with descriptive labels',
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
				Use Tab to focus group, Arrow keys to select, Space to activate
			</p>
			<p style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Choose an option:</p>
			<Radio name="keyboard" value="first" label="First option" />
			<Radio name="keyboard" value="second" label="Second option" defaultChecked />
			<Radio name="keyboard" value="third" label="Third option" />
			<Radio name="keyboard" value="fourth" label="Fourth option (disabled)" disabled />
			<Radio name="keyboard" value="fifth" label="Fifth option" />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story:
					'Test keyboard navigation. Tab focuses the group, arrow keys move selection, Space activates.',
			},
		},
	},
};

export const WithFieldset: Story = {
	render: () => (
		<fieldset
			style={{
				border: '1px solid #262626',
				padding: '16px',
				backgroundColor: '#eeeeee',
			}}
		>
			<legend style={{ padding: '0 8px', fontWeight: 'bold', fontSize: '13px' }}>
				Choose your plan
			</legend>
			<div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
				<Radio name="plan" value="free" label="Free Plan" />
				<Radio name="plan" value="pro" label="Pro Plan ($9.99/mo)" defaultChecked />
				<Radio name="plan" value="enterprise" label="Enterprise Plan (Contact us)" />
			</div>
		</fieldset>
	),
	parameters: {
		docs: {
			description: {
				story: 'Radio group with semantic fieldset and legend for better accessibility',
			},
		},
	},
};

// ========================================
// Interactive Playground
// ========================================

export const Playground: Story = {
	args: {
		label: 'Radio label',
		size: 'md',
		disabled: false,
		error: false,
		labelPosition: 'right',
		name: 'playground',
		value: 'option',
	},
};
