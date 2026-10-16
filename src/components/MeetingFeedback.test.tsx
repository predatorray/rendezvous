import userEvent from '@testing-library/user-event';
import { renderWithProviders, screen } from '../test-utils';
import MeetingFeedback from './MeetingFeedback';
import en from '../i18n/locales/en';

describe('MeetingFeedback', () => {
  let gtag: jest.Mock;

  beforeEach(() => {
    gtag = jest.fn();
    (window as any).gtag = gtag;
  });

  afterEach(() => {
    delete (window as any).gtag;
  });

  it('only shows the comment box and submit after a rating is picked', () => {
    renderWithProviders(<MeetingFeedback endedReason="self-left" />);
    expect(screen.getByText(en.feedback_title)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: en.feedback_submit })
    ).not.toBeInTheDocument();

    userEvent.click(screen.getByRole('button', { name: en.feedback_good }));
    expect(
      screen.getByRole('textbox', { name: en.feedback_comment_placeholder })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: en.feedback_submit })
    ).toBeInTheDocument();
  });

  it('logs a rating without a comment to GA only', () => {
    renderWithProviders(<MeetingFeedback endedReason="host-left" />);
    userEvent.click(screen.getByRole('button', { name: en.feedback_bad }));
    const submit = screen.getByRole('button', { name: en.feedback_submit });
    expect(submit).not.toHaveAttribute('href');
    userEvent.click(submit);

    expect(gtag).toHaveBeenCalledWith('event', 'meeting_feedback', {
      rating: 'down',
      has_comment: false,
      ended_reason: 'host-left',
    });
    expect(screen.getByText(en.feedback_thanks)).toBeInTheDocument();
  });

  it('turns submit into a new-tab GitHub discussion link when commented', () => {
    renderWithProviders(<MeetingFeedback endedReason="kicked" />);
    userEvent.click(screen.getByRole('button', { name: en.feedback_good }));
    userEvent.type(
      screen.getByRole('textbox', { name: en.feedback_comment_placeholder }),
      'Loved it'
    );
    expect(screen.getByText(en.feedback_github_hint)).toBeInTheDocument();

    const link = screen.getByRole('link', { name: en.feedback_submit });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    const url = new URL(link.getAttribute('href')!);
    expect(url.pathname).toBe('/predatorray/rendezvous/discussions/new');
    expect(url.searchParams.get('body')).toContain('Loved it');

    userEvent.click(link);
    expect(gtag).toHaveBeenCalledWith('event', 'meeting_feedback', {
      rating: 'up',
      has_comment: true,
      ended_reason: 'kicked',
    });
    expect(screen.getByText(en.feedback_thanks)).toBeInTheDocument();
  });

  it('still completes when GA is unavailable or throws', () => {
    (window as any).gtag = () => {
      throw new Error('blocked by extension');
    };
    renderWithProviders(<MeetingFeedback endedReason="self-left" />);
    userEvent.click(screen.getByRole('button', { name: en.feedback_good }));
    userEvent.click(screen.getByRole('button', { name: en.feedback_submit }));
    expect(screen.getByText(en.feedback_thanks)).toBeInTheDocument();
  });
});
