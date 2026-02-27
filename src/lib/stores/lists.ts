import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import type { TodoList } from '$lib/models/list';
import { createList } from '$lib/models/list';
import * as listDB from '$lib/db/lists';
import { removeTodosByList } from './todos';

// Re-export for convenience
export type { TodoList } from '$lib/models/list';

/** The default inbox list — always exists */
const INBOX: TodoList = { id: 'inbox', name: 'Inbox', color: '#6b7280', sortOrder: 0 };

/** Reactive store for all lists */
export const lists = writable<TodoList[]>([INBOX]);

/** Currently selected list ID (or smart list like _today, _upcoming) */
export const activeListId = writable<string>('inbox');

/** Whether the store has finished initial load */
export const listsReady = writable(false);

/** Load all lists from IndexedDB into the store */
export async function loadLists(): Promise<void> {
	if (!browser) return;
	let all = await listDB.getAllLists();

	// Ensure inbox always exists
	if (!all.find((l) => l.id === 'inbox')) {
		await listDB.putList(INBOX);
		all = [INBOX, ...all];
	}

	lists.set(all);
	listsReady.set(true);
}

/** Add a new list */
export async function addList(name: string, color?: string): Promise<TodoList> {
	const list = createList(name, color ? { color } : undefined);
	await listDB.putList(list);
	lists.update((all) => [...all, list]);
	return list;
}

/** Rename a list */
export async function renameList(id: string, name: string): Promise<void> {
	const all = get(lists);
	const existing = all.find((l) => l.id === id);
	if (!existing) return;

	const updated = { ...existing, name };
	await listDB.putList(updated);
	lists.update((all) => all.map((l) => (l.id === id ? updated : l)));
}

/** Change list color */
export async function updateListColor(id: string, color: string): Promise<void> {
	const all = get(lists);
	const existing = all.find((l) => l.id === id);
	if (!existing) return;

	const updated = { ...existing, color };
	await listDB.putList(updated);
	lists.update((all) => all.map((l) => (l.id === id ? updated : l)));
}

/** Delete a list and all its todos */
export async function removeList(id: string): Promise<void> {
	if (id === 'inbox') return; // Never delete inbox
	await listDB.deleteList(id);
	await removeTodosByList(id);
	lists.update((all) => all.filter((l) => l.id !== id));

	// If the deleted list was active, switch to inbox
	if (get(activeListId) === id) {
		activeListId.set('inbox');
	}
}

/** Reorder lists by updating sortOrder */
export async function reorderLists(orderedIds: string[]): Promise<void> {
	const all = get(lists);
	const updated = orderedIds
		.map((id, i) => {
			const list = all.find((l) => l.id === id);
			return list ? { ...list, sortOrder: i } : null;
		})
		.filter(Boolean) as TodoList[];

	await listDB.putLists(updated);
	lists.set(updated);
}

// Initialize on first load in browser
if (browser) {
	loadLists();
}
