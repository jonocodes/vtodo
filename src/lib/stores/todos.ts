import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import type { Todo, TodoStatus } from '$lib/models/todo';
import { createTodo } from '$lib/models/todo';
import * as todoDB from '$lib/db/todos';

// Re-export for convenience
export type { Todo } from '$lib/models/todo';
export { createTodo } from '$lib/models/todo';

/** Reactive store for all todos — synced with IndexedDB */
export const todos = writable<Todo[]>([]);

/** Whether the store has finished initial load from IndexedDB */
export const todosReady = writable(false);

/** Load all todos from IndexedDB into the store */
export async function loadTodos(): Promise<void> {
	if (!browser) return;
	const all = await todoDB.getAllTodos();
	todos.set(all);
	todosReady.set(true);
}

/** Add a new todo and persist it */
export async function addTodo(
	listId: string,
	summary: string,
	overrides?: Partial<Todo>,
): Promise<Todo> {
	const todo = createTodo(listId, summary, overrides);
	await todoDB.putTodo(todo);
	todos.update((all) => [...all, todo]);
	return todo;
}

/** Update a todo field and persist */
export async function updateTodo(id: string, changes: Partial<Todo>): Promise<void> {
	const all = get(todos);
	const existing = all.find((t) => t.id === id);
	if (!existing) return;

	const updated: Todo = { ...existing, ...changes, modified: new Date() };
	await todoDB.putTodo(updated);
	todos.update((all) => all.map((t) => (t.id === id ? updated : t)));
}

/** Toggle completion status */
export async function toggleTodo(id: string): Promise<void> {
	const all = get(todos);
	const existing = all.find((t) => t.id === id);
	if (!existing) return;

	const isCompleting = existing.status !== 'COMPLETED';
	const updated: Todo = {
		...existing,
		status: (isCompleting ? 'COMPLETED' : 'NEEDS-ACTION') as TodoStatus,
		completedAt: isCompleting ? new Date() : null,
		modified: new Date(),
	};

	await todoDB.putTodo(updated);
	todos.update((all) => all.map((t) => (t.id === id ? updated : t)));
}

/** Delete a todo */
export async function removeTodo(id: string): Promise<void> {
	await todoDB.deleteTodo(id);
	todos.update((all) => all.filter((t) => t.id !== id));
}

/** Dismiss a specific reminder on a todo */
export async function dismissReminder(todoId: string, reminderIndex: number): Promise<void> {
	const all = get(todos);
	const existing = all.find((t) => t.id === todoId);
	if (!existing) return;

	const reminders = existing.reminders.map((r, i) =>
		i === reminderIndex ? { ...r, dismissed: true } : r,
	);
	const updated: Todo = { ...existing, reminders, modified: new Date() };
	await todoDB.putTodo(updated);
	todos.update((all) => all.map((t) => (t.id === todoId ? updated : t)));
}

/** Delete all todos in a list */
export async function removeTodosByList(listId: string): Promise<void> {
	const all = get(todos);
	const toRemove = all.filter((t) => t.listId === listId);
	for (const t of toRemove) {
		await todoDB.deleteTodo(t.id);
	}
	todos.update((all) => all.filter((t) => t.listId !== listId));
}

// Initialize on first load in browser
if (browser) {
	loadTodos();
}
