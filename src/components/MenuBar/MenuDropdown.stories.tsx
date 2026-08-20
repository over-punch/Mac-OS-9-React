import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { MenuDropdown } from './MenuDropdown';
import { MenuItem } from './MenuItem';
import { MenuBar } from './MenuBar';

const meta: Meta<typeof MenuDropdown> = {
	title: 'Components/MenuDropdown',
	component: MenuDropdown,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<div style={{ height: '200px' }}>
			<MenuDropdown
				label="Options"
				items={
					<>
						<MenuItem label="Settings..." onClick={() => alert('Settings')} />
						<MenuItem label="Preferences..." onClick={() => alert('Preferences')} />
						<MenuItem separator label="Logout" />
						<MenuItem label="Logout" onClick={() => alert('Logout')} />
					</>
				}
			/>
		</div>
	),
};

export const WithIcon: Story = {
	render: () => (
		<div style={{ height: '200px' }}>
			<MenuDropdown
				label={<div style={{ fontWeight: 'bold', fontSize: '12px' }}>Finder</div>}
				items={
					<>
						<MenuItem label="About Finder" onClick={() => {}} />
						<MenuItem separator label="Hide Finder" />
						<MenuItem label="Hide Finder" onClick={() => {}} />
						<MenuItem label="Hide Others" onClick={() => {}} />
						<MenuItem label="Show All" onClick={() => {}} />
					</>
				}
			/>
		</div>
	),
};

export const RightAligned: Story = {
	render: () => (
		<div
			style={{
				height: '200px',
				width: '300px',
				display: 'flex',
				justifyContent: 'flex-end',
				background: '#eee',
				padding: '10px',
			}}
		>
			<MenuDropdown
				align="right"
				label="Right Menu"
				items={
					<>
						<MenuItem label="Item 1" onClick={() => {}} />
						<MenuItem label="Item 2" onClick={() => {}} />
						<MenuItem label="Very Long Item Name" onClick={() => {}} />
					</>
				}
			/>
		</div>
	),
};

export const InsideMenuBar: Story = {
	render: () => (
		<div style={{ minHeight: '200px', width: '100%' }}>
			<MenuBar
				menus={[
					{
						label: 'File',
						items: (
							<>
								<MenuItem label="New" onClick={() => {}} />
								<MenuItem label="Open..." onClick={() => {}} />
							</>
						),
					},
				]}
				rightContent={[
					<MenuDropdown
						key="user"
						align="right"
						label="User"
						items={
							<>
								<MenuItem label="Profile" onClick={() => {}} />
								<MenuItem label="Settings" onClick={() => {}} />
								<MenuItem separator label="Sign Out" />
								<MenuItem label="Sign Out" onClick={() => {}} />
							</>
						}
					/>,
				]}
			/>
		</div>
	),
};
