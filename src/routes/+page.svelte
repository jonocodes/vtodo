
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { get } from 'svelte/store';
  import TodoList from '$lib/components/TodoList.svelte';
  import NotesPane from '$lib/components/NotesPane.svelte';
  import { todos, dismissReminder } from '$lib/stores/todos';
  import { startReminderLoop, stopReminderLoop } from '$lib/utils/notifications';

  let selectedTodoId = $state<string | null>(null);

  onMount(() => {
    startReminderLoop({
      getTodos: () => get(todos),
      dismissReminder,
    });
  });

  onDestroy(() => {
    stopReminderLoop();
  });
</script>

<div class="flex flex-1 min-h-0">
  <TodoList bind:selectedTodoId />

  {#if selectedTodoId}
    <div class="w-80 flex-shrink-0 hidden md:flex">
      <NotesPane todoId={selectedTodoId} onClose={() => selectedTodoId = null} />
    </div>
  {/if}
</div>
