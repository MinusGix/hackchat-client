/**
 * Behaviour when the websocket connection is lost
 */

import { test, expect, joinChannel, chatScroller } from './fixtures';

test('keeps the chat on screen when the connection drops', async ({
  page,
  server,
}) => {
  // the reconnect delay alone is 5.5s
  test.setTimeout(60000);

  await joinChannel(page, server);
  server.chat('alice', 'said before the outage');
  await expect(
    chatScroller(page).getByText('said before the outage'),
  ).toBeVisible();

  server.goOffline();
  // the engine retries after 5.5s; wait for that attempt to fail
  await expect
    .poll(() => server.refusedConnections, { timeout: 15000 })
    .toBeGreaterThan(0);
  await page.waitForTimeout(1000);

  await expect(
    chatScroller(page).getByText('said before the outage'),
  ).toBeVisible();
  await expect(
    chatScroller(page).getByText('Lost connection to server'),
  ).toBeVisible();
});

test('picks the channel back up when the connection returns', async ({
  page,
  server,
}) => {
  // two reconnect delays of 5.5s
  test.setTimeout(60000);

  await joinChannel(page, server);
  server.chat('alice', 'said before the outage');
  await expect(
    chatScroller(page).getByText('said before the outage'),
  ).toBeVisible();

  server.goOffline();
  await expect
    .poll(() => server.refusedConnections, { timeout: 15000 })
    .toBeGreaterThan(0);
  server.goOnline();
  await server.connected;

  await expect(
    chatScroller(page).getByText('you may have missed messages'),
  ).toBeVisible({ timeout: 15000 });
  await expect(
    chatScroller(page).getByText('said before the outage'),
  ).toBeVisible();

  server.chat('bob', 'said after reconnecting');
  await expect(
    chatScroller(page).getByText('said after reconnecting'),
  ).toBeVisible();
});

test('keeps a message typed while disconnected until it can be sent', async ({
  page,
  server,
}) => {
  test.setTimeout(60000);

  await joinChannel(page, server);
  server.goOffline();

  // well inside the 5.5s before the client even retries
  const input = page.getByPlaceholder(/Reconnecting/);
  await expect(input).toBeVisible({ timeout: 2000 });
  await input.fill('typed while offline');
  await input.press('Enter');
  await expect(input).toHaveValue('typed while offline');

  server.goOnline();
  await server.connected;
  const restored = page.getByPlaceholder('Your Message');
  await expect(restored).toBeVisible({ timeout: 15000 });

  await restored.press('Enter');
  await expect(
    chatScroller(page).getByText('typed while offline'),
  ).toBeVisible();
  expect(server.received.filter((p) => p.cmd === 'chat')).toHaveLength(1);
});
