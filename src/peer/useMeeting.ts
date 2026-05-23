import { useCallback, useEffect, useRef, useState } from 'react';
import { MeetingClient, VerificationConfig } from './MeetingClient';
import { Member, TimelineItem } from '../types';
import { useT } from '../i18n/useLangContext';
import { Translations } from '../i18n/translations.type';

interface UseMeetingArgs {
  code: string;
  name: string;
  isHost: boolean;
  verification?: VerificationConfig;
}

export type MeetingPhase =
  | 'preparing'
  | 'joining'
  | 'waiting'
  | 'verifying'
  | 'live'
  | 'ended'
  | 'error';

// Verification failure codes emitted by MeetingClient, mapped to copy here so
// the client layer stays i18n-free.
function mapErrorDetail(detail: string | undefined, t: Translations): string {
  switch (detail) {
    case 'verify-timeout':
      return t.verify_error_timeout;
    case 'verify-unavailable':
      return t.verify_error_unavailable;
    case 'verify-failed':
      return t.verify_error_failed;
    default:
      return detail ?? t.meeting_error_default;
  }
}

export interface UseMeetingState {
  phase: MeetingPhase;
  errorMessage: string | null;
  endedReason: 'host-left' | 'self-left' | 'kicked' | null;
  selfId: string;
  members: Member[];
  timeline: TimelineItem[];
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  audioEnabled: boolean;
  videoEnabled: boolean;
  // Verified meeting: the confirmed host fingerprint once verification passes.
  verifiedFingerprint: string | null;
  sendChat: (text: string) => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  leave: () => void;
  kick: (peerId: string) => void;
}

async function tryGetUserMedia(): Promise<MediaStream | null> {
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
  } catch (e) {
    // Try audio only.
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
      });
    } catch {
      return null;
    }
  }
}

export function useMeeting({
  code,
  name,
  isHost,
  verification,
}: UseMeetingArgs): UseMeetingState {
  const t = useT();
  const [phase, setPhase] = useState<MeetingPhase>('preparing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [endedReason, setEndedReason] = useState<
    'host-left' | 'self-left' | 'kicked' | null
  >(null);
  const [selfId, setSelfId] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(
    new Map()
  );
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [verifiedFingerprint, setVerifiedFingerprint] = useState<string | null>(
    null
  );

  const clientRef = useRef<MeetingClient | null>(null);
  const startedRef = useRef(false);
  // Verified guests don't go "live" until the host's identity checks out, so
  // their phase is driven by events rather than start() resolving.
  const verifiedGuest = verification?.role === 'guest';

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    let cancelled = false;
    const client = new MeetingClient({ code, name, isHost, verification });
    clientRef.current = client;

    const unsubs: Array<() => void> = [];

    unsubs.push(client.on('ready', (id) => setSelfId(id)));
    unsubs.push(
      client.on('waiting', () => {
        if (!cancelled) setPhase('waiting');
      })
    );
    unsubs.push(
      client.on('verifying', () => {
        if (!cancelled) setPhase('verifying');
      })
    );
    unsubs.push(
      client.on('verified', (fingerprint) => {
        if (cancelled) return;
        setVerifiedFingerprint(fingerprint);
        setPhase('live');
      })
    );
    unsubs.push(
      client.on('members', (m) => {
        setMembers(m);
        // Prune remote streams for vanished peers.
        setRemoteStreams((prev) => {
          const ids = new Set(m.map((x) => x.id));
          let changed = false;
          const next = new Map<string, MediaStream>();
          prev.forEach((stream, peerId) => {
            if (ids.has(peerId)) next.set(peerId, stream);
            else changed = true;
          });
          return changed ? next : prev;
        });
      })
    );
    unsubs.push(client.on('timeline', (item) => {
      setTimeline((prev) => [...prev, item]);
    }));
    unsubs.push(client.on('history', (items) => {
      setTimeline(items);
    }));
    unsubs.push(
      client.on('remoteStream', (peerId, stream) => {
        setRemoteStreams((prev) => {
          const next = new Map(prev);
          next.set(peerId, stream);
          return next;
        });
      })
    );
    unsubs.push(
      client.on('remoteStreamRemoved', (peerId) => {
        setRemoteStreams((prev) => {
          if (!prev.has(peerId)) return prev;
          const next = new Map(prev);
          next.delete(peerId);
          return next;
        });
      })
    );
    unsubs.push(
      client.on('ended', (reason, detail) => {
        if (reason === 'error') {
          setErrorMessage(mapErrorDetail(detail, t));
          setPhase('error');
        } else {
          setEndedReason(reason);
          setPhase('ended');
        }
      })
    );

    (async () => {
      const stream = await tryGetUserMedia();
      if (cancelled) {
        stream?.getTracks().forEach((t) => t.stop());
        return;
      }
      setLocalStream(stream);
      const initialAudio = stream?.getAudioTracks()[0]?.enabled ?? false;
      const initialVideo = stream?.getVideoTracks()[0]?.enabled ?? false;
      setAudioEnabled(initialAudio);
      setVideoEnabled(initialVideo);
      setPhase('joining');
      try {
        await client.start(stream);
        // Verified guests stay in 'joining' until a waiting/verifying/verified
        // event moves them; everyone else goes live as soon as start resolves.
        if (!cancelled && !verifiedGuest) setPhase('live');
      } catch (e: any) {
        if (cancelled) return;
        console.error('Meeting start failed', e);
        const detail =
          e?.type === 'unavailable-id'
            ? t.meeting_error_unavailable_id
            : e?.type === 'peer-unavailable'
            ? t.meeting_error_peer_unavailable
            : e?.message ?? t.meeting_error_start;
        setErrorMessage(detail);
        setPhase('error');
      }
    })();

    return () => {
      cancelled = true;
      unsubs.forEach((u) => u());
      try {
        client.leave();
      } catch {}
      localStream?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendChat = useCallback((text: string) => {
    clientRef.current?.sendChat(text);
  }, []);

  const toggleAudio = useCallback(() => {
    setAudioEnabled((prev) => {
      const next = !prev;
      clientRef.current?.setAudioEnabled(next);
      return next;
    });
  }, []);

  const toggleVideo = useCallback(() => {
    setVideoEnabled((prev) => {
      const next = !prev;
      clientRef.current?.setVideoEnabled(next);
      return next;
    });
  }, []);

  const leave = useCallback(() => {
    clientRef.current?.leave();
  }, []);

  const kick = useCallback((peerId: string) => {
    clientRef.current?.kick(peerId);
  }, []);

  return {
    phase,
    errorMessage,
    endedReason,
    selfId,
    members,
    timeline,
    localStream,
    remoteStreams,
    audioEnabled,
    videoEnabled,
    verifiedFingerprint,
    sendChat,
    toggleAudio,
    toggleVideo,
    leave,
    kick,
  };
}
