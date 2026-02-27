import { getDB } from './schema';
import type { TodoList } from '$lib/models/list';

export async function getAllLists(): Promise<TodoList[]> {
  const db = await getDB();
  const lists = await db.getAllFromIndex('lists', 'by-sort');
  return lists;
}

export async function getList(id: string): Promise<TodoList | undefined> {
  const db = await getDB();
  return db.get('lists', id);
}

export async function putList(list: TodoList): Promise<void> {
  const db = await getDB();
  await db.put('lists', list);
}

export async function putLists(lists: TodoList[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('lists', 'readwrite');
  for (const list of lists) {
    tx.store.put(list);
  }
  await tx.done;
}

export async function deleteList(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('lists', id);
}
