
<script lang="ts">
  import { todos } from '$lib/stores/todos';
  import { activeListId } from '$lib/stores/lists';
  import TodoItem from './TodoItem.svelte';

  let { selectedTodoId = $bindable(null), onSelect }: {
    selectedTodoId?: string | null;
    onSelect?: (id: string) => void;
  } = $props();

  const filteredTodos = $derived(
    $todos.filter(t => t.listId === $activeListId)
  );

  const pending = $derived(filteredTodos.filter(t => !t.completed));
  const completed = $derived(filteredTodos.filter(t => t.completed));

  let showCompleted = $state(false);

  function toggleTodo(id: string) {
    todos.update(all =>
      all.map(t => t.id === id ? { ...t, completed: !t.completed, modified: new Date() } : t)
    );
  }

  function selectTodo(id: string) {
    selectedTodoId = id;
    onSelect?.(id);
  }
</script>

<div class="flex-1 overflow-y-auto">
  <!-- Quick add (placeholder) -->
  <div class="px-4 py-3 border-b" style="border-color: var(--color-border);">
    <input
      type="text"
      placeholder="Add a todo..."
      class="w-full bg-transparent text-sm outline-none placeholder-opacity-50"
      style="color: var(--color-text);"
      onkeydown={(e) => {
        if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
          const val = (e.target as HTMLInputElement).value.trim();
          todos.update(all => [...all, {
            id: crypto.randomUUID(),
            listId: $activeListId,
            summary: val,
            description: '',
            completed: false,
            priority: 0,
            tags: [],
            created: new Date(),
            modified: new Date()
          }]);
          (e.target as HTMLInputElement).value = '';
        }
      }}
    />
  </div>

  <!-- Pending todos -->
  <div class="px-1 py-1">
    {#each pending as todo (todo.id)}
      <TodoItem {todo} onToggle={toggleTodo} onSelect={selectTodo} selected={selectedTodoId === todo.id} />
    {/each}
  </div>

  <!-- Completed section -->
  {#if completed.length > 0}
    <div class="px-4 mt-2">
      <button
        onclick={() => showCompleted = !showCompleted}
        class="text-xs font-medium flex items-center gap-1"
        style="color: var(--color-text-muted);"
      >
        <span class="transition-transform" style="transform: rotate({showCompleted ? '90deg' : '0deg'});">▶</span>
        Completed ({completed.length})
      </button>
    </div>
    {#if showCompleted}
      <div class="px-1 py-1 opacity-60">
        {#each completed as todo (todo.id)}
          <TodoItem {todo} onToggle={toggleTodo} onSelect={selectTodo} selected={selectedTodoId === todo.id} />
        {/each}
      </div>
    {/if}
  {/if}
</div>
