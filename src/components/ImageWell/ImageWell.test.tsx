// ImageWell Component Tests
//
// A well that only accepts a drop is unusable by keyboard and by anyone who
// cannot drag. So the load-bearing assertion is that it is a button first,
// and that the drop is an extra route to the same action rather than the only
// one.

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImageWell } from './ImageWell';
import { checkA11y } from '../../test/axe';

/** A DataTransfer stand-in, since jsdom has no real one. */
function dropWith(files: File[]) {
	return { dataTransfer: { files, items: [], types: ['Files'] } };
}

describe('ImageWell', () => {
	it('is a button, so it is reachable without a pointer', () => {
		render(<ImageWell label="Desktop picture" onBrowse={vi.fn()} />);
		expect(screen.getByRole('button', { name: 'Desktop picture' })).toBeInTheDocument();
	});

	it('opens the picker when activated', () => {
		const onBrowse = vi.fn();
		render(<ImageWell label="Desktop picture" onBrowse={onBrowse} />);
		fireEvent.click(screen.getByRole('button'));
		expect(onBrowse).toHaveBeenCalled();
	});

	it('reports dropped files', () => {
		const onFiles = vi.fn();
		const file = new File(['x'], 'fuji.png', { type: 'image/png' });
		render(<ImageWell label="Desktop picture" onFiles={onFiles} />);
		fireEvent.drop(screen.getByRole('button'), dropWith([file]));
		expect(onFiles).toHaveBeenCalledWith([file]);
	});

	it('ignores a drop when disabled', () => {
		const onFiles = vi.fn();
		const file = new File(['x'], 'fuji.png', { type: 'image/png' });
		render(<ImageWell label="Desktop picture" disabled onFiles={onFiles} />);
		fireEvent.drop(screen.getByRole('button'), dropWith([file]));
		expect(onFiles).not.toHaveBeenCalled();
	});

	it('describes the image it holds separately from the control', () => {
		render(<ImageWell label="Desktop picture" src="/fuji.png" imageAlt="Mount Fuji at dawn" />);
		// The button says what the control is for; the image says what is in
		// it. They answer different questions.
		expect(screen.getByRole('button', { name: 'Desktop picture' })).toBeInTheDocument();
		expect(screen.getByAltText('Mount Fuji at dawn')).toBeInTheDocument();
	});

	it('hides the placeholder from assistive tech', () => {
		render(<ImageWell label="Desktop picture" placeholder="Drop an image" />);
		// The button is already named; announcing the placeholder as well
		// would say the same thing twice.
		expect(screen.getByText('Drop an image')).toHaveAttribute('aria-hidden', 'true');
	});

	it('has no automatically detectable accessibility violations', async () => {
		const { container } = render(
			<ImageWell
				label="Desktop picture"
				src="/fuji.png"
				imageAlt="Mount Fuji at dawn"
				onBrowse={vi.fn()}
			/>
		);
		expect(await checkA11y(container)).toHaveNoViolations();
	});
});
