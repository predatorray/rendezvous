import React, { useEffect, useState } from 'react';
import {
  Alert,
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
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import XIcon from '@mui/icons-material/X';
import FacebookIcon from '@mui/icons-material/Facebook';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import TelegramIcon from '@mui/icons-material/Telegram';
import RedditIcon from '@mui/icons-material/Reddit';
import EmailIcon from '@mui/icons-material/Email';
import { useT } from '../i18n/useLangContext';
import { displayMeetingCode } from '../util/code';
import { VerifiedKey, verifiedKeyParams } from '../util/verifiedMeeting';
import { displayFingerprint, fingerprintOf } from '../crypto/verify';

interface Props {
  open: boolean;
  onClose: () => void;
  code: string;
  // When set, the meeting is verified: the link embeds the host key and the
  // fingerprint is shown so it can be shared over a second channel.
  verifiedKey?: VerifiedKey;
}

interface ShareTarget {
  name: string;
  color: string;
  Icon: React.ComponentType<{ fontSize?: 'small' | 'inherit' | 'medium' | 'large' }>;
  href: (url: string, text: string, subject: string) => string;
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
    href: (url, text, subject) =>
      `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`,
  },
];

export default function ShareDialog({ open, onClose, code, verifiedKey }: Props) {
  const t = useT();
  const [copiedField, setCopiedField] = useState<
    'code' | 'link' | 'fingerprint' | null
  >(null);
  const [fingerprint, setFingerprint] = useState<string | null>(null);

  useEffect(() => {
    if (!verifiedKey) {
      setFingerprint(null);
      return;
    }
    let active = true;
    fingerprintOf(verifiedKey.publicKey).then((fp) => {
      if (active) setFingerprint(displayFingerprint(fp));
    });
    return () => {
      active = false;
    };
  }, [verifiedKey]);

  const shownCode = displayMeetingCode(code);
  const base = `${window.location.origin}${window.location.pathname}#/m/${shownCode}`;
  const link = verifiedKey
    ? `${base}?${new URLSearchParams(verifiedKeyParams(verifiedKey)).toString()}`
    : base;
  const shareText = t.share_text(shownCode);
  const shareSubject = t.share_subject;
  const canNativeShare =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const copy = async (
    value: string,
    which: 'code' | 'link' | 'fingerprint'
  ) => {
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
      await navigator.share({ title: shareSubject, text: shareText, url: link });
    } catch {
      // user cancelled
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t.share_title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <Stack spacing={0.5}>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              {t.share_meeting_code}
            </Typography>
            <Stack direction="row" spacing={1}>
              <TextField
                value={shownCode}
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
              <Tooltip title={copiedField === 'code' ? t.share_copied : t.share_copy_code}>
                <IconButton onClick={() => copy(shownCode, 'code')}>
                  {copiedField === 'code' ? <CheckIcon /> : <ContentCopyIcon />}
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          <Stack spacing={0.5}>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              {t.share_invite_link}
            </Typography>
            <Stack direction="row" spacing={1}>
              <TextField
                value={link}
                fullWidth
                size="small"
                InputProps={{ readOnly: true }}
                onFocus={(e) => e.target.select()}
              />
              <Tooltip title={copiedField === 'link' ? t.share_copied : t.share_copy_link}>
                <IconButton onClick={() => copy(link, 'link')}>
                  {copiedField === 'link' ? <CheckIcon /> : <ContentCopyIcon />}
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          {verifiedKey && (
            <Stack spacing={1}>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <VerifiedUserIcon color="success" sx={{ fontSize: 16 }} />
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  {t.share_fingerprint_label}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1}>
                <TextField
                  value={fingerprint ?? '…'}
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
                  title={
                    copiedField === 'fingerprint'
                      ? t.share_copied
                      : t.share_copy_fingerprint
                  }
                >
                  <span>
                    <IconButton
                      onClick={() => fingerprint && copy(fingerprint, 'fingerprint')}
                      disabled={!fingerprint}
                    >
                      {copiedField === 'fingerprint' ? (
                        <CheckIcon />
                      ) : (
                        <ContentCopyIcon />
                      )}
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
              <Alert severity="info" variant="outlined" sx={{ py: 0.25 }}>
                <Typography variant="caption">
                  {t.share_fingerprint_hint}
                </Typography>
              </Alert>
            </Stack>
          )}

          <Box>
            <Typography
              variant="caption"
              sx={{ opacity: 0.7, display: 'block', mb: 1 }}
            >
              {t.share_via}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
              {TARGETS.map(({ name, color, Icon, href }) => (
                <Tooltip key={name} title={t.share_on(name)}>
                  <IconButton
                    component="a"
                    href={href(link, shareText, shareSubject)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t.share_on(name)}
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
                <Tooltip title={t.share_more}>
                  <IconButton
                    onClick={handleNativeShare}
                    aria-label={t.share_more_aria}
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
          {t.share_done}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
