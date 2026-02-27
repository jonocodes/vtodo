import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Todo } from '$lib/models/todo';
import type { TodoList } from '$lib/models/list';

export interface VTodoDB extends DBSchema {
	todos: {
		key: string;
		value: Todo;
		indexes: {
			'by-list': string;
			'by-status': string;
			'by-modified': Date;
		};
	};
	lists: {
		key: string;
		value: TodoList;
		indexes: {
			'by-sort': number;
		};
	};
}

const DB_NAME = 'vtodo';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<VTodoDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<VTodoDB>> {
	if (!dbPromise) {
		dbPromise = openDB<VTodoDB>(DB_NAME, DB_VERSION, {
			upgrade(db) {
				// Todos store
				const todoStore = db.createObjectStore('todos', { keyPath: 'id' });
				todoStore.createIndex('by-list', 'listId');
				todoStore.createIndex('by-status', 'status');
				todoStore.createIndex('by-modified', 'modified');

				// Lists store
				const listStore = db.createObjectStore('lists', { keyPath: 'id' });
				listStore.createIndex('by-sort', 'sortOrder');
			},
		});
	}
	return dbPromise;
}
