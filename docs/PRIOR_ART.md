# Prior Art Survey

Created 2026-02-27

This document summarizes the existing open-source todo applications evaluated before deciding to build a custom solution. The goal was to find an app that is open source, offline-first, cross-platform (web PWA + Android), uses open standards for data storage, and requires no custom backend — just a generic sync target like CalDAV or WebDAV.

## Requirements

- Open source
- Offline support with cross-device sync
- Minimal, checkbox-focused UI (similar to TickTick)
- Recurring tasks, priorities, reminders, tags
- Markdown notes per item
- No mandatory server component to develop or maintain
- Sync via open protocols (CalDAV/VTODO preferred)
- Attachments (nice to have)

## Apps Evaluated

### SuperProductivity

**What it is:** An advanced open-source todo and time-tracking app built with Angular. Available as a desktop app (Electron), web app, and Android app. Supports sync via WebDAV, Dropbox, and Syncthing (desktop only).

**Pros:**
- Local-first architecture — data stored as JSON on device, no server required
- WebDAV and Syncthing sync options are well-aligned with the goal of using generic infrastructure
- Feature-rich: tags, subtasks, recurring tasks, notes, keyboard shortcuts
- Active development and community

**Cons:**
- Heavily oriented around time tracking, timeboxing, Pomodoro timers, idle detection, and daily planning workflows. These features are deeply integrated into the core data model and UI rather than being cleanly separable modules.
- Forking and stripping unwanted features would require ongoing maintenance of a hard fork against a fast-moving upstream (the maintainer noted ~400 commits of architectural changes in a recent period, including an op-log system and sync architecture overhaul).
- Uses a custom JSON format for storage, meaning no interoperability with other todo clients via CalDAV/VTODO.
- The UI, while configurable, is designed around the time-management workflow and carries visual complexity even with features disabled.

**Verdict:** The closest architectural match (local-first, WebDAV sync, no server), but the time-management focus makes it a poor fit for a minimal checkbox-oriented workflow without a significant forking effort.

### Vikunja

**What it is:** A self-hosted, open-source task and project manager (AGPLv3). Offers a web UI, desktop app (Electron), mobile app, and CalDAV support. Written in Go with a Vue.js frontend.

**Pros:**
- Full-featured: priorities, recurring tasks, labels, shared lists, attachments, reminders
- CalDAV/VTODO support for interoperability with other clients
- Actively developed with a hosted cloud option available
- Supports multiple database backends (SQLite for simple setups)

**Cons:**
- No offline support. The PWA shows a "no internet" page when disconnected. Offline capability has been an open feature request since 2021 and the maintainer has described it as a long-term goal, not a current priority.
- Requires running a server (Go binary + database). Even with SQLite, this is a process to deploy, maintain, secure, and keep updated. This conflicts with the goal of zero custom backend.
- The Android app is limited and has been described by community members as unusable for daily use. The practical mobile path is using the web UI or pairing with Tasks.org via CalDAV.
- CalDAV implementation has known limitations — it only handles VTODO objects, so CalDAV clients that create richer objects can cause sync failures.

**Verdict:** Strong feature set and CalDAV support, but the server requirement and lack of offline capability are disqualifying for a local-first PWA approach.

### Tasks.org

**What it is:** An open-source Android task management app. Supports sync with Google Tasks, CalDAV (including Radicale, Nextcloud, and others), Microsoft To Do, and EteSync.

**Pros:**
- Excellent CalDAV/VTODO support — one of the best native VTODO clients available
- Genuine offline-first behavior on Android
- Supports priorities, recurring tasks, tags, subtasks, reminders
- Active development, available on F-Droid

**Cons:**
- Android only. No web app, no desktop app, no PWA. Cannot serve as a cross-platform solution on its own.
- Would need to be paired with a separate web/desktop client for non-Android use.

**Verdict:** The best CalDAV todo client on Android. Kept as a reference and potential companion client for the CalDAV backend, but cannot be the primary app due to platform limitations.


### Planify

**What it is:** A task manager for GNOME desktop. Syncs with CalDAV (Nextcloud) and Todoist.

**Pros:**
- Clean, well-designed UI
- CalDAV sync support
- Good integration with the GNOME ecosystem

**Cons:**
- GNOME-only desktop app. No web version, no Android app, no PWA.
- Depends on the GNOME platform libraries, limiting portability.

**Verdict:** Nice design reference but not cross-platform.

### Other tools considered

- **Nextcloud Tasks:** Good VTODO web client, but requires running a full Nextcloud instance — far heavier than needed for todo sync.
- **Todoman:** CLI-based CalDAV VTODO client. Useful as a power-user companion but not a primary interface.
- **Jazz (sync framework):** Offers free hosting and CRDT-based sync, but the schema setup is complex and the ecosystem is immature for this use case.
- **remoteStorage:** Protocol for per-user storage. Better suited for large files than high-frequency granular data like individual todo items.

## Conclusion

No existing application satisfies all requirements simultaneously. The common gaps are:

1. **Offline + web:** Apps that work offline are native/desktop only (Tasks.org, Planify). Web apps that exist (Vikunja) don't work offline.
2. **Minimal UI + open standards:** Apps with clean UIs tend to use proprietary storage. Apps with CalDAV support tend to be feature-heavy or platform-specific.
3. **No server dependency:** Most CalDAV-capable apps assume a server. Local-first apps (SuperProductivity) use custom formats.

The decision is to build a new application: a TypeScript PWA that speaks CalDAV/VTODO natively, caches to IndexedDB for offline use, and targets a minimal checkbox-focused UI. This fills the specific gap of an offline-first, cross-platform web app built on open standards with no custom backend. Existing CalDAV clients (especially Tasks.org on Android) can interoperate with the same data via a shared CalDAV server.
