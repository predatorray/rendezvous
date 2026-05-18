import { useState } from 'react';
import {
  Button,
  IconButton,
  Menu,
  MenuItem,
  ListItemText,
  Tooltip,
  Typography,
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import { SUPPORTED_LANGUAGES, SupportedLanguages } from './translations.type';
import { getTranslations } from './translations';
import useLangContext, { useT } from './useLangContext';
import { setLanguagePreference } from './LocalLanguagePreference';

interface Props {
  variant?: 'button' | 'icon';
}

export default function LanguageMenu({ variant = 'button' }: Props) {
  const { lang, setLang } = useLangContext();
  const t = useT();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const trigger =
    variant === 'icon' ? (
      <Tooltip title={t.language_change} arrow>
        <IconButton
          size="small"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          aria-label={t.language_change}
          aria-haspopup="menu"
          color="inherit"
        >
          <LanguageIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    ) : (
      <Button
        size="small"
        startIcon={<LanguageIcon fontSize="small" />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        aria-label={t.language_change}
        aria-haspopup="menu"
        color="inherit"
        sx={{ textTransform: 'none' }}
      >
        {getTranslations(lang).lang}
      </Button>
    );

  return (
    <>
      {trigger}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
      >
        {SUPPORTED_LANGUAGES.map((code) => (
          <MenuItem
            key={code}
            selected={code === lang}
            onClick={() => {
              setLang(code as SupportedLanguages);
              setLanguagePreference(code);
              setAnchorEl(null);
            }}
          >
            <ListItemText sx={{ mr: 2 }}>
              {getTranslations(code as SupportedLanguages).lang}
            </ListItemText>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {code}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
