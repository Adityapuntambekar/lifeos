# LifeOS friend-testing beta

## Windows portable app

Extract the entire ZIP first. Double-click **Start LifeOS.bat**. Node is bundled; no npm install or build is needed. The launcher opens localhost:5173. Keep the terminal running. Close other LifeOS servers on that port first. In Chrome/Edge, use Settings → Install or the browser's Install app menu to give LifeOS its own window. This is a portable web-app package, not a signed native installer.

Personal notes/tasks live in your browser profile. Back up from Calendar → Backup before moving to a new URL, computer or browser. Local shared maps live in `%LOCALAPPDATA%\LifeOSBeta\workspaces`. The app contains no author's saved tasks, notes, owner keys or credentials.

## Friends in different locations

The portable local app is for individual testing. Everyone must open the SAME hosted HTTPS LifeOS URL to share a space. A localhost invitation will not connect computers over the internet.

Selected first hosting setup: **Render Free web service**, using the repository's `render.yaml`. Sign up at https://dashboard.render.com/ with GitHub, authorize access only to the LifeOS repository, choose New → Blueprint and select that repo. Review that the web-service plan is **Free**, with **no database or disk**. Deploy and share its HTTPS URL. If any billing prompt or paid resource is shown, stop; this release does not require paid hosting. No public service has been deployed yet.

Free-tier limits: the server sleeps after 15 minutes without inbound traffic and can take about a minute to wake. Server maps, ownership records, chat and sessions are lost on sleep/restart/redeploy. Personal browser data remains on that browser. The host should keep a shared-map draft on their device and export Calendar → Backup. After a reset, create a fresh space, open shared rooms → Edit map → Load saved shared map → Publish, then send the NEW invitation. The UI labels free-hosted sessions temporary. Free hours/build/bandwidth quotas apply; avoid adding a payment method or enabling paid upgrades while testing. See https://render.com/docs/free .

After deployment, open the HTTPS URL in Chrome/Edge. Set your name in workspace settings. Space → Create a space → Invite friends. Friends open that full link, enter a name and join. Each friend can install the hosted URL as an app; no Windows ZIP is needed for hosted use. Personal notes remain local to each browser and do not automatically sync across devices.

Test first with 2–4 friends (maximum 12). Check movement, seat occupancy, room transitions, text chat, map persistence after restart, and that only the owner browser can publish. Quiet rooms mute voice. Creating a different space produces a separate group. Restarting the host disconnects active calls; rejoin using the saved workspace.

## Internet voice setup

HTTPS enables microphone permission but does not guarantee network reachability. For reliable voice across restrictive networks, configure a TURN relay. The production server accepts `STUN_URLS` (comma-separated), `TURN_URLS` and server-only `TURN_SECRET` for Coturn shared-secret authentication. `/api/ice` issues credentials lasting 10 minutes; the master secret never enters the frontend bundle. Use the relay provider's exact URLs and shared secret. Do not place TURN_SECRET in a VITE_ variable. The development server only supports the legacy VITE_ICE_SERVERS option; runtime relay configuration is production-only.

TURN setup, public deployment and two-person live audio verification are still required before calling internet voice ready. Text chat and map synchronization do not depend on TURN. No video/screen sharing, recording or cloud login is implemented. This is a small trusted-group beta; anyone holding a room link can enter. Do not post invite links publicly. Free hosting is selected; a TURN provider may have separate limits or costs. Do not purchase one for this beta without agreement.

## Report a problem

Send: section name, exact clicks, expected behavior, actual behavior, screenshot, browser/version, whether using localhost or hosted URL, and whether reloading changes it. Exclude private notes, credentials and owner keys. For any saving warning, keep the tab open and export a backup before reloading.

## Known test limits

Automated model/server/DOM tests are included in the repository. Browser appearance, touch controls, actual microphone quality, hosted restart behavior and antivirus/SmartScreen behavior need real-device testing. Optional AI companion replies require the user's separately configured model service; deterministic companion commands work without it. Calendar notification permission alone does not schedule background reminders.

Official hosting references: https://render.com/docs/websocket and https://render.com/docs/disks . Review current pricing at https://render.com/pricing .
