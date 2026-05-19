import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { renderWithProviders, screen, waitFor } from '../test-utils';
import HomePage from './HomePage';
import en from '../i18n/locales/en';

function LocationProbe() {
  const loc = useLocation();
  return <div data-testid="location">{loc.pathname + loc.search}</div>;
}

function renderHome() {
  return renderWithProviders(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/m/:code" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('HomePage', () => {
  beforeEach(() => localStorage.clear());

  it('keeps the Join button disabled until a valid code is entered', () => {
    renderHome();
    expect(screen.getByRole('button', { name: en.home_join })).toBeDisabled();
  });

  it('shows an inline name error and focuses the name field when hosting without a name', () => {
    renderHome();
    userEvent.click(screen.getByRole('button', { name: en.home_host }));
    expect(screen.getByText(en.home_error_name)).toBeInTheDocument();
    expect(screen.getByLabelText(en.home_your_name, { exact: false })).toHaveFocus();
  });

  it('shows the required hint on the name field once the user starts typing a code', () => {
    renderHome();
    userEvent.type(screen.getByLabelText(en.home_meeting_code), 'a');
    expect(screen.getByText(en.home_name_required_hint)).toBeInTheDocument();
  });

  it('surfaces the name error when joining with a valid code but no name', () => {
    renderHome();
    userEvent.type(screen.getByLabelText(en.home_meeting_code), 'abcdef');
    userEvent.click(screen.getByRole('button', { name: en.home_join }));
    expect(screen.getByText(en.home_error_name)).toBeInTheDocument();
    expect(screen.getByLabelText(en.home_your_name, { exact: false })).toHaveFocus();
  });

  it('navigates to a host route after entering a name and clicking Host', async () => {
    renderHome();
    userEvent.type(screen.getByLabelText(en.home_your_name, { exact: false }), 'Alice');
    userEvent.click(screen.getByRole('button', { name: en.home_host }));
    const loc = await screen.findByTestId('location');
    expect(loc.textContent).toMatch(/^\/m\/[a-z]{6}\?.*host=1/);
    expect(loc.textContent).toContain('name=Alice');
    expect(localStorage.getItem('rendezvous.name')).toBe('Alice');
  });

  it('keeps the Join button disabled until the code is 6 letters', () => {
    renderHome();
    userEvent.type(screen.getByLabelText(en.home_your_name, { exact: false }), 'Alice');
    userEvent.type(screen.getByLabelText(en.home_meeting_code), 'short');
    expect(screen.getByRole('button', { name: en.home_join })).toBeDisabled();
  });

  it('joins via a valid 6-letter code', async () => {
    renderHome();
    userEvent.type(screen.getByLabelText(en.home_your_name, { exact: false }), 'Alice');
    userEvent.type(screen.getByLabelText(en.home_meeting_code), 'abcdef');
    userEvent.click(screen.getByRole('button', { name: en.home_join }));
    const loc = await screen.findByTestId('location');
    expect(loc.textContent).toMatch(/^\/m\/abcdef/);
    expect(loc.textContent).not.toContain('host=1');
  });

  it('preloads the stored name', async () => {
    localStorage.setItem('rendezvous.name', 'Bob');
    renderHome();
    await waitFor(() =>
      expect(
        (screen.getByLabelText(en.home_your_name, { exact: false }) as HTMLInputElement).value
      ).toBe('Bob')
    );
  });
});
