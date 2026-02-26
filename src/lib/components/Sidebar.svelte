
<script lang="ts">
  import { lists, activeListId } from '$lib/stores/lists';
  import { theme } from '$lib/stores/theme';
  import type { Theme } from '$lib/stores/theme';

  let { collapsed = false, onToggle }: { collapsed?: boolean; onToggle?: () => void } = $props();

  const smartLists = [
    { id: '_today', name: 'Today', icon: '☀️' },
    { id: '_upcoming', name: 'Upcoming', icon: '📅' },
  ];

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
</script>

<aside
  class="h-full flex flex-col border-r transition-all duration-200 select-none"
  style="border-color: var(--color-border); background: var(--color-surface); width: {collapsed ? '0px' : '240px'}; overflow: hidden;"
>
  <div class="p-4 flex items-center justify-between min-w-[240px]">
    <h1 class="text-lg font-semibold tracking-tight">VTodo</h1>
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
    <div class="px-3 py-1 text-xs font-medium uppercase tracking-wider" style="color: var(--color-text-muted);">
      Lists
    </div>
    {#each $lists as list}
      <button
        onclick={() => activeListId.set(list.id)}
        class="w-full text-left px-3 py-1.5 rounded-md text-sm flex items-center gap-2 transition-colors"
        style={$activeListId === list.id ? 'background: var(--color-accent); color: white;' : 'color: var(--color-text);'}
      >
        <span
          class="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style="background: {list.color ?? 'var(--color-text-muted)'};"
        ></span>
        <span class="truncate">{list.name}</span>
      </button>
    {/each}
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
