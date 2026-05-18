import { useEffect, useState } from 'react';

interface Options {
  threshold?: number;
  holdMs?: number;
}

export function useIsSpeaking(
  stream: MediaStream | null,
  enabled: boolean,
  { threshold = 0.04, holdMs = 250 }: Options = {}
): boolean {
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (!stream || !enabled) {
      setSpeaking(false);
      return;
    }
    const audioTrack = stream.getAudioTracks()[0];
    if (!audioTrack) {
      setSpeaking(false);
      return;
    }

    const AudioCtx =
      window.AudioContext ||
      (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx: AudioContext = new AudioCtx();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.6;
    source.connect(analyser);

    const data = new Uint8Array(analyser.fftSize);
    let raf = 0;
    let lastAbove = 0;
    let current = false;

    const tick = () => {
      analyser.getByteTimeDomainData(data);
      let sumSq = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sumSq += v * v;
      }
      const rms = Math.sqrt(sumSq / data.length);
      const now = performance.now();
      if (rms > threshold) lastAbove = now;
      const next = now - lastAbove < holdMs;
      if (next !== current) {
        current = next;
        setSpeaking(next);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      try {
        source.disconnect();
      } catch {}
      try {
        analyser.disconnect();
      } catch {}
      ctx.close().catch(() => {});
      setSpeaking(false);
    };
  }, [stream, enabled, threshold, holdMs]);

  return speaking;
}
