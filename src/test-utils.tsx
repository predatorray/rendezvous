import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import LangProvider from './i18n/LangProvider';
import { ThemeModeProvider } from './util/themeMode';

function AllProviders({ children }: { children: ReactNode }) {
  return (
    <LangProvider>
      <ThemeModeProvider>{children}</ThemeModeProvider>
    </LangProvider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export * from '@testing-library/react';
