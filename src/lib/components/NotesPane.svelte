
<script lang="ts">
  import { todos, updateTodo, removeTodo } from '$lib/stores/todos';
  import type { Todo } from '$lib/stores/todos';
  import type { Reminder } from '$lib/models/todo';
  import { renderMarkdown } from '$lib/utils/markdown';
  import { requestNotificationPermission, canNotify } from '$lib/utils/notifications';

  let { todoId, onClose }: {
    todoId: string;
    onClose: () => void;
  } = $props();

  const todo = $derived($todos.find(t => t.id === todoId));

  // Local state for editing
  let editingSummary = $state(false);
  let summaryValue = $state('');
  let notes = $state('');
  let tagInput = $state('');
  let showMarkdownPreview = $state(false);

  // Recurrence options
  const rruleOptions = [
    { label: 'None', value: '' },
    { label: 'Daily', value: 'FREQ=DAILY' },
    { label: 'Weekly', value: 'FREQ=WEEKLY' },
    { label: 'Biweekly', value: 'FREQ=WEEKLY;INTERVAL=2' },
    { label: 'Monthly', value: 'FREQ=MONTHLY' },
    { label: 'Yearly', value: 'FREQ=YEARLY' },
  ];

  // Sync local state when selected todo changes
  $effect(() => {
    if (todo) {
      notes = todo.description;
      summaryValue = todo.summary;
    }
  });

  function saveNotes() {
    updateTodo(todoId, { description: notes });
  }

  function startEditSummary() {
    editingSummary = true;
    summaryValue = todo?.summary ?? '';
  }

  function saveSummary() {
    if (summaryValue.trim()) {
      updateTodo(todoId, { summary: summaryValue.trim() });
    }
    editingSummary = false;
  }

  function setPriority(p: number) {
    updateTodo(todoId, { priority: p });
  }

  function setDue(e: Event) {
    const input = e.target as HTMLInputElement;
    const due = input.value ? new Date(input.value + 'T00:00:00') : null;
    updateTodo(todoId, { due });
  }

  function setRrule(e: Event) {
    const select = e.target as HTMLSelectElement;
    updateTodo(todoId, { rrule: select.value || null });
  }

  function addTag() {
    if (!todo || !tagInput.trim()) return;
    const tag = tagInput.trim().toLowerCase();
    if (!todo.tags.includes(tag)) {
      updateTodo(todoId, { tags: [...todo.tags, tag] });
    }
    tagInput = '';
  }

  function removeTag(tag: string) {
    if (!todo) return;
    updateTodo(todoId, { tags: todo.tags.filter(t => t !== tag) });
  }

  // Reminders
  const reminderOptions = [
    { label: 'At time of due', value: 0 },
    { label: '5 min before', value: -5 },
    { label: '15 min before', value: -15 },
    { label: '30 min before', value: -30 },
    { label: '1 hour before', value: -60 },
    { label: '1 day before', value: -1440 },
  ];

  async function addReminder(offsetMinutes: number) {
    if (!todo) return;
    const granted = await requestNotificationPermission();
    if (!granted) return;
    const existing = todo.reminders.find(r => r.offsetMinutes === offsetMinutes);
    if (existing) return;
    const reminder: Reminder = { offsetMinutes, dismissed: false };
    updateTodo(todoId, { reminders: [...todo.reminders, reminder] });
  }

  function removeReminder(index: number) {
    if (!todo) return;
    updateTodo(todoId, { reminders: todo.reminders.filter((_, i) => i !== index) });
  }

  function formatReminderOffset(minutes: number): string {
    if (minutes === 0) return 'At time of due';
    const abs = Math.abs(minutes);
    if (abs < 60) return `${abs} min before`;
    if (abs === 60) return '1 hour before';
    if (abs < 1440) return `${abs / 60} hours before`;
    if (abs === 1440) return '1 day before';
    return `${abs / 1440} days before`;
  }

  function handleDelete() {
    removeTodo(todoId);
    onClose();
  }

  function formatDateForInput(d: Date | null): string {
    if (!d) return '';
    const date = new Date(d);
    return date.toISOString().split('T')[0];
  }

  function toggleCheckbox(index: number) {
    if (!todo) return;
    const lines = notes.split('\n');
    let checkboxCount = 0;
    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(/^(\s*- \[)([ x])(\])/);
      if (match) {
        if (checkboxCount === index) {
          lines[i] = match[2] === 'x'
            ? lines[i].replace('- [x]', '- [ ]')
            : lines[i].replace('- [ ]', '- [x]');
          notes = lines.join('\n');
          saveNotes();
          return;
        }
        checkboxCount++;
      }
    }
  }
</script>

{#if todo}
  <div
    class="h-full flex flex-col border-l overflow-hidden"
    style="border-color: var(--color-border); background: var(--color-bg);"
  >
    <!-- Header -->
    <div
      class="flex items-center gap-2 px-4 py-3 border-b flex-shrink-0"
      style="border-color: var(--color-border);"
    >
      {#if editingSummary}
        <input
          class="text-sm font-medium flex-1 bg-transparent outline-none border-b"
          style="color: var(--color-text); border-color: var(--color-accent);"
          bind:value={summaryValue}
          onblur={saveSummary}
          onkeydown={(e) => { if (e.key === 'Enter') saveSummary(); if (e.key === 'Escape') editingSummary = false; }}
          autofocus
        />
      {:else}
        <h3
          class="text-sm font-medium flex-1 truncate cursor-pointer hover:opacity-80"
          style="color: var(--color-text);"
          onclick={startEditSummary}
          title="Click to edit"
        >
          {todo.summary}
        </h3>
      {/if}
      <button
        onclick={onClose}
        class="p-1 rounded hover:opacity-80 flex-shrink-0"
        style="color: var(--color-text-muted);"
        aria-label="Close"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Scrollable content -->
    <div class="flex-1 overflow-y-auto">
      <!-- Priority -->
      <div class="px-4 py-3 border-b" style="border-color: var(--color-border);">
        <label class="text-xs font-medium block mb-1.5" style="color: var(--color-text-muted);">Priority</label>
        <div class="flex gap-1">
          {#each [
            { value: 0, label: 'None', color: 'var(--color-border)' },
            { value: 9, label: 'Low', color: 'var(--color-text-muted)' },
            { value: 5, label: 'Med', color: 'var(--color-accent)' },
            { value: 1, label: 'High', color: 'var(--color-danger)' },
          ] as p}
            <button
              onclick={() => setPriority(p.value)}
              class="text-xs px-2.5 py-1 rounded-md transition-colors"
              style="
                border: 1.5px solid {p.color};
                {todo.priority === p.value ? `background: ${p.color}; color: white;` : `color: ${p.color};`}
              "
            >
              {p.label}
            </button>
          {/each}
        </div>
      </div>

      <!-- Due Date -->
      <div class="px-4 py-3 border-b" style="border-color: var(--color-border);">
        <label class="text-xs font-medium block mb-1.5" style="color: var(--color-text-muted);">Due Date</label>
        <input
          type="date"
          class="text-sm bg-transparent outline-none w-full"
          style="color: var(--color-text);"
          value={formatDateForInput(todo.due)}
          onchange={setDue}
        />
      </div>

      <!-- Recurrence -->
      <div class="px-4 py-3 border-b" style="border-color: var(--color-border);">
        <label class="text-xs font-medium block mb-1.5" style="color: var(--color-text-muted);">Repeat</label>
        <select
          class="text-sm bg-transparent outline-none w-full"
          style="color: var(--color-text);"
          value={todo.rrule ?? ''}
          onchange={setRrule}
        >
          {#each rruleOptions as opt}
            <option value={opt.value}>{opt.label}</option>
          {/each}
        </select>
      </div>

      <!-- Tags -->
      <div class="px-4 py-3 border-b" style="border-color: var(--color-border);">
        <label class="text-xs font-medium block mb-1.5" style="color: var(--color-text-muted);">Tags</label>
        <div class="flex flex-wrap gap-1 mb-2">
          {#each todo.tags as tag}
            <span
              class="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
              style="background: var(--color-border); color: var(--color-text-muted);"
            >
              {tag}
              <button
                onclick={() => removeTag(tag)}
                class="hover:opacity-60"
                aria-label="Remove tag {tag}"
              >&times;</button>
            </span>
          {/each}
        </div>
        <input
          type="text"
          class="text-sm bg-transparent outline-none w-full"
          style="color: var(--color-text);"
          placeholder="Add tag (Enter)"
          bind:value={tagInput}
          onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
        />
      </div>

      <!-- Reminders -->
      {#if todo.due}
        <div class="px-4 py-3 border-b" style="border-color: var(--color-border);">
          <span class="text-xs font-medium block mb-1.5" style="color: var(--color-text-muted);">Reminders</span>
          {#each todo.reminders as reminder, idx}
            <div class="flex items-center justify-between text-xs mb-1" style="color: var(--color-text);">
              <span>{formatReminderOffset(reminder.offsetMinutes)}</span>
              <button
                onclick={() => removeReminder(idx)}
                class="hover:opacity-60"
                style="color: var(--color-text-muted);"
              >&times;</button>
            </div>
          {/each}
          <select
            class="text-xs bg-transparent outline-none w-full mt-1"
            style="color: var(--color-text-muted);"
            onchange={(e) => { const v = parseInt((e.target as HTMLSelectElement).value); if (!isNaN(v)) addReminder(v); (e.target as HTMLSelectElement).value = ''; }}
          >
            <option value="">Add reminder...</option>
            {#each reminderOptions as opt}
              <option value={opt.value}>{opt.label}</option>
            {/each}
          </select>
        </div>
      {/if}

      <!-- Notes / Description -->
      <div class="px-4 py-3">
        <div class="flex items-center justify-between mb-1.5">
          <label class="text-xs font-medium" style="color: var(--color-text-muted);">Notes</label>
          {#if todo.description}
            <button
              class="text-xs"
              style="color: var(--color-accent);"
              onclick={() => showMarkdownPreview = !showMarkdownPreview}
            >
              {showMarkdownPreview ? 'Edit' : 'Preview'}
            </button>
          {/if}
        </div>
        {#if showMarkdownPreview && todo.description}
          <div
            class="text-sm prose prose-sm dark:prose-invert max-w-none min-h-[120px]"
            style="color: var(--color-text);"
            onclick={(e) => {
              const target = e.target as HTMLElement;
              if (target.tagName === 'INPUT' && target.getAttribute('type') === 'checkbox') {
                const checkboxes = (e.currentTarget as HTMLElement).querySelectorAll('input[type="checkbox"]');
                const idx = Array.from(checkboxes).indexOf(target as HTMLInputElement);
                if (idx >= 0) toggleCheckbox(idx);
              }
            }}
          >
            {@html renderMarkdown(notes)}
          </div>
        {:else}
          <textarea
            class="w-full min-h-[120px] resize-none bg-transparent text-sm outline-none"
            style="color: var(--color-text);"
            placeholder="Write notes, checklists (- [ ] item)..."
            bind:value={notes}
            oninput={saveNotes}
          ></textarea>
        {/if}
      </div>
    </div>

    <!-- Footer: Delete -->
    <div class="px-4 py-2 border-t flex-shrink-0" style="border-color: var(--color-border);">
      <button
        onclick={handleDelete}
        class="text-xs px-3 py-1.5 rounded-md transition-colors hover:opacity-80"
        style="color: var(--color-danger);"
      >
        Delete todo
      </button>
    </div>
  </div>
{/if}
