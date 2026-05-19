# Rendezvous e2e tests

Playwright-driven end-to-end tests that simulate real Zoom-like sessions
by opening one browser context per participant inside a single test.

## Setup

```bash
npm install
npm run e2e:install   # one-time: downloads Chromium and OS deps
```

## Run

```bash
npm run e2e           # headless run, auto-starts `npm start`
npm run e2e:ui        # Playwright UI mode for debugging
```

The CRA dev server on http://localhost:3000 is launched automatically
via Playwright's `webServer` config (it reuses an already-running dev
server if one is present).

## How multi-peer tests work

Each peer is its own incognito `browser.newContext()`, giving it isolated
localStorage and permission grants. Helpers in `fixtures.ts`:

- `openPeer({ name, code, role })` — opens a participant directly at
  `/#/m/<code>?name=...&host=1` (skipping the home screen).
- `openParticipantsPanel`, `openChatPanel`, `sendChat`, `leaveMeeting`.

## Caveats

- Tests need outbound network to reach the public PeerJS broker
  (`0.peerjs.com`). Behind a strict firewall they will fail to connect.
- Chromium is launched with `--use-fake-device-for-media-stream` so
  `getUserMedia` resolves without a real camera/microphone.
- Tests are serialized (`workers: 1`) to avoid hammering the broker and
  to prevent peer-id collisions across parallel runs. Each test still
  generates its own fresh 6-letter code.
