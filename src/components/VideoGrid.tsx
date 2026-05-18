import { Box } from '@mui/material';
import { Member } from '../types';
import VideoTile from './VideoTile';

interface Props {
  members: Member[];
  selfId: string;
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
}

// Decide a column count from the participant count so each tile stays
// roughly the same aspect ratio without external libraries.
function columnsFor(count: number): number {
  if (count <= 1) return 1;
  if (count <= 4) return 2;
  if (count <= 9) return 3;
  if (count <= 16) return 4;
  return 5;
}

export default function VideoGrid({
  members,
  selfId,
  localStream,
  remoteStreams,
}: Props) {
  const cols = columnsFor(members.length);
  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: 'grid',
        gap: 1,
        p: 1,
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridAutoRows: '1fr',
      }}
    >
      {members.map((m) => {
        const isSelf = m.id === selfId;
        const stream = isSelf ? localStream : remoteStreams.get(m.id) ?? null;
        return (
          <VideoTile
            key={m.id}
            member={m}
            stream={stream}
            isSelf={isSelf}
          />
        );
      })}
    </Box>
  );
}
