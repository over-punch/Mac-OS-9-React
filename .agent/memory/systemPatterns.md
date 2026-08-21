# System Patterns: Mac OS 9 UI Component Library

## Architecture Overview

### Package Structure
```
@liiift-studio/mac-os9-ui/
├── src/
│   ├── components/        # React components
│   │   ├── Button/
│   │   ├── Checkbox/
│   │   ├── Radio/
│   │   ├── TextField/
│   │   ├── Select/
│   │   ├── Window/
│   │   ├── MenuBar/
│   │   ├── Dialog/
│   │   └── Tabs/
│   ├── tokens/           # Design tokens (colors, spacing, etc.)
│   ├── styles/           # Global CSS and theme
│   ├── types/            # TypeScript type definitions
│   └── index.ts          # Main entry point
├── docs/                 # Design documentation
├── memory-bank/          # Project documentation
└── .storybook/          # Storybook configuration
```

## Component Architecture

### Base Component Pattern
All components follow a consistent pattern:
1. **TypeScript Interface**: Strongly typed props extending `BaseComponentProps`
2. **forwardRef**: Support for ref forwarding to underlying DOM elements
3. **CSS Modules**: Scoped styles using CSS custom properties
4. **Accessibility**: ARIA attributes and keyboard navigation
5. **State Management**: Internal state with optional controlled mode

### Component Structure Template
```typescript
// Component interface with JSDoc comments
export interface ComponentNameProps extends BaseComponentProps {
  variant?: 'default' | 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  // ... component-specific props
}

// Component implementation with forwardRef
export const ComponentName = forwardRef<HTMLElement, ComponentNameProps>(
  ({ variant = 'default', size = 'medium', disabled = false, ...props }, ref) => {
    // Component logic
    return (
      <element ref={ref} className={styles.root} {...props}>
        {/* Component markup */}
      </element>
    );
  }
);

ComponentName.displayName = 'ComponentName';
```

## Styling Strategy

### CSS Custom Properties + Modules
We use a hybrid approach:
1. **Design tokens** → TypeScript constants (`src/tokens/`)
2. **CSS variables** → Global theme (`src/styles/theme.css`)
3. **Component styles** → CSS Modules for scoping

### Mac OS 9 Visual Effects

#### Bevel Rendering
Classic 3D beveled edges achieved through box-shadow:
- **Raised**: Light top-left, dark bottom-right
- **Inset**: Dark top-left, light bottom-right
- **Implementation**: Dual inset box-shadows for crisp edges

```css
/* Raised bevel */
box-shadow: 
  inset 1px 1px 0 rgba(255, 255, 255, 0.9),
  inset -1px -1px 0 rgba(0, 0, 0, 0.3);

/* Pressed/inset bevel */
box-shadow: 
  inset 1px 1px 0 rgba(0, 0, 0, 0.3),
  inset -1px -1px 0 rgba(255, 255, 255, 0.9);
```

#### State Management
- **Default**: Raised bevel
- **Hover**: Maintain raised bevel (Mac OS 9 didn't have hover states)
- **Active/Pressed**: Inset bevel
- **Disabled**: Reduced opacity, dithered appearance
- **Focus**: 1px dotted outline (classic Mac/Windows focus ring)

## Key Technical Decisions

### 1. Build System: Rollup
**Decision**: Rollup, with `rollup-plugin-postcss` for CSS Modules

**Rationale**: the library ships CSS Modules alongside its JS, and the CSS
needs to be extracted to a single stylesheet with the font URLs rewritten to
their published paths. Rollup's plugin ecosystem handles that directly.

**Note**: this section previously described `tsup`. The project moved to
Rollup when CSS Modules were introduced and never switched back; `tsup`
lingered in `devDependencies` and in this document until it was removed
(issue #73).

### 2. Styling: CSS Modules + Custom Properties
**Decision**: CSS Modules rather than CSS-in-JS
**Rationale**:
- Better performance (no runtime styling)
- Easier to achieve pixel-perfect Mac OS 9 effects
- CSS custom properties for theming
- Smaller bundle size

### 3. Testing: Vitest + Testing Library
**Decision**: Vitest over Jest
**Rationale**:
- Faster execution
- Better ESM support
- Vite integration for consistency with Storybook

### 4. Component API: Controlled + Uncontrolled
**Decision**: Support both modes for form components
**Rationale**:
- Flexibility for different use cases
- Follows React best practices
- Easier integration with form libraries

## Design Patterns

### Composition Pattern
Complex components built from simpler ones:
```typescript
<Window>
  <TitleBar title="My Window" />
  <Window.Content>
    {/* Content */}
  </Window.Content>
</Window>
```

### Render Props for Customization
Advanced users can customize rendering:
```typescript
<MenuBar
  renderItem={(item) => (
    <CustomMenuItem {...item} />
  )}
/>
```

### Theme Overrides
Theming is done with CSS custom properties, not a provider. There is no
`MacOS9ThemeProvider` — this section previously described one, which did not
exist and was never built. Tokens are declared in three tiers (primitives,
semantics, per-component hooks) in `src/styles/tokens.css`, and an override is
scoped wherever you want it to reach:

```css
:root { --color-highlight: #6c2bd9; }
[data-theme='night'] { --color-surface: #333333; --color-text: #eeeeee; }
.one-window { --window-titlebar-bg: #cdb4e3; }
```

The one context provider the library does ship is `WindowManagerProvider`,
which coordinates z-order across several `Window`s — not theming.

## Component Layering

Components sit in two layers, and the split is enforced by
`src/test/architecture.test.ts` rather than left as a convention:

**Primitives** — depend on no other component, safe to use anywhere:
Button, Checkbox, Icon, ListView, MenuBar, Radio, Scrollbar, Select, Tabs,
TextField, WindowManager.

**Compounds** — assembled from primitives, with their allowed dependencies
declared:

| Component | May depend on |
|---|---|
| Window | WindowManager |
| Dialog | Window |
| FolderList | ListView, Window |
| IconButton | Button |

The test fails if a primitive grows a component dependency, if a compound
imports something it hasn't declared, if a cycle appears, or if a new
component isn't assigned to a layer. `src/utils` and `src/hooks` sit below
both layers and must never import a component — that is how a cycle would
start.

The directories are deliberately not split into `primitives/` and `compound/`.
Moving every file would encode in paths what the test already checks, and
would churn imports for no behavioural gain.

## Accessibility Patterns

### Keyboard Navigation
- **Tab**: Move focus between interactive elements
- **Enter/Space**: Activate buttons and checkboxes
- **Arrow Keys**: Navigate menus and tabs
- **Escape**: Close dialogs and menus

### ARIA Implementation
- Proper roles: `button`, `checkbox`, `dialog`, `menu`, etc.
- States: `aria-checked`, `aria-disabled`, `aria-expanded`
- Labels: `aria-label`, `aria-labelledby`
- Live regions: `aria-live` for dynamic updates

### Focus Management
- Visible focus indicators (dotted outlines)
- Focus trapping in modals
- Restore focus on dialog close
- Skip links for complex layouts

## Performance Considerations

### Code Splitting
- Tree-shakeable exports
- Each component importable individually
- No default export of entire library

### Bundle Optimization
- No unnecessary dependencies
- CSS extracted and tree-shakeable
- Minification in production builds
- Source maps for debugging

### Runtime Performance
- Minimal re-renders via React.memo where appropriate
- Event delegation for lists
- Virtualization for long menus (if needed)

## Testing Strategy

### Unit Tests
- Component rendering
- Prop validation
- State management
- Event handlers

### Integration Tests
- Keyboard navigation
- Focus management
- Form submission
- Component composition

### Visual Regression
- Storybook serves as visual test suite
- Manual comparison against Figma designs
- Document any intentional deltas

## Critical Implementation Paths

### Path 1: Button Component (Foundation)
Button establishes patterns for all other components:
1. Base component structure
2. Variant system
3. State management
4. Accessibility implementation
5. Testing approach

### Path 2: Form Components
Build on Button patterns:
1. Checkbox, Radio (binary inputs)
2. TextField (text input with borders)
3. Select (dropdown with menu)

### Path 3: Container Components
More complex composition:
1. Window + TitleBar
2. Dialog/Modal
3. MenuBar + MenuItem

### Path 4: Navigation Components
Tab-based navigation:
1. Tabs component with panels
2. Keyboard navigation
3. ARIA tablist pattern

## Integration Points

### With Figma
- Extract design tokens from Figma file
- Document component variants
- Map Figma components to React components

### With npm
- Proper package.json exports
- Peer dependencies (React 18+)
- Versioning via Changesets

### With User Applications
- Simple CSS import: `import '@liiift-studio/mac-os9-ui/styles'`
- Component import: `import { Button } from '@liiift-studio/mac-os9-ui'`
- TypeScript support automatic
- Optional theme customization
