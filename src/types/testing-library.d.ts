// Registers the jest-dom matchers with Vitest's Assertion type.
//
// The runtime side lives in vitest.setup.ts. The type side has to be inside
// `src`, because tsconfig's `include` is rooted there: adding the root-level
// setup file to the program moved TypeScript's inferred common directory up to
// the repo root, which relocated every emitted declaration and broke the
// declaration-bundling step of the build.

import '@testing-library/jest-dom/vitest';
