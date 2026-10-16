import { act, renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import LangProvider from '../i18n/LangProvider';
import { useMeeting } from './useMeeting';

type Handler = (...args: any[]) => void;

const mockClients: MockFakeClient[] = [];

class MockFakeClient {
  handlers = new Map<string, Handler[]>();
  constructor() {
    mockClients.push(this);
  }
  on(event: string, h: Handler) {
    this.handlers.set(event, [...(this.handlers.get(event) ?? []), h]);
    return () => {};
  }
  emit(event: string, ...args: any[]) {
    (this.handlers.get(event) ?? []).forEach((h) => h(...args));
  }
  start = jest.fn().mockResolvedValue(undefined);
  leave = jest.fn(() => this.emit('ended', 'self-left'));
  sendChat() {}
  setAudioEnabled() {}
  setVideoEnabled() {}
  kick() {}
}

jest.mock('./MeetingClient', () => ({
  MeetingClient: function MeetingClient() {
    return new MockFakeClient();
  },
}));

function makeStream() {
  const tracks = [
    { kind: 'audio', enabled: true, stop: jest.fn() },
    { kind: 'video', enabled: true, stop: jest.fn() },
  ];
  const stream = {
    getTracks: () => tracks,
    getAudioTracks: () => tracks.filter((t) => t.kind === 'audio'),
    getVideoTracks: () => tracks.filter((t) => t.kind === 'video'),
  } as unknown as MediaStream;
  return { stream, tracks };
}

function wrapper({ children }: { children: ReactNode }) {
  return <LangProvider>{children}</LangProvider>;
}

async function startMeeting() {
  const { stream, tracks } = makeStream();
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: { getUserMedia: jest.fn().mockResolvedValue(stream) },
  });
  const view = renderHook(
    () => useMeeting({ code: 'abcxyz', name: 'Alice', isHost: false }),
    { wrapper }
  );
  await waitFor(() => expect(view.result.current.phase).toBe('live'));
  return { ...view, tracks, client: mockClients[mockClients.length - 1] };
}

describe('useMeeting media teardown', () => {
  beforeEach(() => {
    mockClients.length = 0;
  });

  it('stops the camera and mic when the user leaves', async () => {
    const { result, tracks } = await startMeeting();
    act(() => result.current.leave());
    expect(result.current.phase).toBe('ended');
    expect(result.current.localStream).toBeNull();
    tracks.forEach((t) => expect(t.stop).toHaveBeenCalled());
  });

  it.each(['host-left', 'kicked'])(
    'stops the camera and mic when the meeting ends with %s',
    async (reason) => {
      const { result, tracks, client } = await startMeeting();
      act(() => client.emit('ended', reason));
      expect(result.current.endedReason).toBe(reason);
      expect(result.current.localStream).toBeNull();
      tracks.forEach((t) => expect(t.stop).toHaveBeenCalled());
    }
  );

  it('stops the camera and mic on unmount', async () => {
    const { unmount, tracks } = await startMeeting();
    unmount();
    tracks.forEach((t) => expect(t.stop).toHaveBeenCalled());
  });
});
