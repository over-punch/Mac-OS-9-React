// Dialog component stories

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Dialog } from './Dialog';
import { Button } from '../Button/Button';
import { TextField } from '../TextField/TextField';
import { Checkbox } from '../Checkbox/Checkbox';

const meta = {
	title: 'Components/Dialog',
	component: Dialog,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Simple alert dialog
 */
export const Alert: Story = {
	args: { children: <></> },
	render: () => {
		const [open, setOpen] = useState(false);
		
		return (
			<>
				<Button onClick={() => setOpen(true)}>Show Alert</Button>
				<Dialog
					open={open}
					onClose={() => setOpen(false)}
					title="Alert"
					width={350}
					showControls={false}
				>
					<div style={{ textAlign: 'center' }}>
						<p>This is an alert message.</p>
						<div style={{ marginTop: '16px' }}>
							<Button variant="primary" onClick={() => setOpen(false)}>
								OK
							</Button>
						</div>
					</div>
				</Dialog>
			</>
		);
	},
};

/**
 * Confirmation dialog
 */
export const Confirm: Story = {
	args: { children: <></> },
	render: () => {
		const [open, setOpen] = useState(false);
		
		return (
			<>
				<Button onClick={() => setOpen(true)}>Show Confirmation</Button>
				<Dialog
					open={open}
					onClose={() => setOpen(false)}
					title="Confirm Action"
					width={400}
					showControls={false}
				>
					<div style={{ textAlign: 'center' }}>
						<p>Are you sure you want to delete this file?</p>
						<p style={{ fontSize: '12px', color: '#666' }}>This action cannot be undone.</p>
						<div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '24px' }}>
							<Button onClick={() => setOpen(false)}>Cancel</Button>
							<Button variant="danger" onClick={() => setOpen(false)}>Delete</Button>
						</div>
					</div>
				</Dialog>
			</>
		);
	},
};

/**
 * Dialog with close button in titlebar
 */
export const WithCloseButton: Story = {
	args: { children: <></> },
	render: () => {
		const [open, setOpen] = useState(false);
		
		return (
			<>
				<Button onClick={() => setOpen(true)}>Show Dialog</Button>
				<Dialog
					open={open}
					onClose={() => setOpen(false)}
					title="Document Properties"
					width={400}
				>
					<div>
						<p>Window with close button in the titlebar.</p>
						<p>Click the X button or press Escape to close.</p>
					</div>
				</Dialog>
			</>
		);
	},
};

/**
 * Form dialog
 */
export const FormDialog: Story = {
	args: { children: <></> },
	render: () => {
		const [open, setOpen] = useState(false);
		
		return (
			<>
				<Button onClick={() => setOpen(true)}>Show Form</Button>
				<Dialog
					open={open}
					onClose={() => setOpen(false)}
					title="User Preferences"
					width={450}
				>
					<div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
						<TextField label="Name" defaultValue="User" />
						<TextField label="Email" defaultValue="user@example.com" />
						<Checkbox label="Enable notifications" defaultChecked />
						<Checkbox label="Auto-save documents" />
						<Checkbox label="Show line numbers" />
						<div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
							<Button onClick={() => setOpen(false)}>Cancel</Button>
							<Button variant="primary" onClick={() => setOpen(false)}>Save</Button>
						</div>
					</div>
				</Dialog>
			</>
		);
	},
};

/**
 * Dialog with no backdrop close
 */
export const NoBackdropClose: Story = {
	args: { children: <></> },
	render: () => {
		const [open, setOpen] = useState(false);
		
		return (
			<>
				<Button onClick={() => setOpen(true)}>Show Dialog</Button>
				<Dialog
					open={open}
					onClose={() => setOpen(false)}
					title="Important"
					width={350}
					closeOnBackdropClick={false}
					showControls={false}
				>
					<div>
						<p>Clicking the backdrop won’t close this dialog.</p>
						<p>You must click the button below.</p>
						<div style={{ marginTop: '16px', textAlign: 'center' }}>
							<Button variant="primary" onClick={() => setOpen(false)}>
								Close
							</Button>
						</div>
					</div>
				</Dialog>
			</>
		);
	},
};

/**
 * Dialog with no Escape key close
 */
export const NoEscapeClose: Story = {
	args: { children: <></> },
	render: () => {
		const [open, setOpen] = useState(false);
		
		return (
			<>
				<Button onClick={() => setOpen(true)}>Show Dialog</Button>
				<Dialog
					open={open}
					onClose={() => setOpen(false)}
					title="Required Action"
					width={350}
					closeOnEscape={false}
					showControls={false}
				>
					<div>
						<p>Pressing Escape won’t close this dialog.</p>
						<p>You must click a button.</p>
						<div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px' }}>
							<Button onClick={() => setOpen(false)}>Cancel</Button>
							<Button variant="primary" onClick={() => setOpen(false)}>
								Confirm
							</Button>
						</div>
					</div>
				</Dialog>
			</>
		);
	},
};

/**
 * Save changes dialog
 */
export const SaveChanges: Story = {
	args: { children: <></> },
	render: () => {
		const [open, setOpen] = useState(false);
		
		return (
			<>
				<Button onClick={() => setOpen(true)}>Quit Application</Button>
				<Dialog
					open={open}
					onClose={() => setOpen(false)}
					title="Unsaved Changes"
					width={400}
					showControls={false}
				>
					<div style={{ textAlign: 'center' }}>
						<p>You have unsaved changes.</p>
						<p>Do you want to save before quitting?</p>
						<div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '24px' }}>
							<Button onClick={() => setOpen(false)}>Cancel</Button>
							<Button onClick={() => setOpen(false)}>Don’t Save</Button>
							<Button variant="primary" onClick={() => setOpen(false)}>Save</Button>
						</div>
					</div>
				</Dialog>
			</>
		);
	},
};

/**
 * Error dialog
 */
export const Error: Story = {
	args: { children: <></> },
	render: () => {
		const [open, setOpen] = useState(false);
		
		return (
			<>
				<Button onClick={() => setOpen(true)}>Show Error</Button>
				<Dialog
					open={open}
					onClose={() => setOpen(false)}
					title="Error"
					width={400}
					showControls={false}
				>
					<div>
						<p><strong>An error occurred:</strong></p>
						<p style={{ fontSize: '12px', fontFamily: 'monospace', background: '#f5f5f5', padding: '8px', margin: '8px 0' }}>
							File not found: /Users/Documents/file.txt
						</p>
						<p>Please check the file path and try again.</p>
						<div style={{ marginTop: '16px', textAlign: 'right' }}>
							<Button variant="primary" onClick={() => setOpen(false)}>
								OK
							</Button>
						</div>
					</div>
				</Dialog>
			</>
		);
	},
};

/**
 * Long content dialog (scrollable)
 */
export const LongContent: Story = {
	args: { children: <></> },
	render: () => {
		const [open, setOpen] = useState(false);
		
		return (
			<>
				<Button onClick={() => setOpen(true)}>Show Long Content</Button>
				<Dialog
					open={open}
					onClose={() => setOpen(false)}
					title="License Agreement"
					width={500}
					height={400}
				>
					<div>
						<h3>Software License Agreement</h3>
						<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
						<p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
						<p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
						<p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
						<p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
						<p>Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
						<p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.</p>
						<div style={{ marginTop: '16px', textAlign: 'right' }}>
							<Button variant="primary" onClick={() => setOpen(false)}>
								Accept
							</Button>
						</div>
					</div>
				</Dialog>
			</>
		);
	},
};

/**
 * Multiple dialogs (stacking)
 */
export const StackedDialogs: Story = {
	args: { children: <></> },
	render: () => {
		const [firstOpen, setFirstOpen] = useState(false);
		const [secondOpen, setSecondOpen] = useState(false);
		
		return (
			<>
				<Button onClick={() => setFirstOpen(true)}>Open First Dialog</Button>
				<Dialog
					open={firstOpen}
					onClose={() => setFirstOpen(false)}
					title="First Dialog"
					width={350}
				>
					<div>
						<p>This is the first dialog.</p>
						<p>Click the button to open another dialog on top.</p>
						<div style={{ marginTop: '16px' }}>
							<Button onClick={() => setSecondOpen(true)}>Open Second Dialog</Button>
						</div>
					</div>
				</Dialog>
				<Dialog
					open={secondOpen}
					onClose={() => setSecondOpen(false)}
					title="Second Dialog"
					width={300}
					showControls={false}
				>
					<div style={{ textAlign: 'center' }}>
						<p>This dialog appears on top.</p>
						<div style={{ marginTop: '16px' }}>
							<Button variant="primary" onClick={() => setSecondOpen(false)}>
								Close
							</Button>
						</div>
					</div>
				</Dialog>
			</>
		);
	},
};
