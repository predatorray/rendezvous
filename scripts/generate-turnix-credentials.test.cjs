const { test } = require('node:test');
const assert = require('node:assert/strict');
const { generateTurnixCredentials } = require('./generate-turnix-credentials.cjs');
const empty = { iceServers: [], expiresAt: null };
const payload = {
  iceServers: [{ urls: ['turn:example.com:3478'], username: 'temporary-user', credential: 'temporary-password' }],
  expiresAt: new Date(Date.now() + 604800000).toISOString(),
};

test('publishes only expiring credentials and requests seven days using the secret', async () => {
  let options;
  const result = await generateTurnixCredentials('test-api-token', async (url, opts) => {
    assert.equal(url, 'https://turnix.io/api/v1/credentials/ice');
    options = opts;
    return { ok: true, json: async () => ({ ...payload, apiToken: 'test-api-token' }) };
  });
  assert.deepEqual(result, payload);
  assert.equal(options.headers.Authorization, 'Bearer test-api-token');
  assert.deepEqual(JSON.parse(options.body), { ttl: 604800 });
  assert.equal(JSON.stringify(result).includes('test-api-token'), false);
});

test('missing secret never calls the API', async () => {
  assert.deepEqual(await generateTurnixCredentials('', () => { throw new Error('unexpected'); }), empty);
});

for (const status of [401, 429, 503]) {
  test(`HTTP ${status} safely falls back without leaking the upstream error`, async () => {
    const warnings = [];
    const result = await generateTurnixCredentials('test-api-token', async () => ({
      ok: false, status, json: async () => { throw new Error('should not read body'); },
    }), (warning) => warnings.push(warning));
    assert.deepEqual(result, empty);
    assert.equal(warnings.length, 1);
    assert.equal(warnings[0].includes('test-api-token'), false);
  });
}

test('rejects short expiry, malformed responses, and network failures', async () => {
  for (const data of [null, {}, { ...payload, expiresAt: new Date().toISOString() },
    { ...payload, iceServers: [{ urls: 'turn:example.com' }] }]) {
    assert.deepEqual(await generateTurnixCredentials('token', async () => ({ ok: true, json: async () => data }), () => {}), empty);
  }
  assert.deepEqual(await generateTurnixCredentials('token', async () => { throw new Error('token'); }, () => {}), empty);
});
