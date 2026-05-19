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
  const selfPipRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [selfPos, setSelfPos] = useState<{ left: number; top: number } | null>(
    null
  );
  const draggedRef = useRef(false);

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

  // Keep the dragged PiP inside the container when the container resizes.
  useEffect(() => {
    if (!selfPos) return;
    const cont = containerRef.current;
    const pip = selfPipRef.current;
    if (!cont || !pip) return;
    const cw = cont.clientWidth;
    const ch = cont.clientHeight;
    const pw = pip.offsetWidth;
    const ph = pip.offsetHeight;
    const left = Math.min(Math.max(0, selfPos.left), Math.max(0, cw - pw));
    const top = Math.min(Math.max(0, selfPos.top), Math.max(0, ch - ph));
    if (left !== selfPos.left || top !== selfPos.top) {
      setSelfPos({ left, top });
    }
  }, [size, selfPos]);

  const onSelfPipPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const cont = containerRef.current;
    const pip = selfPipRef.current;
    if (!cont || !pip) return;
    e.preventDefault();
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);
    draggedRef.current = false;
    const contRect = cont.getBoundingClientRect();
    const pipRect = pip.getBoundingClientRect();
    const offsetX = e.clientX - pipRect.left;
    const offsetY = e.clientY - pipRect.top;
    const startX = e.clientX;
    const startY = e.clientY;
    const onMove = (ev: PointerEvent) => {
      if (
        !draggedRef.current &&
        Math.hypot(ev.clientX - startX, ev.clientY - startY) < 3
      ) {
        return;
      }
      draggedRef.current = true;
      const cw = cont.clientWidth;
      const ch = cont.clientHeight;
      const pw = pip.offsetWidth;
      const ph = pip.offsetHeight;
      const left = Math.min(
        Math.max(0, ev.clientX - contRect.left - offsetX),
        Math.max(0, cw - pw)
      );
      const top = Math.min(
        Math.max(0, ev.clientY - contRect.top - offsetY),
        Math.max(0, ch - ph)
      );
      setSelfPos({ left, top });
    };
    const onUp = (ev: PointerEvent) => {
      try {
        target.releasePointerCapture(ev.pointerId);
      } catch {}
      target.removeEventListener('pointermove', onMove);
      target.removeEventListener('pointerup', onUp);
      target.removeEventListener('pointercancel', onUp);
    };
    target.addEventListener('pointermove', onMove);
    target.addEventListener('pointerup', onUp);
    target.addEventListener('pointercancel', onUp);
  };

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
          ref={selfPipRef}
          onPointerDown={onSelfPipPointerDown}
          sx={{
            position: 'absolute',
            ...(selfPos
              ? { left: `${selfPos.left}px`, top: `${selfPos.top}px` }
              : {
                  right: { xs: 8, sm: 16 },
                  bottom: { xs: 8, sm: 16 },
                }),
            width: { xs: '28vw', sm: 180, md: 220 },
            maxWidth: 240,
            minWidth: 96,
            aspectRatio: '16 / 9',
            zIndex: 5,
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 6px 20px rgba(0,0,0,0.55)',
            outline: '1px solid rgba(255,255,255,0.18)',
            cursor: 'grab',
            touchAction: 'none',
            userSelect: 'none',
            '&:active': { cursor: 'grabbing' },
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
