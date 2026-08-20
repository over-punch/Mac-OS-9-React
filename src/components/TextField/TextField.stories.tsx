// TextField Component Stories - Mac OS 9 UI Kit

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TextField } from './TextField';
import {
	SearchIcon,
	UserIcon,
	LockIcon,
	MailIcon,
	CalendarIcon,
} from '../Icon/categories';
import '../../styles/theme.css';

const meta = {
	title: 'Components/TextField',
	component: TextField,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'Classic Mac OS 9 style text input field with inset bevel effect. Supports various input types, icons, labels, and validation states.',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		type: {
			control: 'select',
			options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
			description: 'Input type',
		},
		size: {
			control: 'select',
			options: ['sm', 'md', 'lg'],
			description: 'TextField size',
		},
		label: {
			control: 'text',
			description: 'Label text for the field',
		},
		labelPosition: {
			control: 'select',
			options: ['top', 'left', 'right'],
			description: 'Position of label relative to field',
		},
		placeholder: {
			control: 'text',
			description: 'Placeholder text',
		},
		disabled: {
			control: 'boolean',
			description: 'Whether the field is disabled',
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
			description: 'Whether field takes full width',
		},
	},
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

// ========================================
// Basic Examples
// ========================================

export const Default: Story = {
	args: {
		placeholder: 'Enter text...',
	},
};

export const WithLabel: Story = {
	args: {
		label: 'Username',
		placeholder: 'Enter your username',
	},
};

export const WithValue: Story = {
	args: {
		label: 'Email',
		defaultValue: 'user@example.com',
	},
};

// ========================================
// Size Variants
// ========================================

export const Small: Story = {
	args: {
		size: 'sm',
		label: 'Small field',
		placeholder: 'Small input',
	},
};

export const Medium: Story = {
	args: {
		size: 'md',
		label: 'Medium field',
		placeholder: 'Medium input',
	},
};

export const Large: Story = {
	args: {
		size: 'lg',
		label: 'Large field',
		placeholder: 'Large input',
	},
};

export const AllSizes: Story = {
	render: () => (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
			<TextField size="sm" label="Small" placeholder="Small input" />
			<TextField size="md" label="Medium" placeholder="Medium input" />
			<TextField size="lg" label="Large" placeholder="Large input" />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Comparison of all three text field sizes',
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
		placeholder: 'Enter value',
	},
};

export const LabelLeft: Story = {
	args: {
		label: 'Name:',
		labelPosition: 'left',
		placeholder: 'John Doe',
	},
};

export const LabelRight: Story = {
	args: {
		label: '(required)',
		labelPosition: 'right',
		placeholder: 'Enter value',
	},
};

export const LabelPositions: Story = {
	render: () => (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
			<TextField label="Label on top" labelPosition="top" placeholder="Top label" />
			<TextField label="Name:" labelPosition="left" placeholder="Left label" />
			<TextField label="(optional)" labelPosition="right" placeholder="Right label" />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Text fields with different label positions',
			},
		},
	},
};

// ========================================
// Input Types
// ========================================

export const EmailInput: Story = {
	args: {
		type: 'email',
		label: 'Email',
		placeholder: 'you@example.com',
	},
};

export const PasswordInput: Story = {
	args: {
		type: 'password',
		label: 'Password',
		placeholder: 'Enter password',
	},
};

export const NumberInput: Story = {
	args: {
		type: 'number',
		label: 'Age',
		placeholder: '0',
		min: 0,
		max: 120,
	},
};

export const SearchInput: Story = {
	args: {
		type: 'search',
		placeholder: 'Search...',
	},
};

export const TelInput: Story = {
	args: {
		type: 'tel',
		label: 'Phone',
		placeholder: '+1 (555) 123-4567',
	},
};

export const URLInput: Story = {
	args: {
		type: 'url',
		label: 'Website',
		placeholder: 'https://example.com',
	},
};

// ========================================
// States
// ========================================

export const Disabled: Story = {
	args: {
		label: 'Disabled field',
		placeholder: 'Cannot edit',
		disabled: true,
	},
};

export const DisabledWithValue: Story = {
	args: {
		label: 'Read-only',
		defaultValue: 'This value cannot be changed',
		disabled: true,
	},
};

export const Error: Story = {
	args: {
		label: 'Email',
		defaultValue: 'invalid-email',
		error: true,
		errorMessage: 'Please enter a valid email address',
	},
};

export const WithHelperText: Story = {
	args: {
		label: 'Password',
		type: 'password',
		placeholder: 'Enter password',
		helperText: 'Must be at least 8 characters',
	},
};

export const FullWidth: Story = {
	args: {
		label: 'Full width field',
		placeholder: 'This field takes the full width',
		fullWidth: true,
	},
	parameters: {
		layout: 'padded',
	},
};

// ========================================
// With Icons
// ========================================

export const WithLeftIcon: Story = {
	render: () => <TextField leftIcon={<SearchIcon />} placeholder="Search..." />,
	parameters: {
		docs: {
			description: {
				story: 'Text field with icon on the left',
			},
		},
	},
};

export const WithRightIcon: Story = {
	render: () => <TextField rightIcon={<UserIcon />} label="Username" placeholder="Enter username" />,
	parameters: {
		docs: {
			description: {
				story: 'Text field with icon on the right',
			},
		},
	},
};

export const IconExamples: Story = {
	render: () => (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '300px' }}>
			<TextField leftIcon={<SearchIcon />} placeholder="Search files..." />
			<TextField leftIcon={<UserIcon />} label="Username" placeholder="Enter username" />
			<TextField leftIcon={<MailIcon />} type="email" label="Email" placeholder="you@example.com" />
			<TextField leftIcon={<LockIcon />} type="password" label="Password" placeholder="Enter password" />
			<TextField leftIcon={<CalendarIcon />} type="date" label="Birth Date" />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Common use cases with icons',
			},
		},
	},
};

// ========================================
// Form Examples
// ========================================

export const LoginForm: Story = {
	render: () => (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				const formData = new FormData(e.currentTarget);
				alert(`Username: ${formData.get('username')}\nPassword: ${formData.get('password')}`);
			}}
			style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '300px' }}
		>	<h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontFamily: 'Geneva, sans-serif' }}>
				Login
			</h3>
			<TextField
				name="username"
				label="Username"
				leftIcon={<UserIcon />}
				placeholder="Enter username"
				required
			/>
			<TextField
				name="password"
				type="password"
				label="Password"
				leftIcon={<LockIcon />}
				placeholder="Enter password"
				required
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
				Log In
			</button>
		</form>
	),
	parameters: {
		docs: {
			description: {
				story: 'Login form with username and password fields',
			},
		},
	},
};

export const RegistrationForm: Story = {
	render: () => (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				alert('Form submitted!');
			}}
			style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '350px' }}
		>
			<h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontFamily: 'Geneva, sans-serif' }}>
				Create Account
			</h3>
			<TextField name="fullname" label="Full Name" placeholder="John Doe" required fullWidth />
			<TextField
				name="email"
				type="email"
				label="Email"
				leftIcon={<MailIcon />}
				placeholder="you@example.com"
				required
				fullWidth
			/>
			<TextField
				name="password"
				type="password"
				label="Password"
				leftIcon={<LockIcon />}
				placeholder="At least 8 characters"
				helperText="Must contain letters and numbers"
				required
				fullWidth
			/>
			<TextField
				name="confirm"
				type="password"
				label="Confirm Password"
				placeholder="Re-enter password"
				required
				fullWidth
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
				Sign Up
			</button>
		</form>
	),
	parameters: {
		docs: {
			description: {
				story: 'Registration form with multiple text fields',
			},
		},
	},
};

// ========================================
// Validation Example
// ========================================

export const WithValidation: Story = {
	render: () => {
		const [email, setEmail] = React.useState('');
		const [error, setError] = React.useState(false);
		const [errorMessage, setErrorMessage] = React.useState('');

		const validateEmail = (value: string) => {
			if (!value) {
				setError(true);
				setErrorMessage('Email is required');
				return;
			}
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(value)) {
				setError(true);
				setErrorMessage('Please enter a valid email address');
			} else {
				setError(false);
				setErrorMessage('');
			}
		};

		return (
			<div style={{ width: '300px' }}>
				<TextField
					label="Email"
					type="email"
					leftIcon={<MailIcon />}
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					onBlur={(e) => validateEmail(e.target.value)}
					error={error}
					errorMessage={errorMessage}
					placeholder="you@example.com"
					fullWidth
				/>
			</div>
		);
	},
	parameters: {
		docs: {
			description: {
				story: 'Text field with real-time validation (blur to validate)',
			},
		},
	},
};

// ========================================
// Real-World Examples
// ========================================

export const SearchBar: Story = {
	render: () => (
		<div style={{ width: '400px' }}>
			<TextField
				type="search"
				leftIcon={<SearchIcon />}
				placeholder="Search files and folders..."
				fullWidth
			/>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Mac OS 9 style search bar',
			},
		},
	},
};

export const ContactForm: Story = {
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
				Contact Information
			</h3>
			<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
				<TextField label="First Name" placeholder="John" fullWidth />
				<TextField label="Last Name" placeholder="Doe" fullWidth />
				<TextField type="email" label="Email" leftIcon={<MailIcon />} placeholder="john@example.com" fullWidth />
				<TextField type="tel" label="Phone" placeholder="+1 (555) 123-4567" fullWidth />
			</div>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Contact form panel',
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
				Use Tab to navigate, type to enter text
			</p>
			<TextField label="First field" placeholder="Tab to next" />
			<TextField label="Second field" placeholder="Tab to next" />
			<TextField label="Third field (disabled)" placeholder="Skipped" disabled />
			<TextField label="Fourth field" placeholder="Tab to next" />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Test keyboard navigation between fields',
			},
		},
	},
};

// ========================================
// Interactive Playground
// ========================================

export const Playground: Story = {
	args: {
		label: 'Text field',
		placeholder: 'Enter text...',
		size: 'md',
		fullWidth: false,
		disabled: false,
		error: false,
		labelPosition: 'top',
	},
};