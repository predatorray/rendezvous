import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import ShareIcon from '@mui/icons-material/Share';
import XIcon from '@mui/icons-material/X';
import FacebookIcon from '@mui/icons-material/Facebook';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import TelegramIcon from '@mui/icons-material/Telegram';
import RedditIcon from '@mui/icons-material/Reddit';
import EmailIcon from '@mui/icons-material/Email';

interface Props {
  open: boolean;
  onClose: () => void;
  code: string;
}

interface ShareTarget {
  name: string;
  color: string;
  Icon: React.ComponentType<{ fontSize?: 'small' | 'inherit' | 'medium' | 'large' }>;
  href: (url: string, text: string) => string;
}

const TARGETS: ShareTarget[] = [
  {
    name: 'X',
    color: '#000000',
    Icon: XIcon,
    href: (url, text) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  },
  {
    name: 'Facebook',
    color: '#1877F2',
    Icon: FacebookIcon,
    href: (url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: 'WhatsApp',
    color: '#25D366',
    Icon: WhatsAppIcon,
    href: (url, text) =>
      `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
  },
  {
    name: 'Telegram',
    color: '#229ED9',
    Icon: TelegramIcon,
    href: (url, text) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    name: 'Reddit',
    color: '#FF4500',
    Icon: RedditIcon,
    href: (url, text) =>
      `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
  },
  {
    name: 'Email',
    color: '#6B7280',
    Icon: EmailIcon,
    href: (url, text) =>
      `mailto:?subject=${encodeURIComponent('Join my meeting')}&body=${encodeURIComponent(`${text}\n\n${url}`)}`,
  },
];

export default function ShareDialog({ open, onClose, code }: Props) {
  const [copiedField, setCopiedField] = useState<'code' | 'link' | null>(null);

  const link = `${window.location.origin}${window.location.pathname}#/m/${code}`;
  const shareText = `Join my meeting (code: ${code})`;
  const canNativeShare =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const copy = async (value: string, which: 'code' | 'link') => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const el = document.createElement('textarea');
      el.value = value;
      document.body.appendChild(el);
      el.select();
      try {
        document.execCommand('copy');
      } catch {}
      document.body.removeChild(el);
    }
    setCopiedField(which);
    window.setTimeout(() => setCopiedField(null), 1500);
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title: 'Join my meeting', text: shareText, url: link });
    } catch {
      // user cancelled
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Invite others</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <Stack spacing={0.5}>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              Meeting code
            </Typography>
            <Stack direction="row" spacing={1}>
              <TextField
                value={code}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
                inputProps={{
                  style: {
                    fontFamily: 'ui-monospace, Menlo, monospace',
                    fontSize: 18,
                    letterSpacing: 2,
                  },
                }}
              />
              <Tooltip title={copiedField === 'code' ? 'Copied' : 'Copy code'}>
                <IconButton onClick={() => copy(code, 'code')}>
                  {copiedField === 'code' ? <CheckIcon /> : <ContentCopyIcon />}
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          <Stack spacing={0.5}>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              Invite link
            </Typography>
            <Stack direction="row" spacing={1}>
              <TextField
                value={link}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
                onFocus={(e) => e.target.select()}
              />
              <Tooltip title={copiedField === 'link' ? 'Copied' : 'Copy link'}>
                <IconButton onClick={() => copy(link, 'link')}>
                  {copiedField === 'link' ? <CheckIcon /> : <ContentCopyIcon />}
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          <Box>
            <Typography
              variant="caption"
              sx={{ opacity: 0.7, display: 'block', mb: 1 }}
            >
              Share via
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
              {TARGETS.map(({ name, color, Icon, href }) => (
                <Tooltip key={name} title={`Share on ${name}`}>
                  <IconButton
                    component="a"
                    href={href(link, shareText)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Share on ${name}`}
                    sx={{
                      color: '#fff',
                      bgcolor: color,
                      '&:hover': { bgcolor: color, opacity: 0.85 },
                    }}
                  >
                    <Icon fontSize="small" />
                  </IconButton>
                </Tooltip>
              ))}
              {canNativeShare && (
                <Tooltip title="More…">
                  <IconButton
                    onClick={handleNativeShare}
                    aria-label="More sharing options"
                    sx={{
                      color: 'text.primary',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <ShareIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}
