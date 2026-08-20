// Tabs Component Stories - Mac OS 9 UI Kit

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Tabs, TabPanel } from './Tabs';
import { FolderIcon, DiskIcon, PrintIcon } from '../Icon/categories';
import '../../styles/theme.css';

const meta = {
	title: 'Components/Tabs',
	component: Tabs,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'Classic Mac OS 9 style tabs with raised appearance when active. Supports keyboard navigation, icons, and controlled/uncontrolled modes.',
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		size: {
			control: 'select',
			options: ['sm', 'md', 'lg'],
			description: 'Size of the tabs',
		},
		fullWidth: {
			control: 'boolean',
			description: 'Whether tabs take full width',
		},
		defaultActiveTab: {
			control: 'number',
			description: 'Default active tab index (uncontrolled)',
		},
	},
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

// ========================================
// Basic Examples
// ========================================

export const Default: Story = {
	render: () => (
		<Tabs>
			<TabPanel label="General">
				<h3 style={{ margin: '0 0 12px 0', fontSize: '13px' }}>General Settings</h3>
				<p style={{ margin: 0, fontSize: '12px' }}>
					This is the general settings panel. Configure your basic preferences here.
				</p>
			</TabPanel>
			<TabPanel label="Advanced">
				<h3 style={{ margin: '0 0 12px 0', fontSize: '13px' }}>Advanced Settings</h3>
				<p style={{ margin: 0, fontSize: '12px' }}>
					Advanced configuration options for power users.
				</p>
			</TabPanel>
			<TabPanel label="About">
				<h3 style={{ margin: '0 0 12px 0', fontSize: '13px' }}>About</h3>
				<p style={{ margin: 0, fontSize: '12px' }}>Version 1.0.0</p>
			</TabPanel>
		</Tabs>
	),
};

export const WithIcons: Story = {
	render: () => (
		<Tabs>
			<TabPanel label="Files" icon={<FolderIcon />}>
				<h3 style={{ margin: '0 0 12px 0', fontSize: '13px' }}>Files</h3>
				<p style={{ margin: 0, fontSize: '12px' }}>Manage your files and folders.</p>
			</TabPanel>
			<TabPanel label="Save" icon={<DiskIcon />}>
				<h3 style={{ margin: '0 0 12px 0', fontSize: '13px' }}>Save Options</h3>
				<p style={{ margin: 0, fontSize: '12px' }}>Configure auto-save and backup settings.</p>
			</TabPanel>
			<TabPanel label="Print" icon={<PrintIcon />}>
				<h3 style={{ margin: '0 0 12px 0', fontSize: '13px' }}>Print Settings</h3>
				<p style={{ margin: 0, fontSize: '12px' }}>Printer configuration and page setup.</p>
			</TabPanel>
		</Tabs>
	),
	parameters: {
		docs: {
			description: {
				story: 'Tabs with icons for visual identification',
			},
		},
	},
};

// ========================================
// Size Variants
// ========================================

export const Small: Story = {
	render: () => (
		<Tabs size="sm">
			<TabPanel label="Tab 1">
				<p style={{ margin: 0, fontSize: '11px' }}>Small tab content</p>
			</TabPanel>
			<TabPanel label="Tab 2">
				<p style={{ margin: 0, fontSize: '11px' }}>Second tab</p>
			</TabPanel>
			<TabPanel label="Tab 3">
				<p style={{ margin: 0, fontSize: '11px' }}>Third tab</p>
			</TabPanel>
		</Tabs>
	),
};

export const Medium: Story = {
	render: () => (
		<Tabs size="md">
			<TabPanel label="Tab 1">
				<p style={{ margin: 0, fontSize: '12px' }}>Medium tab content</p>
			</TabPanel>
			<TabPanel label="Tab 2">
				<p style={{ margin: 0, fontSize: '12px' }}>Second tab</p>
			</TabPanel>
			<TabPanel label="Tab 3">
				<p style={{ margin: 0, fontSize: '12px' }}>Third tab</p>
			</TabPanel>
		</Tabs>
	),
};

export const Large: Story = {
	render: () => (
		<Tabs size="lg">
			<TabPanel label="Tab 1">
				<p style={{ margin: 0, fontSize: '13px' }}>Large tab content</p>
			</TabPanel>
			<TabPanel label="Tab 2">
				<p style={{ margin: 0, fontSize: '13px' }}>Second tab</p>
			</TabPanel>
			<TabPanel label="Tab 3">
				<p style={{ margin: 0, fontSize: '13px' }}>Third tab</p>
			</TabPanel>
		</Tabs>
	),
};

// ========================================
// Full Width
// ========================================

export const FullWidth: Story = {
	render: () => (
		<Tabs fullWidth>
			<TabPanel label="Overview">
				<p style={{ margin: 0 }}>Overview content with full-width tabs</p>
			</TabPanel>
			<TabPanel label="Details">
				<p style={{ margin: 0 }}>Detailed information</p>
			</TabPanel>
			<TabPanel label="Settings">
				<p style={{ margin: 0 }}>Configuration settings</p>
			</TabPanel>
		</Tabs>
	),
	parameters: {
		docs: {
			description: {
				story: 'Tabs that take up the full width of their container',
			},
		},
	},
};

// ========================================
// Disabled Tabs
// ========================================

export const WithDisabledTab: Story = {
	render: () => (
		<Tabs>
			<TabPanel label="Enabled">
				<p style={{ margin: 0 }}>This tab is enabled</p>
			</TabPanel>
			<TabPanel label="Disabled" disabled>
				<p style={{ margin: 0 }}>This content should not be accessible</p>
			</TabPanel>
			<TabPanel label="Also Enabled">
				<p style={{ margin: 0 }}>Another enabled tab</p>
			</TabPanel>
		</Tabs>
	),
	parameters: {
		docs: {
			description: {
				story: 'Tabs can be disabled to prevent interaction',
			},
		},
	},
};

// ========================================
// Controlled Tabs
// ========================================

export const Controlled: Story = {
	render: () => {
		const [activeTab, setActiveTab] = React.useState(0);
		return (
			<div>
				<div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
					<button onClick={() => setActiveTab(0)} style={{ padding: '4px 8px', fontSize: '11px' }}>
						Go to Tab 1
					</button>
					<button onClick={() => setActiveTab(1)} style={{ padding: '4px 8px', fontSize: '11px' }}>
						Go to Tab 2
					</button>
					<button onClick={() => setActiveTab(2)} style={{ padding: '4px 8px', fontSize: '11px' }}>
						Go to Tab 3
					</button>
				</div>
				<Tabs activeTab={activeTab} onChange={setActiveTab}>
					<TabPanel label="Tab 1" value="tab1">
						<p style={{ margin: 0 }}>First tab content (controlled)</p>
					</TabPanel>
					<TabPanel label="Tab 2" value="tab2">
						<p style={{ margin: 0 }}>Second tab content (controlled)</p>
					</TabPanel>
					<TabPanel label="Tab 3" value="tab3">
						<p style={{ margin: 0 }}>Third tab content (controlled)</p>
					</TabPanel>
				</Tabs>
				<p style={{ marginTop: '12px', fontSize: '11px' }}>Active tab index: {activeTab}</p>
			</div>
		);
	},
	parameters: {
		docs: {
			description: {
				story: 'Controlled tabs with external state management',
			},
		},
	},
};

// ========================================
// Real-World Examples
// ========================================

export const SystemPreferences: Story = {
	render: () => (
		<div style={{ maxWidth: '600px' }}>
			<Tabs>
				<TabPanel label="General">
					<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
						<h3 style={{ margin: 0, fontSize: '13px' }}>General Preferences</h3>
						<label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
							<input type="checkbox" defaultChecked />
							Show hidden files
						</label>
						<label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
							<input type="checkbox" />
							Play sound effects
						</label>
						<label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
							<input type="checkbox" defaultChecked />
							Auto-save documents
						</label>
					</div>
				</TabPanel>
				<TabPanel label="Appearance">
					<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
						<h3 style={{ margin: 0, fontSize: '13px' }}>Appearance</h3>
						<label style={{ fontSize: '12px' }}>
							Theme:
							<select style={{ marginLeft: '8px', padding: '2px 4px' }}>
								<option>Classic</option>
								<option>High Contrast</option>
							</select>
						</label>
						<label style={{ fontSize: '12px' }}>
							Font Size:
							<select style={{ marginLeft: '8px', padding: '2px 4px' }}>
								<option>Small</option>
								<option>Medium</option>
								<option>Large</option>
							</select>
						</label>
					</div>
				</TabPanel>
				<TabPanel label="Network">
					<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
						<h3 style={{ margin: 0, fontSize: '13px' }}>Network Settings</h3>
						<p style={{ margin: 0, fontSize: '12px' }}>Configure network preferences</p>
					</div>
				</TabPanel>
			</Tabs>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'System preferences dialog (classic Mac OS 9 pattern)',
			},
		},
	},
};

export const DocumentProperties: Story = {
	render: () => (
		<div style={{ maxWidth: '500px' }}>
			<Tabs size="sm">
				<TabPanel label="Info">
					<table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
						<tbody>
							<tr>
								<td style={{ padding: '4px', fontWeight: 'bold' }}>Name:</td>
								<td style={{ padding: '4px' }}>Document.txt</td>
							</tr>
							<tr>
								<td style={{ padding: '4px', fontWeight: 'bold' }}>Kind:</td>
								<td style={{ padding: '4px' }}>Text Document</td>
							</tr>
							<tr>
								<td style={{ padding: '4px', fontWeight: 'bold' }}>Size:</td>
								<td style={{ padding: '4px' }}>2.4 KB</td>
							</tr>
							<tr>
								<td style={{ padding: '4px', fontWeight: 'bold' }}>Created:</td>
								<td style={{ padding: '4px' }}>Jan 8, 2026</td>
							</tr>
						</tbody>
					</table>
				</TabPanel>
				<TabPanel label="Sharing">
					<div style={{ fontSize: '11px' }}>
						<p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>Permissions:</p>
						<label style={{ display: 'block', margin: '4px 0' }}>
							<input type="checkbox" defaultChecked /> Everyone can read
						</label>
						<label style={{ display: 'block', margin: '4px 0' }}>
							<input type="checkbox" /> Everyone can write
						</label>
					</div>
				</TabPanel>
				<TabPanel label="Preview">
					<div style={{ fontSize: '11px', fontFamily: 'monospace', padding: '8px', backgroundColor: '#fff' }}>
						This is a preview of the document content...
					</div>
				</TabPanel>
			</Tabs>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Document info/properties panel',
			},
		},
	},
};

export const InstallerWizard: Story = {
	render: () => {
		const [currentStep, setCurrentStep] = React.useState(0);
		return (
			<div style={{ maxWidth: '600px' }}>
				<Tabs activeTab={currentStep} onChange={setCurrentStep}>
					<TabPanel label="Welcome">
						<div>
							<h2 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Welcome to Setup Wizard</h2>
							<p style={{ margin: '0 0 16px 0', fontSize: '12px' }}>
								This wizard will guide you through the installation process.
							</p>
							<button
								onClick={() => setCurrentStep(1)}
								style={{ padding: '6px 16px', fontSize: '12px', cursor: 'pointer' }}
							>
								Continue
							</button>
						</div>
					</TabPanel>
					<TabPanel label="License">
						<div>
							<h3 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>License Agreement</h3>
							<div
								style={{
									padding: '12px',
									border: '1px solid #262626',
									height: '150px',
									overflow: 'auto',
									fontSize: '11px',
									marginBottom: '16px',
								}}
							>
								<p>END USER LICENSE AGREEMENT...</p>
								<p>By installing this software, you agree to...</p>
							</div>
							<label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
								<input type="checkbox" />I accept the terms
							</label>
						</div>
					</TabPanel>
					<TabPanel label="Install">
						<div>
							<h3 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>Installation</h3>
							<p style={{ margin: '0 0 16px 0', fontSize: '12px' }}>Ready to install. Click Install to begin.</p>
							<button style={{ padding: '6px 16px', fontSize: '12px', cursor: 'pointer' }}>Install</button>
						</div>
					</TabPanel>
					<TabPanel label="Finish">
						<div>
							<h3 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>Installation Complete!</h3>
							<p style={{ margin: 0, fontSize: '12px' }}>The software has been successfully installed.</p>
						</div>
					</TabPanel>
				</Tabs>
			</div>
		);
	},
	parameters: {
		docs: {
			description: {
				story: 'Multi-step installation wizard',
			},
		},
	},
};

// ========================================
// Accessibility Testing
// ========================================

export const KeyboardNavigation: Story = {
	render: () => (
		<div>
			<p style={{ fontSize: '11px', marginBottom: '16px' }}>
				Use Arrow keys to navigate between tabs, Home/End for first/last tab
			</p>
			<Tabs>
				<TabPanel label="First Tab">
					<p style={{ margin: 0 }}>Navigate with keyboard arrow keys</p>
				</TabPanel>
				<TabPanel label="Second Tab">
					<p style={{ margin: 0 }}>Press Left/Right arrows to switch tabs</p>
				</TabPanel>
				<TabPanel label="Third Tab">
					<p style={{ margin: 0 }}>Press Home to go to first, End to go to last</p>
				</TabPanel>
				<TabPanel label="Fourth Tab (Disabled)" disabled>
					<p style={{ margin: 0 }}>This tab is skipped during keyboard navigation</p>
				</TabPanel>
				<TabPanel label="Fifth Tab">
					<p style={{ margin: 0 }}>Last tab (accessible)</p>
				</TabPanel>
			</Tabs>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Test keyboard navigation with arrow keys, Home, and End',
			},
		},
	},
};

// ========================================
// Interactive Playground
// ========================================

export const Playground: Story = {
	render: () => (
		<Tabs size="md" fullWidth={false}>
			<TabPanel label="Tab 1">
				<p>Content for tab 1</p>
			</TabPanel>
			<TabPanel label="Tab 2">
				<p>Content for tab 2</p>
			</TabPanel>
			<TabPanel label="Tab 3">
				<p>Content for tab 3</p>
			</TabPanel>
		</Tabs>
	),
};