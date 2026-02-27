import type { Todo } from '$lib/models/todo';
import type { TodoList } from '$lib/models/list';
import * as todoDB from '$lib/db/todos';
import * as listDB from '$lib/db/lists';

/** Demo lists beyond the default Inbox */
export const DEMO_LISTS: TodoList[] = [
	{ id: 'work', name: 'Work', color: '#3b82f6', sortOrder: 1 },
	{ id: 'personal', name: 'Personal', color: '#22c55e', sortOrder: 2 },
];

/** Build demo todos with dates relative to "now" so they always look fresh */
export function buildDemoTodos(now = new Date()): Todo[] {
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 0);
	const tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate() + 1);
	const nextWeek = new Date(today);
	nextWeek.setDate(nextWeek.getDate() + 5);

	return [
		{
			id: 'demo-1',
			listId: 'inbox',
			summary: 'Buy groceries',
			description:
				'- [ ] Eggs\n- [ ] Bread\n- [ ] Milk\n- [ ] Avocados\n- [ ] Coffee beans',
			status: 'NEEDS-ACTION',
			completedAt: null,
			priority: 5,
			due: today,
			rrule: null,
			tags: ['errands'],
			reminders: [],
			created: now,
			modified: now,
			sortOrder: 1,
			rawIcs: null,
		},
		{
			id: 'demo-2',
			listId: 'inbox',
			summary: 'Schedule dentist appointment',
			description: '',
			status: 'NEEDS-ACTION',
			completedAt: null,
			priority: 7,
			due: nextWeek,
			rrule: null,
			tags: [],
			reminders: [],
			created: now,
			modified: now,
			sortOrder: 2,
			rawIcs: null,
		},
		{
			id: 'demo-3',
			listId: 'work',
			summary: 'Review pull request for auth service',
			description:
				'Check the new OAuth2 token refresh flow.\n\n- [ ] Read through code changes\n- [ ] Run test suite\n- [ ] Leave review comments',
			status: 'NEEDS-ACTION',
			completedAt: null,
			priority: 1,
			due: today,
			rrule: null,
			tags: ['code-review'],
			reminders: [],
			created: now,
			modified: now,
			sortOrder: 3,
			rawIcs: null,
		},
		{
			id: 'demo-4',
			listId: 'work',
			summary: 'Prepare slides for team standup',
			description: '',
			status: 'NEEDS-ACTION',
			completedAt: null,
			priority: 5,
			due: tomorrow,
			rrule: null,
			tags: [],
			reminders: [],
			created: now,
			modified: now,
			sortOrder: 4,
			rawIcs: null,
		},
		{
			id: 'demo-5',
			listId: 'work',
			summary: 'Update project README',
			description: '',
			status: 'COMPLETED',
			completedAt: now,
			priority: 9,
			due: null,
			rrule: null,
			tags: ['docs'],
			reminders: [],
			created: now,
			modified: now,
			sortOrder: 5,
			rawIcs: null,
		},
		{
			id: 'demo-6',
			listId: 'personal',
			summary: 'Go for a 30-minute run',
			description: '',
			status: 'NEEDS-ACTION',
			completedAt: null,
			priority: 0,
			due: today,
			rrule: 'FREQ=DAILY',
			tags: ['health'],
			reminders: [],
			created: now,
			modified: now,
			sortOrder: 6,
			rawIcs: null,
		},
		{
			id: 'demo-7',
			listId: 'personal',
			summary: 'Read chapter 5 of Design Patterns',
			description:
				'Focus on the **Observer** and **Strategy** patterns.\n\nTake notes on how they apply to the notification system refactor at work.',
			status: 'NEEDS-ACTION',
			completedAt: null,
			priority: 0,
			due: null,
			rrule: null,
			tags: ['learning'],
			reminders: [],
			created: now,
			modified: now,
			sortOrder: 7,
			rawIcs: null,
		},
		{
			id: 'demo-8',
			listId: 'personal',
			summary: 'Plan weekend trip',
			description:
				'- [ ] Pick a destination\n- [ ] Book accommodation\n- [ ] Check the weather forecast',
			status: 'NEEDS-ACTION',
			completedAt: null,
			priority: 5,
			due: nextWeek,
			rrule: null,
			tags: ['travel'],
			reminders: [],
			created: now,
			modified: now,
			sortOrder: 8,
			rawIcs: null,
		},
	];
}

/**
 * Seed the database with demo data.
 * Skips seeding if any todos already exist.
 * Returns true if data was seeded, false if skipped.
 */
export async function seedDemoData(): Promise<boolean> {
	const existing = await todoDB.getAllTodos();
	if (existing.length > 0) return false;

	for (const list of DEMO_LISTS) {
		await listDB.putList(list);
	}

	const todos = buildDemoTodos();
	await todoDB.putTodos(todos);

	return true;
}
