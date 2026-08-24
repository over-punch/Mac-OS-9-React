// DisclosureTriangle Component Tests

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DisclosureTriangle } from './DisclosureTriangle';
import { checkA11y } from '../../test/axe';

describe('DisclosureTriangle', () => {
	it('is a real button, not a clickable span', () => {
		// It toggles, it is keyboard operable, and it owns another element's
		// state — all three say button.
		render(<DisclosureTriangle label="Documents" />);
		expect(screen.getByRole('button', { name: 'Documents' })).toBeInTheDocument();
	});

	it('reports its collapsed state', () => {
		render(<DisclosureTriangle label="Documents" />);
		expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
	});

	it('toggles when uncontrolled', () => {
		render(<DisclosureTriangle label="Documents" />);
		const button = screen.getByRole('button');

		fireEvent.click(button);

		expect(button).toHaveAttribute('aria-expanded', 'true');
	});

	it('starts open when defaultExpanded is set', () => {
		render(<DisclosureTriangle label="Documents" defaultExpanded />);
		expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
	});

	it('reports the next state, not the current one', () => {
		const onExpandedChange = vi.fn();
		render(<DisclosureTriangle label="Documents" onExpandedChange={onExpandedChange} />);

		fireEvent.click(screen.getByRole('button'));

		expect(onExpandedChange).toHaveBeenCalledWith(true);
	});

	it('defers to the parent when controlled', () => {
		const onExpandedChange = vi.fn();
		render(
			<DisclosureTriangle label="Documents" expanded={false} onExpandedChange={onExpandedChange} />
		);
		const button = screen.getByRole('button');

		fireEvent.click(button);

		expect(onExpandedChange).toHaveBeenCalledWith(true);
		// The parent owns the state, so it stays shut until it says otherwise.
		expect(button).toHaveAttribute('aria-expanded', 'false');
	});

	it('points at the region it controls', () => {
		render(<DisclosureTriangle label="Documents" controls="documents-panel" />);
		expect(screen.getByRole('button')).toHaveAttribute('aria-controls', 'documents-panel');
	});

	it('still calls a caller-supplied onClick', () => {
		const onClick = vi.fn();
		render(<DisclosureTriangle label="Documents" onClick={onClick} />);

		fireEvent.click(screen.getByRole('button'));

		expect(onClick).toHaveBeenCalled();
	});

	it('does not toggle while disabled', () => {
		const onExpandedChange = vi.fn();
		render(<DisclosureTriangle label="Documents" disabled onExpandedChange={onExpandedChange} />);

		fireEvent.click(screen.getByRole('button'));

		expect(onExpandedChange).not.toHaveBeenCalled();
	});

	it('has no automatically detectable accessibility violations', async () => {
		const { container } = render(
			<div>
				<DisclosureTriangle label="Documents" controls="panel" />
				<div id="panel">Contents</div>
			</div>
		);
		expect(await checkA11y(container)).toHaveNoViolations();
	});
});
