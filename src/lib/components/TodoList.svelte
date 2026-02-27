<script lang="ts">
	import { todos, addTodo, toggleTodo, removeTodo } from '$lib/stores/todos';
	import { activeListId } from '$lib/stores/lists';
	import TodoItem from './TodoItem.svelte';

	let {
		selectedTodoId = $bindable(null),
		onSelect,
	}: {
		selectedTodoId?: string | null;
		onSelect?: (id: string) => void;
	} = $props();

	// Filter and sort todos based on active list
	const filteredTodos = $derived.by(() => {
		const listId = $activeListId;
		const all = $todos;

		if (listId === '_today') {
			const now = Date.now();
			const todayEnd = now - (now % 86400000) + 86400000 - 1;
			return all.filter((t) => t.due && t.due.getTime() <= todayEnd);
		}
		if (listId === '_upcoming') {
			const now = Date.now();
			const next7End = now + 7 * 86400000;
			return all.filter((t) => t.due && t.due.getTime() <= next7End);
		}
		return all.filter((t) => t.listId === listId);
	});

	const pending = $derived(
		filteredTodos
			.filter((t) => t.status !== 'COMPLETED')
			.sort((a, b) => {
				// Sort: high priority first, then by due date, then by creation
				if (a.priority !== b.priority) {
					const ap = a.priority || 10;
					const bp = b.priority || 10;
					return ap - bp;
				}
				if (a.due && b.due) return new Date(a.due).getTime() - new Date(b.due).getTime();
				if (a.due) return -1;
				if (b.due) return 1;
				return a.sortOrder - b.sortOrder;
			}),
	);

	const completed = $derived(filteredTodos.filter((t) => t.status === 'COMPLETED'));

	let showCompleted = $state(false);
	let quickAddValue = $state('');

	async function handleQuickAdd(e: KeyboardEvent) {
		if (e.key === 'Enter' && quickAddValue.trim()) {
			const listId = $activeListId.startsWith('_') ? 'inbox' : $activeListId;
			await addTodo(listId, quickAddValue.trim());
			quickAddValue = '';
		}
	}

	function handleToggle(id: string) {
		toggleTodo(id);
	}

	function handleDelete(id: string) {
		if (selectedTodoId === id) {
			selectedTodoId = null;
		}
		removeTodo(id);
	}

	function selectTodo(id: string) {
		selectedTodoId = id;
		onSelect?.(id);
	}
</script>

<div class="flex-1 overflow-y-auto flex flex-col">
	<!-- Quick add -->
	<div class="px-4 py-3 border-b" style="border-color: var(--color-border);">
		<input
			type="text"
			placeholder="Add a todo... (Enter to add)"
			class="w-full bg-transparent text-sm outline-none placeholder-opacity-50"
			style="color: var(--color-text);"
			bind:value={quickAddValue}
			onkeydown={handleQuickAdd}
		/>
	</div>

	<!-- Pending todos -->
	{#if pending.length === 0 && completed.length === 0}
		<div class="px-4 py-12 text-center">
			<p class="text-sm" style="color: var(--color-text-muted);">No todos yet. Add one above!</p>
		</div>
	{:else}
		<div class="px-1 py-1">
			{#each pending as todo (todo.id)}
				<TodoItem
					{todo}
					onToggle={handleToggle}
					onSelect={selectTodo}
					onDelete={handleDelete}
					selected={selectedTodoId === todo.id}
				/>
			{/each}
		</div>
	{/if}

	<!-- Completed section pinned to bottom -->
	{#if completed.length > 0}
		<div class="mt-auto border-t" style="border-color: var(--color-border);">
			<div class="px-4 py-2">
				<button
					onclick={() => (showCompleted = !showCompleted)}
					class="text-xs font-medium flex items-center gap-1"
					style="color: var(--color-text-muted);"
				>
					<span
						class="transition-transform"
						style="transform: rotate({showCompleted ? '90deg' : '0deg'});">▶</span
					>
					Completed ({completed.length})
				</button>
			</div>
			{#if showCompleted}
				<div class="px-1 py-1 opacity-60">
					{#each completed as todo (todo.id)}
						<TodoItem
							{todo}
							onToggle={handleToggle}
							onSelect={selectTodo}
							onDelete={handleDelete}
							selected={selectedTodoId === todo.id}
						/>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>
