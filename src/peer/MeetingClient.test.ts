import * as mockModule from './peerjsTestMock';

jest.mock('peerjs', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const m = require('./peerjsTestMock');
  return { __esModule: true, default: m.FakePeer, ...m };
});

const {
  FakeDataConnection,
  FakeMediaConnection,
  FakePeer,
  resetPeerJsMock,
} = mockModule;

function getLatestPeer() {
  return mockModule.peerInstances[mockModule.peerInstances.length - 1]!;
}

function getPeerInstances() {
  return mockModule.peerInstances;
}

// eslint-disable-next-line import/first
import { MeetingClient } from './MeetingClient';

function makeFakeStream(): any {
  return {
    getAudioTracks: () => [{ enabled: true }],
    getVideoTracks: () => [{ enabled: true }],
    getTracks: () => [],
  };
}

async function startHost() {
  const c = new MeetingClient({ code: 'abcdef', name: 'Host', isHost: true });
  const promise = c.start(makeFakeStream());
  // Wait a microtask so the peer is constructed and listeners attach.
  await Promise.resolve();
  const peer = getLatestPeer();
  peer.fakeOpen('rendezvous-abcdef');
  await promise;
  return { client: c, peer };
}

async function startClient() {
  const c = new MeetingClient({ code: 'abcdef', name: 'Guest', isHost: false });
  const promise = c.start(makeFakeStream());
  await Promise.resolve();
  const peer = getLatestPeer();
  peer.fakeOpen(peer.id);
  await promise;
  return { client: c, peer };
}

describe('MeetingClient', () => {
  beforeEach(() => resetPeerJsMock());

  it('host: resolves start() on peer open and emits ready + members for self', async () => {
    const ready = jest.fn();
    const members = jest.fn();
    const c = new MeetingClient({ code: 'abcdef', name: 'Host', isHost: true });
    c.on('ready', ready);
    c.on('members', members);

    const p = c.start(makeFakeStream());
    await Promise.resolve();
    getLatestPeer().fakeOpen('rendezvous-abcdef');
    await p;

    expect(ready).toHaveBeenCalledWith('rendezvous-abcdef');
    expect(members).toHaveBeenCalled();
    const m = members.mock.calls.at(-1)![0];
    expect(m).toHaveLength(1);
    expect(m[0]).toMatchObject({ name: 'Host', isHost: true });
    expect(c.getSelfId()).toBe('rendezvous-abcdef');
  });

  it('host: uses the meeting-derived peer id', async () => {
    const { peer } = await startHost();
    expect(peer.id).toBe('rendezvous-abcdef');
  });

  it('client: uses a random per-meeting peer id', async () => {
    const { peer } = await startClient();
    expect(peer.id).toMatch(/^rendezvous-abcdef-/);
  });

  it('start() rejects when the broker errors before opening', async () => {
    const c = new MeetingClient({ code: 'abcdef', name: 'Host', isHost: true });
    const p = c.start(makeFakeStream());
    await Promise.resolve();
    getLatestPeer().fakeError({ type: 'unavailable-id' });
    await expect(p).rejects.toEqual({ type: 'unavailable-id' });
  });

  it('host: hello message adds member, emits join system message, sends welcome & roster', async () => {
    const timeline = jest.fn();
    const members = jest.fn();
    const { client, peer } = await startHost();
    client.on('timeline', timeline);
    client.on('members', members);

    const dc = new FakeDataConnection('rendezvous-abcdef-guest1');
    peer.fakeIncomingConnection(dc);
    dc.fakeOpen();
    dc.fakeData({ type: 'hello', name: 'Alice' });

    // Welcome should have been sent to the joining peer.
    const welcome = dc.sent.find((m) => m.type === 'welcome');
    expect(welcome).toBeDefined();
    expect(welcome.members.map((x: any) => x.name).sort()).toEqual(
      ['Alice', 'Host'].sort()
    );

    // A "joined" system message should have been emitted.
    const sysCall = timeline.mock.calls.find(
      (call) => call[0]?.system === true
    );
    expect(sysCall).toBeDefined();
    expect(sysCall![0].event).toEqual({ kind: 'joined', name: 'Alice' });

    // A roster broadcast should also have been sent.
    expect(dc.sent.some((m) => m.type === 'roster')).toBe(true);
    expect(members).toHaveBeenCalled();
  });

  it('host: chat-send from client is recorded and broadcast', async () => {
    const timeline = jest.fn();
    const { client, peer } = await startHost();
    client.on('timeline', timeline);

    const dc = new FakeDataConnection('rendezvous-abcdef-guest1');
    peer.fakeIncomingConnection(dc);
    dc.fakeOpen();
    dc.fakeData({ type: 'hello', name: 'Alice' });
    timeline.mockClear();
    dc.sent.length = 0;

    dc.fakeData({ type: 'chat-send', text: 'hi there' });

    const chatEmits = timeline.mock.calls.map((c) => c[0]);
    expect(chatEmits.some((c) => c.text === 'hi there' && !c.system)).toBe(
      true
    );
    expect(
      dc.sent.some((m) => m.type === 'timeline' && m.item.text === 'hi there')
    ).toBe(true);
  });

  it('host: client disconnect emits "left" system message and roster update', async () => {
    const timeline = jest.fn();
    const { client, peer } = await startHost();
    client.on('timeline', timeline);

    const dc = new FakeDataConnection('rendezvous-abcdef-guest1');
    peer.fakeIncomingConnection(dc);
    dc.fakeOpen();
    dc.fakeData({ type: 'hello', name: 'Alice' });
    timeline.mockClear();

    dc.close();
    const leftSys = timeline.mock.calls
      .map((c) => c[0])
      .find((m) => m.event?.kind === 'left');
    expect(leftSys).toBeDefined();
    expect(leftSys.event.name).toBe('Alice');
  });

  it('host: sendChat() emits a local chat message', async () => {
    const timeline = jest.fn();
    const { client } = await startHost();
    client.on('timeline', timeline);
    client.sendChat('hello');
    const last = timeline.mock.calls.at(-1)![0];
    expect(last.text).toBe('hello');
    expect(last.fromName).toBe('Host');
  });

  it('host: sendChat ignores whitespace-only input', async () => {
    const timeline = jest.fn();
    const { client } = await startHost();
    client.on('timeline', timeline);
    client.sendChat('   ');
    expect(timeline).not.toHaveBeenCalled();
  });

  it('host: setAudioEnabled/setVideoEnabled flips own member state and broadcasts roster', async () => {
    const members = jest.fn();
    const { client, peer } = await startHost();

    const dc = new FakeDataConnection('rendezvous-abcdef-guest1');
    peer.fakeIncomingConnection(dc);
    dc.fakeOpen();
    dc.fakeData({ type: 'hello', name: 'Alice' });
    dc.sent.length = 0;

    client.on('members', members);
    client.setAudioEnabled(false);
    client.setVideoEnabled(false);

    const self = members.mock.calls
      .at(-1)![0]
      .find((m: any) => m.isHost);
    expect(self.audio).toBe(false);
    expect(self.video).toBe(false);
    expect(dc.sent.some((m) => m.type === 'roster')).toBe(true);
  });

  it('host: incoming media call is answered and stream is emitted', async () => {
    const remoteStream = jest.fn();
    const { client, peer } = await startHost();
    client.on('remoteStream', remoteStream);

    const mc = new FakeMediaConnection('rendezvous-abcdef-guest1');
    peer.fakeIncomingCall(mc);
    const fakeStream = { id: 'stream-1' };
    mc.fakeStream(fakeStream);

    expect(mc.answered).toBe(true);
    expect(remoteStream).toHaveBeenCalledWith(
      'rendezvous-abcdef-guest1',
      fakeStream
    );
  });

  it('host leave(): broadcasts end and emits ended self-left', async () => {
    const ended = jest.fn();
    const { client, peer } = await startHost();
    client.on('ended', ended);

    const dc = new FakeDataConnection('rendezvous-abcdef-guest1');
    peer.fakeIncomingConnection(dc);
    dc.fakeOpen();
    dc.fakeData({ type: 'hello', name: 'Alice' });
    dc.sent.length = 0;

    client.leave();
    expect(dc.sent.some((m) => m.type === 'end')).toBe(true);
    expect(ended).toHaveBeenCalledWith('self-left');
    expect(peer.destroyed).toBe(true);
  });

  it('client: receives welcome, history, members', async () => {
    const history = jest.fn();
    const members = jest.fn();
    const { client, peer } = await startClient();
    client.on('history', history);
    client.on('members', members);

    // The client's outbound connect to host is index 0.
    const dc = peer.outgoingConnects[0];
    expect(dc).toBeDefined();
    dc.fakeOpen();

    dc.fakeData({
      type: 'welcome',
      selfId: peer.id,
      hostId: 'rendezvous-abcdef',
      members: [{ id: 'rendezvous-abcdef', name: 'Host', audio: true, video: true, isHost: true }],
      timeline: [],
    });
    expect(history).toHaveBeenCalledWith([]);
    expect(members).toHaveBeenCalled();
  });

  it('client: host data conn close emits ended host-left', async () => {
    const ended = jest.fn();
    const { client, peer } = await startClient();
    client.on('ended', ended);
    const dc = peer.outgoingConnects[0];
    dc.fakeOpen();
    dc.close();
    expect(ended).toHaveBeenCalledWith('host-left');
    expect(peer.destroyed).toBe(true);
  });

  it('client: end message from host triggers ended host-left', async () => {
    const ended = jest.fn();
    const { client, peer } = await startClient();
    client.on('ended', ended);
    const dc = peer.outgoingConnects[0];
    dc.fakeOpen();
    dc.fakeData({ type: 'end' });
    expect(ended).toHaveBeenCalledWith('host-left');
  });

  it('client: peer-unavailable error triggers ended error', async () => {
    const ended = jest.fn();
    const { client, peer } = await startClient();
    client.on('ended', ended);
    peer.fakeError({ type: 'peer-unavailable' });
    expect(ended).toHaveBeenCalledWith('error', 'Meeting not found.');
  });

  it('client: sendChat sends chat-send to the host', async () => {
    const { client, peer } = await startClient();
    const dc = peer.outgoingConnects[0];
    dc.fakeOpen();
    dc.sent.length = 0;
    client.sendChat('hello');
    expect(
      dc.sent.find((m) => m.type === 'chat-send' && m.text === 'hello')
    ).toBeTruthy();
  });

  it('client: incoming call uses metadata.peerId to attribute stream', async () => {
    const remoteStream = jest.fn();
    const { client, peer } = await startClient();
    client.on('remoteStream', remoteStream);
    const mc = new FakeMediaConnection('rendezvous-abcdef', {
      peerId: 'other-peer',
    });
    peer.fakeIncomingCall(mc);
    const stream = { id: 's' };
    mc.fakeStream(stream);
    expect(mc.answered).toBe(true);
    expect(remoteStream).toHaveBeenCalledWith('other-peer', stream);
  });

  it('event listener unsubscribe stops further notifications', async () => {
    const fn = jest.fn();
    const { client } = await startHost();
    const off = client.on('timeline', fn);
    off();
    client.sendChat('after unsubscribe');
    expect(fn).not.toHaveBeenCalled();
  });

  it('only one Peer instance is constructed per start()', async () => {
    await startHost();
    expect(getPeerInstances()).toHaveLength(1);
  });

  it('host: kick() sends a kick message to the victim and removes them from the roster', async () => {
    const timeline = jest.fn();
    const members = jest.fn();
    const { client, peer } = await startHost();

    const dc = new FakeDataConnection('rendezvous-abcdef-guest1');
    peer.fakeIncomingConnection(dc);
    dc.fakeOpen();
    dc.fakeData({ type: 'hello', name: 'Alice' });

    client.on('timeline', timeline);
    client.on('members', members);
    dc.sent.length = 0;
    timeline.mockClear();

    client.kick('rendezvous-abcdef-guest1');

    // Victim got the kick message.
    expect(
      dc.sent.find((m) => m.type === 'kick' && m.peerId === 'rendezvous-abcdef-guest1')
    ).toBeTruthy();
    // Member is removed and a "left" system message is emitted.
    const leftSys = timeline.mock.calls
      .map((c) => c[0])
      .find((m) => m.event?.kind === 'left');
    expect(leftSys).toBeDefined();
    expect(leftSys.event.name).toBe('Alice');
    // Roster no longer contains Alice.
    const latestMembers = members.mock.calls.at(-1)![0];
    expect(latestMembers.some((m: any) => m.name === 'Alice')).toBe(false);
  });

  it('host: kick() is a no-op when targeting self', async () => {
    const { client, peer } = await startHost();
    const dc = new FakeDataConnection('rendezvous-abcdef-guest1');
    peer.fakeIncomingConnection(dc);
    dc.fakeOpen();
    dc.fakeData({ type: 'hello', name: 'Alice' });
    dc.sent.length = 0;

    client.kick(client.getSelfId());

    expect(dc.sent.some((m) => m.type === 'kick')).toBe(false);
  });

  it('host: kick() ignores unknown peer ids', async () => {
    const timeline = jest.fn();
    const { client } = await startHost();
    client.on('timeline', timeline);

    client.kick('does-not-exist');

    // No "left" system message should have been generated.
    const leftSys = timeline.mock.calls
      .map((c) => c[0])
      .find((m) => m?.event?.kind === 'left');
    expect(leftSys).toBeUndefined();
  });

  it('client: kick() is a no-op (only the host may evict peers)', async () => {
    const { client, peer } = await startClient();
    const dc = peer.outgoingConnects[0];
    dc.fakeOpen();
    dc.sent.length = 0;

    client.kick('rendezvous-abcdef');

    expect(dc.sent.some((m) => m.type === 'kick')).toBe(false);
  });

  it('client: receiving a kick from host triggers ended with reason "kicked"', async () => {
    const ended = jest.fn();
    const { client, peer } = await startClient();
    client.on('ended', ended);
    const dc = peer.outgoingConnects[0];
    dc.fakeOpen();

    dc.fakeData({ type: 'kick', peerId: peer.id });

    expect(ended).toHaveBeenCalledWith('kicked');
    expect(peer.destroyed).toBe(true);
  });

  it('FakePeer is the mocked Peer constructor', () => {
    // Sanity: ensure peerjs mock is wired up.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Peer = require('peerjs').default;
    expect(Peer).toBe(FakePeer);
  });
});
