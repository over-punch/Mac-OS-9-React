// Button Component Stories - Mac OS 9 UI Kit
// Comprehensive stories showcasing all button features

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import {
	DiskIcon,
	FolderIcon,
	CloseIcon,
	ArrowRightIcon,
	ArrowLeftIcon,
	DownloadIcon,
	LinkIcon,
	MailIcon,
	TrashIcon,
} from '../Icon/categories';
import '../../styles/theme.css';

const meta = {
	title: 'Components/Button',
	component: Button,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'Classic Mac OS 9 style button with raised bevel effect. Now enhanced with polymorphic support (button/link), loading states, icon support, and full accessibility features.',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		variant: {
			control: 'select',
			options: ['default', 'primary', 'danger'],
			description: 'Visual variant of the button',
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
		fullWidth: {
			control: 'boolean',
			description: 'Whether the button should take full width',
		},
		loading: {
			control: 'boolean',
			description: 'Show loading state',
		},
		useCursorLoading: {
			control: 'boolean',
			description: 'Use Mac OS 9 watch cursor during loading',
		},
		children: {
			control: 'text',
			description: 'Button content',
		},
	},
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// ========================================
// Basic Examples
// ========================================

export const Default: Story = {
	args: {
		children: 'Button',
	},
};

export const Primary: Story = {
	args: {
		variant: 'primary',
		children: 'Primary Button',
	},
};

export const Danger: Story = {
	args: {
		variant: 'danger',
		children: 'Delete',
	},
};

// ========================================
// Size Variants
// ========================================

export const Small: Story = {
	args: {
		size: 'sm',
		children: 'Small Button',
	},
};

export const Medium: Story = {
	args: {
		size: 'md',
		children: 'Medium Button',
	},
};

export const Large: Story = {
	args: {
		size: 'lg',
		children: 'Large Button',
	},
};

export const AllSizes: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
			<Button size="sm">Small</Button>
			<Button size="md">Medium</Button>
			<Button size="lg">Large</Button>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Comparison of all three button sizes',
			},
		},
	},
};

// ========================================
// Polymorphic - Links
// ========================================

export const AsLink: Story = {
	// Rendered rather than driven by `args`: ButtonProps is a discriminated
	// union, and Storybook's Story args type resolves to only the `<button>`
	// member of it. This used to be forced through with `as any`.
	render: () => (
		<Button as="a" href="/dashboard">
			Go to Dashboard
		</Button>
	),
	parameters: {
		docs: {
			description: {
				story: 'Button rendered as a link (<a>) with href. Maintains button styling.',
			},
		},
	},
};

export const ExternalLink: Story = {
	render: () => (
		<Button as="a" href="https://example.com" target="_blank">
			External Link
		</Button>
	),
	parameters: {
		docs: {
			description: {
				story:
					'External link with target="_blank". Automatically adds rel="noopener noreferrer" for security.',
			},
		},
	},
};

export const MailtoLink: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: '8px' }}>
			<Button as="a" href="mailto:hello@example.com" leftIcon={<MailIcon />}>
				Email Us
			</Button>
			<Button as="a" href="tel:+1234567890">
				Call Now
			</Button>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Mailto and tel links styled as buttons',
			},
		},
	},
};

export const DownloadLink: Story = {
	render: () => (
		<Button as="a" href="/files/document.pdf" download leftIcon={<DownloadIcon />}>
			Download PDF
		</Button>
	),
	parameters: {
		docs: {
			description: {
				story: 'Download link with download attribute',
			},
		},
	},
};

// ========================================
// Loading States
// ========================================

export const Loading: Story = {
	args: {
		loading: true,
		children: 'Loading...',
	},
	parameters: {
		docs: {
			description: {
				story: 'Loading state with spinner indicator. Button is disabled during loading.',
			},
		},
	},
};

export const LoadingWithText: Story = {
	args: {
		loading: true,
		loadingText: 'Saving...',
		children: 'Save',
	},
	parameters: {
		docs: {
			description: {
				story: 'Loading state with custom loading text',
			},
		},
	},
};

export const LoadingWithCursor: Story = {
	args: {
		loading: true,
		useCursorLoading: true,
		loadingText: 'Processing...',
		children: 'Process',
	},
	parameters: {
		docs: {
			description: {
				story:
					'Mac OS 9 style loading with watch cursor (no spinner). Hover over the button to see the cursor change.',
			},
		},
	},
};

export const LoadingComparison: Story = {
	render: () => (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
			<Button loading>With Spinner</Button>
			<Button loading useCursorLoading>
				With Cursor Only
			</Button>
			<Button loading loadingText="Please wait...">
				Custom Text
			</Button>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Comparison of different loading state styles',
			},
		},
	},
};

// ========================================
// Icon Support
// ========================================

export const WithLeftIcon: Story = {
	render: () => <Button leftIcon={<DiskIcon />}>Save File</Button>,
	parameters: {
		docs: {
			description: {
				story: 'Button with icon on the left side',
			},
		},
	},
};

export const WithRightIcon: Story = {
	render: () => <Button rightIcon={<ArrowRightIcon />}>Next</Button>,
	parameters: {
		docs: {
			description: {
				story: 'Button with icon on the right side',
			},
		},
	},
};

export const IconOnly: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: '8px' }}>
			<Button iconOnly aria-label="Close">
				<CloseIcon />
			</Button>
			<Button iconOnly aria-label="Save" variant="primary">
				<DiskIcon />
			</Button>
			<Button iconOnly aria-label="Delete" variant="danger">
				<TrashIcon />
			</Button>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Icon-only buttons (square). Requires ariaLabel for accessibility.',
			},
		},
	},
};

export const IconExamples: Story = {
	render: () => (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
			<Button leftIcon={<FolderIcon />}>Open</Button>
			<Button leftIcon={<DiskIcon />}>Save</Button>
			<Button leftIcon={<DownloadIcon />}>Download</Button>
			<Button leftIcon={<LinkIcon />} as="a" href="#">
				Copy Link
			</Button>
			<Button leftIcon={<MailIcon />}>Send Email</Button>
			<Button leftIcon={<TrashIcon />} variant="danger">
				Delete
			</Button>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Various icons with buttons demonstrating common use cases',
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
		children: 'Disabled Button',
	},
};

export const FullWidth: Story = {
	args: {
		fullWidth: true,
		children: 'Full Width Button',
	},
	parameters: {
		layout: 'padded',
	},
};

export const AllVariants: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
			<Button variant="default">Default</Button>
			<Button variant="primary">Primary</Button>
			<Button variant="danger">Danger</Button>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'All three button variants side by side',
			},
		},
	},
};

export const AllStates: Story = {
	render: () => (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '200px' }}>
			<Button>Normal</Button>
			<Button disabled>Disabled</Button>
			<Button variant="primary">Primary</Button>
			<Button variant="primary" disabled>
				Primary Disabled
			</Button>
			<Button variant="danger">Danger</Button>
			<Button variant="danger" disabled>
				Danger Disabled
			</Button>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Demonstrates all button states including normal, disabled, and variants.',
			},
		},
	},
};

// ========================================
// Form Integration
// ========================================

export const FormButtons: Story = {
	render: () => (
		<form
			id="demo-form"
			onSubmit={(e) => {
				e.preventDefault();
				alert('Form submitted!');
			}}
			style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '300px' }}
		>
			<input
				type="text"
				placeholder="Enter text..."
				style={{
					padding: '8px',
					border: '1px solid #262626',
					fontFamily: 'Geneva,  sans-serif',
				}}
			/>
			<div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
				<Button type="button">Cancel</Button>
				<Button type="submit" variant="primary">
					Submit
				</Button>
			</div>
		</form>
	),
	parameters: {
		docs: {
			description: {
				story: 'Buttons integrated with a form. Submit button triggers form submission.',
			},
		},
	},
};

// ========================================
// Real-World Examples
// ========================================

export const DialogButtons: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
			<Button variant="default">Cancel</Button>
			<Button variant="primary">OK</Button>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Classic Mac OS 9 dialog button layout with Cancel and OK buttons.',
			},
		},
	},
};

export const Toolbar: Story = {
	render: () => (
		<div
			style={{
				display: 'flex',
				gap: '2px',
				padding: '4px',
				backgroundColor: '#eeeeee',
				border: '1px solid #262626',
			}}
		>
			<Button size="sm" iconOnly aria-label="New">
				<FolderIcon />
			</Button>
			<Button size="sm" iconOnly aria-label="Save">
				<DiskIcon />
			</Button>
			<Button size="sm" iconOnly aria-label="Download">
				<DownloadIcon />
			</Button>
			<Button size="sm" iconOnly aria-label="Print" disabled>
				📄
			</Button>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Mac OS 9 style toolbar with icon-only compact buttons.',
			},
		},
	},
};

export const ActionGroup: Story = {
	render: () => (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '150px' }}>
			<Button fullWidth variant="primary" leftIcon={<ArrowRightIcon />}>
				Continue
			</Button>
			<Button fullWidth leftIcon={<ArrowLeftIcon />}>
				Go Back
			</Button>
			<Button fullWidth variant="danger" leftIcon={<TrashIcon />}>
				Delete
			</Button>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Vertical stack of full-width buttons with icons for action menus.',
			},
		},
	},
};

export const NavigationButtons: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between', width: '300px' }}>
			<Button as="a" href="#" leftIcon={<ArrowLeftIcon />}>
				Previous
			</Button>
			<Button as="a" href="#" variant="primary" rightIcon={<ArrowRightIcon />}>
				Next
			</Button>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Pagination-style navigation links styled as buttons',
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
				Use Tab to navigate, Enter or Space to activate
			</p>
			<Button>First Button</Button>
			<Button variant="primary">Second Button (Primary)</Button>
			<Button disabled>Third Button (Disabled)</Button>
			<Button>Fourth Button</Button>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story:
					'Test keyboard navigation with Tab, Enter, and Space keys. Focus indicators should be visible.',
			},
		},
	},
};

export const ARIAExample: Story = {
	render: () => {
		const [pressed, setPressed] = React.useState(false);
		return (
			<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
				<Button
					aria-pressed={pressed}
					variant={pressed ? 'primary' : 'default'}
					onClick={() => setPressed(!pressed)}
				>
					Toggle {pressed ? 'On' : 'Off'}
				</Button>
				<p style={{ fontSize: '11px' }}>
					Uses aria-pressed for toggle button state (check with screen reader)
				</p>
			</div>
		);
	},
	parameters: {
		docs: {
			description: {
				story: 'Toggle button with aria-pressed attribute for accessibility',
			},
		},
	},
};

// ========================================
// Interactive Playground
// ========================================

export const Playground: Story = {
	args: {
		variant: 'default',
		size: 'md',
		disabled: false,
		fullWidth: false,
		loading: false,
		children: 'Click Me',
	},
};
