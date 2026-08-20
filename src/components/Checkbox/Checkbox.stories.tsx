// Checkbox Component Stories - Mac OS 9 UI Kit

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './Checkbox';
import '../../styles/theme.css';

const meta = {
	title: 'Components/Checkbox',
	component: Checkbox,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'Classic Mac OS 9 style checkbox with inset bevel effect. Supports checked, unchecked, indeterminate, and disabled states with full accessibility.',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		checked: {
			control: 'boolean',
			description: 'Whether the checkbox is checked (controlled)',
		},
		defaultChecked: {
			control: 'boolean',
			description: 'Default checked state (uncontrolled)',
		},
		indeterminate: {
			control: 'boolean',
			description: 'Indeterminate state (for "select all" scenarios)',
		},
		disabled: {
			control: 'boolean',
			description: 'Whether the checkbox is disabled',
		},
		size: {
			control: 'select',
			options: ['sm', 'md', 'lg'],
			description: 'Checkbox size',
		},
		label: {
			control: 'text',
			description: 'Label text for the checkbox',
		},
		labelPosition: {
			control: 'select',
			options: ['left', 'right'],
			description: 'Position of label relative to checkbox',
		},
		error: {
			control: 'boolean',
			description: 'Error state for form validation',
		},
	},
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

// ========================================
// Basic Examples
// ========================================

export const Default: Story = {
	args: {
		label: 'Checkbox',
	},
};

export const Checked: Story = {
	args: {
		defaultChecked: true,
		label: 'Checked checkbox',
	},
};

export const WithoutLabel: Story = {
	args: {
		ariaLabel: 'Checkbox without visible label',
	},
};

// ========================================
// Size Variants
// ========================================

export const Small: Story = {
	args: {
		size: 'sm',
		label: 'Small checkbox',
	},
};

export const Medium: Story = {
	args: {
		size: 'md',
		label: 'Medium checkbox',
	},
};

export const Large: Story = {
	args: {
		size: 'lg',
		label: 'Large checkbox',
	},
};

export const AllSizes: Story = {
	render: () => (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
			<Checkbox size="sm" label="Small checkbox" />
			<Checkbox size="md" label="Medium checkbox" />
			<Checkbox size="lg" label="Large checkbox" />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Comparison of all three checkbox sizes',
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
		label: 'Disabled checkbox',
	},
};

export const DisabledChecked: Story = {
	args: {
		disabled: true,
		defaultChecked: true,
		label: 'Disabled checked checkbox',
	},
};

export const Indeterminate: Story = {
	args: {
		indeterminate: true,
		label: 'Indeterminate checkbox',
	},
	parameters: {
		docs: {
			description: {
				story:
					'Indeterminate state (neither checked nor unchecked). Commonly used for "Select All" when some items are selected.',
			},
		},
	},
};

export const Error: Story = {
	args: {
		error: true,
		label: 'Checkbox with error',
	},
	parameters: {
		docs: {
			description: {
				story: 'Error state for form validation feedback',
			},
		},
	},
};

export const AllStates: Story = {
	render: () => (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
			<Checkbox label="Unchecked" />
			<Checkbox defaultChecked label="Checked" />
			<Checkbox indeterminate label="Indeterminate" />
			<Checkbox disabled label="Disabled" />
			<Checkbox disabled defaultChecked label="Disabled checked" />
			<Checkbox error label="Error state" />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'All checkbox states side by side',
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
	},
};

export const LabelLeft: Story = {
	args: {
		label: 'Label on the left',
		labelPosition: 'left',
	},
};

export const LabelPositions: Story = {
	render: () => (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
			<Checkbox label="Label on the right" labelPosition="right" />
			<Checkbox label="Label on the left" labelPosition="left" />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Checkbox with label on different sides',
			},
		},
	},
};

// ========================================
// Controlled vs Uncontrolled
// ========================================

export const Controlled: Story = {
	render: () => {
		const [checked, setChecked] = React.useState(false);
		return (
			<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
				<Checkbox
					checked={checked}
					onChange={(e) => setChecked(e.target.checked)}
					label="Controlled checkbox"
				/>
				<p style={{ fontSize: '11px' }}>Checked: {checked ? 'Yes' : 'No'}</p>
			</div>
		);
	},
	parameters: {
		docs: {
			description: {
				story: 'Controlled checkbox with React state',
			},
		},
	},
};

export const Uncontrolled: Story = {
	args: {
		defaultChecked: false,
		label: 'Uncontrolled checkbox',
	},
	parameters: {
		docs: {
			description: {
				story: 'Uncontrolled checkbox (manages its own state)',
			},
		},
	},
};

// ========================================
// Indeterminate Example (Select All)
// ========================================

export const SelectAllExample: Story = {
	render: () => {
		const [items, setItems] = React.useState([
			{ id: 1, label: 'Item 1', checked: false },
			{ id: 2, label: 'Item 2', checked: false },
			{ id: 3, label: 'Item 3', checked: false },
		]);

		const allChecked = items.every((item) => item.checked);
		const someChecked = items.some((item) => item.checked) && !allChecked;

		const handleSelectAll = () => {
			setItems(items.map((item) => ({ ...item, checked: !allChecked })));
		};

		const handleItemChange = (id: number) => {
			setItems(items.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)));
		};

		return (
			<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
				<Checkbox
					checked={allChecked}
					indeterminate={someChecked}
					onChange={handleSelectAll}
					label="Select all"
					size="md"
				/>
				<div
					style={{
						paddingLeft: '24px',
						display: 'flex',
						flexDirection: 'column',
						gap: '8px',
						marginTop: '4px',
					}}
				>
					{items.map((item) => (
						<Checkbox
							key={item.id}
							checked={item.checked}
							onChange={() => handleItemChange(item.id)}
							label={item.label}
							size="md"
						/>
					))}
				</div>
			</div>
		);
	},
	parameters: {
		docs: {
			description: {
				story:
					'Classic "Select All" pattern with parent checkbox showing indeterminate state when some items are selected',
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
						`Terms: ${formData.get('terms') ? 'Accepted' : 'Not accepted'}\nNewsletter: ${formData.get('newsletter') ? 'Subscribed' : 'Not subscribed'}`
					);
				}}
				style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '300px' }}
			>
				<Checkbox name="terms" label="I accept the terms and conditions" required />
				<Checkbox name="newsletter" label="Subscribe to newsletter" defaultChecked />
				<button
					type="submit"
					style={{
						marginTop: '8px',
						padding: '8px 16px',
						fontFamily: 'Geneva, sans-serif',
						cursor: 'pointer',
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
				story: 'Checkboxes integrated in a form with native validation',
			},
		},
	},
};

// ========================================
// Real-World Examples
// ========================================

export const SettingsPanel: Story = {
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
				Preferences
			</h3>
			<div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
				<Checkbox defaultChecked label="Show hidden files" />
				<Checkbox label="Enable sounds" />
				<Checkbox defaultChecked label="Auto-save documents" />
				<Checkbox label="Check for updates" />
				<Checkbox disabled label="Advanced mode (coming soon)" />
			</div>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Mac OS 9 style settings panel with multiple checkboxes',
			},
		},
	},
};

export const FilePermissions: Story = {
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
				File Permissions
			</h3>
			<div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
				<Checkbox defaultChecked label="Read" />
				<Checkbox defaultChecked label="Write" />
				<Checkbox label="Execute" />
			</div>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'File permissions selector (common Mac OS 9 dialog)',
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
			<p style={{ fontSize: '11px', marginBottom: '8px' }}>Use Tab to navigate, Space to toggle</p>
			<Checkbox label="First checkbox" />
			<Checkbox label="Second checkbox" />
			<Checkbox label="Third checkbox" />
			<Checkbox disabled label="Disabled checkbox (not focusable)" />
			<Checkbox label="Fifth checkbox" />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Test keyboard navigation. Use Tab to move between checkboxes and Space to toggle.',
			},
		},
	},
};

// ========================================
// Interactive Playground
// ========================================

export const Playground: Story = {
	args: {
		label: 'Checkbox label',
		size: 'md',
		disabled: false,
		indeterminate: false,
		error: false,
		labelPosition: 'right',
	},
};
