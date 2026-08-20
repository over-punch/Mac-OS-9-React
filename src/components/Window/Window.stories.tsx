// Window component stories

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Window } from './Window';
import { Button } from '../Button/Button';
import { TextField } from '../TextField/TextField';
import { Checkbox } from '../Checkbox/Checkbox';
import { WindowPosition } from '../../types';

const meta = {
	title: 'Components/Window',
	component: Window,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	argTypes: {
		active: {
			control: 'boolean',
			description: 'Whether window is active/focused',
		},
		width: {
			control: 'text',
			description: 'Window width',
		},
		height: {
			control: 'text',
			description: 'Window height',
		},
		showControls: {
			control: 'boolean',
			description: 'Whether to show window controls',
		},
		resizable: {
			control: 'boolean',
			description: 'Whether window has resize handle',
		},
	},
} satisfies Meta<typeof Window>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default window with title and content
 */
export const Default: Story = {
	args: {
		title: 'Untitled',
		children: (
			<div>
				<p>This is a classic Mac OS 9 window.</p>
				<p>It contains some content and has a title bar.</p>
			</div>
		),
	},
};

/**
 * Window with close button
 */
export const WithCloseButton: Story = {
	args: {
		title: 'Document',
		onClose: () => alert('Close clicked'),
		children: (
			<div>
				<p>This window has a close button.</p>
				<p>Click the X button to see the callback.</p>
			</div>
		),
	},
};

/**
 * Window with all controls
 */
export const WithAllControls: Story = {
	args: {
		title: 'My Document',
		onClose: () => alert('Close'),
		onMinimize: () => alert('Minimize'),
		onMaximize: () => alert('Maximize'),
		children: (
			<div>
				<p>This window has all three window controls:</p>
				<ul>
					<li>Close (X)</li>
					<li>Minimize (−)</li>
					<li>Maximize (□)</li>
				</ul>
			</div>
		),
	},
};

/**
 * Window without controls
 */
export const NoControls: Story = {
	args: {
		title: 'Alert',
		showControls: false,
		children: (
			<div>
				<p>This window has no controls in the title bar.</p>
				<p>Useful for dialogs or panels.</p>
			</div>
		),
	},
};

/**
 * Inactive window (unfocused)
 */
export const Inactive: Story = {
	args: {
		title: 'Background Window',
		active: false,
		onClose: () => alert('Close'),
		children: (
			<div>
				<p>This window is inactive (slightly dimmed).</p>
				<p>
					Toggle the <code>active</code> prop to see the difference.
				</p>
			</div>
		),
	},
};

/**
 * Window with custom size
 */
export const CustomSize: Story = {
	args: {
		title: 'Custom Window',
		width: 500,
		height: 300,
		onClose: () => alert('Close'),
		children: (
			<div>
				<p>This window has custom dimensions:</p>
				<p>Width: 500px</p>
				<p>Height: 300px</p>
			</div>
		),
	},
};

/**
 * Narrow window
 */
export const Narrow: Story = {
	args: {
		title: 'Narrow Window',
		width: 250,
		onClose: () => alert('Close'),
		children: (
			<div>
				<p>This is a narrow window.</p>
				<p>The title truncates if it’s too long for the space available.</p>
			</div>
		),
	},
};

/**
 * Wide window
 */
export const Wide: Story = {
	args: {
		title: 'Wide Window',
		width: 800,
		height: 400,
		onClose: () => alert('Close'),
		children: (
			<div>
				<p>This is a wide window with plenty of horizontal space.</p>
				<p>Great for displaying multiple columns or wide content.</p>
			</div>
		),
	},
};

/**
 * Window with form controls
 */
export const WithFormControls: Story = {
	args: {
		title: 'Preferences',
		width: 400,
		onClose: () => alert('Close'),
		children: (
			<div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
				<TextField label="Name" defaultValue="User" />
				<TextField label="Email" defaultValue="user@example.com" />
				<Checkbox label="Enable notifications" defaultChecked />
				<Checkbox label="Auto-save documents" />
				<div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
					<Button variant="primary">Save</Button>
					<Button>Cancel</Button>
				</div>
			</div>
		),
	},
};

/**
 * Window with lots of content (scrollable)
 */
export const ScrollableContent: Story = {
	args: {
		title: 'Long Document',
		width: 400,
		height: 300,
		onClose: () => alert('Close'),
		children: (
			<div>
				<h2>Lorem Ipsum</h2>
				<p>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt
					ut labore et dolore magna aliqua.
				</p>
				<p>
					Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
					commodo consequat.
				</p>
				<p>
					Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
					nulla pariatur.
				</p>
				<p>
					Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit
					anim id est laborum.
				</p>
				<p>
					Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque
					laudantium.
				</p>
				<p>
					Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae
					vitae dicta sunt explicabo.
				</p>
			</div>
		),
	},
};

/**
 * Window with resize handle
 * Click and drag the resize handle in the bottom-right corner to resize.
 */
export const Resizable: Story = {
	args: {
		title: 'Resizable Window',
		width: 400,
		height: 300,
		resizable: true,
		minWidth: 250,
		minHeight: 150,
		onClose: () => alert('Close'),
		children: (
			<div>
				<p>
					<strong>Try resizing this window!</strong>
				</p>
				<p>Click and drag the resize handle in the bottom-right corner (diagonal lines).</p>
				<p>Minimum size: 250x150px</p>
				<p>Resize dynamically updates the window dimensions.</p>
			</div>
		),
	},
};

/**
 * Resizable window with size constraints
 * Demonstrates min/max width and height constraints.
 */
export const ResizableWithConstraints: Story = {
	args: {
		children: <></>,
	},
	render: () => {
		const [size, setSize] = useState({ width: 400, height: 300 });

		return (
			<div>
				<div
					style={{
						marginBottom: '16px',
						padding: '12px',
						background: '#f5f5f5',
						borderRadius: '4px',
					}}
				>
					<p style={{ marginBottom: '8px' }}>
						<strong>Current Size:</strong> {size.width}px × {size.height}px
					</p>
					<p style={{ fontSize: '12px', color: '#666' }}>Min: 300×200px | Max: 600×500px</p>
				</div>
				<Window
					title="Constrained Resize"
					width={size.width}
					height={size.height}
					resizable={true}
					minWidth={300}
					minHeight={200}
					maxWidth={600}
					maxHeight={500}
					onResize={setSize}
					onClose={() => alert('Close')}
				>
					<div>
						<p>
							<strong>This window has size constraints.</strong>
						</p>
						<p>Try resizing beyond the min/max bounds - it won’t go past them!</p>
						<p>The parent component tracks the size via onResize callback.</p>
					</div>
				</Window>
			</div>
		);
	},
};

/**
 * Draggable and resizable window
 * Combines both drag and resize functionality.
 */
export const DraggableAndResizable: Story = {
	args: {
		children: <></>,
	},
	render: () => (
		<div
			style={{ position: 'relative', width: '900px', height: '600px', border: '1px dashed #ccc' }}
		>
			<Window
				title="Drag & Resize Me"
				width={400}
				height={300}
				draggable={true}
				resizable={true}
				defaultPosition={{ x: 50, y: 50 }}
				minWidth={250}
				minHeight={150}
				onClose={() => alert('Close')}
			>
				<div>
					<p>
						<strong>This window is both draggable AND resizable!</strong>
					</p>
					<p>Drag it by the title bar to move it around.</p>
					<p>Drag the bottom-right corner to resize it.</p>
					<p>Just like a real Mac OS 9 window!</p>
				</div>
			</Window>
		</div>
	),
};

/**
 * Simple alert-style window
 */
export const Alert: Story = {
	args: {
		title: 'Alert',
		width: 350,
		showControls: false,
		children: (
			<div style={{ textAlign: 'center' }}>
				<p style={{ marginBottom: '24px' }}>Are you sure you want to quit without saving?</p>
				<div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
					<Button variant="primary">Don’t Save</Button>
					<Button>Cancel</Button>
					<Button>Save</Button>
				</div>
			</div>
		),
	},
};

/**
 * Window without title
 */
export const NoTitle: Story = {
	args: {
		children: (
			<div>
				<p>This window has no title bar.</p>
				<p>Good for custom layouts or embedded panels.</p>
			</div>
		),
	},
};

/**
 * Multiple windows stacked (active vs inactive)
 */
export const MultipleWindows: Story = {
	args: {
		children: <></>,
	},
	render: () => (
		<div style={{ position: 'relative', width: '600px', height: '400px' }}>
			<div style={{ position: 'absolute', top: '50px', left: '50px' }}>
				<Window title="Background Window" width={300} height={200} active={false}>
					<p>This window is in the background.</p>
				</Window>
			</div>
			<div style={{ position: 'absolute', top: '100px', left: '150px' }}>
				<Window
					title="Active Window"
					width={300}
					height={200}
					active={true}
					onClose={() => alert('Close')}
				>
					<p>This window is active and in front.</p>
				</Window>
			</div>
		</div>
	),
};

/**
 * Draggable window (uncontrolled)
 * Click and drag the title bar to move the window around.
 * The window stays in normal flow until you first drag it.
 */
export const Draggable: Story = {
	args: {
		children: <></>,
	},
	render: () => (
		<div
			style={{ position: 'relative', width: '800px', height: '600px', border: '1px dashed #ccc' }}
		>
			<p
				style={{ position: 'absolute', top: '10px', left: '10px', color: '#666', fontSize: '12px' }}
			>
				Container area - drag the window by its title bar
			</p>
			<Window
				title="Draggable Window"
				width={400}
				height={250}
				draggable={true}
				onClose={() => alert('Close')}
			>
				<div>
					<p>
						<strong>Try dragging this window!</strong>
					</p>
					<p>Click and hold the title bar, then move your mouse to drag.</p>
					<p>
						The window starts in normal document flow but becomes absolutely positioned once you
						drag it.
					</p>
					<p style={{ marginTop: '16px', fontSize: '12px', color: '#666' }}>
						Notice the grab cursor when hovering over the title bar.
					</p>
				</div>
			</Window>
		</div>
	),
};

/**
 * Draggable window with initial position
 * Window is positioned absolutely from the start.
 */
export const DraggableWithInitialPosition: Story = {
	args: {
		children: <></>,
	},
	render: () => (
		<div
			style={{ position: 'relative', width: '800px', height: '600px', border: '1px dashed #ccc' }}
		>
			<Window
				title="Positioned Window"
				width={350}
				height={200}
				draggable={true}
				defaultPosition={{ x: 100, y: 80 }}
				onClose={() => alert('Close')}
			>
				<div>
					<p>
						<strong>This window starts at a specific position.</strong>
					</p>
					<p>It’s absolutely positioned from the start at x:100, y:80.</p>
					<p>Drag it anywhere you like!</p>
				</div>
			</Window>
		</div>
	),
};

/**
 * Controlled draggable window
 * Demonstrates controlled position with state management.
 */
export const DraggableControlled: Story = {
	args: {
		children: <></>,
	},
	render: () => {
		const [position, setPosition] = useState<WindowPosition>({ x: 50, y: 50 });

		return (
			<div>
				<div
					style={{
						marginBottom: '16px',
						padding: '12px',
						background: '#f5f5f5',
						borderRadius: '4px',
					}}
				>
					<p style={{ marginBottom: '8px' }}>
						<strong>Controlled Position:</strong> x: {position.x}px, y: {position.y}px
					</p>
					<div style={{ display: 'flex', gap: '8px' }}>
						<Button onClick={() => setPosition({ x: 0, y: 0 })}>Top Left</Button>
						<Button onClick={() => setPosition({ x: 200, y: 100 })}>Center</Button>
						<Button onClick={() => setPosition({ x: 400, y: 50 })}>Right</Button>
					</div>
				</div>
				<div
					style={{
						position: 'relative',
						width: '800px',
						height: '500px',
						border: '1px dashed #ccc',
					}}
				>
					<Window
						title="Controlled Window"
						width={350}
						height={200}
						draggable={true}
						position={position}
						onPositionChange={setPosition}
						onClose={() => alert('Close')}
					>
						<div>
							<p>
								<strong>This window’s position is controlled.</strong>
							</p>
							<p>The parent component tracks and can change the position.</p>
							<p>Try the buttons above or drag the window!</p>
						</div>
					</Window>
				</div>
			</div>
		);
	},
};

/**
 * Multiple draggable windows
 * Demonstrates multiple windows that can be dragged independently.
 */
export const MultipleDraggableWindows: Story = {
	args: {
		children: <></>,
	},
	render: () => (
		<div
			style={{ position: 'relative', width: '900px', height: '600px', border: '1px dashed #ccc' }}
		>
			<Window
				title="Window 1"
				width={300}
				height={200}
				draggable={true}
				defaultPosition={{ x: 50, y: 50 }}
				onClose={() => alert('Close Window 1')}
			>
				<div>
					<p>
						<strong>Window 1</strong>
					</p>
					<p>Drag me around!</p>
				</div>
			</Window>
			<Window
				title="Window 2"
				width={300}
				height={200}
				draggable={true}
				defaultPosition={{ x: 250, y: 150 }}
				onClose={() => alert('Close Window 2')}
			>
				<div>
					<p>
						<strong>Window 2</strong>
					</p>
					<p>You can drag all windows independently.</p>
				</div>
			</Window>
			<Window
				title="Window 3"
				width={300}
				height={200}
				draggable={true}
				defaultPosition={{ x: 450, y: 100 }}
				onClose={() => alert('Close Window 3')}
			>
				<div>
					<p>
						<strong>Window 3</strong>
					</p>
					<p>Just like a real desktop!</p>
				</div>
			</Window>
		</div>
	),
};
