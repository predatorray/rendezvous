import userEvent from '@testing-library/user-event';
import { renderWithProviders, screen, waitFor } from '../test-utils';
import ShareDialog from './ShareDialog';
import en from '../i18n/locales/en';

describe('ShareDialog', () => {
  const CODE = 'abcxyz';

  function setupClipboard() {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    return writeText;
  }

  it('renders nothing visible when closed', () => {
    renderWithProviders(
      <ShareDialog open={false} onClose={() => {}} code={CODE} />
    );
    expect(screen.queryByText(en.share_title)).not.toBeInTheDocument();
  });

  it('renders code and an invite link when open', () => {
    renderWithProviders(
      <ShareDialog open onClose={() => {}} code={CODE} />
    );
    expect(screen.getByText(en.share_title)).toBeInTheDocument();
    const codeInput = screen.getByDisplayValue(CODE);
    expect(codeInput).toBeInTheDocument();
    const link = screen
      .getAllByRole('textbox')
      .find((el) => (el as HTMLInputElement).value.includes(`#/m/${CODE}`));
    expect(link).toBeDefined();
  });

  it('copies the code via the copy button', async () => {
    const writeText = setupClipboard();
    renderWithProviders(
      <ShareDialog open onClose={() => {}} code={CODE} />
    );
    userEvent.click(screen.getByLabelText(en.share_copy_code));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(CODE));
  });

  it('calls onClose when Done is clicked', () => {
    const onClose = jest.fn();
    renderWithProviders(<ShareDialog open onClose={onClose} code={CODE} />);
    userEvent.click(screen.getByRole('button', { name: en.share_done }));
    expect(onClose).toHaveBeenCalled();
  });

  it('renders share targets as links with encoded code', () => {
    renderWithProviders(
      <ShareDialog open onClose={() => {}} code={CODE} />
    );
    const xLink = screen.getByLabelText(en.share_on('X')) as HTMLAnchorElement;
    expect(xLink.href).toContain('twitter.com/intent/tweet');
    expect(decodeURIComponent(xLink.href)).toContain(CODE);
  });
});
