
<script lang="ts">
  import type { Todo } from '$lib/stores/todos';

  let { todo, onToggle, onSelect, onDelete, selected = false }: {
    todo: Todo;
    onToggle: (id: string) => void;
    onSelect: (id: string) => void;
    onDelete?: (id: string) => void;
    selected?: boolean;
  } = $props();

  const isCompleted = $derived(todo.status === 'COMPLETED');

  const priorityColors: Record<number, string> = {
    1: 'var(--color-danger)',
    2: 'var(--color-danger)',
    3: 'var(--color-danger)',
    4: 'var(--color-danger)',
    5: 'var(--color-accent)',
    6: 'var(--color-text-muted)',
    7: 'var(--color-text-muted)',
    8: 'var(--color-text-muted)',
    9: 'var(--color-text-muted)',
  };

  const priorityBorder = $derived(
    todo.priority > 0 ? priorityColors[todo.priority] ?? 'var(--color-border)' : 'var(--color-border)'
  );

  function formatDue(d: Date): string {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diff = dueStart.getTime() - todayStart.getTime();
    const days = Math.round(diff / 86400000);
    if (days < 0) return `${Math.abs(days)}d overdue`;
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 7) return d.toLocaleDateString('en', { weekday: 'short' });
    return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
  }

  const dueColor = $derived(() => {
    if (!todo.due) return '';
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const dueStart = new Date(todo.due);
    dueStart.setHours(0, 0, 0, 0);
    const days = Math.round((dueStart.getTime() - todayStart.getTime()) / 86400000);
    if (days < 0) return 'var(--color-danger)';
    if (days === 0) return 'var(--color-accent)';
    return 'var(--color-text-muted)';
  });
</script>

<div
  class="group flex items-start gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer"
  style="background: {selected ? 'var(--color-surface)' : 'transparent'};"
  onmouseenter={(e) => { if (!selected) (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)'; }}
  onmouseleave={(e) => { if (!selected) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
  onclick={() => onSelect(todo.id)}
  role="button"
  tabindex="0"
  onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(todo.id); }}}
>
  <!-- Checkbox -->
  <button
    onclick={(e: MouseEvent) => { e.stopPropagation(); onToggle(todo.id); }}
    class="mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors"
    style="border-color: {priorityBorder}; {isCompleted ? `background: ${priorityBorder};` : ''}"
  >
    {#if isCompleted}
      <svg class="w-3 h-3" fill="white" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
      </svg>
    {/if}
  </button>

  <!-- Content -->
  <div class="flex-1 min-w-0">
    <div class="flex items-center gap-2">
      <span
        class="text-sm leading-snug {isCompleted ? 'line-through' : ''}"
        style="{isCompleted ? 'color: var(--color-text-muted);' : 'color: var(--color-text);'}"
      >
        {todo.summary}
      </span>
      {#each todo.tags as tag}
        <span
          class="text-[10px] px-1.5 py-0.5 rounded-full"
          style="background: var(--color-border); color: var(--color-text-muted);"
        >{tag}</span>
      {/each}
    </div>

    <!-- Meta line: due date + recurrence -->
    {#if todo.due}
      <div class="flex items-center gap-1 text-xs mt-0.5" style="color: {dueColor()};">
        {formatDue(todo.due)}
        {#if todo.rrule}
          <span title="Recurring">↻</span>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Delete button (shown on hover) -->
  {#if onDelete}
    <button
      onclick={(e: MouseEvent) => { e.stopPropagation(); onDelete?.(todo.id); }}
      class="opacity-0 group-hover:opacity-100 p-1 rounded hover:opacity-80 flex-shrink-0 transition-opacity"
      style="color: var(--color-text-muted);"
      title="Delete"
    >
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  {/if}

  <!-- Notes indicator -->
  {#if todo.description}
    <span
      class="text-[10px] mt-1.5 flex-shrink-0"
      style="color: var(--color-text-muted);"
      title="Has notes"
    >&#9998;</span>
  {/if}
</div>
