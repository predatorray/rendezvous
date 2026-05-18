/**
 * Lightweight PeerJS mock for unit-testing MeetingClient.
 *
 * Exposes module-level handles so tests can drive events deterministically:
 *  - latestPeer: the most recently constructed Peer
 *  - peerInstances: every Peer constructed in the test
 *  - Peer.fakeOpen(id) / Peer.fakeError(err) to push the broker handshake
 *  - peer.fakeIncomingConnection(dc) / fakeIncomingCall(mc)
 *  - peer.call() returns a tracked MediaConnection so tests can inspect outgoing calls
 */

class Emitter {
  private map: Record<string, Function[]> = {};
  on(ev: string, fn: Function) {
    (this.map[ev] = this.map[ev] || []).push(fn);
    return this;
  }
  once(ev: string, fn: Function) {
    const wrap = (...args: any[]) => {
      this.off(ev, wrap);
      fn(...args);
    };
    return this.on(ev, wrap);
  }
  off(ev: string, fn: Function) {
    this.map[ev] = (this.map[ev] || []).filter((f) => f !== fn);
    return this;
  }
  emit(ev: string, ...args: any[]) {
    (this.map[ev] || []).slice().forEach((f) => f(...args));
  }
}

export class FakeDataConnection extends Emitter {
  peer: string;
  open = true;
  sent: any[] = [];
  constructor(peer: string) {
    super();
    this.peer = peer;
  }
  send(msg: any) {
    this.sent.push(msg);
  }
  close() {
    this.open = false;
    this.emit('close');
  }
  // Helpers for tests
  fakeOpen() {
    this.emit('open');
  }
  fakeData(msg: any) {
    this.emit('data', msg);
  }
}

export class FakeMediaConnection extends Emitter {
  peer: string;
  metadata: any;
  answered = false;
  answeredWith: any = undefined;
  constructor(peer: string, metadata?: any) {
    super();
    this.peer = peer;
    this.metadata = metadata;
  }
  answer(stream?: any) {
    this.answered = true;
    this.answeredWith = stream;
  }
  close() {
    this.emit('close');
  }
  fakeStream(s: any) {
    this.emit('stream', s);
  }
}

export const peerInstances: FakePeer[] = [];
export let latestPeer: FakePeer | null = null;

export class FakePeer extends Emitter {
  id: string;
  destroyed = false;
  outgoingCalls: FakeMediaConnection[] = [];
  outgoingConnects: FakeDataConnection[] = [];
  constructor(id: string, _opts?: any) {
    super();
    this.id = id;
    peerInstances.push(this);
    latestPeer = this;
  }
  destroy() {
    this.destroyed = true;
  }
  reconnect() {}
  connect(peerId: string, _opts?: any): FakeDataConnection {
    const dc = new FakeDataConnection(peerId);
    this.outgoingConnects.push(dc);
    return dc;
  }
  call(peerId: string, _stream: any, opts?: any): FakeMediaConnection {
    const mc = new FakeMediaConnection(peerId, opts?.metadata);
    this.outgoingCalls.push(mc);
    return mc;
  }
  fakeOpen(id?: string) {
    this.emit('open', id ?? this.id);
  }
  fakeError(err: any) {
    this.emit('error', err);
  }
  fakeIncomingConnection(dc: FakeDataConnection) {
    this.emit('connection', dc);
  }
  fakeIncomingCall(mc: FakeMediaConnection) {
    this.emit('call', mc);
  }
}

export function resetPeerJsMock() {
  peerInstances.length = 0;
  latestPeer = null;
}

export type DataConnection = FakeDataConnection;
export type MediaConnection = FakeMediaConnection;

export default FakePeer;
