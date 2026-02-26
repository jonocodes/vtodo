
<script lang="ts">
  import type { Todo } from '$lib/stores/todos';
  import { renderMarkdown } from '$lib/utils/markdown';

  let { todo, onToggle, onSelect }: {
    todo: Todo;
    onToggle: (id: string) => void;
    onSelect: (id: string) => void;
  } = $props();

  let expanded = $state(false);

  const priorityColors: Record<number, string> = {
    1: 'var(--color-danger)',
    5: 'var(--color-accent)',
    9: 'var(--color-text-muted)',
  };

  const priorityBorder = $derived(
    todo.priority > 0 ? priorityColors[todo.priority] ?? 'var(--color-border)' : 'var(--color-border)'
  );

  function formatDue(d: Date): string {
    const now = new Date();
    const diff = d.getTime() - now.getTime();
    const days = Math.ceil(diff / 86400000);
    if (days < 0) return `${Math.abs(days)}d overdue`;
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 7) return d.toLocaleDateString('en', { weekday: 'short' });
    return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
  }

  const dueColor = $derived(() => {
    if (!todo.due) return '';
    const days = Math.ceil((todo.due.getTime() - Date.now()) / 86400000);
    if (days < 0) return 'var(--color-danger)';
    if (days === 0) return 'var(--color-accent)';
    return 'var(--color-text-muted)';
  });
</script>

<div
  class="group flex items-start gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer"
  style="background: transparent;"
  onmouseenter={(e) => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)'}
  onmouseleave={(e) => (e.currentTarget as HTMLElement).style.background = 'transparent'}
  onclick={() => todo.description ? expanded = !expanded : onSelect(todo.id)}
  role="button"
  tabindex="0"
  onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); expanded = !expanded; }}}
>
  <!-- Checkbox -->
  <button
    onclick={(e: MouseEvent) => { e.stopPropagation(); onToggle(todo.id); }}
    class="mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors"
    style="border-color: {priorityBorder}; {todo.completed ? `background: ${priorityBorder};` : ''}"
  >
    {#if todo.completed}
      <svg class="w-3 h-3" fill="white" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
      </svg>
    {/if}
  </button>

  <!-- Content -->
  <div class="flex-1 min-w-0">
    <div class="flex items-center gap-2">
      <span
        class="text-sm leading-snug {todo.completed ? 'line-through' : ''}"
        style="{todo.completed ? 'color: var(--color-text-muted);' : 'color: var(--color-text);'}"
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

    <!-- Meta line: due date -->
    {#if todo.due}
      <div class="text-xs mt-0.5" style="color: {dueColor()};">
        {formatDue(todo.due)}
      </div>
    {/if}

    <!-- Expanded: markdown description -->
    {#if expanded && todo.description}
      <div
        class="mt-2 text-sm prose prose-sm dark:prose-invert max-w-none"
        style="color: var(--color-text);"
      >
        {@html renderMarkdown(todo.description)}
      </div>
    {/if}
  </div>

  <!-- Expand indicator -->
  {#if todo.description}
    <span
      class="text-xs mt-1 transition-transform flex-shrink-0"
      style="color: var(--color-text-muted); transform: rotate({expanded ? '90deg' : '0deg'});"
    >▶</span>
  {/if}
</div>
