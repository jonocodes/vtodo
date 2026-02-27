import { browser } from '$app/environment';

/** Request notification permission from the user */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!browser || !('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const result = await Notification.requestPermission();
  return result === 'granted';
}

/** Check if notifications are supported and permitted */
export function canNotify(): boolean {
  if (!browser || !('Notification' in window)) return false;
  return Notification.permission === 'granted';
}

/** Show a notification for a todo reminder */
export function showReminderNotification(todoSummary: string, listName?: string): void {
  if (!canNotify()) return;

  new Notification('VTodo Reminder', {
    body: todoSummary,
    tag: `vtodo-reminder-${todoSummary}`,
    icon: '/icon-192.png',
  });
}

let reminderInterval: ReturnType<typeof setInterval> | null = null;

interface ReminderCheck {
  getTodos: () => Array<{
    id: string;
    summary: string;
    due: Date | null;
    status: string;
    reminders: Array<{ offsetMinutes: number; dismissed: boolean }>;
  }>;
  dismissReminder: (todoId: string, reminderIndex: number) => void;
}

/** Start the reminder check loop (runs every 60 seconds) */
export function startReminderLoop(callbacks: ReminderCheck): void {
  if (!browser) return;
  stopReminderLoop();

  function check() {
    if (!canNotify()) return;

    const now = Date.now();
    const todos = callbacks.getTodos();

    for (const todo of todos) {
      if (todo.status === 'COMPLETED' || !todo.due) continue;

      todo.reminders.forEach((reminder, idx) => {
        if (reminder.dismissed) return;

        const triggerTime = new Date(todo.due!).getTime() + reminder.offsetMinutes * 60 * 1000;
        // Fire if we're within 60 seconds of the trigger time
        if (now >= triggerTime && now < triggerTime + 60000) {
          showReminderNotification(todo.summary);
          callbacks.dismissReminder(todo.id, idx);
        }
      });
    }
  }

  // Check immediately and then every 60 seconds
  check();
  reminderInterval = setInterval(check, 60000);
}

/** Stop the reminder check loop */
export function stopReminderLoop(): void {
  if (reminderInterval) {
    clearInterval(reminderInterval);
    reminderInterval = null;
  }
}
