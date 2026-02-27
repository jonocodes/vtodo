# Todo App — Project Plan

A minimal, open-source, offline-first PWA for managing todos. Speaks CalDAV/VTODO natively. Clean, checkbox-focused UI inspired by TickTick's simplicity.

---

## Principles

1. **Local-first.** The app works fully offline. The server is optional.
2. **Open standards.** VTODO is the data format. CalDAV is the sync protocol. No proprietary lock-in.
3. **Minimal UI.** Checkbox lists, not project management. If a feature doesn't help you check things off, it doesn't belong.
4. **No backend to build.** Sync targets existing infrastructure (Radicale, Baikal, Nextcloud). Zero custom server code.

---

## Data Model

Storage format: iCalendar VTODO (RFC 5545 / RFC 7986)

Each todo item maps to a single VTODO object. Here's how your features map:

| Feature | VTODO Property | Notes |
|---|---|---|
| Title | `SUMMARY` | |
| Done/not done | `STATUS` + `COMPLETED` | `COMPLETED` / `NEEDS-ACTION` / `IN-PROCESS` |
| Due date/time | `DUE` | |
| Priority | `PRIORITY` | 1-9 scale (1=high, 9=low, 0=undefined) |
| Recurrence | `RRULE` | Full RFC 5545 recurrence rules |
| Reminders | `VALARM` | Nested alarm components |
| Notes | `DESCRIPTION` | Markdown rendered in app, stored as plain text (round-trips through CalDAV as-is since markdown is valid plain text) |
| Checklist (sub-items) | `DESCRIPTION` with checkboxes | `- [x] item` in description body — rendered as interactive checkboxes via markdown. VTODO sub-tasks (RELATED-TO) have poor client support so this is preferred. |
| Tags/labels | `CATEGORIES` | Comma-separated |
| List membership | CalDAV Calendar/Collection | Each "list" is a CalDAV calendar |
| Attachments | `ATTACH` | URI reference to file, or inline base64 for small files |
| Created/modified | `CREATED` / `LAST-MODIFIED` | Used for conflict detection |

### What this gives you for free

- Tasks.org, Thunderbird, GNOME To Do, Apple Reminders can all read/write your data
- Any CalDAV server works (Radicale, Baikal, Nextcloud, Fastmail, iCloud)
- Data is plain text `.ics` files — inspectable, scriptable, version-controllable

### Limitations to accept

- Sub-tasks as separate linked VTODOs (`RELATED-TO`) work poorly across clients. Use markdown checklists in `DESCRIPTION` instead.
- Attachments: small files inline as base64, larger files as URI references (stored via WebDAV alongside the calendar or externally). Not all CalDAV clients will display these.
- Custom fields beyond VTODO spec (like custom colors, app-specific metadata) would go in `X-` prefixed properties. These survive sync but are invisible to other clients.

---

## Tech Stack

### Frontend
- **Framework:** Svelte 5 + SvelteKit (static adapter for PWA output)
  - Why Svelte: smallest bundle size, no virtual DOM overhead, excellent for a lightweight app. You want TickTick-minimal, not React-heavy.
  - SvelteKit's static adapter produces a pure static site deployable anywhere.
- **Styling:** Tailwind CSS
  - Dark mode via `class` strategy (user preference with system default)
- **VTODO parsing:** `ical.js` (Mozilla's iCalendar library — mature, handles RRULE, VALARM, etc.)
- **CalDAV client:** `tsdav` (TypeScript CalDAV/CardDAV client, works in browser)
- **Markdown rendering:** `marked` (fast, lightweight) + `DOMPurify` (sanitize HTML output)
- **Date parsing (nice-to-have):** `chrono-node` for natural language date input ("wed 7pm", "tomorrow morning")
- **Offline storage:** IndexedDB via `idb` (lightweight wrapper)
- **PWA:** Vite PWA plugin (`vite-plugin-pwa` with Workbox) for service worker, caching, install prompt

### Sync Target
- **Primary:** Any CalDAV server (Radicale recommended for self-hosting)
- **Protocol:** CalDAV (RFC 4791) — REPORT queries, sync-token for efficient delta sync
- **Conflict resolution:** Last-write-wins per VTODO, using `LAST-MODIFIED` + ETag

### Dev Tooling
- TypeScript (strict mode)
- Vite (bundler, dev server)
- Vitest (unit tests)
- Playwright (e2e tests for PWA behavior)
- ESLint + Prettier

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   PWA (Browser)                  │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │  UI Layer │  │  Stores  │  │  Sync Engine  │  │
│  │ (Svelte) │◄►│ (Svelte  │◄►│               │  │
│  │          │  │  stores)  │  │  CalDAV ◄──►  │──── CalDAV Server
│  └──────────┘  └────┬─────┘  │  client       │  │   (Radicale, etc.)
│                     │        └───────────────┘  │
│                     ▼                            │
│              ┌─────────────┐                     │
│              │  IndexedDB  │                     │
│              │ (offline    │                     │
│              │  cache)     │                     │
│              └─────────────┘                     │
└─────────────────────────────────────────────────┘
```

### Key architectural decisions

**IndexedDB is the source of truth for the UI.** The UI always reads from IndexedDB. The sync engine pushes/pulls between IndexedDB and the CalDAV server in the background. This means:
- The app is always fast (no network dependency for reads)
- Offline works by default
- Sync is a background process, not a blocking operation

**Each VTODO is stored as both parsed object and raw ICS.** IndexedDB stores the parsed fields (for querying/display) and the original ICS string (for round-tripping to CalDAV without data loss). This avoids the problem of re-serializing and accidentally dropping properties.

**Lists = CalDAV calendars.** Each list (Groceries, Work, Personal) maps to a CalDAV calendar collection. This is how every CalDAV client does it.

---

## Stages

### Stage 0 — Skeleton (1-2 days)
**Goal:** Empty SvelteKit project that builds as a PWA and can be installed.

- [x] Initialize SvelteKit + static adapter + TypeScript
- [x] Configure Tailwind with dark mode
- [x] Add vite-plugin-pwa with basic service worker
- [x] Create app shell: sidebar (lists) + main area (todos) + top bar
- [ ] Verify: installable PWA, works offline (shows empty shell), dark mode toggle

**Deliverable:** An installable PWA with a static UI skeleton.

### Stage 1 — Local-only todo management (1 week)
**Goal:** Fully functional todo app with no sync. All data in IndexedDB.

- [x] Data layer: IndexedDB schema for todos and lists, CRUD operations
- [x] VTODO model: TypeScript interfaces matching VTODO properties
- [x] List management: create, rename, delete, reorder lists
- [x] Todo CRUD: add, edit, complete, delete todos
- [x] Quick-add input bar with keyboard shortcut
- [x] Checkbox-focused list view with inline editing
- [x] Priority support (visual indicator, sort by priority)
- [x] Due dates (date picker, sort/filter by due date)
- [x] Basic recurrence (daily, weekly, monthly, custom RRULE)
- [x] Minimal notes per item (expandable text field)
- [x] Checklist sub-items within a todo (markdown checkboxes in description)
- [x] Tags/categories (add, filter by tag)
- [x] Reminders (notification API, scheduled via service worker)

**Deliverable:** A complete offline todo app. Usable as a daily driver at this point.

### Stage 2 — CalDAV Sync (1-2 weeks)
**Goal:** Two-way sync with a CalDAV server.

- [ ] CalDAV connection setup UI (server URL, username, password — stored in IndexedDB, encrypted)
- [ ] Discovery: find calendars via PROPFIND on principal URL
- [ ] Initial sync: pull all VTODOs from server, populate IndexedDB
- [ ] ICS serialization: convert local todos to valid VTODO ICS strings using ical.js
- [ ] ICS parsing: parse incoming VTODOs into local model
- [ ] Push: PUT new/modified VTODOs to server
- [ ] Pull: REPORT query with sync-token for efficient delta sync
- [ ] Conflict handling: compare ETags + LAST-MODIFIED, last-write-wins
- [ ] Sync status indicator in UI (synced / syncing / offline / error)
- [ ] Background periodic sync (configurable interval)
- [ ] Sync on app focus / visibility change
- [ ] List sync: create/delete CalDAV calendars from the app
- [ ] Test against Radicale, Baikal, Nextcloud

**Deliverable:** Full two-way sync. Use on phone browser + laptop browser with shared data.

### Stage 3 — Polish & UX (1 week)
**Goal:** Make it feel as smooth as TickTick.

- [ ] Animations: checkbox completion, list transitions, swipe gestures (mobile)
- [ ] Drag-to-reorder todos within a list
- [ ] Swipe actions on mobile (swipe right = complete, swipe left = delete/snooze)
- [ ] Smart date input: integrate chrono-node for "tomorrow", "wed 7pm", "next month"
- [ ] Keyboard shortcuts (n = new todo, d = set due date, p = set priority, etc.)
- [ ] Search across all lists
- [ ] Filter views: Today, Upcoming, Overdue, by tag
- [ ] Empty states and onboarding
- [ ] Responsive layout: single-pane on mobile, sidebar on desktop
- [ ] Touch targets and mobile-optimized interactions

**Deliverable:** A polished daily-driver app.

### Stage 4 — Attachments (3-5 days)
**Goal:** Attach images/files to todos.

- [ ] Attachment UI: add file/image to a todo
- [ ] Small files (<100KB): inline as base64 in VTODO ATTACH property
- [ ] Larger files: upload to WebDAV (alongside CalDAV calendar), store URI in ATTACH
- [ ] Image preview in todo detail view
- [ ] Attachment sync: handle missing attachments gracefully when offline

**Deliverable:** Working attachment support for photos, documents, etc.

### Future / Maybe
These are not planned for initial development but the architecture should not preclude them:

- **Calendar view** — render todos with due dates on a calendar grid
- **Sharing lists** — CalDAV supports shared calendars; UI for managing access
- **Natural language input** — already scaffolded in Stage 3 with chrono-node
- **Import from TickTick** — parse TickTick CSV export, generate VTODOs
- **Multiple sync accounts** — connect to more than one CalDAV server
- **End-to-end encryption** — encrypt VTODO content before pushing to server
- **Electron/Tauri wrapper** — for native desktop app + Syncthing folder sync
- **Widget support** — if packaged as a native app via Tauri/Capacitor

---

## File Structure (initial)

```
src/
├── lib/
│   ├── components/        # Svelte components
│   │   ├── TodoList.svelte
│   │   ├── TodoItem.svelte
│   │   ├── QuickAdd.svelte
│   │   ├── Sidebar.svelte
│   │   ├── ListHeader.svelte
│   │   └── Settings.svelte
│   ├── stores/            # Svelte stores (reactive state)
│   │   ├── todos.ts       # Todo CRUD operations + store
│   │   ├── lists.ts       # List management store
│   │   └── sync.ts        # Sync state (status, last sync time)
│   ├── db/                # IndexedDB layer
│   │   ├── schema.ts      # DB schema definition
│   │   ├── todos.ts       # Todo persistence operations
│   │   └── lists.ts       # List persistence operations
│   ├── sync/              # CalDAV sync engine
│   │   ├── caldav.ts      # CalDAV client wrapper
│   │   ├── engine.ts      # Sync orchestration (push/pull/conflict)
│   │   ├── ics.ts         # VTODO <-> local model conversion
│   │   └── scheduler.ts   # Background sync scheduling
│   ├── models/            # TypeScript types
│   │   ├── todo.ts        # Todo interface
│   │   ├── list.ts        # List interface
│   │   └── vtodo.ts       # VTODO-specific types
│   └── utils/
│       ├── dates.ts       # Date helpers, recurrence logic
│       ├── priorities.ts  # Priority mapping
│       └── notifications.ts # Reminder/notification helpers
├── routes/
│   ├── +layout.svelte     # App shell
│   └── +page.svelte       # Main view
├── app.css                # Tailwind imports + global styles
└── service-worker.ts      # PWA service worker
```

---

## Open Risks & Decisions

1. **`tsdav` browser compatibility.** tsdav is primarily tested in Node.js. It should work in the browser since CalDAV is just HTTP, but CORS may be an issue with some CalDAV servers. Radicale supports CORS configuration. Fallback: write a minimal CalDAV client using fetch directly — the protocol is simple enough.

2. **CORS on CalDAV servers.** Browsers enforce CORS. Radicale and Baikal can be configured for it. Nextcloud may need a plugin. If CORS is a persistent problem, a tiny proxy could be needed, or use the PWA only in "installed" mode where CORS is relaxed (this varies by browser — not reliable).

3. **Credential storage.** Storing CalDAV username/password in IndexedDB is necessary for offline sync credentials to persist. Should be encrypted with a user-provided passphrase or use the Web Crypto API. Alternatively, support token-based auth where the CalDAV server supports it.

4. **Recurrence rule complexity.** RRULE is powerful but complex. For Stage 1, support the common cases (daily, weekly, monthly, yearly with interval). Full RRULE parsing comes from ical.js, but the UI for creating complex rules can be progressive.

5. **Service worker update strategy.** PWAs need careful cache management. Use "stale while revalidate" for the app shell and "network first" for sync operations.

6. **Svelte vs alternatives.** Svelte is recommended for bundle size and simplicity. If you prefer React or Vue, the architecture is the same — swap the component layer. The sync engine and data layer are framework-agnostic.