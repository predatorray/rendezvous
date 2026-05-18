import { act, renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { ThemeModeProvider, useThemeMode } from './themeMode';

const wrapper = ({ children }: { children: ReactNode }) => (
  <ThemeModeProvider>{children}</ThemeModeProvider>
);

describe('ThemeModeProvider / useThemeMode', () => {
  beforeEach(() => localStorage.clear());

  it('throws when used outside the provider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useThemeMode())).toThrow(
      /must be used within ThemeModeProvider/
    );
    spy.mockRestore();
  });

  it('defaults to dark mode when nothing stored', () => {
    const { result } = renderHook(() => useThemeMode(), { wrapper });
    expect(result.current.mode).toBe('dark');
  });

  it('reads stored mode on mount', () => {
    localStorage.setItem('rendezvous.themeMode', 'light');
    const { result } = renderHook(() => useThemeMode(), { wrapper });
    expect(result.current.mode).toBe('light');
  });

  it('toggle switches between dark and light, persisting', () => {
    const { result } = renderHook(() => useThemeMode(), { wrapper });
    expect(result.current.mode).toBe('dark');
    act(() => result.current.toggle());
    expect(result.current.mode).toBe('light');
    expect(localStorage.getItem('rendezvous.themeMode')).toBe('light');
    act(() => result.current.toggle());
    expect(result.current.mode).toBe('dark');
  });

  it('setMode sets explicitly', () => {
    const { result } = renderHook(() => useThemeMode(), { wrapper });
    act(() => result.current.setMode('light'));
    expect(result.current.mode).toBe('light');
  });
});
