import { createContext, useContext } from 'react';
import { SupportedLanguages, Translations } from './translations.type';
import { getTranslations } from './translations';

export interface LangContextType {
  lang: SupportedLanguages;
  setLang: (lang: SupportedLanguages) => void;
}

export const LangContext = createContext<LangContextType | undefined>(undefined);

export default function useLangContext(): LangContextType {
  const context = useContext(LangContext);
  if (context === undefined) {
    throw new Error('useLangContext must be used within a LangContext.Provider');
  }
  return context;
}

export function useT(): Translations {
  const { lang } = useLangContext();
  return getTranslations(lang);
}
