import userEvent from '@testing-library/user-event';
import { renderWithProviders, screen } from '../test-utils';
import ThemeToggle from './ThemeToggle';

describe('ThemeToggle', () => {
  beforeEach(() => localStorage.clear());

  it('shows light-mode action when current mode is dark, and toggles', () => {
    renderWithProviders(<ThemeToggle />);
    const btn = screen.getByLabelText(/switch to light mode/i);
    userEvent.click(btn);
    expect(screen.getByLabelText(/switch to dark mode/i)).toBeInTheDocument();
    expect(localStorage.getItem('rendezvous.themeMode')).toBe('light');
  });
});
