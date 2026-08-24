// GroupBox Component Tests
//
// The point of a group box is the grouping, and the grouping is only real if
// assistive tech gets it. These pin the fieldset/legend semantics, the two
// border weights, and the rule that a switched-off group keeps its title
// operable — otherwise a checkbox title could turn a group off and then be
// unreachable to turn it back on.

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GroupBox } from './GroupBox';
import { Checkbox } from '../Checkbox';
import { checkA11y } from '../../test/axe';

describe('GroupBox', () => {
	it('groups its contents for assistive tech', () => {
		render(
			<GroupBox title="Sharing">
				<Checkbox label="Share this folder" />
			</GroupBox>
		);
		expect(screen.getByRole('group', { name: 'Sharing' })).toBeInTheDocument();
	});

	it('is still a group without a title', () => {
		render(
			<GroupBox>
				<Checkbox label="Share this folder" />
			</GroupBox>
		);
		const group = screen.getByRole('group');
		expect(group).toBeInTheDocument();
		expect(group).not.toHaveAccessibleName();
	});

	it('takes its name from a control used as the title', () => {
		render(
			<GroupBox control={<Checkbox label="Use a proxy server" />}>
				<span>Address</span>
			</GroupBox>
		);
		expect(screen.getByRole('group', { name: /Use a proxy server/ })).toBeInTheDocument();
	});

	it('leaves the title control operable when the group is disabled', () => {
		render(
			<GroupBox disabled control={<Checkbox label="Use a proxy server" />}>
				<Checkbox label="Bypass for local addresses" />
			</GroupBox>
		);
		// The title checkbox is how you switch the group back on. Disabling
		// the fieldset would take it down with the contents.
		// By role, not by label: the group takes its name from the title
		// control, so the fieldset answers to that name too.
		expect(screen.getByRole('checkbox', { name: 'Use a proxy server' })).toBeEnabled();
	});

	it('distinguishes primary from secondary', () => {
		const { container: primary } = render(<GroupBox title="A">x</GroupBox>);
		const { container: secondary } = render(
			<GroupBox variant="secondary" title="B">
				x
			</GroupBox>
		);
		const cls = (c: HTMLElement) => c.querySelector('fieldset')?.className ?? '';
		expect(cls(primary)).not.toBe(cls(secondary));
	});

	it('has no automatically detectable accessibility violations', async () => {
		const { container } = render(
			<GroupBox title="Sharing">
				<Checkbox label="Share this folder" />
			</GroupBox>
		);
		expect(await checkA11y(container)).toHaveNoViolations();
	});
});
