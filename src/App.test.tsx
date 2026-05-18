import { MemoryRouter } from 'react-router-dom';
import { renderWithProviders, screen } from './test-utils';
import App from './App';
import en from './i18n/locales/en';

jest.mock('./peer/useMeeting', () => ({
  useMeeting: () => ({
    phase: 'live',
    errorMessage: null,
    endedReason: null,
    selfId: 'self',
    members: [],
    timeline: [],
    localStream: null,
    remoteStreams: new Map(),
    audioEnabled: true,
    videoEnabled: true,
    sendChat: () => {},
    toggleAudio: () => {},
    toggleVideo: () => {},
    leave: () => {},
  }),
}));

jest.mock('./peer/useIsSpeaking', () => ({
  useIsSpeaking: () => false,
}));

function renderAt(path: string) {
  return renderWithProviders(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );
}

describe('App routing', () => {
  it('renders HomePage on /', () => {
    renderAt('/');
    expect(
      screen.getByRole('button', { name: en.home_host })
    ).toBeInTheDocument();
  });

  it('routes unknown paths to /', () => {
    renderAt('/nonexistent/path');
    expect(
      screen.getByRole('button', { name: en.home_host })
    ).toBeInTheDocument();
  });

  it('renders an invalid-code screen for bad meeting codes', () => {
    renderAt('/m/BAD');
    expect(screen.getByText(en.meeting_invalid_code)).toBeInTheDocument();
  });

  it('renders the join screen for a valid code without a stored name', () => {
    localStorage.clear();
    renderAt('/m/abcdef');
    expect(screen.getByText(/Join meeting/)).toBeInTheDocument();
  });
});
