import ReactDOM from 'react-dom/client';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { HashRouter } from 'react-router-dom';
import './index.css';
import App from './App';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#2D8CFF' }, // Zoom blue
    background: {
      default: '#1a1a1a',
      paper: '#242424',
    },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
// StrictMode double-invokes effects in development which would tear down and
// re-init the PeerJS peer mid-handshake, so it is intentionally omitted here.
root.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <HashRouter>
      <App />
    </HashRouter>
  </ThemeProvider>
);
