import { renderWithProviders, screen } from '../test-utils';
import VideoTile from './VideoTile';
import { Member } from '../types';
import en from '../i18n/locales/en';

function member(over: Partial<Member> = {}): Member {
  return {
    id: 'p1',
    name: 'Alice Anderson',
    audio: true,
    video: false,
    isHost: false,
    ...over,
  };
}

describe('VideoTile', () => {
  it('shows initials when video is off', () => {
    renderWithProviders(
      <VideoTile member={member()} stream={null} isSelf={false} />
    );
    expect(screen.getByText('AA')).toBeInTheDocument();
    expect(screen.getByText('Alice Anderson')).toBeInTheDocument();
  });

  it('appends "(you)" suffix for self', () => {
    renderWithProviders(
      <VideoTile member={member({ name: 'Alice' })} stream={null} isSelf />
    );
    expect(screen.getByText(new RegExp(en.tile_you))).toBeInTheDocument();
  });

  it('renders the mic-off indicator when audio is muted', () => {
    const { container } = renderWithProviders(
      <VideoTile
        member={member({ audio: false })}
        stream={null}
        isSelf={false}
      />
    );
    expect(container.querySelector('svg[data-testid="MicOffIcon"]')).toBeTruthy();
  });

  it('renders a video element when video is on and a stream is provided', () => {
    const fakeStream = {} as MediaStream;
    const { container } = renderWithProviders(
      <VideoTile
        member={member({ video: true })}
        stream={fakeStream}
        isSelf={false}
      />
    );
    expect(container.querySelector('video')).toBeTruthy();
  });

});
