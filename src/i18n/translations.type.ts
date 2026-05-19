import en from './locales/en';

export const SUPPORTED_LANGUAGES = ['en', 'zh', 'fr', 'es', 'ja'] as const;

export type SupportedLanguages = typeof SUPPORTED_LANGUAGES[number];

export function supportLanguage(lang: string): SupportedLanguages | undefined {
  if ((SUPPORTED_LANGUAGES as readonly string[]).includes(lang)) {
    return lang as SupportedLanguages;
  }
  return undefined;
}

type TranslationSchema<T> = T extends (...args: infer A) => any
  ? (...args: A) => string
  : T extends readonly any[]
    ? { [K in keyof T]: string }
    : T extends object
      ? { readonly [K in keyof T]: TranslationSchema<T[K]> }
      : string;

export type Translations = TranslationSchema<typeof en>;
