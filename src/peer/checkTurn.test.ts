import { checkTurn } from './checkTurn';

const servers = [{ urls: 'turn:example.com:443', username: 'user', credential: 'pass' }];

describe('TURN availability check', () => {
  let peer: any;
  let controller: AbortController;
  const original = global.RTCPeerConnection;

  beforeEach(() => {
    jest.useFakeTimers();
    controller = new AbortController();
    peer = {
      close: jest.fn(),
      createDataChannel: jest.fn(),
      createOffer: jest.fn().mockResolvedValue({ type: 'offer', sdp: '' }),
      setLocalDescription: jest.fn().mockResolvedValue(undefined),
    };
    global.RTCPeerConnection = jest.fn(() => peer) as any;
  });

  afterEach(() => {
    global.RTCPeerConnection = original;
    jest.useRealTimers();
  });

  it('accepts a relay candidate and releases the connection immediately', async () => {
    const result = checkTurn(servers, controller.signal);
    expect(global.RTCPeerConnection).toHaveBeenCalledWith({
      iceServers: servers, iceTransportPolicy: 'relay',
    });
    peer.onicecandidate({ candidate: { type: 'relay' } });
    await expect(result).resolves.toBe(true);
    expect(peer.close).toHaveBeenCalledTimes(1);
    expect(jest.getTimerCount()).toBe(0);
  });

  it('reports unavailable when gathering completes without a relay', async () => {
    const result = checkTurn(servers, controller.signal);
    peer.onicecandidate({ candidate: null });
    await expect(result).resolves.toBe(false);
    expect(peer.close).toHaveBeenCalledTimes(1);
  });

  it('bounds a stalled check and closes it', async () => {
    const result = checkTurn(servers, controller.signal);
    jest.advanceTimersByTime(10000);
    await expect(result).resolves.toBe(false);
    expect(peer.close).toHaveBeenCalledTimes(1);
  });

  it('closes on cancellation and does not negotiate after cancellation', async () => {
    const result = checkTurn(servers, controller.signal);
    controller.abort();
    await expect(result).resolves.toBe(false);
    expect(peer.close).toHaveBeenCalledTimes(1);
    expect(peer.setLocalDescription).not.toHaveBeenCalled();
    expect(jest.getTimerCount()).toBe(0);
  });

  it('handles failed negotiation without an unhandled rejection', async () => {
    peer.createOffer.mockRejectedValue(new Error('unavailable'));
    await expect(checkTurn(servers, controller.signal)).resolves.toBe(false);
    expect(peer.close).toHaveBeenCalledTimes(1);
  });
});
