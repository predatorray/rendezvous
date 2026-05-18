import { IconButton, Tooltip } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useThemeMode } from '../util/themeMode';
import { useT } from '../i18n/useLangContext';

interface Props {
  size?: 'small' | 'medium' | 'large';
  edge?: 'start' | 'end' | false;
}

export default function ThemeToggle({ size = 'small', edge = false }: Props) {
  const { mode, toggle } = useThemeMode();
  const t = useT();
  const nextLabel = mode === 'dark' ? t.theme_light : t.theme_dark;
  const label = t.theme_switch_to(nextLabel);
  return (
    <Tooltip title={label} arrow>
      <IconButton
        onClick={toggle}
        size={size}
        edge={edge}
        aria-label={label}
      >
        {mode === 'dark' ? (
          <LightModeIcon fontSize={size === 'small' ? 'small' : 'medium'} />
        ) : (
          <DarkModeIcon fontSize={size === 'small' ? 'small' : 'medium'} />
        )}
      </IconButton>
    </Tooltip>
  );
}
