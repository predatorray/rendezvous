import { useEffect, useRef } from 'react';
import { Avatar, Box, Stack, Typography } from '@mui/material';
import MicOffIcon from '@mui/icons-material/MicOff';
import StarIcon from '@mui/icons-material/Star';
import { Member } from '../types';

interface Props {
  member: Member;
  stream: MediaStream | null;
  isSelf: boolean;
  compact?: boolean;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Stable pastel-ish color from name.
function colorOf(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  const hue = hash % 360;
  return `hsl(${hue}, 40%, 35%)`;
}

export default function VideoTile({ member, stream, isSelf, compact }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (stream && member.video) {
      if (el.srcObject !== stream) el.srcObject = stream;
    } else {
      el.srcObject = null;
    }
  }, [stream, member.video]);

  const showVideo = member.video && !!stream;

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        bgcolor: '#0d0d0d',
        borderRadius: compact ? 0 : 2,
        overflow: 'hidden',
        boxShadow: compact ? 'none' : '0 0 0 1px rgba(255,255,255,0.06)',
      }}
    >
      {showVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isSelf}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: isSelf ? 'scaleX(-1)' : undefined,
          }}
        />
      ) : (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: colorOf(member.name),
          }}
        >
          <Avatar
            sx={{
              width: compact
                ? { xs: 32, sm: 40 }
                : { xs: 56, sm: 72, md: 80 },
              height: compact
                ? { xs: 32, sm: 40 }
                : { xs: 56, sm: 72, md: 80 },
              bgcolor: 'rgba(255,255,255,0.12)',
              fontSize: compact
                ? { xs: 14, sm: 16 }
                : { xs: 20, sm: 28, md: 32 },
              fontWeight: 500,
            }}
          >
            {initialsOf(member.name)}
          </Avatar>
        </Box>
      )}

      {!compact && (
        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
          sx={{
            position: 'absolute',
            left: { xs: 4, sm: 8 },
            bottom: { xs: 4, sm: 8 },
            maxWidth: 'calc(100% - 16px)',
            px: { xs: 0.75, sm: 1 },
            py: 0.25,
            bgcolor: 'rgba(0,0,0,0.55)',
            borderRadius: 1,
          }}
        >
          {member.isHost && (
            <StarIcon
              sx={{ fontSize: { xs: 12, sm: 14 }, color: '#FFD24C' }}
              titleAccess="Host"
            />
          )}
          <Typography
            variant="caption"
            noWrap
            sx={{
              color: '#fff',
              fontWeight: 500,
              fontSize: { xs: 11, sm: 12 },
            }}
          >
            {member.name}
            {isSelf ? ' (you)' : ''}
          </Typography>
        </Stack>
      )}

      {!member.audio && (
        <Box
          sx={{
            position: 'absolute',
            right: compact ? 4 : { xs: 4, sm: 8 },
            bottom: compact ? 4 : { xs: 4, sm: 8 },
            width: compact ? 18 : { xs: 22, sm: 28 },
            height: compact ? 18 : { xs: 22, sm: 28 },
            borderRadius: '50%',
            bgcolor: 'rgba(220,38,38,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MicOffIcon
            sx={{ fontSize: compact ? 12 : { xs: 13, sm: 16 }, color: '#fff' }}
          />
        </Box>
      )}
    </Box>
  );
}
