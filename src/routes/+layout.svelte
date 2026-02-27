
<script lang="ts">
  import '../app.css';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import { lists, activeListId } from '$lib/stores/lists';
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();

  let sidebarCollapsed = $state(false);
  let mobileMenuOpen = $state(false);

  const smartListNames: Record<string, string> = {
    '_today': 'Today',
    '_upcoming': 'Upcoming',
  };

  const activeListName = $derived(
    smartListNames[$activeListId] ?? $lists.find(l => l.id === $activeListId)?.name ?? 'Inbox'
  );

  // Close mobile menu when list changes
  $effect(() => {
    $activeListId;
    mobileMenuOpen = false;
  });
</script>

<div class="h-full flex" style="background: var(--color-bg);">
  <!-- Mobile overlay -->
  {#if mobileMenuOpen}
    <div
      class="fixed inset-0 bg-black/50 z-40 md:hidden"
      onclick={() => mobileMenuOpen = false}
      role="button"
      tabindex="-1"
      onkeydown={(e) => { if (e.key === 'Escape') mobileMenuOpen = false; }}
    ></div>
  {/if}

  <!-- Sidebar: always visible on desktop, slide-over on mobile -->
  <div class="hidden md:flex h-full flex-shrink-0">
    <Sidebar collapsed={sidebarCollapsed} onToggle={() => sidebarCollapsed = !sidebarCollapsed} />
  </div>
  <div
    class="fixed inset-y-0 left-0 z-50 md:hidden transition-transform duration-200"
    style="transform: translateX({mobileMenuOpen ? '0' : '-100%'});"
  >
    <Sidebar />
  </div>

  <!-- Main content -->
  <main class="flex-1 flex flex-col min-w-0 h-full">
    <!-- Top bar -->
    <header class="flex items-center gap-3 px-4 py-3 border-b flex-shrink-0" style="border-color: var(--color-border);">
      <button class="md:hidden p-1" onclick={() => mobileMenuOpen = true}>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: var(--color-text);">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <h2 class="text-base font-medium" style="color: var(--color-text);">
        {activeListName}
      </h2>

      <!-- Sync status placeholder -->
      <div class="ml-auto flex items-center gap-2">
        <span class="text-xs" style="color: var(--color-text-muted);">Offline</span>
        <span class="w-2 h-2 rounded-full" style="background: var(--color-text-muted);"></span>
      </div>
    </header>

    {@render children()}
  </main>
</div>
