import { fetchIceServers } from './iceServers';

const metered = [{ urls: 'turn:metered.example:80', username: 'm', credential: 'm-pass' }];
const turnix = [{ urls: ['turn:turnix.example:3478', 'turns:turnix.example:443'], username: 't', credential: 't-pass' }];
const response = (data: unknown) => ({ ok: true, json: async () => data });
const turnixResponse = () => response({ iceServers: turnix, expiresAt: new Date(Date.now() + 604800000).toISOString() });
const originalEnv = process.env;
const originalFetch = global.fetch;
let load: typeof fetchIceServers;

beforeEach(() => {
  process.env = { ...originalEnv, NODE_ENV: 'production', REACT_APP_METERED_API_KEY: 'metered-test-key', PUBLIC_URL: '/rendezvous/pr-preview/pr-8' };
  jest.isolateModules(() => { load = require('./iceServers').fetchIceServers; });
});
afterEach(() => {
  process.env = originalEnv;
  global.fetch = originalFetch;
  jest.useRealTimers();
});

it('combines both lists and reads Turnix from the site path without an API token', async () => {
  const request = jest.fn().mockResolvedValueOnce(response(metered)).mockResolvedValueOnce(turnixResponse());
  global.fetch = request;
  const error = jest.fn();
  await expect(load(error)).resolves.toEqual([...metered, ...turnix]);
  expect(request.mock.calls[1][0]).toBe('/rendezvous/pr-preview/pr-8/turnix-ice-servers.json');
  expect(request.mock.calls[1][1]).toEqual(expect.objectContaining({ cache: 'no-store' }));
  expect(request.mock.calls[1][1].headers).toBeUndefined();
  expect(error).not.toHaveBeenCalled();
});

it('retains Turnix when Metered fails', async () => {
  global.fetch = jest.fn().mockRejectedValueOnce(new TypeError('offline')).mockResolvedValueOnce(turnixResponse());
  const error = jest.fn();
  await expect(load(error)).resolves.toEqual(turnix);
  expect(error).toHaveBeenCalledTimes(1);
});

it.each([
  { ok: false, status: 404 },
  response({ iceServers: turnix, expiresAt: new Date(0).toISOString() }),
  response({ iceServers: turnix, expiresAt: 'invalid' }),
  response({ iceServers: [{ urls: 'turn:bad.example' }], expiresAt: '2099-01-01' }),
])('retains Metered when the Turnix file is missing, expired or invalid', async (bad) => {
  global.fetch = jest.fn().mockResolvedValueOnce(response(metered)).mockResolvedValueOnce(bad);
  const error = jest.fn();
  await expect(load(error)).resolves.toEqual(metered);
  expect(error).toHaveBeenCalledTimes(1);
});

it('supports Turnix alone when no Metered key is configured', async () => {
  process.env.REACT_APP_METERED_API_KEY = '';
  jest.isolateModules(() => { load = require('./iceServers').fetchIceServers; });
  const request = jest.fn().mockResolvedValue(turnixResponse());
  global.fetch = request;
  await expect(load(jest.fn())).resolves.toEqual(turnix);
  expect(request).toHaveBeenCalledTimes(1);
});

it('returns the default fallback when neither provider supplies servers', async () => {
  global.fetch = jest.fn().mockResolvedValueOnce({ ok: false, status: 503 }).mockResolvedValueOnce(response({ iceServers: [], expiresAt: null }));
  await expect(load(jest.fn())).resolves.toBeNull();
});

it('bounds a stalled provider so a healthy provider can still be used', async () => {
  jest.useFakeTimers();
  global.fetch = jest.fn().mockImplementationOnce((_url, options) => new Promise((_resolve, reject) => {
    options.signal.addEventListener('abort', () => reject(new Error('timeout')));
  })).mockResolvedValueOnce(turnixResponse());
  const error = jest.fn();
  const result = load(error);
  jest.advanceTimersByTime(10000);
  await expect(result).resolves.toEqual(turnix);
  expect(error).toHaveBeenCalledTimes(1);
});

it('does not fetch production credentials in development', async () => {
  process.env = { ...process.env, NODE_ENV: 'development' };
  global.fetch = jest.fn();
  await expect(load(jest.fn())).resolves.toBeNull();
  expect(global.fetch).not.toHaveBeenCalled();
});
