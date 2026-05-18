import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import IosShareIcon from '@mui/icons-material/IosShare';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import VideoGrid from '../components/VideoGrid';
import ChatDrawer from '../components/ChatDrawer';
import Controls from '../components/Controls';
import ShareDialog from '../components/ShareDialog';
import { useMeeting } from '../peer/useMeeting';
import { isValidMeetingCode } from '../util/code';
import { getStoredName, setStoredName } from '../util/storage';

export default function MeetingPage() {
  const { code = '' } = useParams<{ code: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

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
          Invalid meeting code
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          Back to home
        </Button>
      </CenteredCard>
    );
  }

  if (!confirmedName) {
    return (
      <CenteredCard>
        <Typography variant="h6" gutterBottom>
          Join meeting <code style={{ letterSpacing: 2 }}>{normalizedCode}</code>
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.7, mb: 3 }}>
          Please enter your name to continue.
        </Typography>
        <Stack spacing={2}>
          <Box
            component="input"
            value={nameDraft}
            onChange={(e: any) => setNameDraft(e.target.value)}
            placeholder="Your name"
            sx={{
              p: 1.5,
              fontSize: 16,
              borderRadius: 1,
              border: '1px solid rgba(255,255,255,0.2)',
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
            Join
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
  const meeting = useMeeting({ code, name, isHost });

  const [chatOpen, setChatOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [unread, setUnread] = useState(0);

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
              ? 'Preparing your camera and microphone…'
              : isHost
              ? 'Starting meeting…'
              : 'Joining meeting…'}
          </Typography>
        </Stack>
      </CenteredCard>
    );
  }

  if (meeting.phase === 'error') {
    return (
      <CenteredCard>
        <Typography variant="h6" gutterBottom>
          Couldn’t join the meeting
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.7, mb: 3 }}>
          {meeting.errorMessage}
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          Back to home
        </Button>
      </CenteredCard>
    );
  }

  if (meeting.phase === 'ended') {
    return (
      <CenteredCard>
        <Typography variant="h6" gutterBottom>
          {meeting.endedReason === 'host-left'
            ? 'The host ended the meeting'
            : 'You left the meeting'}
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          Back to home
        </Button>
      </CenteredCard>
    );
  }

  const drawerWidth = 340;

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
            mr: chatOpen ? `${drawerWidth}px` : 0,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              px: 2,
              py: 1,
              bgcolor: '#111',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Rendezvous
            </Typography>
            <Typography
              variant="caption"
              sx={{
                opacity: 0.7,
                fontFamily: 'ui-monospace, Menlo, monospace',
                letterSpacing: 1.5,
              }}
            >
              {code}
            </Typography>
            <IconButton
              size="small"
              onClick={() => setShareOpen(true)}
              aria-label="Share invite"
              sx={{ ml: 'auto' }}
            >
              <IosShareIcon fontSize="small" />
            </IconButton>
            <Typography variant="caption" sx={{ opacity: 0.6 }}>
              {meeting.members.length}{' '}
              {meeting.members.length === 1 ? 'person' : 'people'}
            </Typography>
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
            onLeave={meeting.leave}
            unreadCount={unread}
          />
        </Box>

        <ChatDrawer
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          timeline={meeting.timeline}
          onSend={meeting.sendChat}
          selfId={meeting.selfId}
          width={drawerWidth}
        />
      </Box>

      <ShareDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        code={code}
      />
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
