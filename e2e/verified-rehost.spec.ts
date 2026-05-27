import { BrowserContext, Page } from '@playwright/test';
import { expect, freshMeetingCode, test } from './fixtures';

/**
 * Verified meetings need a passkey, so we attach a CDP virtual authenticator
 * to the context. It persists credentials across navigations on the page, so
 * the identity created on the home page is still usable when claiming a host
 * role later.
 */
async function addVirtualAuthenticator(context: BrowserContext, page: Page) {
  const client = await context.newCDPSession(page);
  await client.send('WebAuthn.enable', { enableUI: false });
  await client.send('WebAuthn.addVirtualAuthenticator', {
    options: {
      protocol: 'ctap2',
      transport: 'internal',
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
      automaticPresenceSimulation: true,
    },
  });
}

async function dismissShareDialog(page: Page) {
  const done = page.getByRole('button', { name: 'Done' });
  if (await done.isVisible().catch(() => false)) {
    await done.click();
    await expect(done).toBeHidden();
  }
}

test.describe('Verified meeting re-hosting', () => {
  // Regression test for: a verified host who shares an invite link (the guest
  // link, with no `host=1`) and then opens it themselves was stranded in the
  // waiting room, treated as a guest, with no way to host. The fix lets the
  // passkey holder claim the host role from the waiting room — which is also
  // the "create the link ahead of time, host it later" use case.
  test('the passkey holder can host an unhosted verified meeting from its invite link', async ({
    browser,
  }) => {
    test.setTimeout(120_000);
    const context = await browser.newContext({
      permissions: ['camera', 'microphone'],
    });
    const page = await context.newPage();
    await addVirtualAuthenticator(context, page);

    // 1. Create the verified identity from the home page (mints a passkey).
    await page.goto('/');
    await page.getByLabel('Your name').fill('Alice');
    await page.getByRole('switch', { name: /Verified meeting/ }).click();
    await page.getByRole('button', { name: 'Host verified meeting' }).click();

    // We land on the unlock gate; the URL now carries the identity key (vk/va).
    await expect(
      page.getByRole('button', { name: 'Verify with passkey' })
    ).toBeVisible({ timeout: 30_000 });
    const created = new URL(page.url());
    const hostParams = new URLSearchParams(
      created.hash.slice(created.hash.indexOf('?') + 1)
    );
    const vk = hostParams.get('vk')!;
    const va = hostParams.get('va')!;
    expect(vk).toBeTruthy();
    expect(va).toBeTruthy();

    // 2. Build an invite link for a *fresh* code nobody is hosting yet — the
    //    "link created ahead of the meeting" the host would share.
    const code = freshMeetingCode();
    const inviteParams = new URLSearchParams({ name: 'Alice', vk, va });
    const inviteLink = `${created.origin}${created.pathname}#/m/${code}?${inviteParams.toString()}`;

    // 3. Opening it with no host present shows the waiting room — and, for the
    //    passkey holder, the option to start hosting. reload() forces a fresh
    //    document load (a real recipient opens the link cold), so the page
    //    reads the guest URL rather than reusing the host route's mount state.
    await page.goto(inviteLink);
    await page.reload();
    await expect(page.getByText('Waiting for the host')).toBeVisible({
      timeout: 30_000,
    });
    const claim = page.getByRole('button', { name: 'Host this meeting' });
    await expect(claim).toBeVisible();

    // 4. Claiming with the passkey makes this client the verified host.
    await claim.click();
    await expect(page.locator('button[aria-label="Leave"]')).toBeVisible({
      timeout: 30_000,
    });
    await dismissShareDialog(page);
    await expect(page.getByText('Verified host')).toBeVisible();

    await context.close();
  });
});
