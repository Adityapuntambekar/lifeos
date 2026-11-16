# LifeOS

## Friend beta audit and packaging — 17 November 2026

User requested all-section bug review and a distributable app for friends in different locations. They asked for help choosing hosting. User explicitly chose FREE hosting. Blueprint now uses Render Free, Singapore, one instance, NO paid disk/database. Server files and ownership reset on sleep/restart/redeploy; LIFEOS_EPHEMERAL=true makes the UI mark these sessions temporary. Host must retain a browser shared-map draft/backup and create a new invitation after reset. No Render account connected, public deployment or TURN service provisioned. Do not create paid resources. Those remain necessary to test with remote friends. Do not claim the portable localhost package connects remote computers automatically.

Fixed workspace profile control (screenshot) and header date navigation; Abroad country-filter options and misplaced delete control; persistent ECTS entries and zero-grade inclusion in weighted GPA; calendar edit flow/date-time requirements/ICS escaping; removed notification-permission prompt that could not schedule reminders. Added validated guarded saves for Home/Academics/Skills/Abroad/Calendar: corrupt existing data is preserved and save failures appear in a persistent warning instead of crashing effects. Existing pet visuals unchanged.

Shared server now detects stale sockets, rejects foreign browser origins, serves health checks and runtime ICE configuration. Optional Coturn shared-secret credentials expire after ten minutes; master secret remains server-only. Cross-server invitation links are explained rather than joined on the wrong host. Full UI/real network voice still requires testing.

Built `outputs/LifeOS-Windows-Beta-2026-11-17` with bundled Node runtime, compiled frontend, ws, server and third-party licenses; no npm/build step required for recipients. Launcher opens localhost:5173 and persists maps at LOCALAPPDATA/LifeOSBeta/workspaces. Release is portable web app + PWA, not signed Electron/native installer. `scripts/package-windows.mjs` reproduces folder after build; ZIP is separate. `docs/FRIEND_BETA.md` contains setup, deployment and test instructions. Source and runnable developer copy remain under outputs/LifeOS.

Passed: production build; all-section DOM audit with profile save, academic ECTS/GPA, skill delete, university add/delete, calendar edit/delete, corrupt-data preservation; existing space/creative/backup/search-home/journal/editor/PWA suites; new voice-config checks; portable bundled-runtime HTTP/PWA/two-client WebSocket/persistence smoke. Computer Use attempted Chrome but stopped because it could not reliably identify browser URL; no visual QA or actual microphone check claimed. Broader enterprise spec remains future work. Known limits: browser-local personal data, no cloud auth/video/screen-share/recording/background reminders; 12-person maximum, trusted-group beta.


## Continuation review — 17 November 2026

Reviewed the earlier user requirements, spatial specification, current source, local commit and standalone copy before continuing. The local foundation commit had not yet reached GitHub. The current milestone remains persistent local workspaces, pixel interiors and personal desk/task/note resume; the full Gather-inspired specification remains the roadmap.

Fixed an additional shared-map failure case: publishing now waits for a request-matched server acknowledgement. Editing is paused during the request; rejection keeps the draft open and shows the server error. A timeout leaves the local draft available instead of claiming success. Acknowledgements are sent only after persistence succeeds. Tests cover failed publishing, unrelated acknowledgements, retry and confirmed success.

Validation: production build, complete space/server/hosting/persistence suite, and Studio DOM tests. Browser visual QA was attempted again at a running local server on port 5192, but the in-app browser returned ERR_CONNECTION_TIMED_OUT. Canvas appearance and live microphones are still not visually/audibly verified. Preserve original pets; do not treat this as complete cloud identity, SFU, video or enterprise delivery.


## Spatial foundation update — 16 November 2026

- Shared workspace names, maps, revisions and hashed owner identity now persist in `data/workspaces` on the local server. Set `LIFEOS_DATA_DIR` to an absolute directory to relocate storage. Use one server process per directory. Stop the server before copying this folder for backup; browser JSON export does not include server maps.
- The creator browser retains editing ownership across restarts. Guests can join with the invite code but cannot publish maps. The owner key stays in `lifeos.space.identity` on the same browser origin; it is deliberately excluded from exported backups. Clearing browser storage, changing the URL/port or switching browsers loses access to that key. There is no account-based recovery yet. Keep the original browser profile, or save a shared map draft locally before migrating. Invite codes grant entry, not confidentiality or enterprise authentication.
- Space → Explore my rooms → My desk links a Home task and Journal note, automatically saves a private stopping-point text, and saves the current room/seat through “Save this spot”. “Resume at my desk” walks back to an existing saved seat; removed rooms/seats are handled without inventing a destination. Desk checkpoints and workspace shortcuts are included in browser JSON backups. Desk checkpoints currently apply to personal rooms only.
- Room interiors now use original pixel-art Canvas scenery with the existing collision model and sprite avatars. SVG remains the fallback and editor thumbnail renderer. “Immersive view” expands the studio; Escape exits. Original pet artwork is unchanged.
- This is a local foundation release, not completion of the entire enterprise P1 specification. Cloud accounts, PostgreSQL/Redis, Phaser, SFU/video, recording, SSO and native apps remain proposed. Chat, timers and whiteboard are still session-only. The small-group limit remains 12.
- Verification: production build; existing space, seating, studio and development/production hosting tests; persistent restart/revision/owner/guest/corrupt-file/disk-failure tests; Studio DOM desk links/resume and immersive exit; backup tests. DOM tests use the SVG fallback; actual Canvas appearance and live microphone behavior still require interactive browser QA.


## Spatial platform design package

The proposed Gather-inspired platform is specified in [docs/spatial-platform/README.md](./docs/spatial-platform/README.md): PRD and user journeys, UI wireframes/art direction, and technical architecture including authoritative SFU privacy rules and database schema. This is a design deliverable, not a claim that cloud media, SSO, recordings or native apps are implemented. The recommended next engineering milestone is persistent workspaces/maps, a coherent pixel-art world/HUD and the desk→task→note resume journey.

## Space Studio: build a connected collection of rooms

The previous companion appearance is restored across the gallery, room and floating pet; the chat improvements remain. No true 3D pet renderer has been added.

Open **Space → Explore my rooms** for your offline personal map, or join/create a campus and choose **Shared rooms** to explore with friends. Use the directory, map overview or the floor's left/right doors to travel between rooms. Characters walk around furniture and can sit on chairs/sofas. Shared rooms include a people list, campus chat and opt-in room voice; quiet rooms disable microphones. Chat is visible to everyone in the session.

Choose **Edit map** to add up to eight rooms from six templates: Quiet library, Team office, Coffee house, Garden terrace, Creative studio and Blank canvas. Five themes change the floors, walls and atmosphere. Search the furniture catalog, click to place, select and drag to move, rotate/recolor/duplicate objects, or erase them. Duplicate/delete rooms, undo/redo changes and zoom the map. Doorway aisles stay clear. **Save & explore** saves a personal map; the shared-session host uses **Publish to everyone**. Publishing relocates room occupants to safe entrances and mutes microphones.

Personal maps and saved shared drafts are separate browser records and both are included in backups. The previous small personal room is copied into the new collection on first use; its original record remains intact. The first person joining a shared session is its host; hosting passes to another participant if they leave. Published shared maps live in server memory until everyone leaves. In a later session, the host can use **Edit map → Load saved shared map → Publish**, or **Use my personal rooms** to share that collection. There are no durable accounts, private-room access controls, arbitrary room resizing or uploaded custom assets yet.

This original implementation draws on Gather's documented [Mapmaker](https://support.gather.town/articles/9657827678-mapmaker-overview), [connected rooms](https://support.gather.town/articles/7926276264-add-a-room-to-your-space), and [Studio publish workflow](https://www.gather.town/migration-guide). It is not feature parity with Gather. Build, DOM editor/navigation, model, multiplayer and existing regression checks pass. Real-browser visual and live-microphone QA remains outstanding: Computer Use stopped because it could not confidently establish the Windows browser URL.

## Spaces, a knowledge atlas and living companions

**Space:** click a campus chair to walk over and sit. Seats are shared and exclusive; moving, standing, leaving or disconnecting releases them. **My room** opens a personal solo space; **Enter my solo room** also works without connecting to a shared server. Decorate it with furniture, change its atmosphere/name, or start from Library, Office or Studio templates. Choose a furniture tool and click tiles to place/replace it; Erase removes it. Click a chair/sofa to sit, or empty floor to move. Room layouts save on this device and are included in backups. Personal rooms are not shared with friends or synchronized between devices. Campus voice is muted while you are inside; the shared campus still requires the server. Open Journal from your room and return without losing your place.

**Journal → Think & connect → Graph:** the Knowledge atlas maps actual `[[wiki links]]`, with aliases and backlinks respected and code examples ignored. Explore the whole notebook or one to three hops around the current note, filter by title/tag, show/hide unlinked notes, drag nodes/background, zoom and reset. Select a node for a preview, double-click to open it, or use the keyboard-accessible note list. Node size reflects connections; unresolved links are listed in the preview. Up to 200 matching notes render at once; filter larger notebooks. Graph arrangement is temporary. Obsidian plugins, vault synchronization, canvas embeds and block references are not included.

**Companions:** the original pet artwork is restored following user feedback. Chat retains more visible conversation, offers basic local greetings/focus guidance, and explains rooms and graphs. Local Ollama conversation uses the pet name, role, recent chat and supported workspace context, excluding private journal content. Stop cancels a pending reply; switching pet, page or AI settings cancels stale requests. AI-proposed changes still require Apply, and only the validated action executor can save them. Natural chat requires an installed, running model configured under **AI settings**; it is not a built-in hosted chatbot. Spoken replies use an available local device voice when enabled.

Validation: `npm run build`, `npm run test:creative`, `npm run test:space`, plus existing search/Home, backup, journal, editor, companion and PWA checks. Automated DOM and WebSocket tests pass. Real-browser visual checks remain blocked by preview connection timeouts; live microphone calls and a real Ollama conversation have not been verified in this phase.

## Your Home, your workspace

Open **Home → Customize** to choose Balanced, Focus or Writer, reorder cards, show/hide them, choose half/full width, and adjust spacing and atmosphere. Cards include your intention, shortcuts, tasks, recent notes, upcoming events and active projects. Hiding a card keeps its content. Your layout is saved locally and included in Calendar backups.

Press **Ctrl+K** (Mac: **Cmd+K**) or click **Search your workspace** to search saved notes, tasks, subjects, units, nested learning topics, projects, universities and calendar events. Filter results by workspace, use arrow keys and Enter, or click a result to open it. Matching learning branches expand; calendar events open in the agenda. A task found in a hidden Home card is temporarily revealed. Search stays on your device and excludes trashed notes, AI configuration and companion conversations; queries are not saved.

Shared surfaces, focus indicators, dark-theme contrast and responsive Home cards have been refreshed. Automated checks cover search, layout presets/reordering, backup compatibility, editors, journals, PWA behavior and companion commands. Run `node tests/search-home.mjs` for the new phase. Real-browser visual and keyboard QA remains outstanding because the local browser preview timed out.

## Journal and a workspace for anyone

Open **Journal** for two connected writing spaces. **Journal & create** provides rich text, headings, lists, checklists, tables, web links, undo/redo, daily reflections and creative templates. **Think & connect** provides Markdown write/split/read views, `[[Note title]]` links (including `[[Note title|label]]`), backlink navigation, linked-note creation and a local graph of direct connections. Renaming a knowledge note updates its wiki links outside code spans/blocks.

Both modes have editable folders, tags, full-text search, pins, focus mode, local autosave, recoverable trash, plain-text/Markdown import and export. Export journal creates a JSON backup that Calendar → Restore can preview and restore. Permanently deleted notes cannot be recovered without a backup. Stored notes are not encrypted; do not mistake local storage for an encrypted vault. Journal content is excluded from companion AI context. Attachments, sketches/handwriting, OCR, encrypted note locks, collaboration, cloud sync, full Markdown vault folder import and plugins are not implemented. This is an original notes experience, not Apple Notes or Obsidian feature parity.

Settings now lets anyone name their profile and workspace. Home shows actual tasks, recent pages and an editable intention instead of fabricated scores, study streaks or fixed personal deadlines. New users start with empty tasks, calendar, subjects and projects; existing saved records are preserved. Skills still includes editable starter learning trees. Existing generic planning tools remain available.

Editor/data checks: `node tests/editor.mjs`, `node tests/journal.mjs`, `node tests/backup.mjs`, `node tests/pwa.mjs` after `npm run build`. Browser visual verification was blocked by local preview timeouts; manually check desktop/mobile layout on your PC.

## Installable app and offline use

On Windows, stop the existing LifeOS terminal (Ctrl+C), then double-click **Start Installed LifeOS.bat**. It builds the production app and serves it at **http://localhost:5173**. Open that address in Chrome or Edge, then **Settings → Install LifeOS** when offered (or the browser's Install app menu). The first visit needs the server running; wait until Settings reports that the offline files are saved. Installation is browser-dependent, requires localhost or HTTPS, and was not manually verified on a real device in this update.

Personal trackers and local companion commands can then reopen offline from that same address/profile. Study Garden still needs its server, Google maps need the internet, and AI needs the configured local model. The app does not provide background scheduled reminders. Use Settings to check for and apply app updates. The normal `Start LifeOS.bat` remains the development launcher and disables its own production service worker when loaded.

Calendar → Backup exports supported personal data and theme, excluding AI configuration and temporary companion context. Restore accepts older compatible backups, validates sections, previews replacements, and requires confirmation. Download current data before restoring. Unlisted sections are retained. Different browser profiles, hostnames and ports have separate storage; export before switching. Automated checks: `npm run build`, `node tests/backup.mjs`, `node tests/pwa.mjs`, `npm run test:space`.

Abroad now supports worldwide country, city and campus exploration with embedded Google Maps and Google Earth links. Saved universities remain editable and deletable; no country restriction applies. Full Earth 3D opens separately. Existing personal data is preserved, and new university collections start empty. Internet access is required for maps.

LifeOS is a local-first workspace for writing, studying, planning, career growth and worldwide university exploration.

For another developer or model taking over, start with [`HANDOFF.md`](./HANDOFF.md).

## Shared Study Garden

The campus now has a furnished top-down map, doorways, click-to-walk routes around walls and furniture, keyboard/touch movement, and a live people panel. Share a study goal, walk over to a friend, send a temporary reaction, or start a shared 15/25/50-minute focus session. The commons connects voice only within a nearby radius; study and meeting rooms connect the room, and the library stays silent. The invitation dialog explains how local, LAN and hosted links differ. This is original artwork inspired by the spatial collaboration experience of Gather.

Open **Space** for an original spatial study world with shared avatars, room chat, a noticeboard, zone focus timers, and opt-in WebRTC audio. The session continues while navigating LifeOS. This feature adds a WebSocket server: run `npm run dev` locally, `npm run dev:lan` for private LAN access, or build then run `npm run space:serve` behind HTTPS for hosting. Read [`SPACE_SETUP.md`](./SPACE_SETUP.md) for invitations, voice/TURN requirements and current limits. This is an initial shared-space implementation, not full Gather feature parity.

## Phase 1 delivered

- Notion-inspired responsive shell with Nordic Frost as the initial design system
- Home dashboard with LifeOS score, progress paths, study rhythm, tasks, and milestone cards
- Live date-derived countdowns for the first exam, Chalmers fair, and planned departure
- Local browser persistence for tasks, quick task capture, task completion, and Cmd/Ctrl+K page navigation
- Five theme packs: Nordic Frost, Lavender Dusk, Matcha Study, Sakura, and Midnight Terminal
- Accessible navigation, compact mobile layout, and production build configuration

## Phase 2 delivered — Academics

- Editable Semester 5 subject templates for R Programming, Introduction to Machine Learning, Research Paper Writing, and IoT
- Expandable unit tables with inline rename, difficulty, status, and completion controls; add subjects and units at any time
- Live readiness aggregation from completed units to subject and semester levels
- Exam Planner with configurable upcoming-paper cards, window countdowns, suggested focus, and a working Pomodoro timer
- Grade-point / credit SGPA calculator, current CGPA context, semester trend placeholder, and editable credit-to-ECTS mapper
- Academic state persists in the browser’s local storage and remains local to the device

## Phase 3 delivered — Career skills

- Fully editable, locally persistent three-level learning trees for Programming, AI/ML, Maths & Statistics, and Aptitude
- Completion state bubbles from leaf skills into each topic, category, track, and the overall career-readiness score
- Add, rename, complete, expand, and delete any tree node without affecting other tracks
- Manual coding-stat profile, lightweight LeetCode-compatible problem log, daily-problem shortcut, and deletion controls
- Project Kanban seeded from the stated profile (including AWS Hackathon finalist), with status movement, impact fields, readiness flags, and removal

## Phase 4 delivered — Study abroad

- Interactive, self-contained Sweden–Denmark map with clickable university pins, country/search filters, and a visual university atlas
- Editable programme cards with city, country, application stage, fit score, notes, requirement fields, saved state, and pipeline advancement
- Application readiness sliders, fair preparation checklist, research-paper starter library, and verified-information safeguards
- Editable local budget sandbox with INR conversion, funds, scholarship, and savings-gap calculation; no fees or deadlines are fabricated

## Phase 5 delivered — Calendar & portability

- Responsive live month and agenda views with editable local events, seeded only with the stated end-term window and Chalmers fair
- `.ics` and CSV exports for calendar portability, plus a full LifeOS JSON backup and restore flow
- Browser-notification permission control for reminders, without sending data to a third party
- Google Calendar two-way sync intentionally remains unconfigured until OAuth credentials are supplied

## Phase 6 started — Companions

### Workspace-aware guide and optional chatbot

Companions now index saved items across Academics, Skills, Tasks, Projects, Universities and Calendar. Click a subject or learning node to set a parent context. Then commands such as `in this add sub section as Agentic AI` work at that location. `in the agentic systems plz add sub topic agentic ai` resolves the existing Agent systems item. Ambiguous names prompt a choice; incomplete requests ask for the missing field. Supported local actions include adding records, renaming, completing compatible items, saving university/event notes and confirmed deletion. This does not implement missing features such as academic sub-topic editors or live admissions verification.

For natural teaching and free-form conversation, open the pet’s **AI settings**. Install and run Ollama, install a model suited to your machine, use **Find installed models**, choose the model, and enable AI replies. The companion sends recent chat, the current selection and saved workspace context to that local endpoint. AI changes appear as proposals with an **Apply change** button. No model is bundled or downloaded by this project. The local guide works without one. Provider setup: https://docs.ollama.com/faq and https://docs.ollama.com/capabilities/structured-outputs.

Each role has its own instructions; Pip’s Study Buddy role covers all learning across the app, not just a specific course. AI replies depend on the connected model. If a request fails or a feature is unsupported, the companion must not report it as completed.

The floating pet now follows you across every workspace. Click the character to chat, or drag its move handle. Try “make a unit for AI/ML”; it will ask for the name, then create the topic in Skills → AI / ML. “Where can I find it?” offers an Open button. Name requests remain active when switching pages; say “cancel” to discard one.

- Original animated companions with study, coding, abroad, and break personalities
- Create pets from owl, cat, fox, cloud, and frog templates; choose a name, role, and palette
- Delete any pet from its companion card, including the final pet
- Companion chat understands commands such as “add an assignment for R” and “add a unit for R called functions”; it updates Academics/Tasks and replies when complete
- Renameable, role-switchable, re-skinnable pets with mood animations and a draggable floating companion

## Architecture & sitemap

1. `App.tsx` owns shell state, navigation, local task persistence, themes, and global overlays.
2. `data.ts` is the deliberately small, typed seed-data boundary for the initial dashboard.
3. The `Home` dashboard aggregates scores, live countdowns, tasks, and study activity.
4. The shell routes Academics, Skills, Abroad, Calendar, and Companions as independent workspaces.
5. A shared visual token layer in `styles.css` supports the five theme packs.
6. Phase 2 will introduce a typed IndexedDB repository behind these interfaces.
7. Academic data will model Year → Semester → Subject → Unit → Topic.
8. Skills will model Category → Topic → Sub-topic with bubbled progress.
9. Abroad will relate credits, universities, applications, research, fairs, and costs.
10. Tiptap blocks, dnd-kit interactions, PWA support, and optional integrations arrive in later phases.

## Run locally

Install Node.js 24 LTS (with npm). On Windows, double-click `Start LifeOS.bat`, or run the commands below in this repository. For friends on the same network, use `Start Shared Space.bat` and follow `SPACE_SETUP.md`.

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite. To create a production bundle, run `npm run build`.

## Build plan

1. **Phase 2 — Academics:** semesters, subjects, units, exam planner, SGPA/CGPA, credit mapper.
2. **Phase 3 — Skills:** editable skill trees, coding stats, problem log, projects and readiness.
3. **Phase 4 — Abroad:** universities, research papers, opportunity pipeline, fairs, eligibility, cost calculator.
4. **Phase 5 — Calendar & exports:** agenda, .ics, reminders, JSON/CSV/Markdown backup.
5. **Phase 6 — Companions & PWA:** agent proposal flow, offline install, optional desktop wrapper.

No external deadline, fee, or admission requirement is seeded as fact; future data entry surfaces will label such fields for official-site verification.
