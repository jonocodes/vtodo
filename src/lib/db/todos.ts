import { getDB } from './schema';
import type { Todo } from '$lib/models/todo';

export async function getAllTodos(): Promise<Todo[]> {
	const db = await getDB();
	const todos = await db.getAll('todos');
	// Restore Date objects from IndexedDB (stored as strings)
	return todos.map(hydrateTodo);
}

export async function getTodosByList(listId: string): Promise<Todo[]> {
	const db = await getDB();
	const todos = await db.getAllFromIndex('todos', 'by-list', listId);
	return todos.map(hydrateTodo);
}

export async function getTodo(id: string): Promise<Todo | undefined> {
	const db = await getDB();
	const todo = await db.get('todos', id);
	return todo ? hydrateTodo(todo) : undefined;
}

export async function putTodo(todo: Todo): Promise<void> {
	const db = await getDB();
	await db.put('todos', todo);
}

export async function putTodos(todos: Todo[]): Promise<void> {
	const db = await getDB();
	const tx = db.transaction('todos', 'readwrite');
	for (const todo of todos) {
		tx.store.put(todo);
	}
	await tx.done;
}

export async function deleteTodo(id: string): Promise<void> {
	const db = await getDB();
	await db.delete('todos', id);
}

/** Re-hydrate Date objects that IndexedDB may have serialized */
function hydrateTodo(todo: Todo): Todo {
	return {
		...todo,
		due: todo.due ? new Date(todo.due) : null,
		completedAt: todo.completedAt ? new Date(todo.completedAt) : null,
		created: new Date(todo.created),
		modified: new Date(todo.modified),
	};
}
