<div align="center">
    <a href="https://predatorray.github.io/rendezvous/" target="_blank"><img src="https://raw.githubusercontent.com/predatorray/rendezvous/assets/rendezvous-title.svg" alt="Rendezvous" height="72" /></a>
    <h3><em>where conversations meet, serverlessly.</em></h3>
</div>

<p align="center">
    A <b><i>serverless</i></b>, Zoom-like video conferencing web app,<br>
    built with React, TypeScript, MUI, and PeerJS on top of WebRTC.
</p>

<p align="center">
    <a href="https://discord.gg/VPYRT538n"><img alt="Discord" src="https://img.shields.io/discord/1506173646207455294?label=Discord&logo=discord"></a>
    <a href="https://github.com/predatorray/rendezvous/blob/main/LICENSE"><img src="https://img.shields.io/github/license/predatorray/rendezvous" alt="License"/></a>
    <a href="https://github.com/predatorray/rendezvous/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/predatorray/rendezvous/ci.yml?branch=main" alt="Build Status"/></a>
    <a href="https://github.com/predatorray/rendezvous/actions/workflows/publish.yml"><img src="https://img.shields.io/github/actions/workflow/status/predatorray/rendezvous/publish.yml?branch=main&label=deploy" alt="Deployment Status"/></a>
</p>

---

👉 **Try it online: <https://predatorray.github.io/rendezvous/>**

![Meeting Screenshot](https://raw.githubusercontent.com/predatorray/rendezvous/assets/screenshot-meeting.png)

There is no application server — the **host** of each meeting acts as a
relay hub for chat messages and media streams, so each participant only
maintains connections to the host instead of every other participant. The
PeerJS public broker is used only for the initial WebRTC signaling.

## Features

- Pick a name, host a meeting, or join an existing one by code or link
- 6-letter human-readable meeting codes (~300M combinations)
- Tile-based video grid with auto-layout
- Tile shows the participant’s initials when their camera is off
- Mute / unmute audio, start / stop video (mute icon shown on the tile)
- Collapsible right-side chat drawer with timestamps and join/leave notices
- Chat history is preserved by the host so late joiners see prior messages
- Sharable invite link and copy-able meeting code
- Host leaving ends the meeting for everyone
- No accounts, no passcodes, fully static-site deployable

## Tech stack

- React 19 + TypeScript (Create React App)
- MUI v7 (dark, minimalist Zoom-inspired theme)
- React Router v7 (`HashRouter` for static hosting)
- PeerJS for signaling and WebRTC orchestration
- `gh-pages` for GitHub Pages deployment

## Running locally

```bash
npm install
npm start
```

Open <http://localhost:3000>. To test multi-party meetings open additional
incognito windows and use the same meeting code.

## Building

```bash
npm run build
```

Outputs a static bundle in `build/` ready to be served from any CDN. The
app uses `HashRouter`, so it works on hosts that don’t support
client-side SPA rewrites (e.g. GitHub Pages).

## Deploying to GitHub Pages

1. Add a `homepage` field to `package.json` pointing at your Pages URL:

   ```json
   "homepage": "https://YOUR_USER.github.io/rendezvous"
   ```

2. Push to GitHub, then run:

   ```bash
   npm run deploy
   ```

   This builds and pushes the `build/` directory to the `gh-pages` branch
   using `gh-pages`. Enable Pages from the `gh-pages` branch in repo
   Settings → Pages.

## Architecture

- `src/peer/MeetingClient.ts` — owns the PeerJS `Peer` and implements
  both host (relay) and client behaviors.
- `src/peer/useMeeting.ts` — React hook that adapts the meeting client
  to component state.
- `src/types.ts` — shared types and the wire protocol carried over
  PeerJS `DataConnection`s.
- `src/pages/` — Home and Meeting pages.
- `src/components/` — `VideoGrid`, `VideoTile`, `ChatDrawer`,
  `Controls`, `ShareDialog`.

### Wire protocol

Messages exchanged over the data connection between a client and the
host:

| Type | Direction | Purpose |
| ---- | --------- | ------- |
| `hello` | client → host | Sent on connect with the participant’s name |
| `welcome` | host → client | Returns assigned id, roster, and timeline |
| `roster` | host → all | Updated member list (joins, leaves, state) |
| `chat-send` | client → host | New chat message draft |
| `timeline` | host → all | Authoritative chat or system event |
| `state` | client → host | Participant changed audio/video |
| `end` | host → all | Host is leaving — meeting is over |

### Media topology

Each participant places exactly one outbound media call to the host
carrying their own stream. The host accepts and:

1. Calls every other connected client with that incoming stream,
   tagged with `metadata.peerId` so the receiver knows which participant
   it represents.
2. Pushes its own stream and every existing remote stream to a new
   client when they join.

This gives every client a constant number of signalling sessions with
the host (one data connection + N media connections), avoiding the
classic O(N²) mesh.

## Limitations / caveats

- The host’s upstream bandwidth bounds meeting size (relay is on a
  consumer-grade browser tab).
- Forwarding remote tracks through the host re-encodes them; quality is
  limited to what `getUserMedia` and the browser’s WebRTC stack negotiate.
- Default PeerJS broker is used; for production you can host your own
  PeerServer and pass it to the `Peer` constructor.

[1]: https://github.com/predatorray/rendezvous/blob/main/LICENSE
[2]: https://github.com/predatorray/rendezvous/actions/workflows/ci.yml
