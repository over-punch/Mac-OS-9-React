// Icon and IconLibrary Tests
//
// The registry is the contract: everything it exports must render, and the
// lookup helpers have to agree with each other. Icon names are used as data
// all over the site and in consumer code, so a name that resolves to nothing
// is a silent blank rather than an error.

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { IconLibrary } from './IconLibrary';
import { getIcon, hasIcon, getAllIconNames, type IconName } from './registry';
import { checkA11y } from '../../test/axe';
import { nth } from '../../test/nth';

afterEach(() => {
	vi.restoreAllMocks();
});

describe('registry', () => {
	it('exposes at least one icon', () => {
		expect(getAllIconNames().length).toBeGreaterThan(0);
	});

	it('resolves every name it enumerates', () => {
		// The three helpers are separate code paths over the same object;
		// this is what stops them drifting apart.
		for (const name of getAllIconNames()) {
			expect(hasIcon(name), name).toBe(true);
			expect(getIcon(name), name).toBeDefined();
		}
	});

	it('rejects a name that is not in the registry', () => {
		expect(hasIcon('definitelyNotAnIcon')).toBe(false);
	});

	it('narrows the type through hasIcon', () => {
		const candidate: string = nth(getAllIconNames(), 0);
		if (hasIcon(candidate)) {
			// Compiles only because hasIcon is a type guard.
			const resolved = getIcon(candidate);
			expect(resolved).toBeDefined();
		} else {
			throw new Error('the first registry name should be a valid icon');
		}
	});
});

describe('IconLibrary', () => {
	it('renders every icon in the registry', () => {
		// A registry entry that throws or renders nothing would otherwise only
		// surface as a blank square on someone's page.
		for (const name of getAllIconNames()) {
			const { container, unmount } = render(<IconLibrary icon={name} label={null} />);
			expect(container.firstChild, name).not.toBeNull();
			unmount();
		}
	});

	it('exposes a label as an image role', () => {
		render(<IconLibrary icon={nth(getAllIconNames(), 0)} label="Macintosh HD" />);
		expect(screen.getByRole('img', { name: 'Macintosh HD' })).toBeInTheDocument();
	});

	it('hides itself from assistive tech when label is null', () => {
		// Decorative usage: the icon sits beside text that already names it.
		render(<IconLibrary icon={nth(getAllIconNames(), 0)} label={null} />);
		expect(screen.queryByRole('img')).not.toBeInTheDocument();
	});

	it('renders nothing and warns for an unknown icon', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

		const { container } = render(
			<IconLibrary icon={'notARealIcon' as IconName} label="Nope" />
		);

		expect(container.firstChild).toBeNull();
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('notARealIcon'));
	});

	it('has no automatically detectable accessibility violations', async () => {
		const { container } = render(
			<div>
				<IconLibrary icon={nth(getAllIconNames(), 0)} label="Documents" />
				<IconLibrary icon={nth(getAllIconNames(), 1)} label={null} />
			</div>
		);
		expect(await checkA11y(container)).toHaveNoViolations();
	});
});
