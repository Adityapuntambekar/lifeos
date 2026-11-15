# LifeOS — continuation handoff

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

- No Tiptap/BlockNote rich-text editor yet.
- No dnd-kit drag-and-drop yet; list/tree ordering is currently fixed.
- No IndexedDB, Supabase, OAuth, email reminder provider, Electron/Tauri wrapper, or LLM API integration yet.
- The app is visually polished but it has not been browser-screenshot tested in this session; always run `npm run build` after a change and manually inspect mobile/desktop layouts when possible.
- `dist/` is generated by `npm run build`; do not manually edit it.

## User preferences and product constraints

- User: Aditya Puntambekar, MIT-WPU Pune, BSc (Hons) Data Science & Big Data Analytics, CGPA 8.67 after Sem 4.
- The UI should feel cozy, calm, Notion-like, and use the existing Nordic Frost default unless asked otherwise.
- Countries are **Sweden and Denmark only**.
- Do not fabricate foreign-university deadlines, fees, requirements, or authoritative links. Keep such data user-entered or clearly marked for official verification.
- Keep the existing “everything should be editable and deletable” expectation. When adding a create/add action, add an adjacent delete path as well.
- Preserve current local data during changes. Never clear `localStorage` as part of ordinary development.

## Handoff prompt for another model

> Continue the LifeOS React/Vite app in `C:\Users\Aditya\Documents\Codex\2026-11-15\we-x20`. Read `HANDOFF.md` and `README.md` first. Preserve existing localStorage data and the requirement that newly created items can be deleted. Run `npm run build` after changes. Do not fabricate Sweden/Denmark admission information; label unverified data. The next planned milestone is Phase 6: PWA and safe, confirmation-based companion-agent foundations.
