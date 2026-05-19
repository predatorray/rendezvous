import userEvent from '@testing-library/user-event';
import { renderWithProviders, screen } from '../test-utils';
import ParticipantsPanel from './ParticipantsPanel';
import en from '../i18n/locales/en';
import { Member } from '../types';

const HOST: Member = {
  id: 'host-id',
  name: 'Host',
  audio: true,
  video: true,
  isHost: true,
};
const ALICE: Member = {
  id: 'alice-id',
  name: 'Alice',
  audio: true,
  video: false,
  isHost: false,
};
const BOB: Member = {
  id: 'bob-id',
  name: 'Bob',
  audio: false,
  video: false,
  isHost: false,
};

function makeProps(over: Partial<React.ComponentProps<typeof ParticipantsPanel>> = {}) {
  return {
    onClose: jest.fn(),
    members: [HOST, ALICE, BOB],
    selfId: HOST.id,
    isHost: true,
    onKick: jest.fn(),
    ...over,
  };
}

describe('ParticipantsPanel', () => {
  it('renders all participants and their host/you markers', () => {
    renderWithProviders(<ParticipantsPanel {...makeProps()} />);
    expect(screen.getByText(`${en.participants_title} (3)`)).toBeInTheDocument();
    expect(screen.getByText(/Host \(You\)/)).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText(en.participants_host)).toBeInTheDocument();
  });

  it('shows kick buttons only for non-self, non-host participants when viewer is host', () => {
    renderWithProviders(<ParticipantsPanel {...makeProps()} />);
    expect(
      screen.getByLabelText(`${en.participants_kick}: Alice`)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(`${en.participants_kick}: Bob`)
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText(`${en.participants_kick}: Host`)
    ).not.toBeInTheDocument();
  });

  it('does not show kick buttons when viewer is not the host', () => {
    renderWithProviders(
      <ParticipantsPanel
        {...makeProps({ isHost: false, selfId: ALICE.id })}
      />
    );
    expect(
      screen.queryByLabelText(`${en.participants_kick}: Bob`)
    ).not.toBeInTheDocument();
  });

  it('invokes onKick with the target peer id after confirmation', () => {
    const props = makeProps();
    renderWithProviders(<ParticipantsPanel {...props} />);
    userEvent.click(
      screen.getByLabelText(`${en.participants_kick}: Alice`)
    );
    expect(
      screen.getByText(en.participants_kick_confirm_title)
    ).toBeInTheDocument();
    expect(
      screen.getByText(en.participants_kick_confirm_body('Alice'))
    ).toBeInTheDocument();
    userEvent.click(
      screen.getByRole('button', { name: en.participants_kick_confirm })
    );
    expect(props.onKick).toHaveBeenCalledWith(ALICE.id);
    expect(props.onKick).toHaveBeenCalledTimes(1);
  });

  it('cancel button on confirmation dismisses without kicking', () => {
    const props = makeProps();
    renderWithProviders(<ParticipantsPanel {...props} />);
    userEvent.click(
      screen.getByLabelText(`${en.participants_kick}: Alice`)
    );
    userEvent.click(
      screen.getByRole('button', { name: en.meeting_cancel })
    );
    expect(props.onKick).not.toHaveBeenCalled();
  });

  it('close button calls onClose', () => {
    const props = makeProps();
    renderWithProviders(<ParticipantsPanel {...props} />);
    userEvent.click(screen.getByLabelText(en.participants_close));
    expect(props.onClose).toHaveBeenCalled();
  });
});
