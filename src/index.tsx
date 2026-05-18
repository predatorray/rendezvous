import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { ThemeModeProvider } from './util/themeMode';
import LangProvider from './i18n/LangProvider';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
// StrictMode double-invokes effects in development which would tear down and
// re-init the PeerJS peer mid-handshake, so it is intentionally omitted here.
root.render(
  <LangProvider>
    <ThemeModeProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </ThemeModeProvider>
  </LangProvider>
);
