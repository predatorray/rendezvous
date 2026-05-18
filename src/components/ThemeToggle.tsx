import { IconButton, Tooltip } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useThemeMode } from '../util/themeMode';

interface Props {
  size?: 'small' | 'medium' | 'large';
  edge?: 'start' | 'end' | false;
}

export default function ThemeToggle({ size = 'small', edge = false }: Props) {
  const { mode, toggle } = useThemeMode();
  const next = mode === 'dark' ? 'light' : 'dark';
  return (
    <Tooltip title={`Switch to ${next} mode`} arrow>
      <IconButton
        onClick={toggle}
        size={size}
        edge={edge}
        aria-label={`Switch to ${next} mode`}
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
