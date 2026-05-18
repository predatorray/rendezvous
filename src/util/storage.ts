const NAME_KEY = 'rendezvous.name';

export function getStoredName(): string {
  try {
    return localStorage.getItem(NAME_KEY) ?? '';
  } catch {
    return '';
  }
}

export function setStoredName(name: string): void {
  try {
    localStorage.setItem(NAME_KEY, name);
  } catch {}
}
