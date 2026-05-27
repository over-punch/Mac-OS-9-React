# Mac OS 9 UI Component Library

A pixel-perfect Mac OS 9 UI component library for React and TypeScript. Bring authentic retro Mac OS 9 styling to your web applications with accessible, well-typed components.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Features

- 🎨 **Pixel-Perfect Design** - Faithful recreation of Mac OS 9 UI elements based on the original design system
- 📦 **TypeScript First** - Full TypeScript support with complete type definitions
- ♿ **Accessible** - WCAG 2.1 AA compliant components with proper ARIA attributes
- 🎭 **Dual Module Support** - ESM and CommonJS builds included
- 📖 **Storybook Docs** - Interactive component documentation and examples
- 🧪 **Fully Tested** - Comprehensive test coverage with Vitest

## Installation

```bash
npm install @liiift-studio/mac-os9-ui
```

## Quick Start

Import the styles once in your application's entry point, then use the components:

```tsx
// In your app's main file (e.g., main.tsx, _app.tsx, index.tsx)
import '@liiift-studio/mac-os9-ui/styles';
import { Button, Window } from '@liiift-studio/mac-os9-ui';

function App() {
	return (
		<Window title="My Application">
			<div style={{ padding: '16px' }}>
				<Button variant="primary">Click Me</Button>
			</div>
		</Window>
	);
}
```

## Components

### Form Controls
- **Button** - Classic Mac OS 9 buttons with variants (primary, default, cancel)
- **Checkbox** - Mac OS 9 style checkboxes
- **Radio** - Radio button groups
- **TextField** - Text input fields
- **Select** - Dropdown select menus

### Layout & Chrome
- **Window** - Classic Mac OS 9 window container
- **MenuBar** - Application menu bar with dropdown menus
- **Tabs** - Tabbed navigation component
- **Dialog** - Modal dialog windows

### Lists & Navigation
- **ListView** - List view with Mac OS 9 styling
- **FolderList** - Hierarchical folder/file list view
- **Scrollbar** - Custom Mac OS 9 styled scrollbars

### Utilities
- **Icon** - System icons (folder, document, trash, etc.)
- **IconButton** - Icon-only button variant

## Usage Examples

### Creating a Window with Menu Bar

`MenuBar` accepts a `menus` array describing each top-level entry. Each menu's
`items` is JSX (typically a fragment of `MenuItem` components), not data — this
keeps the dropdown content fully customizable. MenuBar is controlled: the parent
owns `openMenuIndex` and reacts to `onMenuOpen` / `onMenuClose`.

```tsx
import { useState } from 'react';
import { Window, MenuBar, MenuItem } from '@liiift-studio/mac-os9-ui';

function MyApp() {
	const [openMenu, setOpenMenu] = useState<number | undefined>();

	return (
		<Window title="My Application">
			<MenuBar
				openMenuIndex={openMenu}
				onMenuOpen={setOpenMenu}
				onMenuClose={() => setOpenMenu(undefined)}
				menus={[
					{
						label: 'File',
						items: (
							<>
								<MenuItem label="New" shortcut="⌘N" onClick={() => console.log('New')} />
								<MenuItem label="Open..." shortcut="⌘O" onClick={() => console.log('Open')} />
								<MenuItem label="" separator />
								<MenuItem label="Quit" shortcut="⌘Q" onClick={() => console.log('Quit')} />
							</>
						),
					},
					{
						label: 'Edit',
						items: (
							<>
								<MenuItem label="Cut" shortcut="⌘X" onClick={() => console.log('Cut')} />
								<MenuItem label="Copy" shortcut="⌘C" onClick={() => console.log('Copy')} />
								<MenuItem label="Paste" shortcut="⌘V" onClick={() => console.log('Paste')} />
							</>
						),
					},
				]}
			/>
			{/* Your content here */}
		</Window>
	);
}
```

### Using Form Controls

```tsx
import { Button, Checkbox, TextField, Select } from '@liiift-studio/mac-os9-ui';
import { useState } from 'react';

function MyForm() {
	const [checked, setChecked] = useState(false);
	const [text, setText] = useState('');
	const [selected, setSelected] = useState('');

	return (
		<div>
			<TextField
				label="Name"
				value={text}
				onChange={(e) => setText(e.target.value)}
			/>
			
			<Checkbox
				label="I agree to the terms"
				checked={checked}
				onChange={(e) => setChecked(e.target.checked)}
			/>
			
			<Select
				label="Choose an option"
				value={selected}
				onChange={(e) => setSelected(e.target.value)}
				options={[
					{ value: 'option1', label: 'Option 1' },
					{ value: 'option2', label: 'Option 2' },
					{ value: 'option3', label: 'Option 3' },
				]}
			/>
			
			<Button variant="primary" onClick={() => console.log('Submit')}>
				Submit
			</Button>
		</div>
	);
}
```

### Creating a Dialog

```tsx
import { Dialog, Button } from '@liiift-studio/mac-os9-ui';
import { useState } from 'react';

function MyComponent() {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button onClick={() => setOpen(true)}>Open Dialog</Button>
			
			<Dialog
				open={open}
				onClose={() => setOpen(false)}
				title="Confirm Action"
			>
				<p>Are you sure you want to proceed?</p>
				<div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
					<Button variant="primary" onClick={() => setOpen(false)}>
						OK
					</Button>
					<Button onClick={() => setOpen(false)}>Cancel</Button>
				</div>
			</Dialog>
		</>
	);
}
```

## Styling

### Basic Setup

Import the component styles **once** in your application's entry point:

```tsx
// In your app's main file (e.g., main.tsx, _app.tsx, index.tsx)
import '@liiift-studio/mac-os9-ui/styles';
```

This provides:
- CSS custom properties (design tokens/variables)
- Font declarations (Pixel font family)
- Component styles
- Utility classes

This needs to be done only once at the root of your application. All components will then have the correct Mac OS 9 styles applied.

### Optional Global Styles

If you want the **full Mac OS 9 experience** with global styles applied to your entire application (body background, typography, box-sizing reset), you can optionally import the base styles:

```tsx
// In your app's main file
import '@liiift-studio/mac-os9-ui/styles';  // Required
import '@liiift-studio/mac-os9-ui/base';    // Optional global styles
```

The optional base styles include:
- Universal `box-sizing: border-box` reset
- Responsive typography scaling on `<html>`
- Body styles (margin, padding, font-family, colors)

**Note:** Only import `/base` if you want these global styles. The library is designed to work without polluting your application's global styles, making it easier to integrate into existing projects.

### CSS Modules

All components use CSS Modules internally, so styles are scoped and won't conflict with your application's CSS. The theme variables and component styles are extracted to separate CSS files for optimal caching and performance.

## TypeScript Support

All components are written in TypeScript and include full type definitions. Import types as needed:

```tsx
import type { ButtonProps, WindowProps } from '@liiift-studio/mac-os9-ui';
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Development

```bash
# Install dependencies
npm install

# Run Storybook for development
npm run dev

# Build the library
npm run build

# Run tests
npm test

# Run linting
npm run lint
```

## Attribution

This component library is based on the **Mac OS 9 UI Kit** created by [Michael Feeney](https://swallowmygraphicdesign.com/project/macostalgia).

Original Figma design: [Mac OS 9 UI Kit](https://www.figma.com/design/vy2T5MCXFz7QWf4Ba86eqN/Mac-OS-9--UI-Kit--Community-)

Design licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

## License

MIT License - see [LICENSE](./LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Links

- [GitHub Repository](https://github.com/Liiift-Studio/Mac-OS-9-React)
- [Report Issues](https://github.com/Liiift-Studio/Mac-OS-9-React/issues)
- [Changelog](./CHANGELOG.md)

---

Made with 💾 by [Liiift Studio](https://github.com/Liiift-Studio)
