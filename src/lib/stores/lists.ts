import { writable } from "svelte/store";

export interface TodoList {
  id: string;
  name: string;
  color?: string;
}

// Placeholder data for Stage 0 — replaced by IndexedDB in Stage 1
const defaultLists: TodoList[] = [
  { id: "inbox", name: "Inbox" },
  { id: "groceries", name: "Groceries", color: "#22c55e" },
  { id: "work", name: "Work", color: "#3b82f6" },
];

export const lists = writable<TodoList[]>(defaultLists);
export const activeListId = writable<string>("inbox");
