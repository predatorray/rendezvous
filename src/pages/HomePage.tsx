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

type Mode = 'host' | 'join';

export default function HomePage() {
  const navigate = useNavigate();
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
      setError('Please enter your name.');
      return;
    }
    proceed('host', generateMeetingCode());
  };

  const handleJoin = () => {
    setError(null);
    if (!canHost) {
      setError('Please enter your name.');
      return;
    }
    if (!isValidMeetingCode(normalizedCode)) {
      setError('Meeting code must be 6 letters.');
      return;
    }
    proceed('join', normalizedCode);
  };

  return (
    <Box
      sx={{
        minHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 4, md: 6 },
        px: { xs: 2, md: 4 },
        position: 'relative',
      }}
    >
      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
        <ThemeToggle size="medium" />
      </Box>
      <Container maxWidth="lg">
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
              Where conversations meet, serverlessly.
            </Typography>
            <Typography
              variant="body1"
              sx={{ opacity: 0.7, maxWidth: 460, lineHeight: 1.7 }}
            >
              Spin up a private video room in seconds. Pure peer-to-peer
              WebRTC — no accounts, no servers, no middlemen. Just you, your
              people, and a six-letter code.
            </Typography>
          </Stack>

          <Box>
            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
              <Stack spacing={3}>
                <TextField
                  label="Your name"
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
                  Host new meeting
                </Button>

                <Divider sx={{ opacity: 0.4 }}>or join</Divider>

                <Stack direction="row" spacing={1.5}>
                  <TextField
                    label="Meeting code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="abcxyz"
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
                    Join
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
              Peer-to-peer via WebRTC. No accounts, no servers.
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
