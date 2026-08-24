// ChasingArrows Component Tests
//
// The guidelines put this control where there is no dialog to hold a progress
// bar, and it deliberately says nothing about how far along the work is. So
// the assertions are: it names what is happening, it announces politely, and
// an inactive one renders nothing rather than sitting there frozen — a still
// spinner reads as stalled work.

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChasingArrows } from './ChasingArrows';
import { checkA11y } from '../../test/axe';

describe('ChasingArrows', () => {
	it('names what is happening', () => {
		render(<ChasingArrows label="Updating window contents" />);
		expect(screen.getByRole('status', { name: 'Updating window contents' })).toBeInTheDocument();
	});

	it('announces politely, so background work does not interrupt', () => {
		render(<ChasingArrows label="Updating window contents" />);
		expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
	});

	it('renders nothing when inactive', () => {
		const { container } = render(<ChasingArrows active={false} label="Updating window contents" />);
		expect(container).toBeEmptyDOMElement();
	});

	it('claims no progress value', () => {
		render(<ChasingArrows label="Updating window contents" />);
		const status = screen.getByRole('status');
		// It is not a progress bar and must not pretend to be one.
		expect(status).not.toHaveAttribute('aria-valuenow');
		expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
	});

	it('hides the wheel itself from assistive tech', () => {
		const { container } = render(<ChasingArrows label="Updating window contents" />);
		expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
	});

	it('has no automatically detectable accessibility violations', async () => {
		const { container } = render(<ChasingArrows label="Updating window contents" />);
		expect(await checkA11y(container)).toHaveNoViolations();
	});
});
