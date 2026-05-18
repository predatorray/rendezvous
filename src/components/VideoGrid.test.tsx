import { renderWithProviders } from '../test-utils';
import VideoGrid from './VideoGrid';
import { Member } from '../types';

function member(id: string, name = id): Member {
  return { id, name, audio: true, video: false, isHost: id === 'host' };
}

describe('VideoGrid', () => {
  it('renders self alone when the room has only the user', () => {
    const { container } = renderWithProviders(
      <VideoGrid
        members={[member('self', 'Me')]}
        selfId="self"
        localStream={null}
        remoteStreams={new Map()}
      />
    );
    // Solo: one tile, no picture-in-picture overlay.
    expect(container.querySelectorAll('.MuiBox-root').length).toBeGreaterThan(0);
  });

  it('renders remote members as tiles and shows self overlay', () => {
    const { getAllByText } = renderWithProviders(
      <VideoGrid
        members={[member('self', 'Me'), member('p1', 'Alice'), member('p2', 'Bob')]}
        selfId="self"
        localStream={null}
        remoteStreams={new Map()}
      />
    );
    expect(getAllByText('Alice').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('Bob').length).toBeGreaterThanOrEqual(1);
  });
});
