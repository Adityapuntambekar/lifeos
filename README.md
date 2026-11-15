# LifeOS

## Installable app and offline use

On Windows, stop the existing LifeOS terminal (Ctrl+C), then double-click **Start Installed LifeOS.bat**. It builds the production app and serves it at **http://localhost:5173**. Open that address in Chrome or Edge, then **Settings → Install LifeOS** when offered (or the browser's Install app menu). The first visit needs the server running; wait until Settings reports that the offline files are saved. Installation is browser-dependent, requires localhost or HTTPS, and was not manually verified on a real device in this update.

Personal trackers and local companion commands can then reopen offline from that same address/profile. Study Garden still needs its server, Google maps need the internet, and AI needs the configured local model. The app does not provide background scheduled reminders. Use Settings to check for and apply app updates. The normal `Start LifeOS.bat` remains the development launcher and disables its own production service worker when loaded.

Calendar → Backup exports supported personal data and theme, excluding AI configuration and temporary companion context. Restore accepts older compatible backups, validates sections, previews replacements, and requires confirmation. Download current data before restoring. Unlisted sections are retained. Different browser profiles, hostnames and ports have separate storage; export before switching. Automated checks: `npm run build`, `node tests/backup.mjs`, `node tests/pwa.mjs`, `npm run test:space`.

Abroad now supports worldwide country, city and campus exploration with embedded Google Maps and Google Earth links. Saved universities remain editable and deletable; no country restriction applies. Full Earth 3D opens separately. Existing personal data is preserved, and new university collections start empty. Internet access is required for maps.

LifeOS is a calm, local-first personal command center for studies, career growth, research, and a Sweden/Denmark master’s plan.

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
