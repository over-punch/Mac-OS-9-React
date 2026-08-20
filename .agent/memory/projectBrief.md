# Project Brief: Mac OS 9 UI Component Library

## Overview
Building an NPM-publishable React + TypeScript UI component library that faithfully recreates the Mac OS 9 user interface. The library prioritizes pixel-accurate visuals, strong accessibility, and ease of integration for developers who want to add authentic retro Mac OS 9 styling to their web applications.

## Core Objectives
1. **Pixel-Perfect Fidelity**: Recreate Mac OS 9 UI elements with exact visual accuracy based on Figma design file
2. **Developer Experience**: Provide a well-typed, documented, and easy-to-use component library
3. **Accessibility**: Ensure all components meet modern accessibility standards (WCAG 2.1 AA)
4. **NPM Ready**: Package must be production-ready for npm publishing with proper exports, types, and documentation

## Design Source
- **Figma File**: https://www.figma.com/design/vy2T5MCXFz7QWf4Ba86eqN/Mac-OS-9--UI-Kit--Community-
- **Primary Pages**: Cover, Library, Examples
- **Component Naming**: Component/Variant pattern (e.g., Button/Primary)

## Technical Stack
- **Framework**: React 18+
- **Language**: TypeScript (strict mode)
- **Build Tool**: Rollup (ESM/CJS + bundled declarations)
- **Testing**: Vitest + Testing Library
- **Documentation**: Storybook (React + Vite)
- **Versioning**: Changesets
- **Linting**: ESLint + Prettier

## Priority Components (v1)
1. Button
2. Checkbox
3. Radio
4. TextField
5. Select
6. Window + TitleBar
7. MenuBar + MenuItem
8. Dialog / Modal
9. Tabs

## Success Criteria
- `npm i && npm run build` succeeds without errors
- `npm run storybook` renders all component variants
- `npm test` passes all tests
- `npm pack` produces a valid, installable tarball
- Visual output matches Figma designs (documented deltas acceptable)
- All components are keyboard accessible with proper ARIA attributes

## Package Details
- **Name**: @liiift-studio/mac-os9-ui
- **License**: MIT
- **Repository**: https://github.com/Liiift-Studio/Mac-OS-9-React.git
- **Exports**: Dual ESM/CJS with TypeScript declarations
