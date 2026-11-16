# LifeOS — continuation handoff

## Latest phase: restored pet appearance and connected Space Studio

- User correction: prefers the original pet look; wanted optional true 3D, not redesigned SVG characters. `Companions.tsx` now uses its previous emoji artwork again in gallery, scene and floating pet. Chat/AI cancellation improvements remain. `PetAvatar.tsx` is unused; do not re-enable it without user direction. True 3D is not implemented.
- Reviewed official Gather Mapmaker, room portals, Build Tool and current Studio publish docs (links in README). New `shared/studioWorld.ts` is the shared geometry/schema for a 20×14 grid with a protected entrance aisle, up to 8 rooms / 100 objects each, six templates, five themes, furniture rotation footprints, overlap validation and BFS routes. `src/StudioArt.tsx` renders original SVG furniture/floors/windows. `SpaceStudio.tsx`/`spaceStudio.css` provide directory, map overview, connected doors, zoom, collisions/seating, room templates/duplicate/delete, searchable categorized object catalog, placement, drag/rotate/tint/duplicate/erase and 30-step undo/redo.
- `lifeos.space.studio` saves personal room collections; `lifeos.space.sharedDraft` saves shared drafts separately. Both validate in backups. Existing `lifeos.space.personal` is copied into the new personal map when first opened, keeping its original storage. Invalid data blocks saving; quota failure reports unsaved changes and retry. Active edits survive Journal navigation because Space stays mounted. Before leaving an unsaved editor, an explicit warning is shown.
- Server adds `studio`, `revision`, `host` to session and `interior` to Person. `studio-enter/move/sit/publish` validate room IDs, one-tile motion, collision/seating and host/revision permissions. All joined clients receive maps on join/publish; ordinary state updates avoid retransmitting maps. Publish relocates occupants safely, clears seats and mutes voice. Quiet studios reject voice; other studio zones isolate voice by room. Host transfers on disconnect. Maps are server-memory only; host can load a saved shared draft or personal map in editor and republish after a session ends. Host is a session role, not durable authenticated ownership. No uploaded assets or arbitrary room resizing.
- Space routes the new offline collection and shared interiors while retaining original campus. Shared Studio includes people, campus-wide chat and room voice. Leaving custom rooms returns to campus. `spaceVoice.ts` tracks the new interior field. `tsconfig.node.json` includes the new shared model; don't edit emitted JS/declarations.
- Added `tests/studio.mjs` for templates, backups, validation, seat reachability, collision, live map publishing/revision/host checks, room voice isolation, delete relocation and host transfer. `tests/studio-ui.mjs` checks room creation, placement undo, drag, delete undo/redo, atlas and Journal navigation, persistence. Existing creative UI test updated for new entry. Included in `test:space` and `test:creative`. Build and regression suites pass. No visual perfection claim: Computer Use stopped because it could not confidently identify the Windows browser URL; real-browser visuals, touch dragging and live microphone quality still need manual review.

## Latest phase: interactive seats, personal rooms, knowledge atlas and companions

- `shared/spaceWorld.ts` now exports six canonical seats. Server `Person` and client `SpacePerson` include `seat` and `personal`. Server validates distance/exclusive occupancy for sit, releases on move/stand/personal/disconnect, blocks personal-room voice/movement and excludes personal users in `canHear`. Space routes to a clicked seat before requesting sit. GardenMap draws seats from the same source. Do not edit emitted JS/declarations.
- `PersonalRoom.tsx` / `personalRoomModel.ts`: solo room available without shared-server login, 8×6 placement grid, furniture erase/replace, chair/sofa sitting, name, three themes and Library/Office/Studio presets. Saved at `lifeos.space.personal`, validated in backups. Unreadable room data is protected from overwrite; storage failures are visible/retryable. Templates ask before replacing decorations. Personal rooms are device-local and solo, not remotely visitable or cloud-persistent. Shared room presence shows who is in a solo room; voice stops. Journal navigation keeps Space mounted and retains room state.
- `NoteGraph.tsx` / `noteGraphModel.ts`: replaces the old circular immediate-neighbor diagram. Builds actual directed wiki-link edges with aliases, deleted/creative-note exclusion and missing-target reporting. Whole notebook / local 1–3 hops, title/tag/orphan filters, deterministic bounded force layout, node dragging, background panning, zoom/reset, selected-note preview and accessible open controls. Max 200 matching visible notes; filters reach other notes. Drag positions are session-only, not saved. Not a full Obsidian vault/plugin implementation.
- `PetAvatar.tsx` / `creativeUpgrade.css`: original SVG owl, cat, fox, cloud, frog with breathing/blink/thinking states and reduced-motion handling. Companion AI takes an AbortSignal and pet name; Stop, pet/page/settings changes cancel stale requests and suppress late replies/proposals. Model status says enabled, not falsely connected. Local greetings and focus guidance, feature-specific navigation, longer visible chat history, optional available local speech voice. Real AI remains opt-in local Ollama, no bundled model; proposed AI mutations still reviewed and validated. Journal content stays outside model context.
- New checks: `tests/creative-upgrade.mjs` (topology/layout/room schema/backups/seat routes), `tests/creative-ui.mjs` (jsdom interaction incl offline solo-room entry and Journal navigation), `tests/companion-brain.mjs` (mocked AI persona/context/privacy/cancel/errors), `tests/space-seating.mjs` (live socket exclusivity/release/isolation). `test:creative` groups new model/UI/AI checks; `test:space` includes seating plus existing server/hosting checks. Build and existing regression suites passed. Browser preview still times out even after starting a fresh permitted server; no real visual, microphone or live-model QA claim.
- Suggested next product milestone: a daily focus ritual linking one task, a note and a room session with an end-of-session reflection. Before expanding collaboration, add durable identities/room ownership and storage rather than assuming invite links provide access control. First manual QA: mobile room grid, graph touch/pan, pet/chat layout, two-browser seating and local model latency/cancellation.

## Latest phase: customizable Home and local workspace search

- `HomeDashboard.tsx`, `CustomizeHome.tsx`, `homeLayout.ts`: six reorderable cards, visibility/width controls, Balanced/Focus/Writer presets, density and cover colors. Layout persists at `lifeos.home.layout`, validated and supported by `backup.ts`. Hiding/resetting layout never deletes content. Saved notes, events and projects open directly; search can temporarily reveal a hidden task card without changing the saved layout.
- `searchModel.ts` builds an in-memory index from saved local content: workspaces, tasks, journal plaintext/tags/folders, subjects/units, nested skill topics, projects, universities and calendar. Accent-insensitive multiword matching with title ranking, workspace filters and safe snippets. Corrupt JSON sections are skipped with warnings. Trashed notes, companion chat and AI configuration are excluded. No external search, AI request or persisted query.
- `GlobalSearch.tsx` replaces the page-only palette, using a native dialog, keyboard navigation and result counts. Ctrl/Cmd+K and header search open it. `reveal.ts` is a one-shot in-memory destination queue; App dispatches `lifeos-open-result`, workspace handlers expand/select the target, and App scrolls/focuses/highlights its matching data attribute. Journal retains its existing mounted-editor navigation event. Calendar results select Agenda.
- `workspacePolish.css` supplies shared surfaces, spacing, focus states, responsive Home/search/customization, theme-aware dialogs and dark-surface corrections. The header calendar button now navigates to Calendar.
- Build and search/Home, backup, journal, PWA, editor and companion-workspace regression checks pass. No real-browser visual or keyboard verification: browser preview attempts timed out. Next verification should exercise small-screen dialogs, hidden-card search, nested topic reveal and keyboard focus on a real browser. No cloud services, account system or collaboration changes in this phase.
- Keep `outputs/LifeOS` synchronized with source, tests, docs and current dist. Existing browser data stays at its original origin; run the launcher on localhost:5173 to retain access.

## Latest phase: Journal and generalized daily workspace

- Explicit user direction: evolve beyond Aditya's personal planner into a flexible general-purpose workspace inspired by Notion. Apple Notes-inspired creative journaling and Obsidian-inspired knowledge notes are original implementations, not full clones.
- `Journal.tsx` stays mounted (hidden outside Journal) to retain in-memory edits on navigation, including a failed-storage state. Data is `lifeos.journal`: `{notes,folders}`. Notes have mode, title, rich HTML or Markdown body, plain text, tags, folder ID, pin, timestamps, trash timestamp and optional local daily date. Corrupt data blocks loading/saving rather than overwriting it. Storage failure displays a warning/export action. Multi-tab simultaneous editing is not supported; use one editing tab.
- `journalModel.ts`: schema checks, title uniqueness, wiki-link extraction/rename excluding code, templates and local dates. `JournalRichEditor.tsx`: Tiptap StarterKit, task lists/items and tables. `JournalMarkdown.tsx`: react-markdown + GFM, text-node wiki links, no raw HTML and no remote image loading. Rich and Markdown bundles load on demand and are included in PWA precaching.
- Folders can be renamed/deleted (notes retained), notes can be pinned, searched, tagged, moved and soft-deleted/restored. Permanent delete asks confirmation. Daily pages reuse today's entry; templates never overwrite a note. Focus mode, graph with direct neighbors (up to 40), backlinks, text/Markdown import, individual text/Markdown export and journal backup export are included. Restore through Calendar validates journal/profile/intention data.
- `HomeDashboard.tsx` replaces fabricated stats/deadlines with real tasks, editable intention and recent pages. `profile.ts`/Settings provide name/workspace. Fresh tasks, subjects, grades, calendar, projects and problem logs are empty. Stored existing collections are unchanged. Removed hardcoded academic identity, CGPA and dates from visible academic overview; skill learning trees are still starter templates.
- Companion can guide to Journal, but cannot read or edit private notes. New `ids.ts` uses getRandomValues fallback on HTTP/LAN. Empty academic units now show 0% rather than NaN. Windows launchers check for the newly required editor dependency.
- Passed build, DOM editor schema/commands/security checks, journal model/rename/schema checks, backup and PWA checks, and companion-workspace regression. Browser preview timed out; no real visual/manual typing test. Next: real desktop/mobile editing and accessibility QA, IndexedDB attachments/history, richer import/export, optional encrypted sync/account model. No drawings/OCR, attachments, note encryption, cloud sync or real-time note collaboration yet.

## Latest phase: installable offline app and safer restoration

- `scripts/build-pwa.mjs` runs after Vite, generates 192/512 PNG icons and a content-versioned service worker precaching the build. Manifest is in `public/manifest.webmanifest`. Navigation is network-first with offline shell fallback; immutable build files are cache-first. External maps and `/space` are excluded. Activation of a waiting update requires the Settings action. Only LifeOS cache names are cleaned.
- `src/pwa.ts` registers only production builds; development unregisters this origin's `/sw.js`. `AppSettings.tsx` opens via the formerly inert sidebar Settings button and shows install guidance, connectivity/cache status, update controls and data portability instructions. Actual browser install/offline reload has not been manually tested; simulated worker lifecycle and production hosting checks pass.
- `Start Installed LifeOS.bat` builds and serves on localhost:5173 to match the usual development origin. Stop other servers on that port first. User data is origin-specific; never assume another port/profile shares it.
- `backup.ts` validates supported section shapes, accepts legacy plain JSON or versioned envelopes, excludes AI configuration/temporary keys, preserves the raw Skills tab storage encoding, and rolls back failed writes. `RestorePreview.tsx` offers a review, a current-data download, explicit confirmation and section-wise replacement. Existing unlisted sections remain. Backups contain personal data; no cloud upload occurs.
- Theme persists. Calendar now guards unsupported Notification API, avoids in-place state sorting, and truthfully labels permission without claiming reminder scheduling.
- Checks passed: build, `tests/backup.mjs`, `tests/pwa.mjs`, companion-workspace regression, multiplayer and development/production hosting tests. Next suggested phase: real-device install/offline/accessibility QA, then durable accounts/rooms and collaboration hosting. No cloud backend, login, video/screensharing or background notifications were added.

## Latest update: worldwide Abroad exploration and companion polish

The user explicitly replaced the earlier Sweden/Denmark-only requirement with worldwide exploration. Preserve saved user records; new users start with an empty university collection and zero readiness/budget estimates. `WorldExplorer.tsx` provides country chips plus arbitrary country/city/campus search, embedded Google Maps, and external Google Earth / university-search links. Each saved university has a campus map and external Earth/Maps links; full Earth 3D runs in a new tab, not embedded. No API keys, admissions database or verified recommendations are included. Google imagery requires connectivity and coverage varies.

Removed hardcoded departure/intake and fair claims from Abroad, added an editable persisted research journal, free-text university countries and deletion, fixed missing final pipeline stage and disappearing country filter options. Companion local/AI actions now allow any country. Pet styling includes lighting/hover polish, and drag state now handles pointer cancellation and window resizing. Build and companion-workspace regression checks passed. Live maps, mobile visuals and microphone calls were not browser-verified in this update. Broader app still has prototype features; do not claim all bugs have been eliminated. Budget currently converts to INR; the wider dashboard/academics still retain the user's existing personalized content.

## Latest update — 15 November 2026: spatial study sessions

- Gather-inspired original furnished campus in `src/GardenMap.tsx`, with styling in `src/spaceImmersive.css`. Existing CSS remains the base.
- `shared/spaceWorld.ts` is the shared source for geometry, grid route finding, short-step collision validation and voice proximity. Keep frontend and server imports aligned. Do not edit emitted JS/declarations.
- Space now walks routes instead of teleporting. Room shortcuts and Walk over use the same path finder; keyboard arrows/WASD or touch buttons take individual steps. Hidden Space stops walking while keeping the session connected.
- People panel supports a shared 120-character study goal (save an empty goal to clear), availability and Walk over. Five temporary reactions expire after five seconds. Focus timers offer 15, 25 or 50 minutes per zone. Notes include Edit current note and replacement/clear controls.
- Commons voice requires both people within 18 world-coordinate units. Other nonquiet zones use room-wide audio. Library is silent; zone changes mute. This is a hard radius, not smooth audio attenuation. No video, screensharing, seat reservation, map editor, persistent rooms or host permissions yet.
- Invite dialog accepts/copies room links and explains why localhost cannot be shared with another PC. LAN HTTP cannot normally access a microphone; internet use still requires HTTPS and often TURN.
- Run `npm run build` followed by `npm run test:space`. Automated tests cover shared routes/collisions, goals/reactions, proximity predicate, presence, chat isolation, muting, timers/notes, signalling restrictions, disconnect and both hosting modes. Browser preview attempts timed out in this environment; visual and live audio QA remain outstanding.
- Private repository: https://github.com/Adityapuntambekar/lifeos. Runnable standalone copy: `outputs/LifeOS`; include the new `shared` directory when syncing it.

## Project location and commands

## Latest addition: Study Garden shared space

- `src/Space.tsx`, `src/space.css`, `src/spaceVoice.ts`: persistent Space screen, decorative world, custom avatars, keyboard/click/touch movement, shared zone timers/chat/board, opt-in WebRTC audio. Space stays mounted across routes. Leave/unmount closes peers and mic. Return chip shows active mic outside Space.
- `server/space.ts`: WebSocket room server attached through `vite.config.ts` during development. Room code isolates groups; max 12, bounded input sizes/rate. Server memory only; no database/auth/moderation.
- `server/start.mjs`: standalone Node 24+ HTTP server for dist and WebSockets. `npm run space:serve` after build. `npm run dev:lan` serves private LAN clients. Static hosts and Vite preview do not provide shared rooms.
- `ws` and `@types/ws` added. Standalone folder launchers now ensure dependencies are installed. `SPACE_SETUP.md` covers LAN, HTTPS hosting, ICE/TURN configuration and limits.
- Verified with build and `tests/space-server.mjs`: presence, room isolation, chat, zones/mute, board/timer, signal restrictions, disconnect. No live microphone/browser visual test performed. No hosting or TURN provisioned. Voice without configured ICE relays is direct-network only; remote clients need secure contexts for microphone access.

**Workspace:** `C:\Users\Aditya\Documents\Codex\2026-11-15\we-x20`

```powershell
cd C:\Users\Aditya\Documents\Codex\2026-11-15\we-x20
npm install
npm run dev
npm run build
```

This is a Vite + React + TypeScript app with a Node WebSocket server for Study Garden. Personal planning data stays in browser localStorage; shared room state lives in server memory, with no database.

## What is finished

### Phase 1 — shell and dashboard

- Responsive Notion-like sidebar, header, global Ctrl/Cmd+K page palette, light/dark-adjacent theme packs, and local task capture.
- Home dashboard with progress cards, live date-derived countdowns, task persistence, and study chart.

### Phase 2 — academics

- Editable Semester 5 subject / unit tree.
- Add, rename, complete, and delete subjects and units.
- Exam planner, Pomodoro, SGPA calculator, CGPA context, and credit-to-ECTS worksheet.
- Subject deletion propagates correctly to Exam Planner and Credits because they use the same state.

### Phase 3 — skills

- Editable, recursive skills trees for Programming, AI/ML, Maths & Stats, and Aptitude.
- Checkbox completion bubbles up from leaves to track-level readiness.
- Manual coding stats, problem log, and editable Projects Kanban.

### Phase 4 — study abroad

- Sweden/Denmark only; interactive inline SVG map with clickable university pins, filtering, editable university details, application pipeline, readiness controls, research/fair starter content, and local cost sandbox.
- Avoid presenting university requirements, deadlines, fees, or links as confirmed facts unless the user provides/asks to verify them. Existing placeholders say “Verify on official site.”

### Phase 5 — calendar and portability

- Local month/agenda calendar, event add/delete, `.ics` / CSV export, full LifeOS JSON backup and restore, and browser-notification permission button.
- Google Calendar sync is deliberately not implemented because it needs user-owned OAuth credentials. `.ics` export is the no-credential path.

### Phase 6 started — companions

**Latest architecture supersedes the older narrow command handlers:** `Companions.tsx` now uses `companionWorkspace.ts` for a cross-workspace entity index, parent context, nested writes, pending-field questions, ambiguity choices, human-readable proposals and deletion confirmation. `companionActions.ts` remains for earlier regression checks but is no longer the UI command engine. `companionAI.ts` adds an opt-in local Ollama chat adapter, with role instructions, bounded workspace data, JSON response validation and proposed actions requiring Apply. `CompanionAISettings.tsx` detects locally installed models; none was found on this PC during implementation, so live model replies were not tested. Do not claim all app features are automated. Supported mutations are defined by `Intent` and `perform`; grades/budgets are model read context only.

Selection uses `data-companion-id` on subjects, units, skill nodes/tracks, projects, universities and agenda events. Context is persisted per workspace. `lifeos-reveal` opens the corresponding parent/track; `lifeos-data-updated` and existing specific events refresh mounted views. University empty state now handles deletion of the last entry.

Verification: production build and `node --experimental-strip-types work/check-companion-workspace.mjs` pass, covering the two reported phrases, nested insertion, missing fields, ambiguity, duplicate avoidance and mutations across stores. No browser visual check or live Ollama conversation was performed. AI settings are under `lifeos.companions.ai`; there is no API key stored by this local adapter.

- Global companion fix: `App.tsx` now keeps ONE `Companions` instance mounted outside the page switch. `pageActive` hides its management page; its floating pet and chat drawer remain available across Home, Academics, Skills, Abroad, Calendar. `companionGlobal.css` controls the drawer. Clicking the pet opens chat; the move handle drags it.
- `companionActions.ts` parses add/create/make unit/topic/skill commands. Missing names prompt a follow-up; “cancel” abandons it. AI/ML aliases target the Skills tree and R targets R Programming. Writes preserve existing records and emit refresh events. Skills follows the destination tab immediately. Duplicate unit/topic names are not inserted twice.
- Pet choice/visibility and last action are saved. Pending name requests survive page navigation (in memory). Tests: `node --experimental-strip-types work/check-companion-actions.mjs` in the working project. Build passed; no browser visual check performed for this update.

- Latest guide improvement: `src/companionGuide.ts` resolves contextual “where is it?” questions from persisted chat history, provides workspace directions, and exposes navigation buttons. Unknown requests explicitly say no change was made. This is a local command guide, not a connected general-purpose language model.
- Chat history is saved under `lifeos.companions.chat` (last 100 messages). Home now displays all tasks so newly created assignments are visible.

- Added `src/Companions.tsx` with original animated owl, cat, fox, cloud, and frog companions.
- Companion creation offers limited templates plus custom name, role, and palette; each pet can be deleted from its gallery card, even the last one.
- Companions are renameable, role-switchable, re-skinnable, and have moods, chat, and quick actions.
- A floating pet can be toggled and dragged within the app.
- Chat commands currently handle “add an assignment for R” (writes a task to `lifeos.tasks`) and “add a unit for R called functions” (writes to `lifeos.academics.subjects`), then announce completion. Custom browser events refresh the React workspace state.
- Companion config persists under `lifeos.companions.buddies`.
- PWA/service worker and desktop wrapper are still pending.

## Source map

| Area | Primary source |
|---|---|
| App shell, dashboard and routing | `src/App.tsx` |
| Academic workspace | `src/Academics.tsx` |
| Skills workspace | `src/Skills.tsx` |
| Abroad workspace and interactive map | `src/Abroad.tsx` |
| Calendar, exports, backup | `src/Calendar.tsx` |
| Interactive companions | `src/Companions.tsx` |
| Seed dashboard data | `src/data.ts` |
| All styling / responsive design | `src/styles.css` |
| Tooling | `package.json`, `vite.config.ts`, `tsconfig.json` |

## Persistence model today

This is intentionally local-first but currently uses `localStorage`, not IndexedDB/Dexie. Data keys:

| Key | Contents |
|---|---|
| `lifeos.tasks` | Dashboard tasks |
| `lifeos.academics.subjects` | Subjects and units |
| `lifeos.academics.grades` | Grade calculator rows |
| `lifeos.academics.sgpas` | SGPA history placeholder |
| `lifeos.academics.minutes` | Pomodoro minutes |
| `lifeos.skills.tree` | Recursive skill trees |
| `lifeos.skills.problems` | Coding problem log |
| `lifeos.skills.projects` | Project board |
| `lifeos.skills.stats` | Manual coding stats |
| `lifeos.abroad.unis` | University map/database cards |
| `lifeos.abroad.selected` | Selected university card |
| `lifeos.abroad.readiness` | Abroad readiness sliders |
| `lifeos.abroad.funds` / `lifeos.abroad.budget` | Cost sandbox inputs |
| `lifeos.calendar.events` | Calendar events |
| `lifeos.companions.buddies` | Companion names, roles, skins, moods |

The Calendar → Backup action exports every key beginning with `lifeos.`. The Restore action replaces those keys and reloads the page.

## Recommended next work: finish Phase 6

Build PWA / companion foundations without promising native desktop features that cannot run in a browser:

1. Add `manifest.webmanifest`, icons, and a service worker (PWA offline shell).
2. Add a floating draggable “Study Buddy” widget inside the app.
3. Create a local agent-activity / proposal model: agents may *propose* a task/event/tree update but a user must click Confirm before mutation.
4. Add Settings panels for a provider selection and locally stored API key field. Do not call an LLM until the user provides a key and authorizes it.
5. Add a JSON import validation screen before overwriting local data.

## Known limitations / intentional deferrals

- Tiptap rich-text editing is now available in Journal; it is not a general block/database editor across every workspace.
- No dnd-kit drag-and-drop yet; list/tree ordering is currently fixed.
- No IndexedDB, Supabase, OAuth, email reminder provider, Electron/Tauri wrapper, or LLM API integration yet.
- The app is visually polished but it has not been browser-screenshot tested in this session; always run `npm run build` after a change and manually inspect mobile/desktop layouts when possible.
- `dist/` is generated by `npm run build`; do not manually edit it.

## User preferences and product constraints

- User: Aditya Puntambekar, MIT-WPU Pune, BSc (Hons) Data Science & Big Data Analytics, CGPA 8.67 after Sem 4.
- The UI should feel cozy, calm, Notion-like, and use the existing Nordic Frost default unless asked otherwise.
- Abroad now supports **worldwide exploration**, explicitly requested by the user; the earlier Nordic-only restriction is superseded.
- Do not fabricate foreign-university deadlines, fees, requirements, or authoritative links. Keep such data user-entered or clearly marked for official verification.
- Keep the existing “everything should be editable and deletable” expectation. When adding a create/add action, add an adjacent delete path as well.
- Preserve current local data during changes. Never clear `localStorage` as part of ordinary development.

## Handoff prompt for another model

> Continue the LifeOS React/Vite app in `C:\Users\Aditya\Documents\Codex\2026-11-15\we-x20`. Read `HANDOFF.md` and `README.md` first. Preserve existing localStorage data and the requirement that newly created items can be deleted. Run `npm run build` after changes. Do not fabricate Sweden/Denmark admission information; label unverified data. The next planned milestone is Phase 6: PWA and safe, confirmation-based companion-agent foundations.
