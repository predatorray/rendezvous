import { expect, test } from '@playwright/test';
import {
  freshMeetingCode,
  leaveMeeting,
  openChatPanel,
  openParticipantsPanel,
  openPeer,
  sendChat,
} from './fixtures';

test.describe('Two peers (host + guest)', () => {
  test('guest joins, both see each other in the participant list', async ({
    browser,
  }) => {
    const code = freshMeetingCode();
    const host = await openPeer(browser, {
      name: 'Alice',
      code,
      role: 'host',
    });
    const guest = await openPeer(browser, {
      name: 'Bob',
      code,
      role: 'guest',
    });

    for (const peer of [host, guest]) {
      await openParticipantsPanel(peer.page);
      // Each side should list both Alice and Bob.
      await expect(
        peer.page.getByText(/Alice/).first(),
      ).toBeVisible();
      await expect(peer.page.getByText(/Bob/).first()).toBeVisible();
      // The "Host" chip is rendered only for the host row in the panel.
      await expect(
        peer.page.getByRole('list').getByText('Host', { exact: true }),
      ).toBeVisible();
    }

    await host.context.close();
    await guest.context.close();
  });

  test('chat messages from both sides appear in each timeline', async ({
    browser,
  }) => {
    const code = freshMeetingCode();
    const host = await openPeer(browser, {
      name: 'Alice',
      code,
      role: 'host',
    });
    const guest = await openPeer(browser, {
      name: 'Bob',
      code,
      role: 'guest',
    });

    await openChatPanel(host.page);
    await openChatPanel(guest.page);

    await sendChat(host.page, 'Hello from the host');
    await sendChat(guest.page, 'Hi back from the guest');

    for (const peer of [host, guest]) {
      await expect(
        peer.page.getByText('Hello from the host'),
      ).toBeVisible();
      await expect(
        peer.page.getByText('Hi back from the guest'),
      ).toBeVisible();
    }

    await host.context.close();
    await guest.context.close();
  });

  test('late joiner sees prior chat history relayed by the host', async ({
    browser,
  }) => {
    const code = freshMeetingCode();
    const host = await openPeer(browser, {
      name: 'Alice',
      code,
      role: 'host',
    });
    const early = await openPeer(browser, {
      name: 'Bob',
      code,
      role: 'guest',
    });

    await openChatPanel(host.page);
    await openChatPanel(early.page);
    await sendChat(host.page, 'Early greeting');
    await expect(early.page.getByText('Early greeting')).toBeVisible();

    const late = await openPeer(browser, {
      name: 'Carol',
      code,
      role: 'guest',
    });
    await openChatPanel(late.page);
    await expect(late.page.getByText('Early greeting')).toBeVisible();

    await host.context.close();
    await early.context.close();
    await late.context.close();
  });

  test('toggling mute on the guest updates the host participant list', async ({
    browser,
  }) => {
    const code = freshMeetingCode();
    const host = await openPeer(browser, {
      name: 'Alice',
      code,
      role: 'host',
    });
    const guest = await openPeer(browser, {
      name: 'Bob',
      code,
      role: 'guest',
    });

    await guest.page.getByRole('button', { name: 'Mute' }).click();
    await openParticipantsPanel(host.page);
    await expect(
      host.page.getByLabel('Bob: audio off'),
    ).toBeVisible();

    await guest.page.getByRole('button', { name: 'Unmute' }).click();
    await expect(
      host.page.getByLabel('Bob: audio on'),
    ).toBeVisible();

    await host.context.close();
    await guest.context.close();
  });

  test('host ending the meeting kicks the guest to the ended screen', async ({
    browser,
  }) => {
    const code = freshMeetingCode();
    const host = await openPeer(browser, {
      name: 'Alice',
      code,
      role: 'host',
    });
    const guest = await openPeer(browser, {
      name: 'Bob',
      code,
      role: 'guest',
    });

    // Wait for the guest to be visible to the host so the End signal has
    // a connection to travel over.
    await openParticipantsPanel(host.page);
    await expect(host.page.getByText('Bob').first()).toBeVisible();

    await leaveMeeting(host.page);

    await expect(
      guest.page.getByText('The host ended the meeting'),
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      guest.page.getByRole('button', { name: 'Back to home' }),
    ).toBeVisible();

    await host.context.close();
    await guest.context.close();
  });

  test('host can remove a participant', async ({ browser }) => {
    const code = freshMeetingCode();
    const host = await openPeer(browser, {
      name: 'Alice',
      code,
      role: 'host',
    });
    const guest = await openPeer(browser, {
      name: 'Bob',
      code,
      role: 'guest',
    });

    await openParticipantsPanel(host.page);
    // Wait until Bob is in the host's roster before kicking — otherwise the
    // kick fires before the data connection is wired and the guest never
    // gets the `kicked` signal.
    await expect(host.page.getByText('Bob').first()).toBeVisible();
    await host.page
      .getByRole('button', { name: 'Remove from meeting: Bob' })
      .click();
    await host.page
      .getByRole('dialog')
      .getByRole('button', { name: 'Remove' })
      .click();

    // The guest should land on the meeting-ended screen. The exact reason
    // text depends on whether the `kick` message arrives before the data
    // connection close — MeetingClient.kick sends then immediately closes,
    // so racing can surface either the "kicked" or "host ended" copy. The
    // user-facing outcome (removed + can go home) is what we care about.
    await expect(
      guest.page.getByText(
        /You were removed from the meeting by the host|The host ended the meeting/,
      ),
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      guest.page.getByRole('button', { name: 'Back to home' }),
    ).toBeVisible();

    await host.context.close();
    await guest.context.close();
  });
});
