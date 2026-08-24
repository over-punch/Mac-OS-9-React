// ImageWell Component Stories - Mac OS 9 UI Kit

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ImageWell } from './ImageWell';
import '../../styles/theme.css';

const meta = {
	title: 'Components/ImageWell',
	component: ImageWell,
	tags: ['autodocs'],
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component: `A sunken well holding a picture you can drop a new one into. A button first and a drop target second — a well that only accepts a drop is unusable by keyboard and by anyone who cannot drag.`,
			},
		},
	},
} satisfies Meta<typeof ImageWell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
	args: { label: 'Desktop picture', placeholder: 'Drop an image', onBrowse: () => {} },
};

export const WithImage: Story = {
	render: () => {
		// A 2x2 checkerboard, scaled up — the well renders pixel art crisply
		// rather than smoothing it.
		const src =
			'data:image/svg+xml;utf8,' +
			encodeURIComponent(
				'<svg xmlns="http://www.w3.org/2000/svg" width="2" height="2" shape-rendering="crispEdges">' +
					'<rect width="1" height="1" fill="%23336699"/><rect x="1" y="1" width="1" height="1" fill="%23336699"/>' +
					'<rect x="1" width="1" height="1" fill="%23ccccff"/><rect y="1" width="1" height="1" fill="%23ccccff"/></svg>'
			);
		return (
			<ImageWell
				label="Desktop picture"
				src={src}
				imageAlt="A blue and lavender checkerboard"
				onBrowse={() => {}}
			/>
		);
	},
};

/** Dropping reports the files; what you do with them stays yours. */
export const Interactive: Story = {
	render: () => {
		const [name, setName] = useState<string | null>(null);
		return (
			<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
				<ImageWell
					label="Desktop picture"
					placeholder="Drop an image"
					onBrowse={() => setName('(picker opened)')}
					onFiles={(files) => setName(files[0]?.name ?? null)}
				/>
				<span style={{ fontSize: 10 }}>{name ?? 'Nothing dropped yet'}</span>
			</div>
		);
	},
};

export const Disabled: Story = {
	args: { label: 'Desktop picture', placeholder: 'Drop an image', disabled: true },
};
