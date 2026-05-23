import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Divider,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  FormControlLabel,
  Link,
} from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import LoginIcon from '@mui/icons-material/Login';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import {
  generateMeetingCode,
  isValidMeetingCode,
  normalizeMeetingCode,
} from '../util/code';
import { getStoredName, setStoredName } from '../util/storage';
import {
  getOrCreateHostIdentity,
  webAuthnAvailable,
} from '../peer/hostIdentity';
import {
  isVerifiedFeatureEnabled,
  setVerifiedFeatureEnabled,
  verifiedKeyParams,
} from '../util/verifiedMeeting';
import { useT } from '../i18n/useLangContext';
import LanguageMenu from '../i18n/LanguageMenu';

type Mode = 'host' | 'join';

export default function HomePage() {
  const navigate = useNavigate();
  const t = useT();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [nameTouched, setNameTouched] = useState(false);
  const [verifiedEnabled, setVerifiedEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const passkeysAvailable = webAuthnAvailable();

  useEffect(() => {
    setName(getStoredName());
    setVerifiedEnabled(isVerifiedFeatureEnabled());
  }, []);

  const trimmedName = name.trim();
  const hasName = trimmedName.length > 0;
  const normalizedCode = useMemo(() => normalizeMeetingCode(code), [code]);
  const isCodeValid = isValidMeetingCode(normalizedCode);
  const codeStarted = code.length > 0;
  const showNameHint = !hasName && (nameTouched || codeStarted);

  const focusName = () => {
    setNameTouched(true);
    nameInputRef.current?.focus();
  };

  const proceed = (
    mode: Mode,
    meetingCode: string,
    extra?: Record<string, string>
  ) => {
    setStoredName(trimmedName);
    const search = new URLSearchParams();
    search.set('name', trimmedName);
    if (mode === 'host') search.set('host', '1');
    if (extra) {
      for (const [k, v] of Object.entries(extra)) search.set(k, v);
    }
    navigate(`/m/${meetingCode}?${search.toString()}`);
  };

  const toggleVerified = (enabled: boolean) => {
    setVerifiedEnabled(enabled);
    setVerifiedFeatureEnabled(enabled);
  };

  const handleHost = async () => {
    setError(null);
    if (!hasName) {
      setError(t.home_error_name);
      focusName();
      return;
    }
    if (!verifiedEnabled) {
      proceed('host', generateMeetingCode());
      return;
    }
    // Verified meeting: mint (or reuse) the host's passkey identity, then carry
    // its public key in the invite URL so guests can verify the host.
    setBusy(true);
    try {
      const identity = await getOrCreateHostIdentity();
      proceed(
        'host',
        generateMeetingCode(),
        verifiedKeyParams({ publicKey: identity.publicKey, alg: identity.alg })
      );
    } catch (e: any) {
      setError(e?.message ?? t.verify_create_failed);
    } finally {
      setBusy(false);
    }
  };

  const handleJoin = () => {
    setError(null);
    if (!hasName) {
      setError(t.home_error_name);
      focusName();
      return;
    }
    if (!isCodeValid) {
      setError(t.home_error_code);
      return;
    }
    proceed('join', normalizedCode);
  };

  return (
    <Box
      sx={{
        minHeight: '100%',
        '@supports (min-height: 100dvh)': {
          minHeight: '100dvh',
        },
        display: 'flex',
        flexDirection: 'column',
        pt: { xs: 8, md: 6 },
        pb: { xs: 4, md: 6 },
        px: { xs: 2, md: 4 },
        position: 'relative',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <LanguageMenu />
        <ThemeToggle size="medium" />
      </Box>
      <Container
        maxWidth="lg"
        sx={{ flex: 1, display: 'flex', alignItems: 'center' }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: { xs: 4, md: 8 },
            alignItems: 'center',
          }}
        >
          <Stack
            spacing={2}
            sx={{
              textAlign: { xs: 'center', md: 'left' },
              alignItems: { xs: 'center', md: 'flex-start' },
            }}
          >
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                letterSpacing: -2,
                fontSize: { xs: '2.75rem', md: '4rem' },
                lineHeight: 1.05,
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
              variant="h5"
              sx={{
                fontWeight: 500,
                opacity: 0.9,
                fontStyle: 'italic',
                letterSpacing: 0.5,
              }}
            >
              {t.home_tagline}
            </Typography>
            <Typography
              variant="body1"
              sx={{ opacity: 0.7, maxWidth: 460, lineHeight: 1.7 }}
            >
              {t.home_description}
            </Typography>
          </Stack>

          <Box>
            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
              <Stack spacing={3}>
                <TextField
                  label={t.home_your_name}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setNameTouched(true)}
                  fullWidth
                  required
                  autoFocus
                  autoComplete="name"
                  inputRef={nameInputRef}
                  error={showNameHint}
                  helperText={showNameHint ? t.home_name_required_hint : ' '}
                  inputProps={{ maxLength: 40 }}
                />

                <Button
                  variant="contained"
                  size="large"
                  startIcon={
                    busy ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : verifiedEnabled ? (
                      <VerifiedUserIcon />
                    ) : (
                      <VideocamIcon />
                    )
                  }
                  onClick={handleHost}
                  disabled={busy}
                  sx={{ py: 1.5, textTransform: 'none', fontWeight: 500 }}
                >
                  {verifiedEnabled ? t.verify_host_button : t.home_host}
                </Button>

                <Box sx={{ mt: -1 }}>
                  <Tooltip
                    title={passkeysAvailable ? '' : t.verify_unsupported}
                    placement="top"
                  >
                    <FormControlLabel
                      sx={{ ml: 0.25, alignItems: 'flex-start' }}
                      control={
                        <Switch
                          size="small"
                          checked={verifiedEnabled}
                          disabled={!passkeysAvailable}
                          onChange={(e) => toggleVerified(e.target.checked)}
                          inputProps={{ 'aria-label': t.verify_toggle_label }}
                        />
                      }
                      label={
                        <Box sx={{ pt: 0.25 }}>
                          <Stack
                            direction="row"
                            spacing={0.5}
                            alignItems="center"
                          >
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {t.verify_toggle_label}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                px: 0.5,
                                borderRadius: 0.5,
                                bgcolor: 'action.selected',
                                opacity: 0.8,
                              }}
                            >
                              {t.verify_experimental_tag}
                            </Typography>
                          </Stack>
                          <Typography
                            variant="caption"
                            sx={{ opacity: 0.6, display: 'block' }}
                          >
                            {t.verify_toggle_hint}
                          </Typography>
                        </Box>
                      }
                    />
                  </Tooltip>
                </Box>

                <Divider sx={{ opacity: 0.4 }}>{t.home_or_join}</Divider>

                <Stack direction="row" spacing={1.5}>
                  <TextField
                    label={t.home_meeting_code}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder={t.home_meeting_code_placeholder}
                    fullWidth
                    inputProps={{
                      maxLength: 12,
                      style: { textTransform: 'uppercase' },
                      autoCapitalize: 'none',
                      autoCorrect: 'off',
                      spellCheck: false,
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && isCodeValid) handleJoin();
                    }}
                  />
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<LoginIcon />}
                    disabled={!isCodeValid}
                    onClick={handleJoin}
                    sx={{ textTransform: 'none', flexShrink: 0, px: 3 }}
                  >
                    {t.home_join}
                  </Button>
                </Stack>

                {error && (
                  <Alert severity="error" variant="outlined">
                    {error}
                  </Alert>
                )}
              </Stack>
            </Paper>

            <Typography
              variant="caption"
              sx={{
                display: 'block',
                textAlign: 'center',
                mt: 2,
                opacity: 0.5,
              }}
            >
              {t.home_footnote}
            </Typography>
          </Box>
        </Box>
      </Container>
      <Box
        component="footer"
        sx={{
          mt: { xs: 4, md: 6 },
          display: 'flex',
          justifyContent: 'center',
          gap: 3,
          flexWrap: 'wrap',
        }}
      >
        {[
          { label: t.footer_author, href: 'https://www.predatorray.me' },
          { label: t.footer_github, href: 'https://github.com/predatorray/rendezvous' },
          {
            label: t.footer_feedback,
            href: 'https://github.com/predatorray/rendezvous/issues',
          },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            variant="caption"
            color="inherit"
            sx={{ opacity: 0.5, '&:hover': { opacity: 0.9 } }}
          >
            {link.label}
          </Link>
        ))}
      </Box>
    </Box>
  );
}
