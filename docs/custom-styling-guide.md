# Custom Styling and Element Targeting Guide

This guide explains how to customize and target sub-elements within Mac OS 9 UI components using the new `classes` prop, render props, and data attributes.

## Table of Contents

- [Styling Setup](#styling-setup)
- [Overview](#overview)
- [Three Approaches](#three-approaches)
  - [1. Classes Prop (Simple Styling)](#1-classes-prop-simple-styling)
  - [2. Render Props (Advanced Control)](#2-render-props-advanced-control)
  - [3. Data Attributes (CSS-Only)](#3-data-attributes-css-only)
- [Component Support](#component-support)
- [Examples](#examples)
- [Migration Guide](#migration-guide)
- [Best Practices](#best-practices)

## Styling Setup

### Basic Styles (Required)

Import the component styles once in your application:

```tsx
import '@overpunch/mac-os9-ui/styles';
```

This includes:
- CSS custom properties (design tokens)
- Font declarations
- Component styles
- Utility classes

### Optional Global Styles

For the full Mac OS 9 experience with global HTML/body styles:

```tsx
import '@overpunch/mac-os9-ui/styles';  // Required
import '@overpunch/mac-os9-ui/base';    // Optional
```

The optional `base` styles include:
- Universal box-sizing reset
- Responsive typography on `<html>`
- Body margin, padding, font-family, and colors

**Important:** Only import `/base` if you want these global styles applied to your entire application. The library is designed to integrate cleanly without overriding your project's base styles.

---

## Overview

The Mac OS 9 UI library provides three complementary ways to customize components:

1. **`classes` prop** - Add custom CSS classes to specific sub-elements
2. **Render props** - Completely override how elements render
3. **Data attributes** - Target elements using CSS selectors without JavaScript

All approaches are fully backwards compatible and can be used together.

## Three Approaches

### 1. Classes Prop (Simple Styling)

The `classes` prop allows you to add custom CSS classes to specific sub-elements within a component.

#### Example: Styling ListView

```tsx
<ListView
	columns={columns}
	items={items}
	classes={{
		root: 'my-list',
		header: 'custom-header',
		headerCell: 'custom-header-cell',
		row: 'custom-row',
		cell: 'custom-cell',
	}}
/>
```

```css
.my-list {
	border: 2px solid blue;
}

.custom-header {
	background: linear-gradient(180deg, #0000AA 0%, #0000CC 100%);
}

.custom-header-cell {
	color: white;
	font-weight: bold;
}

.custom-row:hover {
	background: #E0E0FF;
}

.custom-cell[data-column="name"] {
	font-weight: bold;
}
```

#### Available Classes by Component

**ListView / FolderList:**
- `root` - Container element
- `header` - Header row
- `headerCell` - Individual header cells
- `body` - Scrollable body area
- `row` - Individual rows
- `cell` - Individual cells

**Window:**
- `root` - Window container
- `titleBar` - Title bar
- `titleText` - Title text
- `controls` - Control buttons container
- `controlButton` - Individual control buttons
- `content` - Content area

### 2. Render Props (Advanced Control)

Render props give you complete control over how elements render while maintaining accessibility and behavior.

#### Example: Custom Cell Rendering

```tsx
<ListView
	columns={columns}
	items={items}
	renderCell={(value, item, column, state) => {
		// Render action buttons in actions column
		if (column.key === 'actions') {
			return (
				<div style={{ display: 'flex', gap: '4px' }}>
					<Button size="sm" onClick={() => edit(item)}>
						Edit
					</Button>
					<Button size="sm" variant="danger" onClick={() => del(item)}>
						Delete
					</Button>
				</div>
			);
		}
		
		// Add icon to name column
		if (column.key === 'name') {
			const icon = item.type === 'folder' ? '📁' : '📄';
			return (
				<span>
					{icon} {value}
				</span>
			);
		}
		
		// Default rendering for other columns
		return value;
	}}
/>
```

#### Example: Custom Row Rendering

```tsx
<ListView
	columns={columns}
	items={items}
	renderRow={(item, state, defaultProps) => {
		const isFolder = item.type === 'folder';
		
		return (
			<div 
				{...defaultProps}
				style={{
					background: state.isSelected ? '#0000AA' : 
					           state.isHovered ? (isFolder ? '#FFF8DC' : '#E6F2FF') :
					           'transparent',
					color: state.isSelected ? 'white' : 'black',
					fontWeight: isFolder ? 'bold' : 'normal',
					borderLeft: isFolder ? '3px solid #DAA520' : 'none',
				}}
			>
				{/* Your custom row content */}
				<div style={{ padding: '4px 8px' }}>
					<span>{isFolder ? '📁' : '📄'}</span>
					<span>{item.name}</span>
				</div>
			</div>
		);
	}}
/>
```

#### Render Prop State

All render props receive state information:

**Row State (`RowRenderState`):**
- `isSelected: boolean` - Whether the row is selected
- `isHovered: boolean` - Whether the row is being hovered
- `index: number` - Row index in the list

**Cell State (`CellRenderState`):**
- `isHovered: boolean` - Whether the cell is being hovered
- `isRowSelected: boolean` - Whether the containing row is selected
- `columnIndex: number` - Column index
- `rowIndex: number` - Row index

**Header Cell State (`HeaderCellRenderState`):**
- `isSorted: boolean` - Whether this column is sorted
- `sortDirection?: 'asc' | 'desc'` - Current sort direction if sorted

#### Default Props Pattern

Row and header render props receive `defaultProps` that should be spread onto your custom element to maintain accessibility and behavior:

```tsx
renderRow={(item, state, defaultProps) => (
	<div {...defaultProps}>
		{/* Your content */}
	</div>
)}
```

These include:
- `className` - Merged classes (base + custom)
- Event handlers (`onClick`, `onMouseEnter`, etc.)
- Data attributes for CSS targeting
- ARIA attributes for accessibility

### 3. Data Attributes (CSS-Only)

All components automatically add semantic data attributes that can be targeted with CSS:

#### Example: Targeting with Data Attributes

```css
/* Target specific columns */
[data-column="name"] {
	font-weight: bold;
	color: #0000AA;
}

[data-column="size"] {
	text-align: right;
	font-family: monospace;
}

/* Target selected rows */
[data-selected="true"] {
	background: #000080;
	color: white;
}

/* Target sorted headers */
[data-sorted="true"] {
	background: #DDDDFF;
}

[data-sort-direction="asc"]::after {
	content: " ▲";
}

/* Hover effects */
[data-hovered="true"] {
	background: rgba(0, 0, 170, 0.1);
}
```

#### Available Data Attributes

**Rows:**
- `data-selected="true|false"` - Selection state
- `data-index="number"` - Row index
- `data-item-id="string"` - Item ID

**Cells:**
- `data-column="string"` - Column key
- `data-hovered="true"` - When cell is hovered

**Header Cells:**
- `data-column="string"` - Column key
- `data-sortable="true|false"` - Whether sortable
- `data-sorted="true"` - When column is sorted
- `data-sort-direction="asc|desc"` - Sort direction

## Component Support

### ListView

Supports all three approaches with comprehensive features:

- **Classes**: root, header, headerCell, body, row, cell
- **Render Props**: renderRow, renderCell, renderHeaderCell
- **Callbacks**: onCellClick, onCellMouseEnter, onCellMouseLeave
- **Data Attributes**: Automatically added to all elements

### FolderList

Passes through all ListView features plus Window styling:

- **Classes**: root, window, titleBar, listView, header, headerCell, body, row, cell
- **Render Props**: All ListView render props
- **Callbacks**: All ListView callbacks plus window-level events

### Window

Supports classes for all sub-elements:

- **Classes**: root, titleBar, titleText, controls, controlButton, content

## Examples

### Example 1: Simple Custom Styling

```tsx
<FolderList
	title="My Documents"
	items={items}
	classes={{
		header: 'folder-header',
		cell: 'folder-cell',
	}}
/>
```

```css
.folder-header {
	background: #4A90E2;
	color: white;
}

.folder-cell[data-column="name"] {
	font-weight: 600;
}
```

### Example 2: Interactive Cells

```tsx
<ListView
	columns={columns}
	items={items}
	onCellClick={(item, column, event) => {
		if (column.key === 'name') {
			navigate(`/item/${item.id}`);
		}
	}}
	onCellMouseEnter={(item, column) => {
		if (column.key === 'name') {
			setPreview(item);
		}
	}}
/>
```

### Example 3: Custom Actions Column

```tsx
const columns = [
	{ key: 'name', label: 'Name' },
	{ key: 'modified', label: 'Modified' },
	{ key: 'actions', label: 'Actions' },
];

<ListView
	columns={columns}
	items={items}
	renderCell={(value, item, column) => {
		if (column.key === 'actions') {
			return (
				<div style={{ display: 'flex', gap: '4px' }}>
					<IconButton onClick={() => edit(item.id)}>
						✏️
					</IconButton>
					<IconButton onClick={() => share(item.id)}>
						📤
					</IconButton>
				</div>
			);
		}
		return value;
	}}
/>
```

### Example 4: Type-Based Row Styling

```tsx
<ListView
	columns={columns}
	items={items}
	renderRow={(item, state, defaultProps) => (
		<div 
			{...defaultProps}
			style={{
				background: item.type === 'folder' ? '#FFF8DC' : 'white',
				fontWeight: item.type === 'folder' ? 'bold' : 'normal',
				borderLeft: item.priority === 'high' ? '3px solid red' : 'none',
			}}
		>
			{/* Default row content is automatically rendered */}
		</div>
	)}
/>
```

## Migration Guide

### From className to classes

**Before:**
```tsx
<ListView className="my-custom-list" />
```

**After:**
```tsx
<ListView 
	className="my-custom-list"  // Still works for root
	classes={{
		root: 'my-custom-list',  // New way to target root
		headerCell: 'my-header-cell',  // Can now target sub-elements
	}}
/>
```

### Adding Cell Interactions

**Before:**
```tsx
<ListView
	items={items}
	onItemMouseEnter={(item) => showPreview(item)}
/>
```

**After (more granular):**
```tsx
<ListView
	items={items}
	onItemMouseEnter={(item) => showPreview(item)}  // Still works
	onCellMouseEnter={(item, column) => {
		// Now know which cell
		if (column.key === 'name') {
			showPreview(item);
		}
	}}
	onCellClick={(item, column) => {
		// Handle cell clicks
		navigate(`/item/${item.id}`);
	}}
/>
```

### Custom Cell Content

**Before (limited):**
```tsx
const items = items.map(item => ({
	...item,
	name: <strong>{item.name}</strong>,  // Had to pre-render
}));
```

**After (flexible):**
```tsx
<ListView
	items={items}  // Use raw data
	renderCell={(value, item, column) => {
		if (column.key === 'name') {
			return <strong>{value}</strong>;
		}
		return value;
	}}
/>
```

## Best Practices

### 1. Choose the Right Approach

- **Use `classes`** for simple CSS customization
- **Use render props** when you need custom components or logic
- **Use data attributes** for CSS-only styling without JavaScript

### 2. Maintain Accessibility

When using render props, always spread `defaultProps`:

```tsx
renderRow={(item, state, defaultProps) => (
	<div {...defaultProps}>  {/* ✅ Maintains accessibility */}
		{/* Your content */}
	</div>
)}
```

### 3. Don't Fight the Defaults

Custom classes are merged with base classes, so you can enhance rather than replace:

```tsx
classes={{
	cell: 'my-cell',  // Adds to base .cell class
}}
```

### 4. Use State for Conditional Rendering

Take advantage of the state object in render props:

```tsx
renderCell={(value, item, column, state) => {
	if (state.isRowSelected) {
		return <strong>{value}</strong>;
	}
	return value;
}}
```

### 5. Stop Event Propagation for Nested Interactions

When adding buttons or interactive elements, prevent row selection:

```tsx
<Button onClick={(e) => {
	e.stopPropagation();  // ✅ Prevents row click
	handleAction();
}}>
	Action
</Button>
```

### 6. Performance: Memoize Render Functions

For large lists, memoize render functions:

```tsx
const renderCell = useCallback((value, item, column, state) => {
	// Your render logic
}, [/* dependencies */]);

<ListView renderCell={renderCell} />
```

## Utilities

The library exports helper utilities:

```tsx
import { mergeClasses, createClassBuilder } from '@overpunch/mac-os9-ui';

// Merge multiple class names
const className = mergeClasses('base', isActive && 'active', 'custom');

// Create a class builder
const cn = createClassBuilder('button');
const buttonClass = cn('primary', isDisabled && 'disabled');
```

## TypeScript Support

All types are exported for your convenience:

```tsx
import type {
	ListViewClasses,
	RowRenderState,
	RowDefaultProps,
	CellRenderState,
	HeaderCellRenderState,
	HeaderCellDefaultProps,
	WindowClasses,
	FolderListClasses,
} from '@overpunch/mac-os9-ui';
```

---

## Questions?

For more examples, check out the Storybook documentation or the component stories in `src/components/*/\*.stories.tsx`.
