import { useEffect, useMemo, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { Member } from '../types';
import VideoTile from './VideoTile';

interface Props {
  members: Member[];
  selfId: string;
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
}

// Pick the rows/cols layout that maximizes per-tile area while keeping each
// tile close to a 16:9 aspect. Beats a fixed columns-by-count rule because
// it adapts to container shape (portrait phones vs. wide monitors).
function bestLayout(
  n: number,
  w: number,
  h: number
): { cols: number; rows: number } {
  if (n <= 1 || w <= 0 || h <= 0) return { cols: 1, rows: Math.max(1, n) };
  const target = 16 / 9;
  let best = { cols: 1, rows: n, score: -Infinity };
  for (let cols = 1; cols <= n; cols++) {
    const rows = Math.ceil(n / cols);
    const cellW = w / cols;
    const cellH = h / rows;
    // Fit a 16:9 rect inside each cell; score by the resulting area.
    const fitW = Math.min(cellW, cellH * target);
    const fitH = fitW / target;
    const score = fitW * fitH;
    if (score > best.score) best = { cols, rows, score };
  }
  return { cols: best.cols, rows: best.rows };
}

export default function VideoGrid({
  members,
  selfId,
  localStream,
  remoteStreams,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0].contentRect;
      setSize({ w: cr.width, h: cr.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const selfMember = useMemo(
    () => members.find((m) => m.id === selfId),
    [members, selfId]
  );
  const remoteMembers = useMemo(
    () => members.filter((m) => m.id !== selfId),
    [members, selfId]
  );

  const aloneInRoom = remoteMembers.length === 0;
  const tiledMembers = aloneInRoom ? members : remoteMembers;

  const { cols, rows } = bestLayout(
    tiledMembers.length || 1,
    size.w,
    size.h
  );

  return (
    <Box
      ref={containerRef}
      sx={{
        flex: 1,
        minHeight: 0,
        position: 'relative',
        display: 'grid',
        gap: { xs: 0.5, sm: 1 },
        p: { xs: 0.5, sm: 1 },
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
      }}
    >
      {tiledMembers.map((m) => {
        const isSelf = m.id === selfId;
        const stream = isSelf ? localStream : remoteStreams.get(m.id) ?? null;
        return (
          <VideoTile key={m.id} member={m} stream={stream} isSelf={isSelf} />
        );
      })}

      {!aloneInRoom && selfMember && (
        <Box
          sx={{
            position: 'absolute',
            right: { xs: 8, sm: 16 },
            bottom: { xs: 8, sm: 16 },
            width: { xs: '28vw', sm: 180, md: 220 },
            maxWidth: 240,
            minWidth: 96,
            aspectRatio: '16 / 9',
            zIndex: 5,
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 6px 20px rgba(0,0,0,0.55)',
            outline: '1px solid rgba(255,255,255,0.18)',
          }}
        >
          <VideoTile
            member={selfMember}
            stream={localStream}
            isSelf
            compact
          />
        </Box>
      )}
    </Box>
  );
}
