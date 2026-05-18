import { useEffect, useRef, useState, KeyboardEvent } from 'react';
import {
  Box,
  Drawer,
  IconButton,
  Stack,
  TextField,
  Typography,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { TimelineItem, isSystem } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  timeline: TimelineItem[];
  onSend: (text: string) => void;
  selfId: string;
  width?: number;
  variant?: 'persistent' | 'temporary';
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

export default function ChatDrawer({
  open,
  onClose,
  timeline,
  onSend,
  selfId,
  width = 340,
  variant = 'persistent',
}: Props) {
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [timeline, open]);

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft('');
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      variant={variant}
      slotProps={{
        paper: {
          sx: {
            width,
            maxWidth: '100vw',
            bgcolor: 'background.paper',
            borderLeft: '1px solid',
            borderColor: 'divider',
          },
        },
      }}
    >
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 2, py: 1.5 }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Chat
          </Typography>
          <IconButton size="small" onClick={onClose} aria-label="Close chat">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
        <Divider />

        <Box
          ref={scrollRef}
          sx={{
            flex: 1,
            overflowY: 'auto',
            px: 2,
            py: 1.5,
          }}
        >
          {timeline.length === 0 && (
            <Typography
              variant="body2"
              sx={{ opacity: 0.5, textAlign: 'center', mt: 4 }}
            >
              No messages yet.
            </Typography>
          )}
          {timeline.map((item) => {
            if (isSystem(item)) {
              return (
                <Box
                  key={item.id}
                  sx={{
                    textAlign: 'center',
                    my: 1,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ opacity: 0.55, fontStyle: 'italic' }}
                  >
                    {item.text} · {formatTime(item.ts)}
                  </Typography>
                </Box>
              );
            }
            const isSelf = item.fromId === selfId;
            return (
              <Box key={item.id} sx={{ mb: 1.5 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="baseline"
                  sx={{ mb: 0.25 }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: isSelf ? 'primary.light' : 'text.primary',
                    }}
                  >
                    {isSelf ? 'You' : item.fromName}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.5 }}>
                    {formatTime(item.ts)}
                  </Typography>
                </Stack>
                <Typography
                  variant="body2"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {item.text}
                </Typography>
              </Box>
            );
          })}
        </Box>

        <Divider />
        <Box sx={{ p: 1.5 }}>
          <Stack direction="row" spacing={1} alignItems="flex-end">
            <TextField
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Message…"
              fullWidth
              multiline
              maxRows={4}
              size="small"
              onKeyDown={onKey}
              inputProps={{ maxLength: 2000 }}
            />
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={!draft.trim()}
              aria-label="Send message"
            >
              <SendIcon />
            </IconButton>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
}
