/** A todo list — maps to a CalDAV calendar collection */
export interface TodoList {
	/** Unique identifier */
	id: string;
	/** Display name */
	name: string;
	/** Color hex (e.g. "#22c55e") */
	color: string;
	/** Sort order in sidebar */
	sortOrder: number;
}

/** Create a new list with defaults */
export function createList(name: string, overrides?: Partial<TodoList>): TodoList {
	return {
		id: crypto.randomUUID(),
		name,
		color: '#6b7280',
		sortOrder: Date.now(),
		...overrides,
	};
}
