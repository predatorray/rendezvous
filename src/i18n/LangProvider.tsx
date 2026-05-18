import { ReactNode, useMemo, useState } from 'react';
import { LangContext } from './useLangContext';
import { DEFAULT_LOCALE } from './translations';
import { SupportedLanguages } from './translations.type';

export default function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<SupportedLanguages>(DEFAULT_LOCALE);
  const value = useMemo(() => ({ lang, setLang }), [lang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}
