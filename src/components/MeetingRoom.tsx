import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Drawer,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import IosShareIcon from '@mui/icons-material/IosShare';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import VideoGrid from './VideoGrid';
import ChatPanel from './ChatPanel';
import Controls from './Controls';
import ShareDialog from './ShareDialog';
import ParticipantsPanel from './ParticipantsPanel';
import ThemeToggle from './ThemeToggle';
import LanguageMenu from '../i18n/LanguageMenu';
import { Member, TimelineItem } from '../types';
import { displayMeetingCode } from '../util/code';
import { VerifiedKey } from '../util/verifiedMeeting';
import { displayFingerprint, fingerprintOf } from '../crypto/verify';
import { useT } from '../i18n/useLangContext';

export interface MeetingRoomProps {
  code: string;
  isHost: boolean;
  selfId: string;
  members: Member[];
  timeline: TimelineItem[];
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  audioEnabled: boolean;
  videoEnabled: boolean;
  isSpeaking: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onSendChat: (text: string) => void;
  onKick: (peerId: string) => void;
  // Invoked after the user confirms leaving (perform cleanup + navigation here).
  onLeave: () => void;
  // Optional label shown next to the meeting code (e.g. a "Demo" badge).
  bannerText?: string;
  // When true, auto-open the share dialog once if the user is the host and
  // is currently alone in the room (used to prompt fresh hosts to invite).
  autoShareWhenAlone?: boolean;
  // Verified meeting (experimental): the host identity key pinned in the URL,
  // and (guest side) the confirmed host fingerprint once verification passes.
  verifiedKey?: VerifiedKey;
  verifiedFingerprint?: string | null;
}

// Presentational meeting room. Holds only UI state (open panels, splitter,
// unread counter); all meeting data and actions are supplied by the caller so
// both the live meeting and the static demo can share this exact layout.
export default function MeetingRoom({
  code,
  isHost,
  selfId,
  members,
  timeline,
  localStream,
  remoteStreams,
  audioEnabled,
  videoEnabled,
  isSpeaking,
  onToggleAudio,
  onToggleVideo,
  onSendChat,
  onKick,
  onLeave,
  bannerText,
  autoShareWhenAlone,
  verifiedKey,
  verifiedFingerprint,
}: MeetingRoomProps) {
  const t = useT();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [chatOpen, setChatOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [identityOpen, setIdentityOpen] = useState(false);
  const [identityCopied, setIdentityCopied] = useState(false);
  const [hostFingerprint, setHostFingerprint] = useState<string | null>(null);

  // The fingerprint a guest compares against what the host shared out-of-band.
  // Derived from the key pinned in the invite URL (the same value verification
  // confirms the host actually holds).
  useEffect(() => {
    if (!verifiedKey) {
      setHostFingerprint(null);
      return;
    }
    let active = true;
    fingerprintOf(verifiedKey.publicKey).then((fp) => {
      if (active) setHostFingerprint(displayFingerprint(fp));
    });
    return () => {
      active = false;
    };
  }, [verifiedKey]);

  const copyFingerprint = async () => {
    if (!hostFingerprint) return;
    try {
      await navigator.clipboard.writeText(hostFingerprint);
    } catch {}
    setIdentityCopied(true);
    window.setTimeout(() => setIdentityCopied(false), 1500);
  };

  // Rail split: ratio of vertical space given to participants when both
  // participants and chat panels are open. Adjusted by dragging the splitter.
  const RAIL_MIN_PANEL_PX = 150;
  const [participantsRatio, setParticipantsRatio] = useState(0.5);
  const railBodyRef = useRef<HTMLDivElement>(null);
  const onSplitterPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);
    const onMove = (ev: PointerEvent) => {
      const el = railBodyRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.height <= 0) return;
      const y = ev.clientY - rect.top;
      const minRatio = Math.min(0.4, RAIL_MIN_PANEL_PX / rect.height);
      const maxRatio = 1 - minRatio;
      const r = Math.min(Math.max(y / rect.height, minRatio), maxRatio);
      setParticipantsRatio(r);
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

  const confirmLeave = () => {
    setLeaveOpen(false);
    onLeave();
  };

  // Auto-open share dialog the first time a host enters a fresh, empty meeting.
  const sharedOnceRef = useRef(false);
  useEffect(() => {
    if (
      autoShareWhenAlone &&
      isHost &&
      !sharedOnceRef.current &&
      members.length <= 1
    ) {
      sharedOnceRef.current = true;
      setShareOpen(true);
    }
  }, [autoShareWhenAlone, isHost, members.length]);

  // Track unread messages while chat is closed.
  const lastSeenLenRef = useRef(timeline.length);
  useEffect(() => {
    if (chatOpen) {
      lastSeenLenRef.current = timeline.length;
      setUnread(0);
    } else {
      const delta = timeline.length - lastSeenLenRef.current;
      // Only count real chat messages, not system events.
      const newOnes = timeline
        .slice(lastSeenLenRef.current)
        .filter((t: any) => !t.system).length;
      if (delta > 0) setUnread((u) => u + newOnes);
      lastSeenLenRef.current = timeline.length;
    }
  }, [timeline, chatOpen]);

  const sortedMembers = useMemo(() => {
    // Host first, then by name, with self pinned right after host.
    return [...members].sort((a, b) => {
      if (a.isHost && !b.isHost) return -1;
      if (!a.isHost && b.isHost) return 1;
      if (a.id === selfId && b.id !== selfId) return -1;
      if (b.id === selfId && a.id !== selfId) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [members, selfId]);

  const drawerWidth = isMobile ? Math.min(window.innerWidth, 360) : 340;
  const railOpen = chatOpen || participantsOpen;
  // On mobile, overlay the drawer instead of squeezing the video grid.
  const pushContent = railOpen && !isMobile;

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
                  fontWeight: 700,
                  letterSpacing: -0.5,
                  display: { xs: 'none', sm: 'inline' },
                  background:
                    'linear-gradient(135deg, #7c4dff 0%, #00bcd4 50%, #ff4081 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
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
                {displayMeetingCode(code)}
              </Typography>
              {bannerText && (
                <Chip
                  label={bannerText}
                  size="small"
                  color="secondary"
                  sx={{ height: 20, fontSize: 11, fontWeight: 600 }}
                />
              )}
              {verifiedKey && (
                <Tooltip title={t.verify_identity_view}>
                  <Chip
                    icon={<VerifiedUserIcon sx={{ fontSize: 14 }} />}
                    label={
                      isHost
                        ? t.verify_badge_host
                        : verifiedFingerprint
                        ? t.verify_badge_verified
                        : t.verify_badge_pending
                    }
                    size="small"
                    color={
                      !isHost && !verifiedFingerprint ? 'default' : 'success'
                    }
                    variant={
                      !isHost && !verifiedFingerprint ? 'outlined' : 'filled'
                    }
                    onClick={() => setIdentityOpen(true)}
                    sx={{ height: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                  />
                </Tooltip>
              )}
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
            </Stack>
          </Stack>
          <VideoGrid
            members={sortedMembers}
            selfId={selfId}
            localStream={localStream}
            remoteStreams={remoteStreams}
          />
          <Controls
            audioEnabled={audioEnabled}
            videoEnabled={videoEnabled}
            onToggleAudio={onToggleAudio}
            onToggleVideo={onToggleVideo}
            onToggleChat={() => setChatOpen((v) => !v)}
            onShare={() => setShareOpen(true)}
            onLeave={() => setLeaveOpen(true)}
            onToggleParticipants={() => setParticipantsOpen((v) => !v)}
            participantCount={members.length}
            unreadCount={unread}
            isSpeaking={isSpeaking}
            chatOpen={chatOpen}
            participantsOpen={participantsOpen}
          />
        </Box>

        <Drawer
          anchor="right"
          open={railOpen}
          onClose={() => {
            setChatOpen(false);
            setParticipantsOpen(false);
          }}
          variant={isMobile ? 'temporary' : 'persistent'}
          slotProps={{
            paper: {
              sx: {
                width: drawerWidth,
                maxWidth: '100vw',
                bgcolor: 'background.paper',
                borderLeft: '1px solid',
                borderColor: 'divider',
              },
            },
          }}
        >
          <Box
            ref={railBodyRef}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
            }}
          >
            {participantsOpen && (
              <Box
                sx={{
                  ...(chatOpen
                    ? {
                        height: `${participantsRatio * 100}%`,
                        flexShrink: 0,
                      }
                    : { flex: '1 1 100%' }),
                  minHeight: 0,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <ParticipantsPanel
                  onClose={() => setParticipantsOpen(false)}
                  members={sortedMembers}
                  selfId={selfId}
                  isHost={isHost}
                  onKick={onKick}
                />
              </Box>
            )}
            {participantsOpen && chatOpen && (
              <Box
                role="separator"
                aria-orientation="horizontal"
                aria-label={t.rail_resize}
                tabIndex={0}
                onPointerDown={onSplitterPointerDown}
                sx={{
                  height: 6,
                  flexShrink: 0,
                  cursor: 'row-resize',
                  bgcolor: 'divider',
                  position: 'relative',
                  touchAction: 'none',
                  '&:hover, &:focus-visible': {
                    bgcolor: 'primary.main',
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 28,
                    height: 2,
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                    opacity: 0.6,
                  },
                }}
              />
            )}
            {chatOpen && (
              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <ChatPanel
                  onClose={() => setChatOpen(false)}
                  timeline={timeline}
                  onSend={onSendChat}
                  selfId={selfId}
                />
              </Box>
            )}
          </Box>
        </Drawer>
      </Box>

      <ShareDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        code={code}
        verifiedKey={verifiedKey}
      />

      <Dialog
        open={identityOpen}
        onClose={() => setIdentityOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <VerifiedUserIcon
              color={!isHost && !verifiedFingerprint ? 'disabled' : 'success'}
              fontSize="small"
            />
            <span>{t.verify_identity_title}</span>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            <DialogContentText>
              {isHost
                ? t.verify_identity_body_host
                : verifiedFingerprint
                ? t.verify_identity_status_verified
                : t.verify_identity_status_pending}
            </DialogContentText>
            <Stack direction="row" spacing={1}>
              <TextField
                value={hostFingerprint ?? '…'}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
                inputProps={{
                  style: {
                    fontFamily: 'ui-monospace, Menlo, monospace',
                    fontSize: 12,
                  },
                }}
                onFocus={(e) => e.target.select()}
              />
              <Tooltip
                title={identityCopied ? t.share_copied : t.share_copy_fingerprint}
              >
                <span>
                  <IconButton onClick={copyFingerprint} disabled={!hostFingerprint}>
                    {identityCopied ? <CheckIcon /> : <ContentCopyIcon />}
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
            {!isHost && (
              <Alert severity="info" variant="outlined" sx={{ py: 0.25 }}>
                <Typography variant="caption">
                  {t.verify_identity_compare_hint}
                </Typography>
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIdentityOpen(false)}
            sx={{ textTransform: 'none' }}
          >
            {t.share_done}
          </Button>
        </DialogActions>
      </Dialog>

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
