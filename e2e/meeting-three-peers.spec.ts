import { expect, test } from '@playwright/test';
import {
  freshMeetingCode,
  openChatPanel,
  openParticipantsPanel,
  openPeer,
  sendChat,
} from './fixtures';

test.describe('Three peers (host + two guests)', () => {
  test('host relays chat between two guests', async ({ browser }) => {
    const code = freshMeetingCode();
    const host = await openPeer(browser, {
      name: 'Alice',
      code,
      role: 'host',
    });
    const bob = await openPeer(browser, {
      name: 'Bob',
      code,
      role: 'guest',
    });
    const carol = await openPeer(browser, {
      name: 'Carol',
      code,
      role: 'guest',
    });

    for (const peer of [host, bob, carol]) {
      await openChatPanel(peer.page);
    }

    await sendChat(bob.page, 'Bob says hi to everyone');

    // The host bridges chat traffic; if it landed on the host AND on the
    // other guest, the relay topology is working.
    await expect(host.page.getByText('Bob says hi to everyone')).toBeVisible();
    await expect(
      carol.page.getByText('Bob says hi to everyone'),
    ).toBeVisible();

    await sendChat(carol.page, 'Carol responding');
    await expect(bob.page.getByText('Carol responding')).toBeVisible();

    await host.context.close();
    await bob.context.close();
    await carol.context.close();
  });

  test('participant count badge reflects every peer', async ({ browser }) => {
    const code = freshMeetingCode();
    const host = await openPeer(browser, {
      name: 'Alice',
      code,
      role: 'host',
    });
    const bob = await openPeer(browser, {
      name: 'Bob',
      code,
      role: 'guest',
    });
    const carol = await openPeer(browser, {
      name: 'Carol',
      code,
      role: 'guest',
    });

    for (const peer of [host, bob, carol]) {
      await openParticipantsPanel(peer.page);
      await expect(
        peer.page.getByText(/Participants \(3\)/),
      ).toBeVisible();
      // Every member name should be present in each panel.
      for (const name of ['Alice', 'Bob', 'Carol']) {
        await expect(peer.page.getByText(name).first()).toBeVisible();
      }
    }

    await host.context.close();
    await bob.context.close();
    await carol.context.close();
  });

  test('a guest leaving updates the roster on the remaining peers', async ({
    browser,
  }) => {
    const code = freshMeetingCode();
    const host = await openPeer(browser, {
      name: 'Alice',
      code,
      role: 'host',
    });
    const bob = await openPeer(browser, {
      name: 'Bob',
      code,
      role: 'guest',
    });
    const carol = await openPeer(browser, {
      name: 'Carol',
      code,
      role: 'guest',
    });

    await openParticipantsPanel(host.page);
    await expect(host.page.getByText(/Participants \(3\)/)).toBeVisible();

    // Bob walks out.
    await bob.page.getByRole('button', { name: 'Leave', exact: true }).click();
    await bob.page
      .getByRole('dialog')
      .getByRole('button', { name: 'Leave' })
      .click();

    await expect(host.page.getByText(/Participants \(2\)/)).toBeVisible({
      timeout: 30_000,
    });
    await openParticipantsPanel(carol.page);
    await expect(carol.page.getByText(/Participants \(2\)/)).toBeVisible();

    await host.context.close();
    await bob.context.close();
    await carol.context.close();
  });
});
