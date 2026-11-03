const fs = require('node:fs/promises');
const path = require('node:path');

// Only the returned, expiring TURN credentials may be published. Never write
// the API token, request headers, or upstream error bodies to files or logs.
async function generateTurnixCredentials(token, request = fetch, warn = console.warn) {
  if (!token) return { iceServers: [], expiresAt: null };
  try {
    const response = await request('https://turnix.io/api/v1/credentials/ice', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ttl: 604800 }),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error();
    const data = await response.json();
    if (!Array.isArray(data.iceServers) || !data.iceServers.length ||
        !Number.isFinite(Date.parse(data.expiresAt)) ||
        Date.parse(data.expiresAt) < Date.now() + 6 * 86400000 ||
        !data.iceServers.every((server) => {
          const urls = Array.isArray(server?.urls) ? server.urls : [server?.urls];
          return urls.length && urls.every((url) => typeof url === 'string' &&
            /^(stun|stuns|turn|turns):/i.test(url)) &&
            (!urls.some((url) => /^turns?:/i.test(url)) ||
              (typeof server.username === 'string' && typeof server.credential === 'string'));
        })) throw new Error();
    // Allowlist fields rather than publishing the upstream response verbatim.
    return {
      iceServers: data.iceServers.map(({ urls, username, credential }) => ({
        urls, ...(username !== undefined ? { username } : {}),
        ...(credential !== undefined ? { credential } : {}),
      })),
      expiresAt: data.expiresAt,
    };
  } catch {
    warn('::warning::Turnix credential generation failed; continuing with Metered only. Check Turnix quota and the TURNIX_API_TOKEN secret.');
    return { iceServers: [], expiresAt: null };
  }
}

module.exports = { generateTurnixCredentials };
if (require.main === module) {
  generateTurnixCredentials(process.env.TURNIX_API_TOKEN).then(async (data) => {
    await fs.mkdir(path.join(process.cwd(), 'public'), { recursive: true });
    await fs.writeFile(path.join(process.cwd(), 'public/turnix-ice-servers.json'), JSON.stringify(data));
  }).catch(() => {
    console.error('Could not write Turnix credentials file.');
    process.exitCode = 1;
  });
}
