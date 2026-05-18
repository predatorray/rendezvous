import userEvent from '@testing-library/user-event';
import { renderWithProviders, screen } from '../test-utils';
import Controls from './Controls';
import en from '../i18n/locales/en';

function makeProps(over: Partial<React.ComponentProps<typeof Controls>> = {}) {
  return {
    audioEnabled: true,
    videoEnabled: true,
    onToggleAudio: jest.fn(),
    onToggleVideo: jest.fn(),
    onToggleChat: jest.fn(),
    onShare: jest.fn(),
    onLeave: jest.fn(),
    unreadCount: 0,
    ...over,
  };
}

describe('Controls', () => {
  it('renders mute/stop-video labels when both are enabled', () => {
    renderWithProviders(<Controls {...makeProps()} />);
    expect(screen.getByLabelText(en.controls_mute)).toBeInTheDocument();
    expect(screen.getByLabelText(en.controls_stop_video)).toBeInTheDocument();
  });

  it('flips to unmute/start-video labels when disabled', () => {
    renderWithProviders(
      <Controls
        {...makeProps({ audioEnabled: false, videoEnabled: false })}
      />
    );
    expect(screen.getByLabelText(en.controls_unmute)).toBeInTheDocument();
    expect(screen.getByLabelText(en.controls_start_video)).toBeInTheDocument();
  });

  it('invokes the proper callback for each action', () => {
    const props = makeProps();
    renderWithProviders(<Controls {...props} />);
    userEvent.click(screen.getByLabelText(en.controls_mute));
    userEvent.click(screen.getByLabelText(en.controls_stop_video));
    userEvent.click(screen.getByLabelText(en.controls_chat));
    userEvent.click(screen.getByLabelText(en.controls_share));
    userEvent.click(screen.getByLabelText(en.controls_leave));
    expect(props.onToggleAudio).toHaveBeenCalledTimes(1);
    expect(props.onToggleVideo).toHaveBeenCalledTimes(1);
    expect(props.onToggleChat).toHaveBeenCalledTimes(1);
    expect(props.onShare).toHaveBeenCalledTimes(1);
    expect(props.onLeave).toHaveBeenCalledTimes(1);
  });

  it('renders the unread chat badge with the count, capped at 9+', () => {
    const { rerender } = renderWithProviders(
      <Controls {...makeProps({ unreadCount: 3 })} />
    );
    expect(screen.getByText('3')).toBeInTheDocument();
    rerender(<Controls {...makeProps({ unreadCount: 42 })} />);
    expect(screen.getByText('9+')).toBeInTheDocument();
  });

  it('hides the badge when there are no unread messages', () => {
    renderWithProviders(<Controls {...makeProps({ unreadCount: 0 })} />);
    expect(screen.queryByText('9+')).not.toBeInTheDocument();
  });
});
