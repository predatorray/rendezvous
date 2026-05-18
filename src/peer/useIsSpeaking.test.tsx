import { act, renderHook } from '@testing-library/react';
import { useIsSpeaking } from './useIsSpeaking';

class FakeAnalyser {
  fftSize = 512;
  smoothingTimeConstant = 0.6;
  payload = new Uint8Array(512);
  getByteTimeDomainData(out: Uint8Array) {
    out.set(this.payload);
  }
  connect() {}
  disconnect() {}
}

class FakeAudioContext {
  closed = false;
  analyser = new FakeAnalyser();
  createMediaStreamSource() {
    return { connect: () => {}, disconnect: () => {} };
  }
  createAnalyser() {
    return this.analyser;
  }
  close() {
    this.closed = true;
    return Promise.resolve();
  }
}

function makeStreamWithAudio(): MediaStream {
  return {
    getAudioTracks: () => [{} as MediaStreamTrack],
  } as unknown as MediaStream;
}

function makeStreamWithoutAudio(): MediaStream {
  return {
    getAudioTracks: () => [],
  } as unknown as MediaStream;
}

describe('useIsSpeaking', () => {
  let rafCb: FrameRequestCallback | null = null;
  let ctxInstance: FakeAudioContext | null = null;

  beforeEach(() => {
    rafCb = null;
    ctxInstance = null;
    (window as any).AudioContext = jest.fn(() => {
      ctxInstance = new FakeAudioContext();
      return ctxInstance;
    });
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCb = cb;
      return 1;
    });
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    jest.spyOn(performance, 'now').mockReturnValue(0);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns false when there is no stream', () => {
    const { result } = renderHook(() =>
      useIsSpeaking(null, true)
    );
    expect(result.current).toBe(false);
  });

  it('returns false when not enabled', () => {
    const { result } = renderHook(() =>
      useIsSpeaking(makeStreamWithAudio(), false)
    );
    expect(result.current).toBe(false);
  });

  it('returns false when there is no audio track', () => {
    const { result } = renderHook(() =>
      useIsSpeaking(makeStreamWithoutAudio(), true)
    );
    expect(result.current).toBe(false);
  });

  it('sets up an AudioContext + analyser and schedules an animation frame', () => {
    renderHook(() =>
      useIsSpeaking(makeStreamWithAudio(), true, { threshold: 0.04, holdMs: 250 })
    );
    expect(ctxInstance).not.toBeNull();
    expect(typeof rafCb).toBe('function');
  });

  it('cleans up the audio context on unmount', () => {
    const { unmount } = renderHook(() =>
      useIsSpeaking(makeStreamWithAudio(), true)
    );
    expect(ctxInstance).not.toBeNull();
    unmount();
    expect(ctxInstance!.closed).toBe(true);
  });
});
