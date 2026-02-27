import { describe, it, expect } from 'vitest';
import { DEMO_LISTS, buildDemoTodos } from './seed';

describe('DEMO_LISTS', () => {
	it('provides lists with unique IDs', () => {
		const ids = DEMO_LISTS.map((l) => l.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('has required fields on every list', () => {
		for (const list of DEMO_LISTS) {
			expect(list.name).toBeTruthy();
			expect(list.color).toMatch(/^#[0-9a-f]{6}$/i);
			expect(typeof list.sortOrder).toBe('number');
		}
	});
});

describe('buildDemoTodos', () => {
	const todos = buildDemoTodos(new Date('2025-06-15T10:00:00'));

	it('returns 8 demo todos', () => {
		expect(todos).toHaveLength(8);
	});

	it('assigns unique IDs to every todo', () => {
		const ids = todos.map((t) => t.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('references only known list IDs', () => {
		const validLists = new Set(['inbox', ...DEMO_LISTS.map((l) => l.id)]);
		for (const todo of todos) {
			expect(validLists.has(todo.listId)).toBe(true);
		}
	});

	it('includes at least one completed todo', () => {
		expect(todos.some((t) => t.status === 'COMPLETED')).toBe(true);
	});

	it('includes todos with due dates', () => {
		expect(todos.filter((t) => t.due !== null).length).toBeGreaterThanOrEqual(3);
	});

	it('includes a recurring todo', () => {
		expect(todos.some((t) => t.rrule !== null)).toBe(true);
	});

	it('includes todos with descriptions', () => {
		expect(todos.filter((t) => t.description.length > 0).length).toBeGreaterThanOrEqual(3);
	});

	it('includes todos with tags', () => {
		expect(todos.filter((t) => t.tags.length > 0).length).toBeGreaterThanOrEqual(3);
	});
});
