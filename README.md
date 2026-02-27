# VTodo

A minimal, offline-first PWA for managing todos. Speaks CalDAV/VTODO natively.

## Principles

- **Local-first.** Works fully offline. The server is optional.
- **Open standards.** VTODO (RFC 5545) is the data format. CalDAV is the sync protocol.
- **Minimal UI.** Checkbox lists, not project management.
- **No backend to build.** Syncs with existing CalDAV servers (Radicale, Baikal, Nextcloud).

## Stack

- Svelte 5 + SvelteKit (static adapter)
- Tailwind CSS v4
- IndexedDB (via `idb`) for offline storage
- `ical.js` for VTODO parsing
- `marked` + `DOMPurify` for markdown rendering
- `vite-plugin-pwa` for service worker and installability

## Development

```
bun install
bun dev
```

visit http://localhost:5173

Docker:

```
docker compose up
```

visit http://localhost:8080

Build for production:

```
bun run build
bun run preview
```

Visit: http://localhost:4173
