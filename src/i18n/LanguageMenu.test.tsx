import userEvent from '@testing-library/user-event';
import { renderWithProviders, screen } from '../test-utils';
import LanguageMenu from './LanguageMenu';
import en from './locales/en';
import zh from './locales/zh';

describe('LanguageMenu', () => {
  beforeEach(() => localStorage.clear());

  it('renders the current language as button label', () => {
    renderWithProviders(<LanguageMenu />);
    expect(
      screen.getByRole('button', { name: en.language_change })
    ).toBeInTheDocument();
  });

  it('renders as icon button when variant=icon', () => {
    renderWithProviders(<LanguageMenu variant="icon" />);
    const trigger = screen.getByLabelText(en.language_change);
    expect(trigger).toBeInTheDocument();
  });

  it('opens menu and lets the user pick another language, persisting it', async () => {
    renderWithProviders(<LanguageMenu />);
    userEvent.click(screen.getByRole('button', { name: en.language_change }));
    const zhItem = await screen.findByText(zh.lang);
    userEvent.click(zhItem);
    expect(localStorage.getItem('rendezvous.lang')).toBe('zh');
  });
});
