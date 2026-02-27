
<script lang="ts">
  import { lists, activeListId, addList, renameList, removeList, updateListColor } from '$lib/stores/lists';
  import { theme } from '$lib/stores/theme';
  import type { Theme } from '$lib/stores/theme';

  let { collapsed = false, onToggle }: { collapsed?: boolean; onToggle?: () => void } = $props();

  const smartLists = [
    { id: '_today', name: 'Today', icon: '☀' },
    { id: '_upcoming', name: 'Upcoming', icon: '📅' },
  ];

  const listColors = ['#6b7280', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

  // Theme
  function cycleTheme() {
    theme.update((t: Theme) => {
      if (t === 'system') return 'dark';
      if (t === 'dark') return 'light';
      return 'system';
    });
  }

  let currentTheme = $state<Theme>('system');
  theme.subscribe((t: Theme) => currentTheme = t);

  const themeIcon = $derived(
    currentTheme === 'dark' ? '🌙' : currentTheme === 'light' ? '☀️' : '💻'
  );

  // List creation
  let showNewList = $state(false);
  let newListName = $state('');

  async function handleCreateList() {
    if (newListName.trim()) {
      const list = await addList(newListName.trim());
      activeListId.set(list.id);
      newListName = '';
      showNewList = false;
    }
  }

  // List editing
  let editingListId = $state<string | null>(null);
  let editingName = $state('');

  function startRename(id: string, name: string) {
    editingListId = id;
    editingName = name;
  }

  function finishRename() {
    if (editingListId && editingName.trim()) {
      renameList(editingListId, editingName.trim());
    }
    editingListId = null;
  }

  // Context menu
  let contextMenu = $state<{ x: number; y: number; listId: string } | null>(null);

  function showContextMenu(e: MouseEvent, listId: string) {
    if (listId === 'inbox') return;
    e.preventDefault();
    contextMenu = { x: e.clientX, y: e.clientY, listId };
  }

  function closeContextMenu() {
    contextMenu = null;
  }

  function handleColorChange(listId: string, color: string) {
    updateListColor(listId, color);
    closeContextMenu();
  }

  function handleDeleteList(listId: string) {
    removeList(listId);
    closeContextMenu();
  }
</script>

<svelte:window onclick={closeContextMenu} />

<aside
  class="h-full flex flex-col border-r transition-all duration-200 select-none"
  style="border-color: var(--color-border); background: var(--color-surface); width: {collapsed ? '0px' : '240px'}; overflow: hidden;"
>
  <div class="p-4 flex items-center justify-between min-w-[240px]">
    <h1 class="text-lg font-semibold tracking-tight" style="color: var(--color-text);">VTodo</h1>
    <div class="flex gap-1">
      <button
        onclick={cycleTheme}
        class="p-1.5 rounded-md text-sm hover:opacity-80 transition-opacity"
        title="Theme: {currentTheme}"
      >
        {themeIcon}
      </button>
      {#if onToggle}
        <button onclick={onToggle} class="p-1.5 rounded-md text-sm hover:opacity-80 transition-opacity" title="Collapse sidebar">
          ◀
        </button>
      {/if}
    </div>
  </div>

  <!-- Smart lists -->
  <nav class="px-2 mb-2 min-w-[240px]">
    {#each smartLists as sl}
      <button
        onclick={() => activeListId.set(sl.id)}
        class="w-full text-left px-3 py-1.5 rounded-md text-sm flex items-center gap-2 transition-colors"
        style={$activeListId === sl.id ? 'background: var(--color-accent); color: white;' : 'color: var(--color-text-muted);'}
      >
        <span>{sl.icon}</span>
        <span>{sl.name}</span>
      </button>
    {/each}
  </nav>

  <div class="px-4 min-w-[240px]">
    <div class="border-t" style="border-color: var(--color-border);"></div>
  </div>

  <!-- User lists -->
  <nav class="px-2 mt-2 flex-1 overflow-y-auto min-w-[240px]">
    <div class="px-3 py-1 flex items-center justify-between">
      <span class="text-xs font-medium uppercase tracking-wider" style="color: var(--color-text-muted);">Lists</span>
      <button
        onclick={() => { showNewList = true; }}
        class="text-xs px-1.5 rounded hover:opacity-80"
        style="color: var(--color-text-muted);"
        title="New list"
      >+</button>
    </div>

    {#each $lists as list (list.id)}
      {#if editingListId === list.id}
        <div class="px-3 py-1">
          <input
            class="text-sm bg-transparent outline-none border-b w-full"
            style="color: var(--color-text); border-color: var(--color-accent);"
            bind:value={editingName}
            onblur={finishRename}
            onkeydown={(e) => { if (e.key === 'Enter') finishRename(); if (e.key === 'Escape') editingListId = null; }}
            autofocus
          />
        </div>
      {:else}
        <button
          onclick={() => activeListId.set(list.id)}
          ondblclick={() => { if (list.id !== 'inbox') startRename(list.id, list.name); }}
          oncontextmenu={(e) => showContextMenu(e, list.id)}
          class="w-full text-left px-3 py-1.5 rounded-md text-sm flex items-center gap-2 transition-colors"
          style={$activeListId === list.id ? 'background: var(--color-accent); color: white;' : 'color: var(--color-text);'}
        >
          <span
            class="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style="background: {list.color ?? 'var(--color-text-muted)'};"
          ></span>
          <span class="truncate">{list.name}</span>
        </button>
      {/if}
    {/each}

    <!-- New list input -->
    {#if showNewList}
      <div class="px-3 py-1">
        <input
          class="text-sm bg-transparent outline-none border-b w-full"
          style="color: var(--color-text); border-color: var(--color-accent);"
          placeholder="List name..."
          bind:value={newListName}
          onblur={() => { if (!newListName.trim()) showNewList = false; else handleCreateList(); }}
          onkeydown={(e) => { if (e.key === 'Enter') handleCreateList(); if (e.key === 'Escape') { showNewList = false; newListName = ''; } }}
          autofocus
        />
      </div>
    {/if}
  </nav>

  <!-- Bottom: settings -->
  <div class="p-2 border-t min-w-[240px]" style="border-color: var(--color-border);">
    <button
      class="w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors"
      style="color: var(--color-text-muted);"
    >
      ⚙ Settings
    </button>
  </div>
</aside>

<!-- Context menu -->
{#if contextMenu}
  <div
    class="fixed z-[100] rounded-lg shadow-lg py-1 min-w-[160px]"
    style="left: {contextMenu.x}px; top: {contextMenu.y}px; background: var(--color-surface); border: 1px solid var(--color-border);"
    onclick={(e) => e.stopPropagation()}
  >
    <button
      onclick={() => { const list = $lists.find(l => l.id === contextMenu?.listId); if (list && contextMenu) startRename(contextMenu.listId, list.name); closeContextMenu(); }}
      class="w-full text-left px-3 py-1.5 text-sm hover:opacity-80"
      style="color: var(--color-text);"
    >
      Rename
    </button>

    <div class="px-3 py-1.5">
      <div class="text-xs mb-1" style="color: var(--color-text-muted);">Color</div>
      <div class="flex gap-1 flex-wrap">
        {#each listColors as color}
          <button
            onclick={() => { if (contextMenu) handleColorChange(contextMenu.listId, color); }}
            class="w-5 h-5 rounded-full border"
            style="background: {color}; border-color: var(--color-border);"
          ></button>
        {/each}
      </div>
    </div>

    <div class="border-t my-1" style="border-color: var(--color-border);"></div>

    <button
      onclick={() => { if (contextMenu) handleDeleteList(contextMenu.listId); }}
      class="w-full text-left px-3 py-1.5 text-sm hover:opacity-80"
      style="color: var(--color-danger);"
    >
      Delete
    </button>
  </div>
{/if}
