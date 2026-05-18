import { Box, IconButton, keyframes, Stack, Tooltip, useTheme } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import ChatIcon from '@mui/icons-material/Chat';
import IosShareIcon from '@mui/icons-material/IosShare';
import CallEndIcon from '@mui/icons-material/CallEnd';
import { useT } from '../i18n/useLangContext';

interface Props {
  audioEnabled: boolean;
  videoEnabled: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleChat: () => void;
  onShare: () => void;
  onLeave: () => void;
  unreadCount: number;
  isSpeaking?: boolean;
}

const speakingPulse = keyframes`
  0%   { transform: scale(1);    box-shadow: 0 0 0 0   rgba(45,140,255,0.55); }
  50%  { transform: scale(1.12); box-shadow: 0 0 0 10px rgba(45,140,255,0);   }
  100% { transform: scale(1);    box-shadow: 0 0 0 0   rgba(45,140,255,0);   }
`;

function PillButton({
  label,
  active,
  onClick,
  children,
  danger,
  pulsing,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  danger?: boolean;
  pulsing?: boolean;
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const neutralBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const neutralHover = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)';
  return (
    <Tooltip title={label} arrow>
      <IconButton
        onClick={onClick}
        aria-label={label}
        sx={{
          width: { xs: 40, sm: 48 },
          height: { xs: 40, sm: 48 },
          bgcolor: danger
            ? '#dc2626'
            : active
            ? neutralBg
            : 'rgba(220,38,38,0.85)',
          color: danger || !active ? '#fff' : 'text.primary',
          transition: 'transform 120ms ease, box-shadow 120ms ease',
          ...(pulsing && {
            animation: `${speakingPulse} 1.1s ease-out infinite`,
            bgcolor: 'rgba(45,140,255,0.18)',
            color: '#2D8CFF',
          }),
          '&:hover': {
            bgcolor: danger
              ? '#b91c1c'
              : active
              ? neutralHover
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
  isSpeaking,
}: Props) {
  const t = useT();
  return (
    <Box
      sx={{
        py: { xs: 1, sm: 1.5 },
        px: { xs: 1, sm: 2 },
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Stack
        direction="row"
        spacing={{ xs: 0.75, sm: 1.5 }}
        alignItems="center"
      >
        <PillButton
          label={audioEnabled ? t.controls_mute : t.controls_unmute}
          active={audioEnabled}
          onClick={onToggleAudio}
          pulsing={audioEnabled && isSpeaking}
        >
          {audioEnabled ? <MicIcon /> : <MicOffIcon />}
        </PillButton>
        <PillButton
          label={videoEnabled ? t.controls_stop_video : t.controls_start_video}
          active={videoEnabled}
          onClick={onToggleVideo}
        >
          {videoEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
        </PillButton>
        <PillButton label={t.controls_chat} active={true} onClick={onToggleChat}>
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
        <PillButton label={t.controls_share} active={true} onClick={onShare}>
          <IosShareIcon />
        </PillButton>
        <Box sx={{ width: { xs: 4, sm: 12 } }} />
        <PillButton label={t.controls_leave} active={true} onClick={onLeave} danger>
          <CallEndIcon />
        </PillButton>
      </Stack>
    </Box>
  );
}
