import { SUPPORTED_LANGUAGES, supportLanguage } from './translations.type';

describe('supportLanguage', () => {
  it.each(SUPPORTED_LANGUAGES)('accepts %s', (lang) => {
    expect(supportLanguage(lang)).toBe(lang);
  });

  it('returns undefined for unsupported codes', () => {
    expect(supportLanguage('it')).toBeUndefined();
    expect(supportLanguage('')).toBeUndefined();
    expect(supportLanguage('EN')).toBeUndefined();
  });
});
