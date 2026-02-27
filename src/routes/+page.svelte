<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { get } from 'svelte/store';
	import TodoList from '$lib/components/TodoList.svelte';
	import NotesPane from '$lib/components/NotesPane.svelte';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import { todos, dismissReminder } from '$lib/stores/todos';
	import { startReminderLoop, stopReminderLoop } from '$lib/utils/notifications';

	let selectedTodoId = $state<string | null>(null);
	let drawerOpen = $state(false);

	const mdBreakpoint = '(min-width: 768px)';

	function handleSelect(id: string) {
		selectedTodoId = id;
		// Only open the drawer on mobile; desktop uses the side panel
		if (!window.matchMedia(mdBreakpoint).matches) {
			drawerOpen = true;
		}
	}

	function handleClose() {
		selectedTodoId = null;
		drawerOpen = false;
	}

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
	<TodoList bind:selectedTodoId onSelect={handleSelect} />

	<!-- Desktop: side panel -->
	{#if selectedTodoId}
		<div class="w-80 flex-shrink-0 hidden md:flex">
			<NotesPane todoId={selectedTodoId} onClose={handleClose} />
		</div>
	{/if}

	<!-- Mobile: bottom sheet drawer -->
	<div class="md:hidden">
		<Drawer.Root bind:open={drawerOpen} onClose={handleClose}>
			<Drawer.Portal>
				<Drawer.Overlay />
				<Drawer.Content>
					<Drawer.Header class="sr-only">
						<Drawer.Title>Todo Details</Drawer.Title>
					</Drawer.Header>
					{#if selectedTodoId}
						<div class="max-h-[85vh] overflow-y-auto">
							<NotesPane todoId={selectedTodoId} onClose={handleClose} />
						</div>
					{/if}
				</Drawer.Content>
			</Drawer.Portal>
		</Drawer.Root>
	</div>
</div>
