import { Box, IconButton, Stack, Tooltip } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import ChatIcon from '@mui/icons-material/Chat';
import IosShareIcon from '@mui/icons-material/IosShare';
import CallEndIcon from '@mui/icons-material/CallEnd';

interface Props {
  audioEnabled: boolean;
  videoEnabled: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleChat: () => void;
  onShare: () => void;
  onLeave: () => void;
  unreadCount: number;
}

function PillButton({
  label,
  active,
  onClick,
  children,
  danger,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <Tooltip title={label} arrow>
      <IconButton
        onClick={onClick}
        aria-label={label}
        sx={{
          width: 48,
          height: 48,
          bgcolor: danger
            ? '#dc2626'
            : active
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(220,38,38,0.85)',
          color: '#fff',
          '&:hover': {
            bgcolor: danger
              ? '#b91c1c'
              : active
              ? 'rgba(255,255,255,0.15)'
              : 'rgba(220,38,38,1)',
          },
        }}
      >
        {children}
      </IconButton>
    </Tooltip>
  );
}

export default function Controls({
  audioEnabled,
  videoEnabled,
  onToggleAudio,
  onToggleVideo,
  onToggleChat,
  onShare,
  onLeave,
  unreadCount,
}: Props) {
  return (
    <Box
      sx={{
        py: 1.5,
        px: 2,
        bgcolor: '#111',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <PillButton
          label={audioEnabled ? 'Mute' : 'Unmute'}
          active={audioEnabled}
          onClick={onToggleAudio}
        >
          {audioEnabled ? <MicIcon /> : <MicOffIcon />}
        </PillButton>
        <PillButton
          label={videoEnabled ? 'Stop video' : 'Start video'}
          active={videoEnabled}
          onClick={onToggleVideo}
        >
          {videoEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
        </PillButton>
        <PillButton label="Chat" active={true} onClick={onToggleChat}>
          <Box sx={{ position: 'relative' }}>
            <ChatIcon />
            {unreadCount > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: -6,
                  right: -8,
                  minWidth: 16,
                  height: 16,
                  borderRadius: 8,
                  bgcolor: '#2D8CFF',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  px: 0.5,
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Box>
            )}
          </Box>
        </PillButton>
        <PillButton label="Share invite" active={true} onClick={onShare}>
          <IosShareIcon />
        </PillButton>
        <Box sx={{ width: 12 }} />
        <PillButton label="Leave" active={true} onClick={onLeave} danger>
          <CallEndIcon />
        </PillButton>
      </Stack>
    </Box>
  );
}
