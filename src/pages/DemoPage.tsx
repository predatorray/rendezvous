import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MeetingRoom from '../components/MeetingRoom';
import { Member, TimelineItem } from '../types';
import { newMessageId } from '../util/code';

// A fixed meeting code so the share dialog renders something sensible.
const DEMO_CODE = 'demoxy';
const SELF_ID = 'self';

// Resolve images placed in public/demo so they work under any base path.
const asset = (file: string) => `${process.env.PUBLIC_URL}/demo/${file}`;

// Static roster for a 1:1 call: the other peer fills the main video, and "you"
// (peer-1) sit in the draggable self thumbnail.
const INITIAL_MEMBERS: Member[] = [
  {
    id: 'james',
    name: 'James Wilson',
    audio: true,
    video: true,
    isHost: true,
    imageSrc: asset('peer-2.png'),
  },
  {
    id: SELF_ID,
    name: 'You',
    audio: true,
    video: true,
    isHost: false,
    imageSrc: asset('peer-1.png'),
  },
];

// Timestamps a few minutes back so the chat reads like an in-progress meeting.
const base = Date.now() - 6 * 60 * 1000;
const at = (minutes: number, seconds = 0) =>
  base + minutes * 60 * 1000 + seconds * 1000;

const INITIAL_TIMELINE: TimelineItem[] = [
  { id: newMessageId(), ts: at(0), system: true, text: 'James Wilson joined', event: { kind: 'joined', name: 'James Wilson' } },
  { id: newMessageId(), ts: at(0, 30), system: true, text: 'You joined', event: { kind: 'joined', name: 'You' } },
  {
    id: newMessageId(),
    fromId: 'james',
    fromName: 'James Wilson',
    text: 'Morning! Thanks for hopping on. 👋',
    ts: at(1),
  },
  {
    id: newMessageId(),
    fromId: SELF_ID,
    fromName: 'You',
    text: 'Hey James! Good to see you. Ready when you are.',
    ts: at(1, 40),
  },
  {
    id: newMessageId(),
    fromId: 'james',
    fromName: 'James Wilson',
    text: "Great. Let's kick off with the Q3 roadmap — I'll share my screen in a sec.",
    ts: at(2, 30),
  },
  {
    id: newMessageId(),
    fromId: SELF_ID,
    fromName: 'You',
    text: 'Sounds good. I dropped the design doc link in the shared drive earlier.',
    ts: at(3, 15),
  },
  {
    id: newMessageId(),
    fromId: 'james',
    fromName: 'James Wilson',
    text: 'Got it, opening it now. 📄',
    ts: at(4),
  },
  {
    id: newMessageId(),
    fromId: 'james',
    fromName: 'James Wilson',
    text: 'This is just a demo of the meeting UI — feel free to click around! 🎉',
    ts: at(5),
  },
];

// Static showcase of the meeting room. Reuses the exact MeetingRoom layout that
// powers a real meeting, but with mock data and no WebRTC, so the controls,
// chat, and participant panels are all interactive without a camera or peers.
export default function DemoPage() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [timeline, setTimeline] = useState<TimelineItem[]>(INITIAL_TIMELINE);

  const self = members.find((m) => m.id === SELF_ID);
  const audioEnabled = self?.audio ?? true;
  const videoEnabled = self?.video ?? false;

  const updateSelf = (patch: Partial<Member>) =>
    setMembers((prev) =>
      prev.map((m) => (m.id === SELF_ID ? { ...m, ...patch } : m))
    );

  const emptyStreams = useMemo(() => new Map<string, MediaStream>(), []);

  return (
    <MeetingRoom
      code={DEMO_CODE}
      isHost={false}
      selfId={SELF_ID}
      members={members}
      timeline={timeline}
      localStream={null}
      remoteStreams={emptyStreams}
      audioEnabled={audioEnabled}
      videoEnabled={videoEnabled}
      isSpeaking={false}
      bannerText="Demo"
      onToggleAudio={() => updateSelf({ audio: !audioEnabled })}
      onToggleVideo={() => updateSelf({ video: !videoEnabled })}
      onSendChat={(text) =>
        setTimeline((prev) => [
          ...prev,
          {
            id: newMessageId(),
            fromId: SELF_ID,
            fromName: 'You',
            text,
            ts: Date.now(),
          },
        ])
      }
      onKick={(peerId) =>
        setMembers((prev) => prev.filter((m) => m.id !== peerId))
      }
      onLeave={() => navigate('/')}
    />
  );
}
