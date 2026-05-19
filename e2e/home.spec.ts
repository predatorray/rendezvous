import { expect, test } from '@playwright/test';

test.describe('Home page', () => {
  test('shows the app branding and the host CTA', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Rendezvous' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Host new meeting' }),
    ).toBeVisible();
  });

  test('blocks hosting when the name field is empty', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Host new meeting' }).click();
    await expect(page.getByText('Please enter your name.')).toBeVisible();
    // We must still be on the home page (no navigation to /m/...).
    await expect(page).toHaveURL(/\/(#\/?)?$/);
  });

  test('rejects an invalid meeting code on join', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Your name').fill('Alice');
    await page.getByLabel('Meeting code').fill('ABC');
    // The Join button stays disabled until the code parses as 6 letters;
    // verifying disabled state is itself an assertion that validation works.
    await expect(page.getByRole('button', { name: 'Join' })).toBeDisabled();
  });

  test('navigates to a meeting URL after hosting', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Your name').fill('Alice');
    await page.getByRole('button', { name: 'Host new meeting' }).click();
    await expect(page).toHaveURL(/#\/m\/[a-z]{6}\?.*host=1/);
  });
});
