import { getStoredName, setStoredName } from './storage';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty string when nothing stored', () => {
    expect(getStoredName()).toBe('');
  });

  it('round-trips a name through localStorage', () => {
    setStoredName('Alice');
    expect(getStoredName()).toBe('Alice');
  });

  it('returns empty string and does not throw if localStorage.getItem throws', () => {
    const spy = jest
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => {
        throw new Error('blocked');
      });
    expect(getStoredName()).toBe('');
    spy.mockRestore();
  });

  it('swallows errors when localStorage.setItem throws', () => {
    const spy = jest
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('blocked');
      });
    expect(() => setStoredName('Bob')).not.toThrow();
    spy.mockRestore();
  });
});
