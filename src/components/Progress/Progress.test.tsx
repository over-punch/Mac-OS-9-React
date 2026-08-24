// Progress Component Tests
//
// The load-bearing distinction is determinate vs indeterminate, and it is
// carried entirely by whether `value` was passed. An indeterminate bar that
// reports aria-valuenow is claiming progress nobody measured.

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Progress } from './Progress';
import { checkA11y } from '../../test/axe';

describe('Progress', () => {
	it('exposes the progressbar role', () => {
		render(<Progress value={40} aria-label="Copying" />);
		expect(screen.getByRole('progressbar')).toBeInTheDocument();
	});

	describe('determinate', () => {
		it('reports its value and bounds', () => {
			render(<Progress value={40} aria-label="Copying" />);
			const bar = screen.getByRole('progressbar');
			expect(bar).toHaveAttribute('aria-valuenow', '40');
			expect(bar).toHaveAttribute('aria-valuemin', '0');
			expect(bar).toHaveAttribute('aria-valuemax', '100');
		});

		it('honours a custom max', () => {
			render(<Progress value={3} max={4} aria-label="Step" />);
			expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '4');
		});

		it('clamps a value past the end rather than overflowing the track', () => {
			render(<Progress value={250} aria-label="Copying" />);
			expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
		});

		it('clamps a negative value to zero', () => {
			render(<Progress value={-20} aria-label="Copying" />);
			expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
		});

		it('shows the percentage when asked', () => {
			render(<Progress value={62} label="Copying" showValue />);
			expect(screen.getByText('62%')).toBeInTheDocument();
		});
	});

	describe('indeterminate', () => {
		it('omits aria-valuenow entirely', () => {
			// The absence is the signal. Sending 0 would report no progress,
			// which is a different and false claim.
			render(<Progress aria-label="Connecting" />);
			const bar = screen.getByRole('progressbar');
			expect(bar).not.toHaveAttribute('aria-valuenow');
			expect(bar).not.toHaveAttribute('aria-valuemax');
		});

		it('never shows a percentage, even when asked', () => {
			render(<Progress label="Connecting" showValue />);
			expect(screen.queryByText(/%/)).not.toBeInTheDocument();
		});
	});

	describe('naming', () => {
		it('is named by a visible label without needing aria-label', () => {
			render(<Progress value={10} label="Copying files" />);
			expect(screen.getByRole('progressbar', { name: 'Copying files' })).toBeInTheDocument();
		});

		it('falls back to aria-label when there is no visible label', () => {
			render(<Progress value={10} aria-label="Copying files" />);
			expect(screen.getByRole('progressbar', { name: 'Copying files' })).toBeInTheDocument();
		});
	});

	it('has no automatically detectable accessibility violations', async () => {
		const { container } = render(
			<div>
				<Progress value={40} label="Determinate" showValue />
				<Progress aria-label="Indeterminate" />
			</div>
		);
		expect(await checkA11y(container)).toHaveNoViolations();
	});
});
