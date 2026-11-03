const METERED_CREDENTIALS_URL =
  'https://predatorray.metered.live/api/v1/turn/credentials';
const METERED_API_KEY = process.env.REACT_APP_METERED_API_KEY;
const TURNIX_CREDENTIALS_URL = `${process.env.PUBLIC_URL || ''}/turnix-ice-servers.json`;

function serverError(message: string): Error {
  return Object.assign(new Error(message), { type: 'server-error' });
}

function parseServers(value: unknown): RTCIceServer[] {
  if (!Array.isArray(value) || !value.every((server) => {
    const urls = Array.isArray(server?.urls) ? server.urls : [server?.urls];
    return urls.length > 0 && urls.every((url: unknown) =>
      typeof url === 'string' && /^(stun|stuns|turn|turns):/i.test(url)
    ) && (!urls.some((url: string) => /^turns?:/i.test(url)) ||
      (typeof server.username === 'string' && typeof server.credential === 'string'));
  })) throw serverError('Invalid ICE servers response');
  return value as RTCIceServer[];
}

/** Fetch both providers independently; an outage must not discard the other list. */
export async function fetchIceServers(
  onError: (error: unknown) => void
): Promise<RTCIceServer[] | null> {
  if (process.env.NODE_ENV !== 'production') return null;

  async function load(url: string, turnix: boolean): Promise<RTCIceServer[]> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(url, { signal: controller.signal, cache: 'no-store' });
      if (!response.ok) throw serverError(`ICE provider responded with ${response.status}`);
      const data = await response.json();
      if (!turnix) return parseServers(data);
      const servers = parseServers(data?.iceServers);
      // An empty generated file means Turnix was not configured or issuance failed.
      if (!servers.length) return [];
      if (typeof data.expiresAt !== 'string' ||
          !Number.isFinite(Date.parse(data.expiresAt)) ||
          Date.parse(data.expiresAt) <= Date.now() + 60000) {
        throw serverError('Turnix credentials have expired or are about to expire');
      }
      return servers;
    } catch (error) {
      // Do not log URLs, upstream bodies, or credentials.
      onError(error);
      return [];
    } finally {
      clearTimeout(timer);
    }
  }

  const lists = await Promise.all([
    METERED_API_KEY
      ? load(`${METERED_CREDENTIALS_URL}?apiKey=${METERED_API_KEY}`, false)
      : Promise.resolve([]),
    load(TURNIX_CREDENTIALS_URL, true),
  ]);
  const servers = lists.flat();
  return servers.length ? servers : null;
}
