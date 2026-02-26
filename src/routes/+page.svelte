
<script lang="ts">
  import TodoList from '$lib/components/TodoList.svelte';
  import NotesPane from '$lib/components/NotesPane.svelte';

  let selectedTodoId = $state<string | null>(null);
</script>

<div class="flex flex-1 min-h-0">
  <TodoList bind:selectedTodoId />

  {#if selectedTodoId}
    <div class="w-80 flex-shrink-0 hidden md:flex">
      <NotesPane todoId={selectedTodoId} onClose={() => selectedTodoId = null} />
    </div>
  {/if}
</div>
