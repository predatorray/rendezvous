export interface Member {
  id: string;
  name: string;
  audio: boolean;
  video: boolean;
  isHost: boolean;
  // Demo-only: a still image used in place of a live video stream so the
  // shared meeting UI can be rendered without WebRTC. Ignored in real meetings.
  imageSrc?: string;
}

export interface ChatMessage {
  id: string;
  fromId: string;
  fromName: string;
  text: string;
  ts: number;
}

export type SystemEvent =
  | { kind: 'joined'; name: string }
  | { kind: 'left'; name: string };

export interface SystemMessage {
  id: string;
  text: string;
  ts: number;
  system: true;
  event?: SystemEvent;
}

export type TimelineItem = ChatMessage | SystemMessage;

export function isSystem(item: TimelineItem): item is SystemMessage {
  return (item as SystemMessage).system === true;
}

// ----- Wire protocol (carried over PeerJS DataConnections) -----

export type WireMessage =
  | { type: 'hello'; name: string }
  | {
      type: 'welcome';
      selfId: string;
      hostId: string;
      members: Member[];
      timeline: TimelineItem[];
    }
  | { type: 'roster'; members: Member[] }
  | { type: 'chat-send'; text: string } // client -> host
  | { type: 'timeline'; item: TimelineItem } // host -> all
  | { type: 'state'; audio: boolean; video: boolean } // client -> host
  | { type: 'kick'; peerId: string } // host -> victim
  | { type: 'end' };
