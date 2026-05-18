import { useState } from 'react';
import {
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

interface Props {
  open: boolean;
  onClose: () => void;
  code: string;
}

export default function ShareDialog({ open, onClose, code }: Props) {
  const [copiedField, setCopiedField] = useState<'code' | 'link' | null>(null);

  const link = `${window.location.origin}${window.location.pathname}#/m/${code}`;

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
