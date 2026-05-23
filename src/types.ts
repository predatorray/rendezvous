export interface Member {
  id: string;
  name: string;
  audio: boolean;
  video: boolean;
  isHost: boolean;
  // Demo-only: a still image used in place of a live video stream so the
  // shared meeting UI can be rendered without WebRTC. Ignored in real meetings.
  imageSrc?: string;
}

export interface ChatMessage {
  id: string;
  fromId: string;
  fromName: string;
  text: string;
  ts: number;
}

export type SystemEvent =
  | { kind: 'joined'; name: string }
  | { kind: 'left'; name: string };

export interface SystemMessage {
  id: string;
  text: string;
  ts: number;
  system: true;
  event?: SystemEvent;
}

export type TimelineItem = ChatMessage | SystemMessage;

export function isSystem(item: TimelineItem): item is SystemMessage {
  return (item as SystemMessage).system === true;
}

// ----- Verified meeting (experimental) handshake -----

// A passkey assertion the host produces once per hosting session over its
// ephemeral session key. base64url-encoded raw WebAuthn fields.
export interface SessionCert {
  authenticatorData: string;
  clientDataJSON: string;
  signature: string;
}

// Sent by a verified host in response to a guest's `auth-challenge`. Lets the
// guest confirm it is talking to the real host before exchanging any data.
export interface AuthResponsePayload {
  // The host identity (passkey) public key, SPKI base64url. The guest cross
  // checks its fingerprint against the one pinned in the invite URL.
  identityPublicKey: string;
  identityAlg: number; // COSE algorithm id (e.g. -7 for ES256)
  // Ephemeral per-session key the passkey vouches for via `sessionCert`.
  sessionPublicKey: string; // SPKI base64url
  sessionCert: SessionCert;
  // Raw ECDSA signature by the session key over the guest's fresh nonce,
  // proving the host is live (not a replayed certificate). base64url.
  liveness: string;
}

// ----- Wire protocol (carried over PeerJS DataConnections) -----

export type WireMessage =
  | { type: 'hello'; name: string }
  | { type: 'auth-challenge'; nonce: string } // client -> host
  | { type: 'auth-response'; payload: AuthResponsePayload } // host -> client
  | { type: 'auth-unavailable' } // host -> client: not running verification
  | {
      type: 'welcome';
      selfId: string;
      hostId: string;
      members: Member[];
      timeline: TimelineItem[];
    }
  | { type: 'roster'; members: Member[] }
  | { type: 'chat-send'; text: string } // client -> host
  | { type: 'timeline'; item: TimelineItem } // host -> all
  | { type: 'state'; audio: boolean; video: boolean } // client -> host
  | { type: 'kick'; peerId: string } // host -> victim
  | { type: 'end' };
