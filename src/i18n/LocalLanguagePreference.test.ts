import {
  getLanguagePreference,
  setLanguagePreference,
} from './LocalLanguagePreference';

describe('LocalLanguagePreference', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('round-trips a language code', () => {
    setLanguagePreference('zh');
    expect(getLanguagePreference()).toBe('zh');
  });

  it('removes the stored value when called with no argument', () => {
    setLanguagePreference('fr');
    setLanguagePreference(undefined);
    expect(getLanguagePreference()).toBeNull();
  });

  it('returns null when nothing stored', () => {
    expect(getLanguagePreference()).toBeNull();
  });

  it('returns null and does not throw when localStorage.getItem fails', () => {
    const spy = jest
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => {
        throw new Error('blocked');
      });
    expect(getLanguagePreference()).toBeNull();
    spy.mockRestore();
  });

  it('swallows setItem errors', () => {
    const spy = jest
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('blocked');
      });
    expect(() => setLanguagePreference('en')).not.toThrow();
    spy.mockRestore();
  });
});
