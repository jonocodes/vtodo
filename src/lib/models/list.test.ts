import { describe, it, expect } from 'vitest';
import { createList } from './list';

describe('createList', () => {
	it('creates a list with the given name', () => {
		const list = createList('Groceries');
		expect(list.name).toBe('Groceries');
	});

	it('sets default color and sort order', () => {
		const list = createList('Work');
		expect(list.id).toBeTruthy();
		expect(list.color).toBe('#6b7280');
		expect(typeof list.sortOrder).toBe('number');
	});

	it('applies color override', () => {
		const list = createList('Personal', { color: '#22c55e' });
		expect(list.color).toBe('#22c55e');
		expect(list.name).toBe('Personal');
	});

	it('generates unique IDs', () => {
		const a = createList('A');
		const b = createList('B');
		expect(a.id).not.toBe(b.id);
	});
});
