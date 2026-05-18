import userEvent from '@testing-library/user-event';
import { renderWithProviders, screen } from '../test-utils';
import ChatDrawer from './ChatDrawer';
import { TimelineItem } from '../types';
import en from '../i18n/locales/en';

const SELF = 'self-id';

function buildTimeline(): TimelineItem[] {
  return [
    {
      id: 'sys1',
      text: '',
      ts: new Date('2024-01-01T10:30:00').getTime(),
      system: true,
      event: { kind: 'joined', name: 'Alice' },
    },
    {
      id: 'c1',
      fromId: 'other',
      fromName: 'Alice',
      text: 'Hello',
      ts: new Date('2024-01-01T10:31:00').getTime(),
    },
    {
      id: 'c2',
      fromId: SELF,
      fromName: 'Me',
      text: 'Hi',
      ts: new Date('2024-01-01T10:32:00').getTime(),
    },
  ];
}

describe('ChatDrawer', () => {
  it('shows an empty message when timeline is empty', () => {
    renderWithProviders(
      <ChatDrawer
        open
        onClose={() => {}}
        timeline={[]}
        onSend={() => {}}
        selfId={SELF}
        variant="temporary"
      />
    );
    expect(screen.getByText(en.chat_empty)).toBeInTheDocument();
  });

  it('renders system, peer, and self messages', () => {
    renderWithProviders(
      <ChatDrawer
        open
        onClose={() => {}}
        timeline={buildTimeline()}
        onSend={() => {}}
        selfId={SELF}
        variant="temporary"
      />
    );
    expect(screen.getByText(/Alice joined/)).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi')).toBeInTheDocument();
    expect(screen.getByText(en.chat_you)).toBeInTheDocument();
  });

  it('sends a message via the send button and clears the input', () => {
    const onSend = jest.fn();
    renderWithProviders(
      <ChatDrawer
        open
        onClose={() => {}}
        timeline={[]}
        onSend={onSend}
        selfId={SELF}
        variant="temporary"
      />
    );
    const input = screen.getByPlaceholderText(en.chat_placeholder);
    userEvent.type(input, 'hello world');
    userEvent.click(screen.getByLabelText(en.chat_send));
    expect(onSend).toHaveBeenCalledWith('hello world');
    expect((input as HTMLTextAreaElement).value).toBe('');
  });

  it('sends on Enter (without Shift)', () => {
    const onSend = jest.fn();
    renderWithProviders(
      <ChatDrawer
        open
        onClose={() => {}}
        timeline={[]}
        onSend={onSend}
        selfId={SELF}
        variant="temporary"
      />
    );
    const input = screen.getByPlaceholderText(en.chat_placeholder);
    userEvent.type(input, 'hi{enter}');
    expect(onSend).toHaveBeenCalledWith('hi');
  });

  it('does not send when the draft is whitespace-only', () => {
    const onSend = jest.fn();
    renderWithProviders(
      <ChatDrawer
        open
        onClose={() => {}}
        timeline={[]}
        onSend={onSend}
        selfId={SELF}
        variant="temporary"
      />
    );
    const input = screen.getByPlaceholderText(en.chat_placeholder);
    userEvent.type(input, '   ');
    const sendBtn = screen.getByLabelText(en.chat_send);
    expect(sendBtn).toBeDisabled();
    userEvent.type(input, '{enter}');
    expect(onSend).not.toHaveBeenCalled();
  });

  it('close button invokes onClose', () => {
    const onClose = jest.fn();
    renderWithProviders(
      <ChatDrawer
        open
        onClose={onClose}
        timeline={[]}
        onSend={() => {}}
        selfId={SELF}
        variant="temporary"
      />
    );
    userEvent.click(screen.getByLabelText(en.chat_close));
    expect(onClose).toHaveBeenCalled();
  });
});
