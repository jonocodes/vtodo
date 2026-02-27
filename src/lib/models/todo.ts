/** VTODO-aligned todo model (RFC 5545) */

export interface Todo {
  /** Unique identifier (UID in VTODO) */
  id: string;
  /** Which list/calendar this todo belongs to */
  listId: string;
  /** SUMMARY — the todo title */
  summary: string;
  /** DESCRIPTION — markdown notes, may contain checkboxes */
  description: string;
  /** STATUS — maps to COMPLETED / NEEDS-ACTION / IN-PROCESS */
  status: TodoStatus;
  /** COMPLETED — timestamp when completed (null if not) */
  completedAt: Date | null;
  /** PRIORITY — 0=undefined, 1-4=high, 5=medium, 6-9=low (RFC 5545) */
  priority: number;
  /** DUE — due date/time */
  due: Date | null;
  /** RRULE — recurrence rule string (e.g. "FREQ=DAILY;INTERVAL=1") */
  rrule: string | null;
  /** CATEGORIES — tags */
  tags: string[];
  /** VALARM — reminders */
  reminders: Reminder[];
  /** CREATED */
  created: Date;
  /** LAST-MODIFIED */
  modified: Date;
  /** Sort order within a list */
  sortOrder: number;
  /** Raw ICS string for round-tripping (populated when syncing) */
  rawIcs: string | null;
}

export type TodoStatus = 'NEEDS-ACTION' | 'IN-PROCESS' | 'COMPLETED';

export interface Reminder {
  /** Trigger — offset in minutes before DUE (negative = before) */
  offsetMinutes: number;
  /** Whether the reminder has been dismissed */
  dismissed: boolean;
}

/** Create a new todo with sensible defaults */
export function createTodo(listId: string, summary: string, overrides?: Partial<Todo>): Todo {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    listId,
    summary,
    description: '',
    status: 'NEEDS-ACTION',
    completedAt: null,
    priority: 0,
    due: null,
    rrule: null,
    tags: [],
    reminders: [],
    created: now,
    modified: now,
    sortOrder: Date.now(),
    rawIcs: null,
    ...overrides,
  };
}
