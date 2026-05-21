import { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import MeetingRoom from '../components/MeetingRoom';
import { useMeeting } from '../peer/useMeeting';
import { useIsSpeaking } from '../peer/useIsSpeaking';
import { displayMeetingCode, isValidMeetingCode } from '../util/code';
import { getStoredName, setStoredName } from '../util/storage';
import { useT } from '../i18n/useLangContext';

export default function MeetingPage() {
  const { code = '' } = useParams<{ code: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const t = useT();

  // Lock host flag at mount: subsequent URL changes shouldn't flip you
  // from host to guest mid-meeting.
  const [isHost] = useState(() => searchParams.get('host') === '1');
  const [initialName] = useState(() =>
    ((searchParams.get('name') || '').trim() || getStoredName().trim())
  );

  const [confirmedName, setConfirmedName] = useState(initialName);
  const [nameDraft, setNameDraft] = useState(initialName);

  const normalizedCode = code.trim().toLowerCase();
  const validCode = isValidMeetingCode(normalizedCode);

  if (!validCode) {
    return (
      <CenteredCard>
        <Typography variant="h6" gutterBottom>
          {t.meeting_invalid_code}
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          {t.meeting_back_home}
        </Button>
      </CenteredCard>
    );
  }

  if (!confirmedName) {
    return (
      <CenteredCard>
        <Typography variant="h6" gutterBottom>
          {t.meeting_join_title} <code style={{ letterSpacing: 2 }}>{displayMeetingCode(normalizedCode)}</code>
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.7, mb: 3 }}>
          {t.meeting_enter_name}
        </Typography>
        <Stack spacing={2}>
          <Box
            component="input"
            value={nameDraft}
            onChange={(e: any) => setNameDraft(e.target.value)}
            placeholder={t.meeting_your_name}
            sx={{
              p: 1.5,
              fontSize: 16,
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'transparent',
              color: 'inherit',
              outline: 'none',
              '&:focus': { borderColor: 'primary.main' },
            }}
            autoFocus
          />
          <Button
            variant="contained"
            disabled={!nameDraft.trim()}
            onClick={() => {
              const n = nameDraft.trim();
              if (!n) return;
              setStoredName(n);
              setConfirmedName(n);
            }}
            sx={{ textTransform: 'none' }}
          >
            {t.meeting_join}
          </Button>
        </Stack>
      </CenteredCard>
    );
  }

  return (
    <LiveMeeting code={normalizedCode} name={confirmedName} isHost={isHost} />
  );
}

function LiveMeeting({
  code,
  name,
  isHost,
}: {
  code: string;
  name: string;
  isHost: boolean;
}) {
  const navigate = useNavigate();
  const t = useT();
  const meeting = useMeeting({ code, name, isHost });
  const isSpeaking = useIsSpeaking(meeting.localStream, meeting.audioEnabled);

  if (meeting.phase === 'preparing' || meeting.phase === 'joining') {
    return (
      <CenteredCard>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={28} />
          <Typography variant="body1">
            {meeting.phase === 'preparing'
              ? t.meeting_preparing
              : isHost
              ? t.meeting_starting
              : t.meeting_joining}
          </Typography>
        </Stack>
      </CenteredCard>
    );
  }

  if (meeting.phase === 'error') {
    return (
      <CenteredCard>
        <Typography variant="h6" gutterBottom>
          {t.meeting_error_title}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.7, mb: 3 }}>
          {meeting.errorMessage}
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          {t.meeting_back_home}
        </Button>
      </CenteredCard>
    );
  }

  if (meeting.phase === 'ended') {
    return (
      <CenteredCard>
        <Typography variant="h6" gutterBottom>
          {meeting.endedReason === 'host-left'
            ? t.meeting_ended_host
            : meeting.endedReason === 'kicked'
            ? t.meeting_ended_kicked
            : t.meeting_ended_self}
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          {t.meeting_back_home}
        </Button>
      </CenteredCard>
    );
  }

  return (
    <MeetingRoom
      code={code}
      isHost={isHost}
      selfId={meeting.selfId}
      members={meeting.members}
      timeline={meeting.timeline}
      localStream={meeting.localStream}
      remoteStreams={meeting.remoteStreams}
      audioEnabled={meeting.audioEnabled}
      videoEnabled={meeting.videoEnabled}
      isSpeaking={isSpeaking}
      autoShareWhenAlone
      onToggleAudio={meeting.toggleAudio}
      onToggleVideo={meeting.toggleVideo}
      onSendChat={meeting.sendChat}
      onKick={meeting.kick}
      onLeave={() => {
        meeting.leave();
        navigate('/');
      }}
    />
  );
}

function CenteredCard({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        minHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Box
        sx={{
          maxWidth: 420,
          width: '100%',
          p: 4,
          borderRadius: 3,
          bgcolor: 'background.paper',
          textAlign: 'center',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
