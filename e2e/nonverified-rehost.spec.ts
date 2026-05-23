import { Page } from '@playwright/test';
import { expect, freshMeetingCode, test } from './fixtures';

async function dismissShareDialog(page: Page) {
  const done = page.getByRole('button', { name: 'Done' });
  if (await done.isVisible().catch(() => false)) {
    await done.click();
    await expect(done).toBeHidden();
  }
}

test.describe('Ordinary meeting re-hosting', () => {
  // A host can leave and re-host an ordinary (non-verified) meeting from the
  // invite link — the unhosted meeting offers a "Host this meeting" button
  // instead of dead-ending at the error screen.
  test('a guest can host an ordinary meeting that has no host', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      permissions: ['camera', 'microphone'],
    });
    const page = await context.newPage();

    // Open an ordinary invite link for a code nobody is hosting.
    const code = freshMeetingCode();
    await page.goto(`/#/m/${code}?name=Alice`);

    // No host present → the error screen now offers re-hosting.
    const host = page.getByRole('button', { name: 'Host this meeting' });
    await expect(host).toBeVisible({ timeout: 30_000 });

    // Claiming hosts the meeting.
    await host.click();
    await expect(page.locator('button[aria-label="Leave"]')).toBeVisible({
      timeout: 30_000,
    });
    await dismissShareDialog(page);

    await context.close();
  });
});
