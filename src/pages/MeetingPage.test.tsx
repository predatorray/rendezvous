import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { renderWithProviders, screen } from '../test-utils';
import MeetingPage from './MeetingPage';
import en from '../i18n/locales/en';

const mockMeeting: Record<string, any> = {};

jest.mock('../peer/useMeeting', () => ({
  useMeeting: () => mockMeeting,
}));

jest.mock('../peer/useIsSpeaking', () => ({
  useIsSpeaking: () => false,
}));

function renderMeeting() {
  return renderWithProviders(
    <MemoryRouter initialEntries={['/m/abcxyz?name=Alice']}>
      <Routes>
        <Route path="/" element={<div>home page</div>} />
        <Route path="/m/:code" element={<MeetingPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('MeetingPage ended screen', () => {
  beforeEach(() => {
    Object.keys(mockMeeting).forEach((k) => delete mockMeeting[k]);
    Object.assign(mockMeeting, {
      phase: 'ended',
      errorMessage: null,
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
      kick: () => {},
    });
  });

  it.each([
    ['host-left', en.meeting_ended_host],
    ['self-left', en.meeting_ended_self],
    ['kicked', en.meeting_ended_kicked],
  ])('shows the reason and feedback prompt when %s', (reason, text) => {
    mockMeeting.endedReason = reason;
    renderMeeting();
    expect(screen.getByText(text)).toBeInTheDocument();
    expect(screen.getByText(en.feedback_title)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: en.feedback_good })
    ).toBeInTheDocument();
  });

  it('navigates home from the ended screen', () => {
    mockMeeting.endedReason = 'host-left';
    renderMeeting();
    userEvent.click(screen.getByRole('button', { name: en.meeting_back_home }));
    expect(screen.getByText('home page')).toBeInTheDocument();
  });
});
