# LifeOS Spatial Office — design package

Version 1.0 · 16 November 2026 · Proposed product and engineering specification

This package specifies the requested Gather-inspired platform. It does not claim these enterprise, media or cloud features have been implemented. The current local application remains the working prototype.

1. [Product requirements and user journeys](./01-PRD.md)
2. [UI wireframes and visual component specification](./02-UX-WIREFRAMES.md)
3. [Technical architecture, SFU policy and database schema](./03-ARCHITECTURE.md)

**Product direction:** a cozy spatial office that remembers a person's task, notes and desk between sessions, supports spontaneous conversations, and protects deliberate focus. Existing LifeOS tasks and Journal remain first-class destinations. Original companion appearance stays intact; true 3D pets are a separate optional future project.

**Reference interpretation:** the user-provided [Gather virtual-office page](https://www.gather.town/virtual-office) emphasizes discoverable teammates, focus controls, office templates, object customization and multiple floors. We adopt those interaction principles and the user's requested pixel-art direction while creating original artwork, terminology and layouts. The reference is not a claim that every requested feature is available in Gather or already in LifeOS.

**Initial local implementation now available:** disk-persisted shared maps/revisions, browser-key ownership, Canvas pixel interiors, immersive studio, and personal desk/task/note checkpoints. See the root README for limits, storage and recovery details. These are a subset of the planned cloud foundation; the architecture below remains a target.

**Planned foundation milestone:** persistent workspace identity and map revisions, a coherent pixel-art renderer/HUD, and the desk-to-task-to-note resume journey. SFU privacy must pass adversarial tests before enabling private audio/video rooms. Recording, integrations and native applications follow separate release gates.

## Specification conventions

- **MUST** is a release acceptance requirement for the indicated phase.
- **Target** is a proposed measurable goal, not an observed benchmark or SLA.
- **P1–P5** are dependency-ordered deliveries, not calendar estimates.
- A map **room** is a navigable architectural area; an **acoustic zone** controls media access; a **conversation** records a consented interaction. They are separate identifiers.
- Limits and retention defaults are initial product decisions to validate with pilots and operating-cost measurements.

## Coverage of the supplied brief

| Brief area | PRD requirements | UX coverage | Architecture coverage |
|---|---|---|---|
| Pixel world, seasons, avatars, glass HUD | V1–V4 | Art system, world HUD, avatar states | Rendering, movement and map revisions |
| Proximity, private zones, doors, stage, volume | M1–M5 | Media strip, door states, broadcast notice | Authoritative media policy and SFU routing |
| Multiple screens, interactive objects | C1–C3 | Share stage and object panel | Track lifecycle, document service, object sandbox |
| Desks, presence, waves, follow, directory, mini mode | D1–D5 | Desk journey, directory, mini mode | Presence, desk/mailbox schema, capability matrix |
| Scribe, captions, recording, timers, chat | A1–A4 | Consent bar, transcript, review inbox | Recording pipeline, retention, messaging schema |
| Editor, 400+ catalog, large templates, floors | B1–B3 | Mapmaker wireframe and publish states | Asset manifests, validation, capacity planning |
| Calendar, Slack, GitHub, webhooks, SSO, platforms | I1–I4 | Admin and integration states | OAuth, webhook sync, RBAC, client delivery |

## Current baseline verified in this repository

React/Vite application; SVG room renderer; WebSocket-authoritative movement; up to 12 people per in-memory campus; a small peer-to-peer audio mesh; six room templates, five themes, eight-room collections and a small furniture catalog; local personal/shared drafts; host-only revisioned map publication; per-room voice and quiet rooms; campus chat; local tasks, notes, note graph and optional Ollama companion. No SFU, camera/screen sharing, durable accounts, persistent cloud chat, recordings, SSO or native applications exist yet. Automated interaction/model/network checks have passed previously; real-browser visual and live-media QA remains outstanding.
