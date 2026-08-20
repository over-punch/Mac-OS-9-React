// Vitest setup file
// This file runs before all tests

import { expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import * as axeMatchers from 'vitest-axe/matchers';

// Accessibility assertions. The library states a WCAG 2.1 AA goal, so
// `toHaveNoViolations` is available in every test file rather than being
// wired up ad hoc.
expect.extend(axeMatchers);
