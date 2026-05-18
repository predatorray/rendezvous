import {
  SupportedLanguages,
  Translations,
  supportLanguage,
} from './translations.type';
import en from './locales/en';
import zh from './locales/zh';
import fr from './locales/fr';
import { getLanguagePreference } from './LocalLanguagePreference';

const TranslationsPerLang: Record<SupportedLanguages, Translations> = {
  en,
  zh,
  fr,
};

export function detectDefaultLocale(): SupportedLanguages {
  if (typeof window === 'undefined') {
    return 'en';
  }

  const urlParams = new URLSearchParams(window.location.search);
  const langParam = urlParams.get('lang');
  if (langParam) {
    const matched = supportLanguage(langParam);
    if (matched) return matched;
  }

  const stored = getLanguagePreference();
  if (stored) {
    const matched = supportLanguage(stored);
    if (matched) return matched;
  }

  const browserLanguages = navigator.languages || [navigator.language];
  for (const lang of browserLanguages) {
    const matched = supportLanguage(lang);
    if (matched) return matched;
    const base = lang.split('-')[0];
    const matchedBase = supportLanguage(base);
    if (matchedBase) return matchedBase;
  }

  return 'en';
}

export const DEFAULT_LOCALE: SupportedLanguages = detectDefaultLocale();

export function getTranslations(locale: SupportedLanguages): Translations {
  return TranslationsPerLang[locale];
}
