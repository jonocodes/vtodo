import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'light' | 'dark' | 'system';

function createThemeStore() {
	const stored = browser ? ((localStorage.getItem('vtodo-theme') as Theme) ?? 'system') : 'system';

	const { subscribe, set: _set, update: _update } = writable<Theme>(stored);

	function apply(theme: Theme) {
		if (!browser) return;
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		const isDark = theme === 'dark' || (theme === 'system' && prefersDark);
		document.documentElement.classList.toggle('dark', isDark);
	}

	function set(theme: Theme) {
		_set(theme);
		if (browser) {
			localStorage.setItem('vtodo-theme', theme);
			apply(theme);
		}
	}

	// Initialize on load
	if (browser) {
		apply(stored);
		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
			const current = (localStorage.getItem('vtodo-theme') as Theme) ?? 'system';
			if (current === 'system') apply('system');
		});
	}

	function update(fn: (t: Theme) => Theme) {
		_update((current) => {
			const next = fn(current);
			if (browser) {
				localStorage.setItem('vtodo-theme', next);
				apply(next);
			}
			return next;
		});
	}

	return { subscribe, set, update };
}

export const theme = createThemeStore();
