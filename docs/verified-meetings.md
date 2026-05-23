# Verified meetings (experimental)

A meeting code alone proves nothing about *who* is hosting. The host's PeerJS
id is derived deterministically from the code (`rendezvous-<code>`), so anyone
who knows the code can race to claim that id on the public broker and relay the
meeting as a fake "host". **Verified meetings** let a host prove their identity
to guests with a passkey, so guests can refuse to join an impostor.

This is an **experimental, off-by-default** feature. With it disabled the app
behaves exactly as before — no passkeys, no extra handshake.

## What the host shares

When a host enables *Verified meeting* and starts one, the invite link carries
the host's public identity key:

```
https://www.predatorray.me/rendezvous/#/m/ABCDEF?vk=<public-key>&va=<alg>
```

The Share dialog also shows a **fingerprint** (`SHA256:…`, like an SSH key
fingerprint). The host is encouraged to send the fingerprint over a *second*
channel (in person, a phone call, a signed email).

In the meeting, both host and guests see a **"Verified" badge**; clicking it
opens a dialog showing the fingerprint (derived from the key pinned in the
invite URL). A guest compares that against the value the host gave them
out-of-band. This is the check that catches a **tampered link**: the
cryptographic handshake only proves the host holds whatever key is *in the
URL*, so if an attacker rewrote `vk` in the link the guest received, the
automatic check still passes — only the human fingerprint comparison detects it.

## The handshake

The host identity is a **passkey** (WebAuthn credential). The private key never
leaves the authenticator and syncs across the host's devices via iCloud
Keychain / Google Password Manager. The public key (and its fingerprint) is the
identity guests pin.

To avoid a biometric prompt on every guest join, the host signs **once per
meeting**:

1. **Session key.** On starting the meeting the host generates an ephemeral
   ECDSA P-256 key pair (WebCrypto, in memory) and has the passkey sign the
   session public key — one biometric prompt. This produces a *session cert*.
2. **Per guest.** When a guest connects it sends a fresh random `nonce`. The
   host replies with the identity public key, the session public key, the
   session cert, and a signature by the *session key* over the nonce. No
   further biometric prompts.

A guest verifies three links in the chain (`src/peer/verification.ts`):

| # | Check | Defends against |
|---|-------|-----------------|
| 1 | `SHA-256(identity public key)` equals the fingerprint pinned in the URL | a swapped key |
| 2 | The session cert is a valid WebAuthn assertion by the identity key over `hash(code ‖ session public key)`, for this origin/RP, user-present | a key the passkey never vouched for |
| 3 | The session key signed *this guest's* fresh nonce | replay of a recorded cert |

Only if all three hold does the guest send its name / state / media. Otherwise
it shows an error and refuses to join.

## Waiting room

If a guest opens a verified link before the host is present, it shows a
*waiting for host* screen and retries the connection until the host appears,
then verifies and joins automatically.

## Cross-device

- **Hosting** a created link from another of the host's devices works: the
  synced passkey signs the session cert (chosen via a discoverable-credential
  prompt), and it is checked against the key already pinned in the URL.
- **Creating a brand-new link** on a second device mints a *new* identity (a new
  fingerprint), because the public key isn't recoverable from a synced passkey
  without an assertion. Create your links from one device for a stable
  fingerprint.
- Passkey sync is per-ecosystem (Apple **or** Google), as the user confirmed for
  this build.

## Threat model & limitations

**Defended:** a peer-id squatter or anyone who knows only the code cannot
impersonate the host — they hold no passkey, and an impostor "host" that isn't
running verification answers `auth-unavailable`, which the guest treats as a
failure. The out-of-band fingerprint additionally defends against a tampered
invite link.

**Not (yet) defended — documented honestly:** a fully active man-in-the-middle
that can both intercept the guest's connection *and* maintain a live connection
to the real host could relay challenges and responses. Closing this requires
binding the proof to the transport (e.g. signing the WebRTC DTLS fingerprint or
an app-layer ECDH exchange and encrypting all relayed traffic). That is a
deliberate follow-up; today's guarantee is host **authentication**, not a fully
authenticated/encrypted-at-the-app-layer channel on top of WebRTC's existing
DTLS.

Because this is why it's labelled *experimental*, the failure copy tells guests
not to share anything sensitive when verification fails.

## Code map

- `src/crypto/encoding.ts` — base64url, SHA-256, byte helpers.
- `src/crypto/verify.ts` — ECDSA DER→raw, WebAuthn assertion & session-signature
  verification, fingerprints.
- `src/peer/hostIdentity.ts` — passkey registration + local persistence of the
  public parts.
- `src/peer/verification.ts` — challenge derivations, `HostSession` (the
  once-per-meeting ceremony + per-guest signing), and `verifyAuthResponse` (the
  guest's full check).
- `src/peer/MeetingClient.ts` — `auth-challenge` / `auth-response` wire messages,
  guest waiting room + verify-before-join, host signing.
- `src/util/verifiedMeeting.ts` — the experimental flag and URL params.
