import { useEffect, useRef, useState, KeyboardEvent } from 'react';
import {
  Box,
  Divider,
  IconButton,
  Popover,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import { TimelineItem, isSystem } from '../types';
import { useT } from '../i18n/useLangContext';

const EMOJI_GROUPS: { label: string; emojis: string[] }[] = [
  {
    label: 'Smileys',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
      '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
      '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪',
      '😝', '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏',
      '😴', '🤤', '😪', '😵', '🥳', '😎', '🤓', '🧐',
      '😢', '😭', '😤', '😠', '😡', '🤯', '😱', '😨',
    ],
  },
  {
    label: 'Gestures',
    emojis: [
      '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙',
      '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️',
      '🖖', '👋', '🤝', '🙏', '💪', '👏', '🙌', '👐',
    ],
  },
  {
    label: 'Hearts',
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
      '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖',
      '💘', '💝', '💟', '✨', '🔥', '🎉', '🎊', '⭐',
    ],
  },
  {
    label: 'Animals',
    emojis: [
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
      '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔',
      '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🐺', '🐗',
    ],
  },
  {
    label: 'Food',
    emojis: [
      '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓',
      '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🥑',
      '🍔', '🍕', '🌭', '🥪', '🌮', '🌯', '🍣', '🍜',
      '🍰', '🎂', '🍩', '🍪', '☕', '🍵', '🍺', '🍷',
    ],
  },
  {
    label: 'Activities',
    emojis: [
      '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱',
      '🏓', '🏸', '🥊', '⛳', '🎣', '🎮', '🎲', '🎯',
      '🎸', '🎹', '🎺', '🎻', '🥁', '🎤', '🎧', '🎬',
    ],
  },
];

interface Props {
  onClose: () => void;
  timeline: TimelineItem[];
  onSend: (text: string) => void;
  selfId: string;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

export default function ChatPanel({
  onClose,
  timeline,
  onSend,
  selfId,
}: Props) {
  const t = useT();
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const [emojiAnchor, setEmojiAnchor] = useState<HTMLElement | null>(null);
  const [emojiTab, setEmojiTab] = useState(0);

  const insertEmoji = (emoji: string) => {
    const el = inputRef.current;
    const start = el?.selectionStart ?? draft.length;
    const end = el?.selectionEnd ?? draft.length;
    const next = draft.slice(0, start) + emoji + draft.slice(end);
    setDraft(next);
    requestAnimationFrame(() => {
      const node = inputRef.current;
      if (!node) return;
      const caret = start + emoji.length;
      node.focus();
      node.setSelectionRange(caret, caret);
    });
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [timeline]);

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
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2, py: 1.5 }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {t.chat_title}
        </Typography>
        <IconButton size="small" onClick={onClose} aria-label={t.chat_close}>
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
          minHeight: 0,
        }}
      >
        {timeline.length === 0 && (
          <Typography
            variant="body2"
            sx={{ opacity: 0.5, textAlign: 'center', mt: 4 }}
          >
            {t.chat_empty}
          </Typography>
        )}
        {timeline.map((item) => {
          if (isSystem(item)) {
            const text = item.event
              ? item.event.kind === 'joined'
                ? t.chat_system_joined(item.event.name)
                : t.chat_system_left(item.event.name)
              : item.text;
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
                  {text} · {formatTime(item.ts)}
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
                  {isSelf ? t.chat_you : item.fromName}
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
            placeholder={t.chat_placeholder}
            fullWidth
            multiline
            maxRows={4}
            size="small"
            onKeyDown={onKey}
            inputRef={inputRef}
            inputProps={{ maxLength: 2000 }}
          />
          <IconButton
            onClick={(e) => setEmojiAnchor(e.currentTarget)}
            aria-label={t.chat_emoji}
          >
            <EmojiEmotionsIcon />
          </IconButton>
          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={!draft.trim()}
            aria-label={t.chat_send}
          >
            <SendIcon />
          </IconButton>
        </Stack>
        <Popover
          open={Boolean(emojiAnchor)}
          anchorEl={emojiAnchor}
          onClose={() => setEmojiAnchor(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          slotProps={{ paper: { sx: { width: 304 } } }}
        >
          <Tabs
            value={emojiTab}
            onChange={(_, v) => setEmojiTab(v)}
            variant="scrollable"
            scrollButtons={false}
            sx={{ minHeight: 36, '& .MuiTab-root': { minHeight: 36, minWidth: 0, px: 1.25, fontSize: 12 } }}
          >
            {EMOJI_GROUPS.map((g) => (
              <Tab key={g.label} label={g.label} />
            ))}
          </Tabs>
          <Divider />
          <Box
            sx={{
              p: 1,
              display: 'grid',
              gridTemplateColumns: 'repeat(8, 1fr)',
              gap: 0.25,
              maxHeight: 220,
              overflowY: 'auto',
            }}
          >
            {EMOJI_GROUPS[emojiTab].emojis.map((e, i) => (
              <IconButton
                key={`${e}-${i}`}
                size="small"
                onClick={() => {
                  insertEmoji(e);
                  setEmojiAnchor(null);
                }}
                sx={{ fontSize: 20, lineHeight: 1, borderRadius: 1 }}
              >
                <Box component="span" sx={{ fontSize: 20, lineHeight: 1 }}>
                  {e}
                </Box>
              </IconButton>
            ))}
          </Box>
        </Popover>
      </Box>
    </Box>
  );
}
