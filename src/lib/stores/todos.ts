import { writable } from "svelte/store";

export interface Todo {
  id: string;
  listId: string;
  summary: string;
  description: string;
  completed: boolean;
  priority: number; // 0=none, 1=high, 5=medium, 9=low
  due?: Date;
  tags: string[];
  created: Date;
  modified: Date;
}

// Placeholder data for Stage 0
const demoTodos: Todo[] = [
  {
    id: "1",
    listId: "inbox",
    summary: "Try out the new todo app",
    description:
      "## Getting started\n\nThis is a **markdown** description.\n\n- [x] Install the PWA\n- [ ] Add your first todo\n- [ ] Set up CalDAV sync",
    completed: false,
    priority: 1,
    tags: ["meta"],
    created: new Date(),
    modified: new Date(),
  },
  {
    id: "2",
    listId: "inbox",
    summary: "Set up Radicale server",
    description: "",
    completed: false,
    priority: 5,
    tags: [],
    due: new Date(Date.now() + 86400000),
    created: new Date(),
    modified: new Date(),
  },
  {
    id: "3",
    listId: "groceries",
    summary: "Milk",
    description: "",
    completed: false,
    priority: 0,
    tags: [],
    created: new Date(),
    modified: new Date(),
  },
  {
    id: "4",
    listId: "groceries",
    summary: "Eggs",
    description: "",
    completed: true,
    priority: 0,
    tags: [],
    created: new Date(),
    modified: new Date(),
  },
];

export const todos = writable<Todo[]>(demoTodos);
