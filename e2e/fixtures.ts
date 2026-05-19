import {
  Browser,
  BrowserContext,
  Page,
  expect,
  test as base,
} from '@playwright/test';

export type Role = 'host' | 'guest';

export interface PeerSession {
  context: BrowserContext;
  page: Page;
  name: string;
  role: Role;
}

/**
 * Generates a fresh lowercase 6-letter code per test so concurrent
 * runs don't collide on the public PeerJS broker.
 */
export function freshMeetingCode(): string {
  const alphabet = 'abcdefghjkmnpqrstuvwxyz';
  let out = '';
  for (let i = 0; i < 6; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

/**
 * Opens a peer session in its own incognito context so localStorage and
 * media permissions are isolated per participant.
 */
export async function openPeer(
  browser: Browser,
  opts: { name: string; code: string; role: Role },
): Promise<PeerSession> {
  const context = await browser.newContext({
    permissions: ['camera', 'microphone'],
  });
  const page = await context.newPage();
  const params = new URLSearchParams({ name: opts.name });
  if (opts.role === 'host') params.set('host', '1');
  await page.goto(`/#/m/${opts.code}?${params.toString()}`);
  // The bottom-bar "Leave" button is the most reliable signal that the
  // live meeting UI is mounted. Locating it via attribute (instead of
  // getByRole) avoids the share dialog's `inert` shroud, which auto-opens
  // for a host on a fresh meeting and hides siblings from the a11y tree.
  await expect(page.locator('button[aria-label="Leave"]')).toBeVisible({
    timeout: 30_000,
  });
  // Host-only: dismiss the auto-opened share dialog so subsequent
  // clicks aren't blocked by the modal.
  if (opts.role === 'host') {
    const done = page.getByRole('button', { name: 'Done' });
    if (await done.isVisible().catch(() => false)) {
      await done.click();
      await expect(done).toBeHidden();
    }
  }
  return { context, page, name: opts.name, role: opts.role };
}

export async function openParticipantsPanel(page: Page) {
  const btn = page.getByRole('button', { name: 'Participants' });
  await btn.click();
  await expect(
    page.getByRole('button', { name: 'Close participants' }),
  ).toBeVisible();
}

export async function openChatPanel(page: Page) {
  // The Chat control button has the same accessible name as the panel
  // heading text node, so disambiguate by role=button.
  const btn = page.getByRole('button', { name: 'Chat', exact: true });
  await btn.click();
  await expect(
    page.getByRole('button', { name: 'Close chat' }),
  ).toBeVisible();
}

export async function sendChat(page: Page, text: string) {
  const input = page.getByPlaceholder('Message…');
  await input.fill(text);
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(input).toHaveValue('');
}

export async function leaveMeeting(page: Page) {
  await page.getByRole('button', { name: 'Leave', exact: true }).click();
  // Two "Leave" buttons appear when the confirm dialog opens (one in the
  // toolbar, one in the dialog actions). The dialog button is inside the
  // dialog role.
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: /Leave|End meeting/ }).click();
}

export const test = base.extend({});
export { expect };
