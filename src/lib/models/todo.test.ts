import { describe, it, expect } from 'vitest';
import { createTodo } from './todo';

describe('createTodo', () => {
	it('creates a todo with the given list and summary', () => {
		const todo = createTodo('inbox', 'Buy milk');
		expect(todo.listId).toBe('inbox');
		expect(todo.summary).toBe('Buy milk');
	});

	it('sets sensible defaults', () => {
		const todo = createTodo('inbox', 'Test');
		expect(todo.id).toBeTruthy();
		expect(todo.description).toBe('');
		expect(todo.status).toBe('NEEDS-ACTION');
		expect(todo.completedAt).toBeNull();
		expect(todo.priority).toBe(0);
		expect(todo.due).toBeNull();
		expect(todo.rrule).toBeNull();
		expect(todo.tags).toEqual([]);
		expect(todo.reminders).toEqual([]);
		expect(todo.rawIcs).toBeNull();
		expect(todo.created).toBeInstanceOf(Date);
		expect(todo.modified).toBeInstanceOf(Date);
		expect(typeof todo.sortOrder).toBe('number');
	});

	it('applies overrides', () => {
		const due = new Date('2025-12-25');
		const todo = createTodo('work', 'Ship feature', {
			priority: 1,
			due,
			tags: ['urgent'],
		});
		expect(todo.priority).toBe(1);
		expect(todo.due).toBe(due);
		expect(todo.tags).toEqual(['urgent']);
		expect(todo.listId).toBe('work');
	});

	it('generates unique IDs', () => {
		const a = createTodo('inbox', 'A');
		const b = createTodo('inbox', 'B');
		expect(a.id).not.toBe(b.id);
	});
});
