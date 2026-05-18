import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import LangProvider from './LangProvider';
import useLangContext, { useT } from './useLangContext';

const wrapper = ({ children }: { children: ReactNode }) => (
  <LangProvider>{children}</LangProvider>
);

describe('useLangContext', () => {
  it('throws when used outside the provider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useLangContext())).toThrow(
      /must be used within a LangContext.Provider/
    );
    spy.mockRestore();
  });

  it('exposes the current language and a setter', () => {
    const { result } = renderHook(() => useLangContext(), { wrapper });
    expect(result.current.lang).toBeDefined();
    expect(typeof result.current.setLang).toBe('function');
  });
});

describe('useT', () => {
  it('returns translations for the active language', () => {
    const { result } = renderHook(() => useT(), { wrapper });
    expect(typeof result.current.home_host).toBe('string');
    expect(typeof result.current.share_text).toBe('function');
  });
});
