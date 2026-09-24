# Icon Library - Mac OS 9 React UI

## Overview

The Icon Library provides a scalable, type-safe system for managing and using icons in the Mac OS 9 UI component library. All icons follow consistent sizing, styling, and accessibility patterns.

## Directory Structure

```
src/components/Icon/
├── Icon.tsx                  # Base Icon wrapper component
├── Icon.module.css           # Icon styling
├── index.ts                  # Main exports
├── registry.ts               # Central icon registry
├── types.ts                  # TypeScript types
├── IconLibrary.tsx           # Icon component with name-based selection
├── README.md                 # This file
├── categories/               # Organized icon categories
│   ├── index.ts              # Exports all categories
│   ├── actions.tsx           # Action-related icons (Save, Close, etc.)
│   ├── files.tsx             # File/document icons
│   ├── navigation.tsx        # Navigation icons (Arrows, Chevrons)
│   ├── media.tsx             # Media icons (Image, Music, Video)
│   ├── status.tsx            # Status/feedback icons (Check, Error, Warning)
│   └── ui.tsx                # UI control icons (Menu, More, Settings)
└── stories/
    └── IconLibrary.stories.tsx # Storybook documentation
```

## Usage

### Method 1: Direct Icon Import (Recommended)

Import specific icons directly for optimal tree-shaking:

```tsx
import { SaveIcon, FolderIcon, CloseIcon } from '@overpunch/mac-os9-ui';

function MyComponent() {
	return (
		<div>
			<SaveIcon />
			<FolderIcon />
			<CloseIcon />
		</div>
	);
}
```

### Method 2: Icon by Name

Use the `IconLibrary` component to select icons by name:

```tsx
import { IconLibrary } from '@overpunch/mac-os9-ui';

function MyComponent() {
	return <IconLibrary icon="save" size="md" />;
}
```

### Method 3: Base Icon Component

Use the base `Icon` component with custom SVG content:

```tsx
import { Icon } from '@overpunch/mac-os9-ui';

function CustomIcon() {
	return (
		<Icon size="md" label="Custom Icon">
			<path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
		</Icon>
	);
}
```

## Icon Sizes

All icons support five size variants:
- `xs`: 12×12px
- `sm`: 14×14px (default for most icon components)
- `md`: 16×16px
- `lg`: 20×20px
- `xl`: 24×24px

## Adding New Icons

### Step 1: Choose a Category

Determine which category your icon belongs to:
- **actions**: User actions (save, delete, download, print, etc.)
- **files**: File and document types
- **navigation**: Navigation and directional (arrows, chevrons)
- **media**: Media content (images, music, video)
- **status**: Status indicators and feedback (check, error, warning, info)
- **ui**: UI controls and elements (menu, settings, more)

### Step 2: Create the Icon Component

Add your icon to the appropriate category file in `categories/`:

```tsx
// Example: Adding a new action icon to categories/actions.tsx

export const NewIcon: React.FC = () => (
	<Icon label="New" size="sm">
		<path d="YOUR_SVG_PATH_DATA_HERE" />
	</Icon>
);
```

### Step 3: Icon Naming Convention

Follow these naming rules:
- Use PascalCase
- End with "Icon" suffix
- Be descriptive and specific
- Examples: `SaveIcon`, `FolderOpenIcon`, `ArrowUpIcon`

### Step 4: Register the Icon

Add your icon to `registry.ts`:

```tsx
import { NewIcon } from './categories/actions';

export const iconRegistry = {
	// ... existing icons
	new: NewIcon,
};

export type IconName = keyof typeof iconRegistry;
```

### Step 5: Export from Category

Ensure the icon is exported from `categories/index.ts`:

```tsx
export * from './actions';
// ... other exports
```

### Step 6: Update Main Exports

The icon will automatically be available through the main `index.ts` export.

## Icon Format Guidelines

### SVG Requirements

1. **ViewBox**: All icons use a 24×24 viewBox
2. **Paths**: Use `<path>` elements with the `d` attribute
3. **Fill**: Use `currentColor` to inherit text color
4. **Stroke**: Avoid strokes; use fills for consistency
5. **Optimization**: Remove unnecessary attributes and whitespace

### SVG Optimization

Before adding an icon, optimize the SVG:

1. Remove unnecessary attributes (`id`, `class`, `style`, etc.)
2. Simplify paths where possible
3. Remove comments and metadata
4. Use relative commands in path data when shorter
5. Round decimal values to 2-3 decimal places

Example of a well-formatted icon:

```tsx
export const ExampleIcon: React.FC = () => (
	<Icon label="Example" size="sm">
		<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
	</Icon>
);
```

### Accessibility

All icons must include:
- A descriptive `label` prop for screen readers
- The label should describe what the icon represents, not what it looks like
- Use sentence case for labels

Good: `label="Save document"`
Bad: `label="floppy disk"`

## Icon Categories

### Actions
User-initiated actions and commands:
- Save, Close, Delete, Download, Print, Refresh, etc.

### Files
File types and document-related icons:
- Document, Folder, File, Image, etc.

### Navigation
Directional and navigation icons:
- Arrows (Up, Down, Left, Right), Chevrons, etc.

### Media
Media content and playback:
- Image, Music, Video, Camera, etc.

### Status
Status indicators and feedback:
- Check, Error, Warning, Info, Success, etc.

### UI
User interface controls:
- Menu, Settings, More, Search, Close, etc.

## Testing New Icons

After adding a new icon:

1. **Visual Test**: Run Storybook to see your icon
   ```bash
   npm run dev
   ```

2. **Import Test**: Verify the icon can be imported
   ```tsx
   import { YourNewIcon } from '@overpunch/mac-os9-ui';
   ```

3. **Size Test**: Test all size variants
   ```tsx
   <YourNewIcon size="xs" />
   <YourNewIcon size="sm" />
   <YourNewIcon size="md" />
   <YourNewIcon size="lg" />
   <YourNewIcon size="xl" />
   ```

4. **Accessibility Test**: Verify the label is read by screen readers

## Best Practices

1. **Reuse Existing Icons**: Before creating a new icon, check if a similar one exists
2. **Consistent Style**: Match the visual style of existing icons
3. **Semantic Naming**: Use clear, descriptive names
4. **Category Logic**: Place icons in the most appropriate category
5. **Documentation**: Add a comment explaining non-obvious icons
6. **Tree-Shakeable**: Each icon is a separate export for optimal bundle size

## Example: Complete Icon Addition

Here's a complete example of adding a "Copy" icon:

**Step 1**: Add to `categories/actions.tsx`:
```tsx
export const CopyIcon: React.FC = () => (
	<Icon label="Copy" size="sm">
		<path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
	</Icon>
);
```

**Step 2**: Register in `registry.ts`:
```tsx
export const iconRegistry = {
	// ... existing icons
	copy: CopyIcon,
};
```

**Step 3**: Use in your application:
```tsx
import { CopyIcon } from '@overpunch/mac-os9-ui';

<CopyIcon />
// or
<IconLibrary icon="copy" size="md" />
```

## Troubleshooting

### Icon Not Showing
- Check that the SVG path is valid
- Verify the viewBox is "0 0 24 24"
- Ensure `fill="currentColor"` is set

### Icon Too Large/Small
- Use the `size` prop to adjust
- Check CSS for conflicting styles
- Verify the Icon.module.css is imported

### TypeScript Errors
- Ensure icon is registered in `registry.ts`
- Check that `IconName` type includes your icon
- Verify exports in category files

## Contributing

When contributing new icons:
1. Follow the naming and format guidelines
2. Test all size variants
3. Verify accessibility
4. Update relevant documentation
5. Add to appropriate Storybook stories

## Resources

- [Mac OS 9 Design Reference](https://www.figma.com/design/vy2T5MCXFz7QWf4Ba86eqN/Mac-OS-9--UI-Kit--Community-)
- [ARIA Icon Patterns](https://www.w3.org/WAI/ARIA/apg/patterns/)
- [SVG Optimization Guide](https://jakearchibald.github.io/svgomg/)