import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import IosShareIcon from '@mui/icons-material/IosShare';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import VideoGrid from '../components/VideoGrid';
import ChatDrawer from '../components/ChatDrawer';
import Controls from '../components/Controls';
import ShareDialog from '../components/ShareDialog';
import ThemeToggle from '../components/ThemeToggle';
import { useMeeting } from '../peer/useMeeting';
import { useIsSpeaking } from '../peer/useIsSpeaking';
import { isValidMeetingCode } from '../util/code';
import { getStoredName, setStoredName } from '../util/storage';
import { useT } from '../i18n/useLangContext';
import LanguageMenu from '../i18n/LanguageMenu';

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
          {t.meeting_join_title} <code style={{ letterSpacing: 2 }}>{normalizedCode}</code>
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [chatOpen, setChatOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  const confirmLeave = () => {
    setLeaveOpen(false);
    meeting.leave();
    navigate('/');
  };

  // Auto-open share dialog the first time the host enters a fresh meeting.
  const sharedOnceRef = useRef(false);
  useEffect(() => {
    if (
      isHost &&
      meeting.phase === 'live' &&
      !sharedOnceRef.current &&
      meeting.members.length <= 1
    ) {
      sharedOnceRef.current = true;
      setShareOpen(true);
    }
  }, [isHost, meeting.phase, meeting.members.length]);

  // Track unread messages while chat is closed.
  const lastSeenLenRef = useRef(meeting.timeline.length);
  useEffect(() => {
    if (chatOpen) {
      lastSeenLenRef.current = meeting.timeline.length;
      setUnread(0);
    } else {
      const delta = meeting.timeline.length - lastSeenLenRef.current;
      // Only count real chat messages, not system events.
      const newOnes = meeting.timeline
        .slice(lastSeenLenRef.current)
        .filter((t: any) => !t.system).length;
      if (delta > 0) setUnread((u) => u + newOnes);
      lastSeenLenRef.current = meeting.timeline.length;
    }
  }, [meeting.timeline, chatOpen]);

  const sortedMembers = useMemo(() => {
    // Host first, then by name, with self pinned right after host.
    return [...meeting.members].sort((a, b) => {
      if (a.isHost && !b.isHost) return -1;
      if (!a.isHost && b.isHost) return 1;
      if (a.id === meeting.selfId && b.id !== meeting.selfId) return -1;
      if (b.id === meeting.selfId && a.id !== meeting.selfId) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [meeting.members, meeting.selfId]);

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
            : t.meeting_ended_self}
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          {t.meeting_back_home}
        </Button>
      </CenteredCard>
    );
  }

  const drawerWidth = isMobile ? Math.min(window.innerWidth, 360) : 340;
  // On mobile, overlay the drawer instead of squeezing the video grid.
  const pushContent = chatOpen && !isMobile;

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#000',
      }}
    >
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
        }}
      >
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            transition: 'margin-right .2s',
            mr: pushContent ? `${drawerWidth}px` : 0,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            sx={{
              px: { xs: 1, sm: 2 },
              py: { xs: 0.75, sm: 1 },
              bgcolor: 'background.paper',
              borderBottom: '1px solid',
              borderColor: 'divider',
              minHeight: 44,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography
                variant="subtitle2"
                noWrap
                sx={{
                  fontWeight: 600,
                  display: { xs: 'none', sm: 'inline' },
                }}
              >
                Rendezvous
              </Typography>
              <Typography
                variant="caption"
                noWrap
                sx={{
                  opacity: 0.7,
                  fontFamily: 'ui-monospace, Menlo, monospace',
                  letterSpacing: 1.5,
                }}
              >
                {code}
              </Typography>
            </Stack>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ ml: 'auto' }}
            >
              <LanguageMenu variant="icon" />
              <ThemeToggle />
              <IconButton
                size="small"
                onClick={() => setShareOpen(true)}
                aria-label={t.meeting_share_invite_aria}
              >
                <IosShareIcon fontSize="small" />
              </IconButton>
              <Typography
                variant="caption"
                noWrap
                sx={{ opacity: 0.6 }}
              >
                {meeting.members.length}{' '}
                {meeting.members.length === 1 ? t.meeting_person : t.meeting_people}
              </Typography>
            </Stack>
          </Stack>
          <VideoGrid
            members={sortedMembers}
            selfId={meeting.selfId}
            localStream={meeting.localStream}
            remoteStreams={meeting.remoteStreams}
          />
          <Controls
            audioEnabled={meeting.audioEnabled}
            videoEnabled={meeting.videoEnabled}
            onToggleAudio={meeting.toggleAudio}
            onToggleVideo={meeting.toggleVideo}
            onToggleChat={() => setChatOpen((v) => !v)}
            onShare={() => setShareOpen(true)}
            onLeave={() => setLeaveOpen(true)}
            unreadCount={unread}
            isSpeaking={isSpeaking}
          />
        </Box>

        <ChatDrawer
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          timeline={meeting.timeline}
          onSend={meeting.sendChat}
          selfId={meeting.selfId}
          width={drawerWidth}
          variant={isMobile ? 'temporary' : 'persistent'}
        />
      </Box>

      <ShareDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        code={code}
      />

      <Dialog open={leaveOpen} onClose={() => setLeaveOpen(false)}>
        <DialogTitle>
          {isHost ? t.meeting_end_for_everyone : t.meeting_leave_title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {isHost ? t.meeting_end_for_everyone_body : t.meeting_leave_body}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLeaveOpen(false)}>{t.meeting_cancel}</Button>
          <Button onClick={confirmLeave} color="error" variant="contained" autoFocus>
            {isHost ? t.meeting_end : t.meeting_leave}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
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
