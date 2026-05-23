import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import MeetingRoom from '../components/MeetingRoom';
import { useMeeting } from '../peer/useMeeting';
import { useIsSpeaking } from '../peer/useIsSpeaking';
import { VerificationConfig } from '../peer/MeetingClient';
import { HostSession } from '../peer/verification';
import { loadHostIdentity } from '../peer/hostIdentity';
import { fingerprintOf, displayFingerprint } from '../crypto/verify';
import { displayMeetingCode, isValidMeetingCode } from '../util/code';
import { parseVerifiedKey, VerifiedKey } from '../util/verifiedMeeting';
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
  const [verifiedKey] = useState<VerifiedKey | null>(() =>
    parseVerifiedKey(searchParams)
  );
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

  // A verified host must unlock with their passkey before the meeting starts.
  if (isHost && verifiedKey) {
    return (
      <VerifiedHostGate
        code={normalizedCode}
        name={confirmedName}
        verifiedKey={verifiedKey}
      />
    );
  }

  // A guest joining a verified link verifies the host's identity automatically.
  if (!isHost && verifiedKey) {
    return (
      <VerifiedGuest
        code={normalizedCode}
        name={confirmedName}
        verifiedKey={verifiedKey}
      />
    );
  }

  return (
    <LiveMeeting code={normalizedCode} name={confirmedName} isHost={isHost} />
  );
}

/**
 * Pre-meeting screen for a verified host. Performs the one-time passkey
 * ceremony (within a user gesture) that vouches for this session's key, then
 * mounts the live meeting with verification enabled.
 */
function VerifiedHostGate({
  code,
  name,
  verifiedKey,
}: {
  code: string;
  name: string;
  verifiedKey: VerifiedKey;
}) {
  const navigate = useNavigate();
  const t = useT();
  const [session, setSession] = useState<HostSession | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unlock = async () => {
    setBusy(true);
    setError(null);
    try {
      const created = await HostSession.create({
        code,
        identityCredentialId: loadHostIdentity()?.credentialId ?? null,
        identityPublicKey: verifiedKey.publicKey,
        identityAlg: verifiedKey.alg,
      });
      setSession(created);
    } catch (e: any) {
      setError(e?.message ?? t.verify_host_unlock_failed);
    } finally {
      setBusy(false);
    }
  };

  if (session) {
    return (
      <LiveMeeting
        code={code}
        name={name}
        isHost
        verification={{ role: 'host', session }}
        verifiedKey={verifiedKey}
      />
    );
  }

  return (
    <CenteredCard>
      <Stack alignItems="center" spacing={2}>
        <VerifiedUserIcon color="primary" sx={{ fontSize: 40 }} />
        <Typography variant="h6">{t.verify_host_unlock_title}</Typography>
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          {t.verify_host_unlock_body}
        </Typography>
        {error && (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        )}
        <Button
          variant="contained"
          onClick={unlock}
          disabled={busy}
          startIcon={busy ? <CircularProgress size={16} /> : <VerifiedUserIcon />}
          sx={{ textTransform: 'none' }}
        >
          {busy ? t.verify_host_unlocking : t.verify_host_unlock_cta}
        </Button>
        <Button
          variant="text"
          onClick={() => navigate('/')}
          sx={{ textTransform: 'none' }}
        >
          {t.meeting_back_home}
        </Button>
      </Stack>
    </CenteredCard>
  );
}

/**
 * Wrapper that derives the expected host fingerprint from the invite URL key,
 * then runs the live meeting as a verifying guest.
 */
function VerifiedGuest({
  code,
  name,
  verifiedKey,
}: {
  code: string;
  name: string;
  verifiedKey: VerifiedKey;
}) {
  const t = useT();
  const [config, setConfig] = useState<VerificationConfig | null>(null);

  useEffect(() => {
    let active = true;
    fingerprintOf(verifiedKey.publicKey).then((expectedFingerprint) => {
      if (active) setConfig({ role: 'guest', expectedFingerprint });
    });
    return () => {
      active = false;
    };
  }, [verifiedKey.publicKey]);

  if (!config) {
    return (
      <CenteredCard>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={28} />
          <Typography variant="body1">{t.meeting_preparing}</Typography>
        </Stack>
      </CenteredCard>
    );
  }

  return (
    <LiveMeeting
      code={code}
      name={name}
      isHost={false}
      verification={config}
      verifiedKey={verifiedKey}
    />
  );
}

function LiveMeeting({
  code,
  name,
  isHost,
  verification,
  verifiedKey,
}: {
  code: string;
  name: string;
  isHost: boolean;
  verification?: VerificationConfig;
  verifiedKey?: VerifiedKey;
}) {
  const navigate = useNavigate();
  const t = useT();
  const meeting = useMeeting({ code, name, isHost, verification });
  const isSpeaking = useIsSpeaking(meeting.localStream, meeting.audioEnabled);

  if (meeting.phase === 'waiting') {
    return (
      <CenteredCard>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={28} />
          <Typography variant="h6">{t.verify_waiting_title}</Typography>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            {t.verify_waiting_body}
          </Typography>
          <Button variant="text" onClick={() => navigate('/')} sx={{ textTransform: 'none' }}>
            {t.meeting_back_home}
          </Button>
        </Stack>
      </CenteredCard>
    );
  }

  if (
    meeting.phase === 'preparing' ||
    meeting.phase === 'joining' ||
    meeting.phase === 'verifying'
  ) {
    return (
      <CenteredCard>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={28} />
          <Typography variant="body1">
            {meeting.phase === 'verifying'
              ? t.verify_checking
              : meeting.phase === 'preparing'
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
      verifiedKey={verifiedKey}
      verifiedFingerprint={
        meeting.verifiedFingerprint
          ? displayFingerprint(meeting.verifiedFingerprint)
          : null
      }
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
