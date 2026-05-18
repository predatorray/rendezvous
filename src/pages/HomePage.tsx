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
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
      }}
    >
      <Container maxWidth="sm">
        <Stack spacing={1} alignItems="center" sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            sx={{ fontWeight: 600, letterSpacing: -1 }}
          >
            Rendezvous
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.7 }}>
            Serverless peer-to-peer video meetings.
          </Typography>
        </Stack>

        <Paper elevation={0} sx={{ p: 4, borderRadius: 3 }}>
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
          sx={{ display: 'block', textAlign: 'center', mt: 3, opacity: 0.5 }}
        >
          Peer-to-peer via WebRTC. No accounts, no servers.
        </Typography>
      </Container>
    </Box>
  );
}
