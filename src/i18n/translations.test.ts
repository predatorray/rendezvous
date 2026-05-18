import { getTranslations } from './translations';
import en from './locales/en';
import zh from './locales/zh';
import fr from './locales/fr';
import { SUPPORTED_LANGUAGES } from './translations.type';

describe('getTranslations', () => {
  it('returns the matching locale bundle', () => {
    expect(getTranslations('en')).toBe(en);
    expect(getTranslations('zh')).toBe(zh);
    expect(getTranslations('fr')).toBe(fr);
  });
});

describe('locale shape parity', () => {
  function shape(o: any, prefix = ''): string[] {
    if (o === null || typeof o !== 'object') return [prefix];
    return Object.keys(o)
      .sort()
      .flatMap((k) => {
        const v = (o as any)[k];
        const here = prefix ? `${prefix}.${k}` : k;
        if (typeof v === 'function') return [`${here}:fn`];
        if (typeof v === 'object' && v !== null) return shape(v, here);
        return [here];
      });
  }

  const enShape = shape(en);

  for (const lang of SUPPORTED_LANGUAGES) {
    it(`${lang} has the same key set and value kinds as en`, () => {
      expect(shape(getTranslations(lang))).toEqual(enShape);
    });
  }

  it('parameterized translations produce strings', () => {
    expect(en.share_text('abcdef')).toContain('abcdef');
    expect(en.chat_system_joined('Alice')).toContain('Alice');
    expect(en.chat_system_left('Alice')).toContain('Alice');
    expect(en.theme_switch_to('dark')).toContain('dark');
    expect(en.share_on('X')).toContain('X');

    expect(zh.share_text('abcdef')).toContain('abcdef');
    expect(fr.share_text('abcdef')).toContain('abcdef');
  });
});
