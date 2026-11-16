# LifeOS Study Garden

An original shared study space inspired by spatial collaboration tools. Open **Space** in the LifeOS sidebar. Create a room, customise your avatar, then invite people using the room link. Room entry does not request microphone or camera access.

## Start on this PC

Use Node.js 24 or newer (the standalone server uses native TypeScript stripping).

```powershell
npm install
npm run dev
```

Double-click **Start LifeOS.bat** in the standalone folder to do this automatically. Restart an existing Vite process after updating: the new room server is loaded at startup.

For a quick multiplayer check, create a space, copy the invite link, and open it in another browser or private window. Join using a second name. Both avatars, messages, board changes and zone timers should appear together.

## Friends on the same Wi-Fi

Double-click **Start Shared Space.bat**, or run:

```powershell
npm run dev:lan
```

Open the **Network** URL printed by Vite, e.g. `http://192.168.x.x:5173`, create a space, then copy that address with its `?room=...` code to your friends. A `localhost` invite only works on your own computer. Allow Node through Windows Firewall for your private network if prompted. Do not use the Vite development server as a public internet deployment.

Avatar movement and chat work over ordinary LAN HTTP. Microphone access requires HTTPS or localhost; friends using an HTTP LAN address generally cannot enable voice.

## Host for friends over the internet

Use a Node hosting service that supports long-lived WebSocket connections, one server instance, and HTTPS. Static-only hosting is insufficient for shared rooms.

```powershell
npm ci
npm run build
npm run space:serve
```

The Node server serves `dist/` and the `/space` WebSocket endpoint on `PORT` (default 4173). Put it behind HTTPS/WSS. Share the deployed URL with its room code. Vite preview (`npm run preview`) does not include the room server.

### Voice configuration

Voice uses WebRTC audio. No camera or screen sharing is implemented. Both people must click **Join voice** and be in the same zone. Quiet library disables voice. Crossing a zone boundary mutes you and releases microphone tracks; explicitly rejoin voice in the new area. A session and active mic remain connected when navigating other LifeOS sections; the floating return badge displays the mic state. Use **Mute** or **Leave** before closing a session.

The default ICE-server list is empty, suitable only where browsers can connect directly. For reliable calls across internet networks, provide your own STUN/TURN service in `.env.local` before building:

```dotenv
VITE_ICE_SERVERS=[{"urls":"stun:YOUR_STUN_HOST:3478"},{"urls":"turn:YOUR_TURN_HOST:3478","username":"YOUR_USER","credential":"YOUR_SHORT_LIVED_CREDENTIAL"}]
```

VITE variables are included in browser bundles. Do not embed a provider master secret or long-lived privileged credentials. Production TURN credentials should be short-lived and issued by a server. No paid relay or hosting service has been created or configured by this project.

## Controls and room behaviour

- Click the world to walk around walls and furniture; use WASD, arrow keys or the on-screen arrows for individual steps. Room shortcuts and Walk over find a route through doorways. Walking stops if you navigate to another LifeOS page.
- Four zones: quiet library, study studio, commons and meeting room. Commons voice reaches people within 18 map units; other rooms use zone-wide voice. There is no gradual distance attenuation. The library disables voice.
- Shared chat is visible to every person in the same room. Microphone access is opt-in.
- Start a 15-, 25- or 50-minute timer for your current zone. Any participant in that zone can stop/restart it.
- Save a goal in People to share what you are studying. Save an empty goal to clear it. Availability, goals and five-second reactions are visible to your room.
- Noticeboard updates are shared; the last saved note wins.
- Up to 12 people. Rooms, messages, board and timers live in server memory and disappear when everyone leaves or the server restarts.
- Anyone possessing an invite code can join that room. There is no user login, host moderation or recording. The server does not read or share your academic/skills localStorage data.
- Walls and large furniture block movement on both client and server. Chairs are decorative floor accents; the room shortcuts provide accessible navigation without precise map clicks.

## Verification

```powershell
node --experimental-strip-types tests/space-server.mjs
node tests/space-hosting.mjs
```

Automated WebSocket tests cover room presence/chat, isolation between rooms, movement/zone muting, timers, board, signalling restrictions and disconnects. Both the Vite development and standalone production HTTP/WebSocket servers passed startup/join smoke checks. The production build passes. Real microphone interoperability, browser visual checks and internet TURN deployment still need testing on the target devices.
# Seats and personal rooms

Click a campus chair to walk over and request its seat. Occupancy is enforced by the shared server. Stand, move, leave or disconnect to release it. Personal rooms are solo, saved in this browser, customizable with furniture/themes, and backed up with the rest of LifeOS. They can be opened without joining a server. Entering one from the campus mutes voice and marks you as in your own room. Friends cannot visit personal rooms yet. Existing campus voice and room-hosting requirements below still apply.
# Space Studio shared maps

After creating or joining a campus, choose **Shared rooms**. The first connected participant is the session host and may edit/publish the map. Others can walk, sit, chat and join voice. Quiet rooms mute microphones; entering another room also mutes. The host role transfers if its holder disconnects. Publishing a map resets occupants to safe entrances and stops voice. Campus chat remains visible across rooms.

Published maps disappear from server memory when the last participant leaves. The host's saved draft remains in this browser; use **Edit map → Load saved shared map → Publish to everyone** in a new session. Personal maps are stored separately and can be copied into a shared draft with **Use my personal rooms**. No account-based ownership or private-room access controls are provided. Run `npm run test:space` to check shared map publishing, seating, collision, voice signalling isolation, host transfer and hosting.
