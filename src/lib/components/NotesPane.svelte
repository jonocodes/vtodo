
<script lang="ts">
  import { todos } from '$lib/stores/todos';
  import type { Todo } from '$lib/stores/todos';

  let { todoId, onClose }: {
    todoId: string;
    onClose: () => void;
  } = $props();

  const todo = $derived($todos.find(t => t.id === todoId));

  let notes = $state('');

  // Sync notes when the selected todo changes
  $effect(() => {
    if (todo) {
      notes = todo.description;
    }
  });

  function saveNotes() {
    todos.update(all =>
      all.map(t => t.id === todoId ? { ...t, description: notes, modified: new Date() } : t)
    );
  }
</script>

{#if todo}
  <div
    class="h-full flex flex-col border-l"
    style="border-color: var(--color-border); background: var(--color-bg);"
  >
    <!-- Header -->
    <div
      class="flex items-center gap-2 px-4 py-3 border-b flex-shrink-0"
      style="border-color: var(--color-border);"
    >
      <h3 class="text-sm font-medium flex-1 truncate" style="color: var(--color-text);">
        {todo.summary}
      </h3>
      <button
        onclick={onClose}
        class="p-1 rounded hover:opacity-80 flex-shrink-0"
        style="color: var(--color-text-muted);"
        aria-label="Close notes"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Notes textarea -->
    <div class="flex-1 p-4 overflow-y-auto">
      <textarea
        class="w-full h-full resize-none bg-transparent text-sm outline-none"
        style="color: var(--color-text);"
        placeholder="Write your notes here..."
        bind:value={notes}
        oninput={saveNotes}
      ></textarea>
    </div>
  </div>
{/if}
