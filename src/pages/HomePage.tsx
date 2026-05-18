import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Divider,
  Stack,
  TextField,
  Typography,
  Paper,
  Alert,
  Link,
} from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import LoginIcon from '@mui/icons-material/Login';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import {
  generateMeetingCode,
  isValidMeetingCode,
  normalizeMeetingCode,
} from '../util/code';
import { getStoredName, setStoredName } from '../util/storage';
import { useT } from '../i18n/useLangContext';
import LanguageMenu from '../i18n/LanguageMenu';

type Mode = 'host' | 'join';

export default function HomePage() {
  const navigate = useNavigate();
  const t = useT();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(getStoredName());
  }, []);

  const trimmedName = name.trim();
  const canHost = trimmedName.length > 0;
  const normalizedCode = useMemo(() => normalizeMeetingCode(code), [code]);
  const canJoin = canHost && isValidMeetingCode(normalizedCode);

  const proceed = (mode: Mode, meetingCode: string) => {
    setStoredName(trimmedName);
    const search = new URLSearchParams();
    search.set('name', trimmedName);
    if (mode === 'host') search.set('host', '1');
    navigate(`/m/${meetingCode}?${search.toString()}`);
  };

  const handleHost = () => {
    setError(null);
    if (!canHost) {
      setError(t.home_error_name);
      return;
    }
    proceed('host', generateMeetingCode());
  };

  const handleJoin = () => {
    setError(null);
    if (!canHost) {
      setError(t.home_error_name);
      return;
    }
    if (!isValidMeetingCode(normalizedCode)) {
      setError(t.home_error_code);
      return;
    }
    proceed('join', normalizedCode);
  };

  return (
    <Box
      sx={{
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        py: { xs: 4, md: 6 },
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
                  fullWidth
                  autoFocus
                  autoComplete="name"
                  inputProps={{ maxLength: 40 }}
                />

                <Button
                  variant="contained"
                  size="large"
                  startIcon={<VideocamIcon />}
                  disabled={!canHost}
                  onClick={handleHost}
                  sx={{ py: 1.5, textTransform: 'none', fontWeight: 500 }}
                >
                  {t.home_host}
                </Button>

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
                      style: { textTransform: 'lowercase' },
                      autoCapitalize: 'none',
                      autoCorrect: 'off',
                      spellCheck: false,
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && canJoin) handleJoin();
                    }}
                  />
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<LoginIcon />}
                    disabled={!canJoin}
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
