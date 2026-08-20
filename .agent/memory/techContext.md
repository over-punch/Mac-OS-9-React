# Tech Context: Mac OS 9 UI Component Library

## Technology Stack

### Core Dependencies

#### React 18+ and React 19
- **Purpose**: Component framework
- **Version**: ^18.0.0 || ^19.0.0 (peer dependency)
- **Rationale**: Industry standard, excellent TypeScript support, hooks API, backward compatibility

#### TypeScript 5.7+
- **Purpose**: Type safety and developer experience
- **Configuration**: Strict mode enabled
- **Features Used**:
  - Interfaces and type aliases
  - Generic types
  - Union and intersection types
  - Template literal types
  - forwardRef typing

### Build & Development Tools

#### Rollup 8.3+
- **Purpose**: Library bundling
- **Output**: ESM + CJS with TypeScript declarations
- **Configuration**: `Rollup.config.ts`
- **Features**:
  - esbuild-powered for speed
  - Automatic code splitting
  - Source map generation
  - "use client" directive for Next.js compatibility

#### Vite 6.0+
- **Purpose**: Development server for Storybook
- **Benefits**:
  - Fast HMR
  - ESM-native
  - Plugin ecosystem
  - TypeScript support out of the box

#### Storybook 8.5+
- **Purpose**: Component documentation and development
- **Framework**: @storybook/react-vite
- **Addons**:
  - essentials (controls, actions, viewport, etc.)
  - interactions (for interaction testing)
  - links (for navigation between stories)
  - chromatic (for visual testing)

### Testing Infrastructure

#### Vitest 2.1+
- **Purpose**: Unit and integration testing
- **Configuration**: `vitest.config.ts`
- **Features**:
  - Jest-compatible API
  - Fast execution
  - Built-in coverage (v8)
  - Watch mode with smart re-run

#### Testing Library
- **Packages**:
  - @testing-library/react: Component testing
  - @testing-library/jest-dom: Custom matchers
  - @testing-library/user-event: User interaction simulation
- **Philosophy**: Test components as users interact with them
- **Focus**: Accessibility and behavior over implementation details

### Code Quality Tools

#### ESLint 9.18+
- **Purpose**: Code linting
- **Configuration**: `.eslintrc.cjs`
- **Plugins**:
  - @typescript-eslint: TypeScript rules
  - eslint-plugin-react: React-specific rules
  - eslint-plugin-react-hooks: Hooks rules
  - eslint-plugin-storybook: Storybook rules
- **Extends**:
  - eslint:recommended
  - plugin:@typescript-eslint/recommended
  - plugin:react/recommended
  - plugin:react-hooks/recommended
  - prettier (disables conflicting rules)

#### Prettier 3.4+
- **Purpose**: Code formatting
- **Configuration**: `.prettierrc`
- **Settings**:
  - Tabs for indentation (per custom instructions)
  - Single quotes
  - Trailing commas (ES5)
  - 100 character line width
  - LF line endings

### Version Management

#### Changesets 2.27+
- **Purpose**: Version and changelog management
- **Workflow**:
  1. Developer creates changeset: `npm run changeset`
  2. CI validates changeset exists
  3. Version bump: `npm run version`
  4. Publish: `npm run release`
- **Configuration**: `.changeset/config.json`

## Development Setup

### Prerequisites
```bash
Node.js: >= 18.x
npm: >= 9.x
Git: >= 2.x
```

### Initial Setup
```bash
# Clone repository
git clone https://github.com/Liiift-Studio/Mac-OS-9-React.git
cd Mac-OS-9-React

# Install dependencies
npm install

# Run Storybook for development
npm run dev
```

### Available Scripts

#### Development
- `npm run dev`: Start Storybook development server on port 6006
- `npm run test:watch`: Run tests in watch mode

#### Building
- `npm run build`: Build the library (ESM + CJS + types)
- `npm run build:storybook`: Build static Storybook site

#### Testing
- `npm test`: Run all tests once
- `npm run test:watch`: Run tests in watch mode

#### Code Quality
- `npm run lint`: Check code for lint errors
- `npm run lint:fix`: Fix auto-fixable lint errors
- `npm run format`: Format code with Prettier
- `npm run format:check`: Check if code is formatted
- `npm run typecheck`: Run TypeScript compiler without emitting

#### Versioning & Publishing
- `npm run changeset`: Create a new changeset
- `npm run version`: Update versions based on changesets
- `npm run release`: Build and publish to npm

### IDE Setup

#### VS Code (Recommended)
Recommended extensions:
- ESLint (dbaeumer.vscode-eslint)
- Prettier (esbenp.prettier-vscode)
- TypeScript Vue Plugin (Vue.volar)

Settings:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Technical Constraints

### Browser Support
Target modern browsers with ES2020 support:
- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

No IE11 support (uses modern JS features).

### React Compatibility
- Minimum: React 18.0.0
- Maximum: React 19.x
- Tested with: React 18.3.1
- Hooks required (functional components only)
- Compatible with both React 18 and React 19

### Bundle Size Goals
- **Total library**: < 50KB gzipped
- **Individual components**: < 5KB gzipped each
- **CSS**: < 10KB gzipped

### Performance Targets
- **Initial render**: < 16ms (60fps)
- **Interaction response**: < 100ms
- **Storybook load**: < 2s

## Design Token Extraction

### Figma MCP Server
- **Purpose**: Extract design tokens from Figma
- **File URL**: https://www.figma.com/design/vy2T5MCXFz7QWf4Ba86eqN/Mac-OS-9--UI-Kit--Community-
- **Node ID**: 68-94977 (starting point)
- **Extraction Strategy**:
  1. List all pages in Figma file
  2. Identify component sets and variants
  3. Extract style properties (colors, spacing, typography)
  4. Document measurements and effects
  5. Create `docs/figma-map.md` with findings

### Token Categories
1. **Colors**: Grayscale palette, accent colors, status colors
2. **Typography**: Font families, sizes, weights, line heights
3. **Spacing**: Consistent spacing scale (2px, 4px, 8px, etc.)
4. **Borders**: Widths, radii, styles
5. **Shadows**: Bevel effects (raised, inset)
6. **Effects**: Gradients, patterns, dithering

## CSS Architecture

### Naming Convention
- **CSS Variables**: `--{category}-{name}` / `--{category}-{name}-{modifier}`, e.g.
  `--color-gray-500`, `--font-size-md`, `--window-titlebar-bg`. There is no
  `--mac-os9-` prefix; the docs claimed one that no token has ever used.
  - Example: `--mac-os9-color-gray-500`
- **CSS Classes**: `mac-os9-{component}-{modifier}`
  - Example: `mac-os9-button-primary`
- **CSS Modules**: `styles.{element}`
  - Example: `styles.root`, `styles.label`

### Layering Strategy
1. **Reset/Base**: Minimal normalization
2. **Theme Variables**: CSS custom properties
3. **Utility Classes**: Reusable patterns (`.mac-os9-raised`)
4. **Component Styles**: Scoped via CSS Modules

## TypeScript Configuration

### Compiler Options
- **Target**: ES2020
- **Module**: ESNext
- **JSX**: react-jsx (new transform)
- **Strict**: true (all strict checks enabled)
- **Module Resolution**: bundler
- **Declaration**: true (generate .d.ts files)

### Type Safety
- No `any` types (use `unknown` if needed)
- Strict null checks enabled
- No unused locals/parameters warnings
- Exhaustive switch case checking

## Dependency Management

### Peer Dependencies
Only React and React DOM:
```json
{
  "react": "^18.0.0 || ^19.0.0",
  "react-dom": "^18.0.0 || ^19.0.0"
}
```

### Zero Runtime Dependencies
The library has no runtime dependencies beyond React. All utilities are internal.

### Dev Dependencies Philosophy
- Use latest stable versions
- Lock file committed (npm-shrinkwrap.json or package-lock.json)
- Regular updates via Dependabot
- Security audits before releases

## Build Output

### Directory Structure
```
dist/
├── esm/
│   ├── index.js
│   ├── components/
│   └── styles/
├── cjs/
│   ├── index.js
│   ├── components/
│   └── styles/
├── index.d.ts
└── components/
    └── *.d.ts
```

### Package Exports
```json
{
  "exports": {
    ".": {
      "import": "./dist/esm/index.js",
      "require": "./dist/cjs/index.js",
      "types": "./dist/index.d.ts"
    },
    "./styles": {
      "import": "./dist/esm/styles/theme.css",
      "require": "./dist/cjs/styles/theme.css"
    }
  }
}
```

## Known Limitations

### No SSR Optimization
- Library is client-side only
- "use client" directive for Next.js App Router
- No server component support (not needed for UI library)

### CSS Modules Limitation
- Styles must be imported explicitly
- No automatic style injection
- Users must import `@liiift-studio/mac-os9-ui/styles` in their app

### Browser Constraints
- No IE11 support
- Requires CSS custom properties
- Requires CSS box-shadow for bevels

## Future Technical Considerations

### Potential Additions
- [ ] CSS-in-JS option (styled-components/emotion)
- [ ] Web Components version
- [ ] Vue/Svelte adapters
- [ ] Animation library integration
- [ ] Form validation helpers

### Performance Optimizations
- [ ] React.memo for expensive components
- [ ] Virtual scrolling for long lists
- [ ] Lazy loading for large component sets
- [ ] Code splitting by component category
