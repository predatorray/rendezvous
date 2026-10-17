import * as mockModule from './peerjsTestMock';

jest.mock('peerjs', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const m = require('./peerjsTestMock');
  return { __esModule: true, default: m.FakePeer, ...m };
});

const { FakeDataConnection, FakeMediaConnection, resetPeerJsMock } =
  mockModule;

// eslint-disable-next-line import/first
import { MeetingClient } from './MeetingClient';
// eslint-disable-next-line import/first
import { MetricsCollector } from '../metrics';

function makeFakeStream(): any {
  return {
    getAudioTracks: () => [{ enabled: true }],
    getVideoTracks: () => [{ enabled: true }],
    getTracks: () => [],
  };
}

function makeMetrics(): Record<keyof MetricsCollector, jest.Mock> {
  return {
    meetingStarted: jest.fn(),
    guestJoined: jest.fn(),
    meetingEnded: jest.fn(),
    connectionError: jest.fn(),
  };
}

function latestPeer() {
  return mockModule.peerInstances[mockModule.peerInstances.length - 1]!;
}

async function startHost(metrics: MetricsCollector) {
  const client = new MeetingClient({
    code: 'abcdef',
    name: 'Host',
    isHost: true,
    metrics,
  });
  const p = client.start(makeFakeStream());
  await Promise.resolve();
  const peer = latestPeer();
  peer.fakeOpen('rendezvous-abcdef');
  await p;
  return { client, peer };
}

async function startGuest(metrics: MetricsCollector) {
  const client = new MeetingClient({
    code: 'abcdef',
    name: 'Guest',
    isHost: false,
    metrics,
  });
  const p = client.start(makeFakeStream());
  await Promise.resolve();
  const peer = latestPeer();
  peer.fakeOpen(peer.id);
  await p;
  const dc = peer.outgoingConnects[0];
  return { client, peer, dc };
}

function joinGuest(peer: any, id: string, name = id) {
  const dc = new FakeDataConnection(id);
  peer.fakeIncomingConnection(dc);
  dc.fakeOpen();
  dc.fakeData({ type: 'hello', name });
  return dc;
}

function welcome(memberCount: number) {
  return {
    type: 'welcome',
    selfId: 'me',
    hostId: 'rendezvous-abcdef',
    members: Array.from({ length: memberCount }, (_, i) => ({ id: `m${i}` })),
    timeline: [],
  };
}

describe('MeetingClient metrics', () => {
  let now: jest.SpyInstance;
  let errSpy: jest.SpyInstance;

  beforeEach(() => {
    resetPeerJsMock();
    now = jest.spyOn(Date, 'now').mockReturnValue(1_000_000);
    errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    now.mockRestore();
    errSpy.mockRestore();
  });

  describe('host', () => {
    it('reports meeting_started once the peer opens', async () => {
      const metrics = makeMetrics();
      await startHost(metrics);
      expect(metrics.meetingStarted).toHaveBeenCalledWith({ role: 'host' });
      expect(metrics.guestJoined).not.toHaveBeenCalled();
    });

    it('reports duration, guest count and peak participants on leave', async () => {
      const metrics = makeMetrics();
      const { client, peer } = await startHost(metrics);
      joinGuest(peer, 'g1');
      joinGuest(peer, 'g2');
      client.kick('g1');
      joinGuest(peer, 'g3');
      now.mockReturnValue(1_000_000 + 90_000);
      client.leave();
      expect(metrics.meetingEnded).toHaveBeenCalledTimes(1);
      expect(metrics.meetingEnded).toHaveBeenCalledWith({
        role: 'host',
        reason: 'self-left',
        durationMs: 90_000,
        guestCount: 3,
        peakParticipants: 3,
      });
    });

    it('reports meeting_ended only once', async () => {
      const metrics = makeMetrics();
      const { client } = await startHost(metrics);
      client.leave();
      client.leave();
      window.dispatchEvent(new Event('pagehide'));
      expect(metrics.meetingEnded).toHaveBeenCalledTimes(1);
    });

    it('ignores pagehide into the back/forward cache', async () => {
      const metrics = makeMetrics();
      const { client } = await startHost(metrics);
      const event = new Event('pagehide');
      Object.defineProperty(event, 'persisted', { value: true });
      window.dispatchEvent(event);
      expect(metrics.meetingEnded).not.toHaveBeenCalled();
      client.leave();
      expect(metrics.meetingEnded).toHaveBeenCalledWith(
        expect.objectContaining({ reason: 'self-left' })
      );
    });

    it('reports page-closed when the tab is closed mid-meeting', async () => {
      const metrics = makeMetrics();
      await startHost(metrics);
      now.mockReturnValue(1_000_000 + 5_000);
      window.dispatchEvent(new Event('pagehide'));
      window.dispatchEvent(new Event('pagehide'));
      expect(metrics.meetingEnded).toHaveBeenCalledTimes(1);
      expect(metrics.meetingEnded).toHaveBeenCalledWith(
        expect.objectContaining({ reason: 'page-closed', durationMs: 5_000 })
      );
    });

    it('reports a start failure and rejects as before', async () => {
      const metrics = makeMetrics();
      const client = new MeetingClient({
        code: 'abcdef',
        name: 'Host',
        isHost: true,
        metrics,
      });
      const p = client.start(null);
      await Promise.resolve();
      latestPeer().fakeError({ type: 'unavailable-id' });
      await expect(p).rejects.toEqual({ type: 'unavailable-id' });
      expect(metrics.connectionError).toHaveBeenCalledWith({
        role: 'host',
        stage: 'start',
        category: 'peerjs',
        errorType: 'unavailable-id',
      });
      expect(metrics.meetingStarted).not.toHaveBeenCalled();
      client.leave();
      expect(metrics.meetingEnded).not.toHaveBeenCalled();
    });

    it('reports peer, data connection and media call errors', async () => {
      const metrics = makeMetrics();
      const { peer } = await startHost(metrics);

      peer.fakeError({ type: 'network' });
      expect(metrics.connectionError).toHaveBeenLastCalledWith({
        role: 'host',
        stage: 'peer',
        category: 'network',
        errorType: 'network',
      });

      const dc = joinGuest(peer, 'g1');
      dc.emit('error', { type: 'negotiation-failed' });
      expect(metrics.connectionError).toHaveBeenLastCalledWith({
        role: 'host',
        stage: 'data-connection',
        category: 'webrtc',
        errorType: 'negotiation-failed',
      });

      const incoming = new FakeMediaConnection('g2');
      peer.fakeIncomingCall(incoming);
      incoming.emit('error', new Error('ice failed'));
      expect(metrics.connectionError).toHaveBeenLastCalledWith({
        role: 'host',
        stage: 'media-call',
        category: 'webrtc',
        errorType: 'Error',
      });

      joinGuest(peer, 'g3');
      const outgoing = peer.outgoingCalls[peer.outgoingCalls.length - 1];
      outgoing.emit('error', { type: 'webrtc' });
      expect(metrics.connectionError).toHaveBeenLastCalledWith(
        expect.objectContaining({ stage: 'media-call', category: 'webrtc' })
      );
    });
  });

  describe('guest', () => {
    it('reports guest_joined only after the host welcomes them', async () => {
      const metrics = makeMetrics();
      const { dc } = await startGuest(metrics);
      expect(metrics.meetingStarted).not.toHaveBeenCalled();
      expect(metrics.guestJoined).not.toHaveBeenCalled();
      dc.fakeOpen();
      dc.fakeData(welcome(2));
      dc.fakeData(welcome(2));
      expect(metrics.guestJoined).toHaveBeenCalledTimes(1);
      expect(metrics.guestJoined).toHaveBeenCalledWith({ participantCount: 2 });
    });

    it.each([
      ['host-left', { type: 'end' }],
      ['kicked', { type: 'kick', peerId: 'me' }],
    ])('reports meeting_ended (%s) with the peak roster size', async (reason, msg) => {
      const metrics = makeMetrics();
      const { dc } = await startGuest(metrics);
      dc.fakeOpen();
      dc.fakeData(welcome(2));
      dc.fakeData({ type: 'roster', members: [{}, {}, {}, {}] });
      dc.fakeData({ type: 'roster', members: [{}, {}] });
      now.mockReturnValue(1_000_000 + 42_000);
      dc.fakeData(msg);
      expect(metrics.meetingEnded).toHaveBeenCalledWith({
        role: 'guest',
        reason,
        durationMs: 42_000,
        peakParticipants: 4,
      });
    });

    it('ignores a late welcome after the meeting ended', async () => {
      const metrics = makeMetrics();
      const { dc } = await startGuest(metrics);
      dc.fakeOpen();
      dc.fakeData(welcome(2));
      dc.fakeData({ type: 'end' });
      dc.fakeData(welcome(2));
      window.dispatchEvent(new Event('pagehide'));
      expect(metrics.guestJoined).toHaveBeenCalledTimes(1);
      expect(metrics.meetingEnded).toHaveBeenCalledTimes(1);
    });

    it('emits ended once when the connection closes after a kick', async () => {
      const metrics = makeMetrics();
      const ended = jest.fn();
      const { client, dc } = await startGuest(metrics);
      client.on('ended', ended);
      dc.fakeOpen();
      dc.fakeData(welcome(2));
      dc.fakeData({ type: 'kick', peerId: 'me' });
      dc.close();
      expect(ended).toHaveBeenCalledTimes(1);
      expect(ended).toHaveBeenCalledWith('kicked');
      expect(metrics.meetingEnded).toHaveBeenCalledTimes(1);
    });

    it('tolerates a null peer error', async () => {
      const metrics = makeMetrics();
      const { peer } = await startGuest(metrics);
      expect(() => peer.fakeError(null)).not.toThrow();
      expect(metrics.connectionError).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'unknown', errorType: 'unknown' })
      );
    });

    it('reports host-left when the data connection closes', async () => {
      const metrics = makeMetrics();
      const { dc } = await startGuest(metrics);
      dc.fakeOpen();
      dc.fakeData(welcome(2));
      dc.close();
      expect(metrics.meetingEnded).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'guest', reason: 'host-left' })
      );
    });

    it('reports a connection error, but no meeting_ended, when the meeting is not found', async () => {
      const metrics = makeMetrics();
      const ended = jest.fn();
      const { client, peer } = await startGuest(metrics);
      client.on('ended', ended);
      peer.fakeError({ type: 'peer-unavailable' });
      expect(ended).toHaveBeenCalledWith('error', 'Meeting not found.');
      expect(metrics.connectionError).toHaveBeenCalledWith({
        role: 'guest',
        stage: 'peer',
        category: 'peerjs',
        errorType: 'peer-unavailable',
      });
      expect(metrics.guestJoined).not.toHaveBeenCalled();
      expect(metrics.meetingEnded).not.toHaveBeenCalled();
    });

    it('reports data connection and incoming call errors', async () => {
      const metrics = makeMetrics();
      const { dc, peer } = await startGuest(metrics);
      dc.emit('error', { type: 'connection-closed' });
      expect(metrics.connectionError).toHaveBeenLastCalledWith({
        role: 'guest',
        stage: 'data-connection',
        category: 'webrtc',
        errorType: 'connection-closed',
      });
      const call = new FakeMediaConnection('rendezvous-abcdef', {
        peerId: 'x',
      });
      peer.fakeIncomingCall(call);
      call.emit('error', {});
      expect(metrics.connectionError).toHaveBeenLastCalledWith({
        role: 'guest',
        stage: 'media-call',
        category: 'webrtc',
        errorType: 'unknown',
      });
    });
  });

  describe('failsafe', () => {
    it('keeps the meeting working when every metric throws', async () => {
      const boom = () => {
        throw new Error('analytics down');
      };
      const metrics: MetricsCollector = {
        meetingStarted: boom,
        guestJoined: boom,
        meetingEnded: boom,
        connectionError: boom,
      };
      const ended = jest.fn();
      const { client, peer } = await startHost(metrics);
      client.on('ended', ended);
      const dc = joinGuest(peer, 'g1');
      peer.fakeError({ type: 'network' });
      client.leave();
      expect(dc.sent.some((m) => m.type === 'end')).toBe(true);
      expect(ended).toHaveBeenCalledWith('self-left');
    });

    it('survives errors whose fields throw when read', async () => {
      const metrics = makeMetrics();
      const { peer } = await startHost(metrics);
      const hostile = new Proxy(
        {},
        {
          get() {
            throw new Error('no peeking');
          },
        }
      );
      expect(() => peer.fakeError(hostile)).not.toThrow();
    });

    it('defaults to a no-op collector when gtag is missing', async () => {
      delete (window as any).gtag;
      const client = new MeetingClient({
        code: 'abcdef',
        name: 'Host',
        isHost: true,
      });
      const p = client.start(null);
      await Promise.resolve();
      latestPeer().fakeOpen('rendezvous-abcdef');
      await expect(p).resolves.toBeUndefined();
      expect(() => client.leave()).not.toThrow();
    });

    it('defaults to Google Analytics when gtag is loaded', async () => {
      const gtag = jest.fn();
      (window as any).gtag = gtag;
      try {
        const client = new MeetingClient({
          code: 'abcdef',
          name: 'Host',
          isHost: true,
        });
        const p = client.start(null);
        await Promise.resolve();
        latestPeer().fakeOpen('rendezvous-abcdef');
        await p;
        client.leave();
        expect(gtag).toHaveBeenCalledWith('event', 'meeting_started', {
          role: 'host',
        });
        expect(gtag).toHaveBeenCalledWith(
          'event',
          'meeting_ended',
          expect.objectContaining({ role: 'host', reason: 'self-left' })
        );
      } finally {
        delete (window as any).gtag;
      }
    });
  });

  describe('ICE server fetch', () => {
    const env = process.env;

    afterEach(() => {
      process.env = env;
      delete (global as any).fetch;
    });

    async function startWithFetch(fetchImpl: jest.Mock) {
      process.env = {
        ...env,
        NODE_ENV: 'production',
        REACT_APP_METERED_API_KEY: 'key',
      };
      (global as any).fetch = fetchImpl;
      let Client!: typeof MeetingClient;
      let mock!: typeof mockModule;
      jest.isolateModules(() => {
        Client = require('./MeetingClient').MeetingClient;
        mock = require('peerjs');
      });
      const metrics = makeMetrics();
      const client = new Client({
        code: 'abcdef',
        name: 'Host',
        isHost: true,
        metrics,
      });
      const p = client.start(null);
      // Let the (mocked) fetch settle and the Peer get constructed.
      for (let i = 0; i < 20 && !mock.peerInstances.length; i++) {
        await new Promise((r) => setTimeout(r, 0));
      }
      mock.peerInstances[mock.peerInstances.length - 1].fakeOpen(
        'rendezvous-abcdef'
      );
      await p;
      return metrics;
    }

    it('reports a network error when metered.ca is unreachable', async () => {
      const metrics = await startWithFetch(
        jest.fn().mockRejectedValue(new TypeError('Failed to fetch'))
      );
      expect(metrics.connectionError).toHaveBeenCalledWith({
        role: 'host',
        stage: 'ice-servers',
        category: 'network',
        errorType: 'TypeError',
      });
      expect(metrics.meetingStarted).toHaveBeenCalled();
    });

    it('reports a server error when metered.ca responds with an error', async () => {
      const metrics = await startWithFetch(
        jest.fn().mockResolvedValue({ ok: false, status: 503 })
      );
      expect(metrics.connectionError).toHaveBeenCalledWith({
        role: 'host',
        stage: 'ice-servers',
        category: 'network',
        errorType: 'server-error',
      });
    });

    it('reports nothing when the fetch succeeds', async () => {
      const metrics = await startWithFetch(
        jest.fn().mockResolvedValue({ ok: true, json: async () => [] })
      );
      expect(metrics.connectionError).not.toHaveBeenCalled();
    });
  });
});
