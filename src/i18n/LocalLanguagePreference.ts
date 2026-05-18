const USER_LANGUAGE_LOCAL_STORAGE_KEY = 'rendezvous.lang';

export function setLanguagePreference(langCode?: string) {
  try {
    if (langCode) {
      localStorage.setItem(USER_LANGUAGE_LOCAL_STORAGE_KEY, langCode);
    } else {
      localStorage.removeItem(USER_LANGUAGE_LOCAL_STORAGE_KEY);
    }
  } catch {}
}

export function getLanguagePreference(): string | null {
  try {
    return localStorage.getItem(USER_LANGUAGE_LOCAL_STORAGE_KEY);
  } catch {
    return null;
  }
}
