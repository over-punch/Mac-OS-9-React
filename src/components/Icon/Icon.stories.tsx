// Icon and IconLibrary Storybook stories - Mac OS 9 React UI

import type { Meta, StoryObj } from '@storybook/react';
import { Icon } from './Icon';
import { IconLibrary } from './IconLibrary';
import { DividerIcon } from './categories/ui';

/**
 * Icon component for displaying SVG icons with consistent sizing.
 *
 * ## Usage Patterns
 *
 * 1. **Direct Import** (Recommended for tree-shaking):
 * ```tsx
 * import { DividerIcon } from '@liiift-studio/mac-os9-ui';
 * <DividerIcon />
 * ```
 *
 * 2. **By Name** (Convenient for dynamic icons):
 * ```tsx
 * import { IconLibrary } from '@liiift-studio/mac-os9-ui';
 * <IconLibrary icon="divider" size="md" />
 * ```
 *
 * 3. **Custom SVG** (For one-off icons):
 * ```tsx
 * import { Icon } from '@liiift-studio/mac-os9-ui';
 * <Icon size="md" label="Custom" viewBox="0 0 10 32">
 *   <path d="..." />
 * </Icon>
 * ```
 */
const meta = {
	title: 'Components/Icon',
	component: Icon,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'Icon components for the Mac OS 9 UI library. Supports multiple sizes and custom viewBox dimensions.',
			},
		},
	},
	tags: ['autodocs'],
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Base Icon component with custom SVG content
 */
export const CustomIcon: Story = {
	args: {
		size: 'md',
		label: 'Home',
		children: <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />,
	},
};

/**
 * Divider icon - vertical separator for menu bars and toolbars
 */
export const Divider: Story = {
	render: () => (
		<div>
			<h3 style={{ marginBottom: '16px', fontFamily: 'Chicago, sans-serif' }}>Divider Icon</h3>
			<div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
				<div style={{ textAlign: 'center' }}>
					<DividerIcon />
					<div style={{ fontSize: '11px', marginTop: '4px' }}>Direct import</div>
				</div>
				<div style={{ textAlign: 'center' }}>
					<IconLibrary icon="divider" />
					<div style={{ fontSize: '11px', marginTop: '4px' }}>By name</div>
				</div>
			</div>
			<pre
				style={{
					marginTop: '16px',
					padding: '12px',
					background: '#f5f5f5',
					borderRadius: '4px',
					fontSize: '12px',
				}}
			>
				{`import { DividerIcon } from '@liiift-studio/mac-os9-ui';

<DividerIcon />

// or by name
<IconLibrary icon="divider" />`}
			</pre>
		</div>
	),
};

/**
 * Using the divider in a menu bar context
 */
export const InMenuBar: Story = {
	render: () => (
		<div>
			<h3 style={{ marginBottom: '16px', fontFamily: 'Chicago, sans-serif' }}>
				Divider in Menu Bar Context
			</h3>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: '8px',
					padding: '8px',
					background: '#e0e0e0',
					border: '1px solid #999',
				}}
			>
				<button style={{ padding: '4px 8px' }}>File</button>
				<DividerIcon />
				<button style={{ padding: '4px 8px' }}>Edit</button>
				<DividerIcon />
				<button style={{ padding: '4px 8px' }}>View</button>
			</div>
		</div>
	),
};

/**
 * All icon sizes (standard sizes, though divider has custom dimensions)
 */
export const Sizes: Story = {
	render: () => (
		<div>
			<h3 style={{ marginBottom: '16px', fontFamily: 'Chicago, sans-serif' }}>Icon Sizes</h3>
			<p style={{ fontSize: '12px', marginBottom: '16px', color: '#666' }}>
				Note: Divider uses a custom 10x32 viewBox, so sizes affect overall scale
			</p>
			<div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px' }}>
				<div style={{ textAlign: 'center' }}>
					<Icon label="Divider" size="xs" viewBox="0 0 10 32">
						<g clipPath="url(#clip0_xs)">
							<path d="M8 4H10V32H8V4Z" fill="#999999" />
							<path d="M8 0H10V4H8V0Z" fill="#999999" />
							<path d="M0 4H2V32H0V4Z" fill="white" />
							<path d="M0 0H2V4H0V0Z" fill="white" />
						</g>
						<defs>
							<clipPath id="clip0_xs">
								<rect width="10" height="32" fill="white" />
							</clipPath>
						</defs>
					</Icon>
					<div style={{ fontSize: '10px', marginTop: '4px' }}>xs</div>
				</div>
				<div style={{ textAlign: 'center' }}>
					<DividerIcon />
					<div style={{ fontSize: '10px', marginTop: '4px' }}>sm (default)</div>
				</div>
				<div style={{ textAlign: 'center' }}>
					<IconLibrary icon="divider" size="md" />
					<div style={{ fontSize: '10px', marginTop: '4px' }}>md</div>
				</div>
				<div style={{ textAlign: 'center' }}>
					<IconLibrary icon="divider" size="lg" />
					<div style={{ fontSize: '10px', marginTop: '4px' }}>lg</div>
				</div>
				<div style={{ textAlign: 'center' }}>
					<IconLibrary icon="divider" size="xl" />
					<div style={{ fontSize: '10px', marginTop: '4px' }}>xl</div>
				</div>
			</div>
		</div>
	),
};
