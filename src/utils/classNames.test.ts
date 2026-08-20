// classNames Utility Tests

import { describe, it, expect } from 'vitest';
import { mergeClasses, createClassBuilder } from './classNames';

describe('mergeClasses', () => {
	it('joins class names with spaces', () => {
		expect(mergeClasses('a', 'b', 'c')).toBe('a b c');
	});

	it('drops undefined, null, false and empty strings', () => {
		expect(mergeClasses('a', undefined, null, false, '', 'b')).toBe('a b');
	});

	it('keeps the result of a satisfied conditional', () => {
		const isActive = true;
		expect(mergeClasses('base', isActive && 'active')).toBe('base active');
	});

	it('drops a number, rather than emitting it as a class', () => {
		// `styles.row` alongside a count is an easy mistake to make, and a
		// plain filter(Boolean) would have produced `class="row 5"`.
		expect(mergeClasses('row', 5)).toBe('row');
		expect(mergeClasses('row', 0)).toBe('row');
	});

	it('returns an empty string when nothing survives', () => {
		expect(mergeClasses(undefined, false, null)).toBe('');
	});

	it('handles no arguments', () => {
		expect(mergeClasses()).toBe('');
	});
});

describe('createClassBuilder', () => {
	it('prefixes every result with the base class', () => {
		const cn = createClassBuilder('button');
		expect(cn('primary')).toBe('button primary');
	});

	it('applies the same filtering as mergeClasses', () => {
		const cn = createClassBuilder('button');
		expect(cn(undefined, false, 'disabled', 0)).toBe('button disabled');
	});

	it('returns just the base class when given nothing', () => {
		expect(createClassBuilder('button')()).toBe('button');
	});
});
