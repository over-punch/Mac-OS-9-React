// ListView component stories - showcasing classes and render props

import type { Meta, StoryObj } from '@storybook/react';
import { ListView } from './ListView';
import { Button } from '../Button/Button';
import React, { useState } from 'react';

const meta: Meta<typeof ListView> = {
	title: 'Components/ListView',
	component: ListView,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ListView>;

const sampleItems = [
	{ id: '1', name: 'Document.txt', modified: 'Today, 2:30 PM', size: '2 KB', type: 'file' },
	{ id: '2', name: 'Images', modified: 'Yesterday', size: '--', type: 'folder' },
	{ id: '3', name: 'Report.pdf', modified: 'Jan 15, 2026', size: '1.2 MB', type: 'file' },
	{ id: '4', name: 'Music', modified: 'Jan 10, 2026', size: '--', type: 'folder' },
	{ id: '5', name: 'Notes.doc', modified: 'Jan 5, 2026', size: '45 KB', type: 'file' },
];

const defaultColumns = [
	{ key: 'name', label: 'Name', width: '40%' },
	{ key: 'modified', label: 'Date Modified', width: '35%' },
	{ key: 'size', label: 'Size', width: '25%'},
];

/**
 * Basic ListView with default styling
 */
export const Default: Story = {
	args: {
		columns: defaultColumns,
		items: sampleItems,
		height: 300,
	},
};

/**
 * ListView with item selection
 */
export const WithSelection: Story = {
	render: () => {
		const [selectedIds, setSelectedIds] = useState<string[]>(['1']);
		
		return (
			<div>
				<p style={{ marginBottom: '1rem', fontFamily: 'var(--font-system)' }}>
					Selected: {selectedIds.join(', ') || 'none'}
				</p>
				<ListView
					columns={defaultColumns}
					items={sampleItems}
					selectedIds={selectedIds}
					onSelectionChange={setSelectedIds}
					height={300}
				/>
			</div>
		);
	},
};

/**
 * ListView with custom classes for styling
 */
export const WithCustomClasses: Story = {
	render: () => {
		const [selectedIds, setSelectedIds] = useState<string[]>([]);
		
		return (
			<div>
				<style>{`
					.custom-list-root {
						border: 2px solid #0000AA;
					}
					
					.custom-header {
						background: linear-gradient(180deg, #0000AA 0%, #0000CC 100%);
					}
					
					.custom-header-cell {
						color: white;
						font-weight: bold;
					}
					
					.custom-row:hover {
						background: #E0E0FF !important;
					}
					
					.custom-cell[data-column="name"] {
						font-weight: bold;
						color: #0000AA;
					}
				`}</style>
				
				<ListView
					columns={defaultColumns}
					items={sampleItems}
					selectedIds={selectedIds}
					onSelectionChange={setSelectedIds}
					height={300}
					classes={{
						root: 'custom-list-root',
						header: 'custom-header',
						headerCell: 'custom-header-cell',
						row: 'custom-row',
						cell: 'custom-cell',
					}}
				/>
			</div>
		);
	},
};

/**
 * ListView with cell-level interactions
 */
export const WithCellInteractions: Story = {
	render: () => {
		const [selectedIds, setSelectedIds] = useState<string[]>([]);
		const [lastClicked, setLastClicked] = useState<string>('');
		
		return (
			<div>
				<p style={{ marginBottom: '1rem', fontFamily: 'var(--font-system)' }}>
					Last clicked: {lastClicked || 'none'}
				</p>
				<ListView
					columns={defaultColumns}
					items={sampleItems}
					selectedIds={selectedIds}
					onSelectionChange={setSelectedIds}
					height={300}
					onCellClick={(item, column) => {
						setLastClicked(`${item.name} - ${column.label}`);
					}}
					onCellMouseEnter={(item, column) => {
						console.log('Cell hover:', item.name, column.key);
					}}
				/>
			</div>
		);
	},
};

/**
 * ListView with custom cell rendering (action buttons)
 */
export const WithCustomCellRendering: Story = {
	render: () => {
		const [selectedIds, setSelectedIds] = useState<string[]>([]);
		const [log, setLog] = useState<string[]>([]);
		
		const addLog = (message: string) => {
			setLog(prev => [...prev.slice(-2), message]);
		};
		
		// Add actions column
		const columns = [
			...defaultColumns,
			{ key: 'actions', label: 'Actions', width: '20%' },
		];
		
		return (
			<div>
				<div style={{ marginBottom: '1rem', fontFamily: 'var(--font-system)', minHeight: '40px' }}>
					{log.map((msg, i) => (
						<div key={i}>{msg}</div>
					))}
				</div>
				<ListView
					columns={columns}
					items={sampleItems}
					selectedIds={selectedIds}
					onSelectionChange={setSelectedIds}
					height={300}
					renderCell={(value, item, column, _state) => {
						if (column.key === 'actions') {
							return (
								<div style={{ display: 'flex', gap: '4px' }}>
									<Button 
										size="sm" 
										onClick={(e) => {
											e.stopPropagation();
											addLog(`Edit: ${item.name}`);
										}}
									>
										Edit
									</Button>
									<Button 
										size="sm" 
										variant="danger"
										onClick={(e) => {
											e.stopPropagation();
											addLog(`Delete: ${item.name}`);
										}}
									>
										Del
									</Button>
								</div>
							);
						}
						
						// Default rendering for other cells
						return value;
					}}
				/>
			</div>
		);
	},
};

/**
 * ListView with custom header rendering
 */
export const WithCustomHeaderRendering: Story = {
	render: () => {
		const [selectedIds, setSelectedIds] = useState<string[]>([]);
		const [sortColumn, setSortColumn] = useState<string>('');
		const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
		
		return (
			<div>
				<p style={{ marginBottom: '1rem', fontFamily: 'var(--font-system)' }}>
					Sort: {sortColumn ? `${sortColumn} (${sortDirection})` : 'none'}
				</p>
				<ListView
					columns={defaultColumns}
					items={sampleItems}
					selectedIds={selectedIds}
					onSelectionChange={setSelectedIds}
					height={300}
					onSort={(column, direction) => {
						setSortColumn(column);
						setSortDirection(direction);
					}}
					renderHeaderCell={(column, _state, defaultProps) => {
						return (
							<div {...defaultProps}>
								<span style={{ marginRight: '4px' }}>📋</span>
								{column.label}
								{state.isSorted && (
									<span style={{ marginLeft: '4px', fontSize: '10px' }}>
										{state.sortDirection === 'asc' ? '⬆️' : '⬇️'}
									</span>
								)}
							</div>
						);
					}}
				/>
			</div>
		);
	},
};

/**
 * ListView with custom row rendering
 */
export const WithCustomRowRendering: Story = {
	render: () => {
		const [selectedIds, setSelectedIds] = useState<string[]>([]);
		
		return (
			<div>
				<ListView
					columns={defaultColumns}
					items={sampleItems}
					selectedIds={selectedIds}
					onSelectionChange={setSelectedIds}
					height={300}
					renderRow={(item, _state, defaultProps) => {
						// Custom row with hover effect and type-based styling
						const isFolder = item.type === 'folder';
						
						return (
							<div 
								{...defaultProps}
								style={{
									background: state.isSelected 
										? '#0000AA' 
										: state.isHovered 
											? isFolder ? '#FFF8DC' : '#E6F2FF'
											: 'transparent',
									color: state.isSelected ? 'white' : 'black',
									fontWeight: isFolder ? 'bold' : 'normal',
									borderLeft: isFolder ? '3px solid #DAA520' : 'none',
								}}
							>
								<div style={{ padding: '4px 8px', display: 'flex', gap: '8px' }}>
									<span>{isFolder ? '📁' : '📄'}</span>
									<span style={{ flex: 1 }}>{item.name}</span>
									<span style={{ color: state.isSelected ? '#DDD' : '#666', fontSize: '0.9em' }}>
										{item.modified}
									</span>
									<span style={{ color: state.isSelected ? '#DDD' : '#666', fontSize: '0.9em', minWidth: '60px', textAlign: 'right' }}>
										{item.size}
									</span>
								</div>
							</div>
						);
					}}
				/>
			</div>
		);
	},
};

/**
 * ListView with data attribute targeting (CSS only)
 */
export const WithDataAttributes: Story = {
	render: () => {
		const [selectedIds, setSelectedIds] = useState<string[]>([]);
		
		return (
			<div>
				<style>{`
					/* Target specific columns via data attributes */
					.data-attr-example [data-column="name"] {
						font-weight: bold;
					}
					
					.data-attr-example [data-column="size"] {
						text-align: right;
						font-family: monospace;
					}
					
					/* Style selected rows */
					.data-attr-example [data-selected="true"] {
						background: #000080;
						color: white;
					}
					
					/* Hover effects on cells */
					.data-attr-example [data-column="name"]:hover {
						text-decoration: underline;
						cursor: pointer;
					}
				`}</style>
				
				<ListView
					className="data-attr-example"
					columns={defaultColumns}
					items={sampleItems}
					selectedIds={selectedIds}
					onSelectionChange={setSelectedIds}
					height={300}
				/>
			</div>
		);
	},
};

/**
 * Complete example with all features combined
 */
export const CompleteExample: Story = {
	render: () => {
		const [selectedIds, setSelectedIds] = useState<string[]>([]);
		const [messages, setMessages] = useState<string[]>([]);
		
		const addMessage = (msg: string) => {
			setMessages(prev => [...prev.slice(-3), msg]);
		};
		
		const columns = [
			{ key: 'name', label: 'Name', width: '35%' },
			{ key: 'modified', label: 'Modified', width: '30%' },
			{ key: 'size', label: 'Size', width: '20%' },
			{ key: 'actions', label: '', width: '15%' },
		];
		
		return (
			<div style={{ width: '600px' }}>
				<style>{`
					.complete-example [data-column="name"] {
						font-weight: 500;
					}
					
					.complete-example .custom-cell:hover {
						background: rgba(0, 0, 170, 0.05);
					}
				`}</style>
				
				<div style={{ 
					marginBottom: '1rem', 
					fontFamily: 'var(--font-system)',
					minHeight: '60px',
					padding: '8px',
					background: '#F0F0F0',
					border: '1px solid #999',
				}}>
					<strong>Activity Log:</strong>
					{messages.map((msg, i) => (
						<div key={i} style={{ fontSize: '0.9em' }}>{msg}</div>
					))}
				</div>
				
				<ListView
					className="complete-example"
					columns={columns}
					items={sampleItems}
					selectedIds={selectedIds}
					onSelectionChange={setSelectedIds}
					height={300}
					classes={{
						cell: 'custom-cell',
					}}
					onItemMouseEnter={(item) => addMessage(`Hovering: ${item.name}`)}
					onCellClick={(item, column) => {
						if (column.key !== 'actions') {
							addMessage(`Clicked: ${item.name} - ${column.label}`);
						}
					}}
					renderCell={(value, item, column, _state) => {
						if (column.key === 'actions') {
							return (
								<Button 
									size="sm"
									onClick={(e) => {
										e.stopPropagation();
										addMessage(`Action on: ${item.name}`);
									}}
								>
									•••
								</Button>
							);
						}
						
						if (column.key === 'name') {
							const icon = item.type === 'folder' ? '📁' : '📄';
							return (
								<span>
									<span style={{ marginRight: '6px' }}>{icon}</span>
									{value}
								</span>
							);
						}
						
						return value;
					}}
				/>
			</div>
		);
	},
};
