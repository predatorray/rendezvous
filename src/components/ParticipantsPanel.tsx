import { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import { Member } from '../types';
import { useT } from '../i18n/useLangContext';

interface Props {
  onClose: () => void;
  members: Member[];
  selfId: string;
  isHost: boolean;
  onKick: (peerId: string) => void;
}

export default function ParticipantsPanel({
  onClose,
  members,
  selfId,
  isHost,
  onKick,
}: Props) {
  const t = useT();
  const [pendingKick, setPendingKick] = useState<Member | null>(null);

  const handleConfirmKick = () => {
    if (pendingKick) onKick(pendingKick.id);
    setPendingKick(null);
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
          {t.participants_title} ({members.length})
        </Typography>
        <IconButton
          size="small"
          onClick={onClose}
          aria-label={t.participants_close}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>
      <Divider />

      <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        <List dense disablePadding>
          {members.map((m) => {
            const isSelf = m.id === selfId;
            const canKick = isHost && !isSelf && !m.isHost;
            const initial =
              (m.name || '?').trim().charAt(0).toUpperCase() || '?';
            return (
              <ListItem
                key={m.id}
                divider
                secondaryAction={
                  canKick ? (
                    <Tooltip title={t.participants_kick} arrow>
                      <IconButton
                        edge="end"
                        size="small"
                        color="error"
                        aria-label={`${t.participants_kick}: ${m.name}`}
                        onClick={() => setPendingKick(m)}
                      >
                        <PersonRemoveIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ) : null
                }
              >
                <ListItemAvatar>
                  <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
                    {initial}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ flexWrap: 'wrap' }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: isSelf ? 600 : 500 }}
                      >
                        {m.name}
                        {isSelf ? ` (${t.participants_you})` : ''}
                      </Typography>
                      {m.isHost && (
                        <Chip
                          label={t.participants_host}
                          size="small"
                          color="primary"
                          sx={{ height: 18, fontSize: 10 }}
                        />
                      )}
                    </Stack>
                  }
                  secondary={
                    <Stack
                      direction="row"
                      spacing={0.5}
                      sx={{ mt: 0.25 }}
                      component="span"
                    >
                      {m.audio ? (
                        <MicIcon
                          sx={{ fontSize: 14, opacity: 0.7 }}
                          aria-label={`${m.name}: audio on`}
                        />
                      ) : (
                        <MicOffIcon
                          sx={{ fontSize: 14, color: 'error.main' }}
                          aria-label={`${m.name}: audio off`}
                        />
                      )}
                      {m.video ? (
                        <VideocamIcon
                          sx={{ fontSize: 14, opacity: 0.7 }}
                          aria-label={`${m.name}: video on`}
                        />
                      ) : (
                        <VideocamOffIcon
                          sx={{ fontSize: 14, color: 'error.main' }}
                          aria-label={`${m.name}: video off`}
                        />
                      )}
                    </Stack>
                  }
                  secondaryTypographyProps={{ component: 'div' }}
                />
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Dialog open={!!pendingKick} onClose={() => setPendingKick(null)}>
        <DialogTitle>{t.participants_kick_confirm_title}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {pendingKick
              ? t.participants_kick_confirm_body(pendingKick.name)
              : ''}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingKick(null)}>
            {t.meeting_cancel}
          </Button>
          <Button
            onClick={handleConfirmKick}
            color="error"
            variant="contained"
            autoFocus
          >
            {t.participants_kick_confirm}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
