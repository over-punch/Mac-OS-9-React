// WindowHeader Component Tests
//
// It reports on a window rather than labelling it, so the thing worth pinning
// is that it is NOT a heading — "12 items" in the document outline would be
// noise, and headings are how screen-reader users navigate.

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WindowHeader } from './WindowHeader';
import { checkA11y } from '../../test/axe';

describe('WindowHeader', () => {
	it('renders what the window contains', () => {
		render(<WindowHeader>12 items</WindowHeader>);
		expect(screen.getByText('12 items')).toBeInTheDocument();
	});

	it('renders trailing information', () => {
		render(<WindowHeader trailing="1.2 GB available">12 items</WindowHeader>);
		expect(screen.getByText('1.2 GB available')).toBeInTheDocument();
	});

	it('is not a heading', () => {
		render(<WindowHeader>12 items</WindowHeader>);
		expect(screen.queryByRole('heading')).not.toBeInTheDocument();
	});

	it('omits the trailing slot entirely when there is nothing for it', () => {
		const { container } = render(<WindowHeader>12 items</WindowHeader>);
		expect(container.querySelectorAll('span')).toHaveLength(1);
	});

	it('drops the dividing rule in list view', () => {
		const { container: doc } = render(<WindowHeader>a</WindowHeader>);
		const { container: list } = render(<WindowHeader variant="list">a</WindowHeader>);
		expect(doc.firstElementChild?.className).not.toBe(list.firstElementChild?.className);
	});

	it('has no automatically detectable accessibility violations', async () => {
		const { container } = render(<WindowHeader trailing="1.2 GB available">12 items</WindowHeader>);
		expect(await checkA11y(container)).toHaveNoViolations();
	});
});
