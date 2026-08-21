// Type augmentation for the axe matchers used across the test suites.
//
// `vitest-axe/extend-expect` augments the legacy global `Vi` namespace, which
// Vitest 4 no longer uses — so `expect(...).toHaveNoViolations()` type-checked
// as a missing property even though it works at runtime. This declares the
// matcher against the module interface Vitest 4 actually reads.

import 'vitest';
import type { AxeMatchers } from 'vitest-axe/matchers';

declare module 'vitest' {
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	interface Assertion<_T = unknown> extends AxeMatchers {}
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	interface AsymmetricMatchersContaining extends AxeMatchers {}
}
