// Separator Component Tests

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Separator } from './Separator';
import { checkA11y } from '../../test/axe';

describe('Separator', () => {
	it('is hidden from assistive tech by default', () => {
		// Most rules group things visually. Announcing every one of those is
		// noise, so decoration is the default.
		render(<Separator />);
		expect(screen.queryByRole('separator')).not.toBeInTheDocument();
	});

	it('becomes a real separator when it carries meaning', () => {
		render(<Separator decorative={false} />);
		expect(screen.getByRole('separator')).toBeInTheDocument();
	});

	it('reports its orientation when meaningful', () => {
		render(<Separator decorative={false} orientation="vertical" />);
		expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');
	});

	it('does not report an orientation while decorative', () => {
		const { container } = render(<Separator orientation="vertical" />);
		expect(container.firstElementChild).not.toHaveAttribute('aria-orientation');
	});

	it('has no automatically detectable accessibility violations', async () => {
		const { container } = render(
			<div>
				<Separator />
				<Separator decorative={false} />
			</div>
		);
		expect(await checkA11y(container)).toHaveNoViolations();
	});
});
