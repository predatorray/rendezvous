import Peer, { DataConnection, MediaConnection } from 'peerjs';
import {
  AuthResponsePayload,
  ChatMessage,
  Member,
  SystemMessage,
  TimelineItem,
  WireMessage,
} from '../types';
import {
  newMessageId,
  peerIdForMeeting,
  randomClientPeerId,
} from '../util/code';
import { HostSession, freshNonce, verifyAuthResponse } from './verification';

/**
 * Verified-meeting configuration (experimental). Absent for ordinary meetings,
 * in which case the client behaves exactly as it always has.
 */
export type VerificationConfig =
  | { role: 'host'; session: HostSession }
  | { role: 'guest'; expectedFingerprint: string };

/**
 * Event payloads for subscribers.
 */
export interface MeetingEvents {
  members: (members: Member[]) => void;
  timeline: (item: TimelineItem) => void;
  history: (items: TimelineItem[]) => void;
  localStream: (stream: MediaStream | null) => void;
  remoteStream: (peerId: string, stream: MediaStream) => void;
  remoteStreamRemoved: (peerId: string) => void;
  ended: (
    reason: 'host-left' | 'self-left' | 'error' | 'kicked',
    detail?: string
  ) => void;
  ready: (selfId: string) => void;
  // Verified meeting (experimental) lifecycle, guest side only.
  waiting: () => void; // host not present yet; waiting room
  verifying: () => void; // connected, checking host identity
  verified: (fingerprint: string) => void; // host identity confirmed
}

type EventName = keyof MeetingEvents;
type Listener<K extends EventName> = MeetingEvents[K];

/**
 * metered.ca TURN/STUN credentials endpoint. The API key is injected at build
 * time from the REACT_APP_METERED_API_KEY env var (set by the GitHub publish
 * workflow). Since this is a fully serverless / backend-less app, the key is
 * inlined into the client bundle as plaintext — that is expected and accepted.
 */
const METERED_CREDENTIALS_URL =
  'https://predatorray.metered.live/api/v1/turn/credentials';
const METERED_API_KEY = process.env.REACT_APP_METERED_API_KEY;

/**
 * Fetches ICE servers from metered.ca for production builds only. Unit tests
 * (NODE_ENV=test) and e2e tests (CRA dev server, NODE_ENV=development) fall
 * back to PeerJS's built-in default ICE servers by returning null.
 */
async function fetchIceServers(): Promise<RTCIceServer[] | null> {
  if (process.env.NODE_ENV !== 'production' || !METERED_API_KEY) {
    return null;
  }
  try {
    const response = await fetch(
      `${METERED_CREDENTIALS_URL}?apiKey=${METERED_API_KEY}`
    );
    if (!response.ok) {
      throw new Error(`metered.ca responded with ${response.status}`);
    }
    return (await response.json()) as RTCIceServer[];
  } catch (e) {
    console.error('Failed to fetch ICE servers from metered.ca', e);
    return null;
  }
}

interface ConstructorArgs {
  code: string;
  name: string;
  isHost: boolean;
  verification?: VerificationConfig;
}

interface MetadataPayload {
  peerId: string; // the "logical" peer the stream belongs to
}

/**
 * MeetingClient owns the PeerJS Peer and orchestrates either a host (relay hub)
 * or a client (single connection to host) lifecycle.
 */
export class MeetingClient {
  readonly code: string;
  readonly isHost: boolean;
  private name: string;
  private peer: Peer | null = null;
  private hostId: string;
  private selfId: string = '';
  private localStream: MediaStream | null = null;
  private audioEnabled = true;
  private videoEnabled = true;

  // Host-only state.
  private members = new Map<string, Member>();
  private timeline: TimelineItem[] = [];
  private dataConns = new Map<string, DataConnection>(); // peerId -> data
  private mediaConns = new Map<string, MediaConnection[]>(); // peerId -> open outgoing calls

  // Client-only state.
  private hostDataConn: DataConnection | null = null;

  // Verified meeting (experimental) state.
  private verification?: VerificationConfig;
  private clientConnected = false; // data conn to host is open
  private waitingForHost = false;
  private authNonce: string | null = null;
  private authTimer: ReturnType<typeof setTimeout> | null = null;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;

  // Tracks remote streams by logical peer id for both host and client.
  private remoteStreams = new Map<string, MediaStream>();

  private listeners: { [K in EventName]?: Set<Listener<K>> } = {};

  constructor({ code, name, isHost, verification }: ConstructorArgs) {
    this.code = code;
    this.name = name;
    this.isHost = isHost;
    this.verification = verification;
    this.hostId = peerIdForMeeting(code);
  }

  on<K extends EventName>(event: K, handler: Listener<K>): () => void {
    let set = this.listeners[event] as Set<Listener<K>> | undefined;
    if (!set) {
      set = new Set();
      (this.listeners as any)[event] = set;
    }
    set.add(handler);
    return () => set!.delete(handler);
  }

  private emit<K extends EventName>(
    event: K,
    ...args: Parameters<Listener<K>>
  ): void {
    const set = this.listeners[event] as Set<Listener<K>> | undefined;
    if (!set) return;
    set.forEach((fn) => {
      try {
        (fn as any)(...args);
      } catch (e) {
        console.error('listener error', e);
      }
    });
  }

  // ---- Public lifecycle ----

  async start(stream: MediaStream | null): Promise<void> {
    this.localStream = stream;
    this.audioEnabled = stream?.getAudioTracks()[0]?.enabled ?? false;
    this.videoEnabled = stream?.getVideoTracks()[0]?.enabled ?? false;

    const peerId = this.isHost ? this.hostId : randomClientPeerId(this.code);
    const iceServers = await fetchIceServers();
    this.peer = new Peer(peerId, {
      debug: 1,
      ...(iceServers ? { config: { iceServers } } : {}),
    });

    await new Promise<void>((resolve, reject) => {
      const peer = this.peer!;
      const onOpen = (id: string) => {
        this.selfId = id;
        peer.off('error', onErr as any);
        resolve();
      };
      const onErr = (err: any) => {
        peer.off('open', onOpen);
        reject(err);
      };
      peer.once('open', onOpen);
      peer.once('error', onErr);
    });

    this.emit('ready', this.selfId);

    if (this.isHost) {
      this.startAsHost();
    } else {
      this.startAsClient();
    }
  }

  leave(): void {
    if (this.isHost) {
      // Notify all clients then tear down.
      this.broadcast({ type: 'end' });
    } else if (this.hostDataConn?.open) {
      try {
        this.hostDataConn.close();
      } catch {}
    }
    this.shutdown();
    this.emit('ended', 'self-left');
  }

  sendChat(text: string): void {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (this.isHost) {
      const msg: ChatMessage = {
        id: newMessageId(),
        fromId: this.selfId,
        fromName: this.name,
        text: trimmed,
        ts: Date.now(),
      };
      this.recordAndBroadcastTimeline(msg);
    } else {
      this.sendToHost({ type: 'chat-send', text: trimmed });
    }
  }

  setAudioEnabled(enabled: boolean): void {
    this.audioEnabled = enabled;
    this.localStream?.getAudioTracks().forEach((t) => (t.enabled = enabled));
    this.publishOwnState();
  }

  setVideoEnabled(enabled: boolean): void {
    this.videoEnabled = enabled;
    this.localStream?.getVideoTracks().forEach((t) => (t.enabled = enabled));
    this.publishOwnState();
  }

  getSelfId(): string {
    return this.selfId;
  }

  /**
   * Host-only: forcibly remove a participant from the meeting.
   * Sends a `kick` message to the victim, then tears down their connection
   * (which surfaces a "left" system message via handleClientGone).
   */
  kick(peerId: string): void {
    if (!this.isHost) return;
    if (peerId === this.selfId) return;
    const conn = this.dataConns.get(peerId);
    if (conn) {
      this.safeSend(conn, { type: 'kick', peerId });
      try {
        conn.close();
      } catch {}
    }
    // Ensure roster/media cleanup runs even if the close event is delayed.
    this.handleClientGone(peerId);
  }

  // ---- Host ----

  private startAsHost(): void {
    const peer = this.peer!;
    // Seed self into roster.
    this.members.set(this.selfId, {
      id: this.selfId,
      name: this.name,
      audio: this.audioEnabled,
      video: this.videoEnabled,
      isHost: true,
    });
    this.emitMembers();

    peer.on('connection', (conn) => this.handleClientDataConnection(conn));
    peer.on('call', (call) => this.handleIncomingCallAsHost(call));
    peer.on('error', (err) => {
      console.error('Host peer error', err);
    });
    peer.on('disconnected', () => {
      // Try to reconnect — PeerJS broker pings.
      try {
        peer.reconnect();
      } catch {}
    });
  }

  private handleClientDataConnection(conn: DataConnection): void {
    conn.on('open', () => {
      this.dataConns.set(conn.peer, conn);
    });
    conn.on('data', (raw) => {
      const msg = raw as WireMessage;
      this.handleMessageFromClient(conn, msg);
    });
    conn.on('close', () => this.handleClientGone(conn.peer));
    conn.on('error', () => this.handleClientGone(conn.peer));
  }

  private handleMessageFromClient(conn: DataConnection, msg: WireMessage): void {
    switch (msg.type) {
      case 'auth-challenge': {
        this.respondToAuthChallenge(conn, msg.nonce);
        break;
      }
      case 'hello': {
        const member: Member = {
          id: conn.peer,
          name: msg.name?.trim() || 'Guest',
          audio: false,
          video: false,
          isHost: false,
        };
        this.members.set(conn.peer, member);
        const joinSys: SystemMessage = {
          id: newMessageId(),
          text: `${member.name} joined`,
          ts: Date.now(),
          system: true,
          event: { kind: 'joined', name: member.name },
        };
        // Welcome the new client with current state & history.
        const welcome: WireMessage = {
          type: 'welcome',
          selfId: conn.peer,
          hostId: this.selfId,
          members: Array.from(this.members.values()),
          timeline: this.timeline,
        };
        this.safeSend(conn, welcome);
        // Tell the new client about the join system message immediately too.
        this.recordAndBroadcastTimeline(joinSys);
        this.broadcastRoster();
        // Push host's own stream and any existing remote streams to the
        // new client by calling them once they're ready to receive.
        this.shareAllStreamsWith(conn.peer);
        break;
      }
      case 'chat-send': {
        const member = this.members.get(conn.peer);
        if (!member) return;
        const chat: ChatMessage = {
          id: newMessageId(),
          fromId: member.id,
          fromName: member.name,
          text: msg.text.slice(0, 4000),
          ts: Date.now(),
        };
        this.recordAndBroadcastTimeline(chat);
        break;
      }
      case 'state': {
        const member = this.members.get(conn.peer);
        if (!member) return;
        member.audio = !!msg.audio;
        member.video = !!msg.video;
        this.broadcastRoster();
        break;
      }
      default:
        // ignore
        break;
    }
  }

  private respondToAuthChallenge(conn: DataConnection, nonce: string): void {
    const v = this.verification;
    if (!v || v.role !== 'host') {
      // We are not a verified host — tell the guest so it can bail fast.
      this.safeSend(conn, { type: 'auth-unavailable' });
      return;
    }
    v.session
      .signFor(nonce)
      .then((payload) =>
        this.safeSend(conn, { type: 'auth-response', payload })
      )
      .catch((e) => {
        console.error('failed to sign auth challenge', e);
        this.safeSend(conn, { type: 'auth-unavailable' });
      });
  }

  private handleClientGone(peerId: string): void {
    const member = this.members.get(peerId);
    if (!member) return;
    this.members.delete(peerId);
    this.dataConns.delete(peerId);
    this.tearDownMediaFor(peerId);
    const leftSys: SystemMessage = {
      id: newMessageId(),
      text: `${member.name} left`,
      ts: Date.now(),
      system: true,
      event: { kind: 'left', name: member.name },
    };
    this.recordAndBroadcastTimeline(leftSys);
    this.broadcastRoster();
    // Also tell other clients to drop that remote stream visual.
    // This is conveyed implicitly by the roster update; clients prune
    // streams for peers no longer in the roster.
  }

  private handleIncomingCallAsHost(call: MediaConnection): void {
    // The client is offering their stream. Answer with host's own stream.
    const ownerId = call.peer;
    call.answer(this.localStream || undefined);
    call.on('stream', (incoming) => {
      // Stop any prior stream from this peer.
      this.remoteStreams.set(ownerId, incoming);
      this.emit('remoteStream', ownerId, incoming);
      // Forward to all OTHER connected clients.
      Array.from(this.dataConns.keys()).forEach((otherId) => {
        if (otherId === ownerId) return;
        this.callPeer(otherId, incoming, ownerId);
      });
    });
    call.on('close', () => {
      // Owner's stream gone.
      this.remoteStreams.delete(ownerId);
      this.emit('remoteStreamRemoved', ownerId);
    });
    call.on('error', (e) => console.error('host call error', e));
  }

  /**
   * After a new peer connects, push host's own stream + every existing remote
   * stream into the new peer so they see everyone.
   */
  private shareAllStreamsWith(newPeerId: string): void {
    if (this.localStream) {
      this.callPeer(newPeerId, this.localStream, this.selfId);
    }
    Array.from(this.remoteStreams.entries()).forEach(([ownerId, stream]) => {
      if (ownerId === newPeerId) return;
      this.callPeer(newPeerId, stream, ownerId);
    });
  }

  private callPeer(
    targetPeerId: string,
    stream: MediaStream,
    ownerLogicalId: string
  ): void {
    const peer = this.peer;
    if (!peer) return;
    const meta: MetadataPayload = { peerId: ownerLogicalId };
    const call = peer.call(targetPeerId, stream, { metadata: meta });
    if (!call) return;
    const list = this.mediaConns.get(targetPeerId) ?? [];
    list.push(call);
    this.mediaConns.set(targetPeerId, list);
    call.on('close', () => {
      const remaining = (this.mediaConns.get(targetPeerId) ?? []).filter(
        (c) => c !== call
      );
      if (remaining.length) this.mediaConns.set(targetPeerId, remaining);
      else this.mediaConns.delete(targetPeerId);
    });
    call.on('error', (e) => console.error('host outbound call error', e));
  }

  private tearDownMediaFor(peerId: string): void {
    const conns = this.mediaConns.get(peerId);
    if (conns) {
      conns.forEach((c) => {
        try {
          c.close();
        } catch {}
      });
      this.mediaConns.delete(peerId);
    }
  }

  private recordAndBroadcastTimeline(item: TimelineItem): void {
    this.timeline.push(item);
    this.emit('timeline', item);
    this.broadcast({ type: 'timeline', item });
  }

  private broadcastRoster(): void {
    const members = Array.from(this.members.values());
    this.emitMembers();
    this.broadcast({ type: 'roster', members });
  }

  private emitMembers(): void {
    this.emit('members', Array.from(this.members.values()));
  }

  private broadcast(msg: WireMessage): void {
    Array.from(this.dataConns.values()).forEach((conn) =>
      this.safeSend(conn, msg)
    );
  }

  private safeSend(conn: DataConnection, msg: WireMessage): void {
    try {
      if (conn.open) conn.send(msg);
    } catch (e) {
      console.error('send failed', e);
    }
  }

  // ---- Client ----

  private isVerifiedGuest(): boolean {
    return this.verification?.role === 'guest';
  }

  private startAsClient(): void {
    const peer = this.peer!;
    // Accept incoming calls from host (they carry other peers' streams).
    peer.on('call', (call) => this.handleIncomingCallAsClient(call));
    peer.on('error', (err) => {
      // PeerJS surfaces peer-unavailable when the host id isn't registered.
      if ((err as any).type === 'peer-unavailable') {
        // Verified meetings show a waiting room and keep retrying until the
        // host appears; ordinary meetings keep the original behavior.
        if (this.isVerifiedGuest() && !this.clientConnected) {
          this.enterWaiting();
          return;
        }
        this.emit('ended', 'error', 'Meeting not found.');
        this.shutdown();
        return;
      }
      console.error('Client peer error', err);
    });

    this.connectToHost();
  }

  private connectToHost(): void {
    const peer = this.peer;
    if (!peer) return;
    // Drop any dead connection from a previous (failed) waiting-room attempt.
    if (this.hostDataConn) {
      try {
        this.hostDataConn.close();
      } catch {}
    }
    const dc = peer.connect(this.hostId, { reliable: true });
    this.hostDataConn = dc;
    dc.on('open', () => {
      this.clientConnected = true;
      this.waitingForHost = false;
      if (this.retryTimer) {
        clearTimeout(this.retryTimer);
        this.retryTimer = null;
      }
      this.onHostConnectionOpen(dc);
    });
    dc.on('data', (raw) => this.handleMessageFromHost(raw as WireMessage));
    dc.on('close', () => {
      // Ignore stale connections abandoned while retrying in the waiting room.
      if (!this.clientConnected) return;
      this.emit('ended', 'host-left');
      this.shutdown();
    });
    dc.on('error', (err) => {
      console.error('Host data conn error', err);
    });
  }

  private enterWaiting(): void {
    if (!this.waitingForHost) {
      this.waitingForHost = true;
      this.emit('waiting');
    }
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.retryTimer = setTimeout(() => {
      if (this.peer) this.connectToHost();
    }, 2500);
  }

  private onHostConnectionOpen(dc: DataConnection): void {
    if (this.isVerifiedGuest()) {
      // Verify the host's identity before revealing our name, state or media.
      this.authNonce = freshNonce();
      this.emit('verifying');
      this.safeSend(dc, { type: 'auth-challenge', nonce: this.authNonce });
      if (this.authTimer) clearTimeout(this.authTimer);
      this.authTimer = setTimeout(
        () => this.failVerification('verify-timeout'),
        15000
      );
      return;
    }
    this.joinHost(dc);
  }

  // Sends hello, publishes state and offers our stream. Runs only once the
  // host is trusted: immediately for ordinary meetings, after a successful
  // identity check for verified ones.
  private joinHost(dc: DataConnection): void {
    this.safeSend(dc, { type: 'hello', name: this.name });
    this.publishOwnState();
    // Place a call to host with our stream so host can relay it.
    if (this.localStream && this.peer) {
      const meta: MetadataPayload = { peerId: this.selfId };
      const outgoing = this.peer.call(this.hostId, this.localStream, {
        metadata: meta,
      });
      outgoing?.on('stream', (incoming) => {
        // This is host's own stream.
        this.remoteStreams.set(this.hostId, incoming);
        this.emit('remoteStream', this.hostId, incoming);
      });
    }
  }

  private failVerification(reasonCode: string): void {
    if (this.authTimer) {
      clearTimeout(this.authTimer);
      this.authTimer = null;
    }
    this.emit('ended', 'error', reasonCode);
    this.shutdown();
  }

  private handleAuthResponse(payload: AuthResponsePayload): void {
    const v = this.verification;
    if (!v || v.role !== 'guest' || !this.authNonce) return;
    const nonce = this.authNonce;
    verifyAuthResponse({
      payload,
      expectedFingerprint: v.expectedFingerprint,
      code: this.code,
      nonce,
      origin: window.location.origin,
      rpId: window.location.hostname,
    })
      .then((result) => {
        if (this.authTimer) {
          clearTimeout(this.authTimer);
          this.authTimer = null;
        }
        if (!result.ok) {
          console.warn('host verification failed:', result.reason);
          this.failVerification('verify-failed');
          return;
        }
        this.emit('verified', result.fingerprint);
        const dc = this.hostDataConn;
        if (dc && dc.open) this.joinHost(dc);
      })
      .catch(() => this.failVerification('verify-failed'));
  }

  private handleMessageFromHost(msg: WireMessage): void {
    switch (msg.type) {
      case 'auth-response': {
        this.handleAuthResponse(msg.payload);
        break;
      }
      case 'auth-unavailable': {
        // The peer answering for this meeting is not running verification —
        // either a misconfigured host or an impostor squatting the id.
        this.failVerification('verify-unavailable');
        break;
      }
      case 'welcome': {
        // Track host id (it might differ from the static derived one in edge
        // cases; trust what host says).
        this.hostId = msg.hostId;
        this.emit('history', msg.timeline);
        this.emit('members', msg.members);
        break;
      }
      case 'roster':
        this.emit('members', msg.members);
        break;
      case 'timeline':
        this.emit('timeline', msg.item);
        break;
      case 'end':
        this.emit('ended', 'host-left');
        this.shutdown();
        break;
      case 'kick':
        this.emit('ended', 'kicked');
        this.shutdown();
        break;
      default:
        break;
    }
  }

  private handleIncomingCallAsClient(call: MediaConnection): void {
    const meta = (call.metadata ?? {}) as MetadataPayload;
    const ownerId = meta.peerId || call.peer;
    call.answer(); // we don't need to send anything back on this call
    call.on('stream', (incoming) => {
      this.remoteStreams.set(ownerId, incoming);
      this.emit('remoteStream', ownerId, incoming);
    });
    call.on('close', () => {
      this.remoteStreams.delete(ownerId);
      this.emit('remoteStreamRemoved', ownerId);
    });
    call.on('error', (e) => console.error('client incoming call error', e));
  }

  private sendToHost(msg: WireMessage): void {
    if (this.hostDataConn?.open) this.safeSend(this.hostDataConn, msg);
  }

  private publishOwnState(): void {
    if (this.isHost) {
      const me = this.members.get(this.selfId);
      if (me) {
        me.audio = this.audioEnabled;
        me.video = this.videoEnabled;
        this.broadcastRoster();
      }
      return;
    }
    this.sendToHost({
      type: 'state',
      audio: this.audioEnabled,
      video: this.videoEnabled,
    });
  }

  // ---- Teardown ----

  private shutdown(): void {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
    if (this.authTimer) {
      clearTimeout(this.authTimer);
      this.authTimer = null;
    }
    try {
      this.peer?.destroy();
    } catch {}
    this.peer = null;
    this.dataConns.clear();
    this.mediaConns.clear();
    this.remoteStreams.clear();
    this.hostDataConn = null;
  }
}
