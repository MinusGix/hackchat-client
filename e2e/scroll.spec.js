/**
 * Chat scrolling: following new messages, and nested scroll areas
 */

import {
  test,
  expect,
  joinChannel,
  fillHistory,
  chatScroller,
  distanceFromBottom,
  routeSlowImage,
} from './fixtures';

test.beforeEach(async ({ page, server }) => {
  await joinChannel(page, server);
  await fillHistory(page, server, 40);
});

test('follows new text messages while at the bottom', async ({
  page,
  server,
}) => {
  server.chat('alice', 'newest message');
  await expect(chatScroller(page).getByText('newest message')).toBeVisible();

  await expect.poll(() => distanceFromBottom(page)).toBeLessThanOrEqual(2);
});

test('leaves the view alone when scrolled up into history', async ({
  page,
  server,
}) => {
  await chatScroller(page).evaluate((el) => {
    el.scrollTop = 0;
  });
  // let the scroll handler record that we're no longer at the bottom
  await page.waitForTimeout(100);

  server.chat('alice', 'arrives while reading history');
  await expect(
    chatScroller(page).getByText('arrives while reading history'),
  ).toBeAttached();

  expect(await chatScroller(page).evaluate((el) => el.scrollTop)).toBe(0);
});

/** How far the chat scrolls for one wheel tick at (x, y) */
async function wheelDelta(page, x, y) {
  const chat = chatScroller(page);
  // start at the bottom (where beforeEach leaves us) and scroll up
  const before = await chat.evaluate((el) => el.scrollTop);
  await page.mouse.move(x, y);
  await page.mouse.wheel(0, -100);
  await page.waitForTimeout(300);
  return before - (await chat.evaluate((el) => el.scrollTop));
}

test('wheel over the page margin scrolls the chat', async ({ page }) => {
  const box = await chatScroller(page).boundingBox();
  expect(await wheelDelta(page, 10, box.y + box.height / 2)).toBe(100);
});

test('wheel over the chat scrolls it once, not twice', async ({ page }) => {
  const box = await chatScroller(page).boundingBox();
  expect(
    await wheelDelta(page, box.x + box.width / 2, box.y + box.height / 2),
  ).toBe(100);
});

test('follows an embedded image that loads after its message', async ({
  page,
  server,
}) => {
  const src = await routeSlowImage(page, { height: 400, delay: 500 });
  server.chat('bob', `look ![pic](${src})`);

  const img = chatScroller(page).locator(`img[src="${src}"]`);
  await expect
    .poll(() => img.evaluate((el) => el.complete && el.naturalHeight > 0))
    .toBe(true);

  await expect
    .poll(() => distanceFromBottom(page), { timeout: 2000 })
    .toBeLessThanOrEqual(2);
});

test('scrolling inside an expanded long message does not scroll the chat', async ({
  page,
  server,
}) => {
  const lines = Array.from({ length: 80 }, (_, i) => `long line ${i}`);
  server.chat('alice', lines.join('\n'));
  await fillHistory(page, server, 10, 'after');

  await chatScroller(page).getByRole('button', { name: 'Show more' }).click();

  // the expanded message is capped in height and scrolls on its own
  const inner = await chatScroller(page)
    .getByText('long line 0', { exact: false })
    .first()
    .evaluateHandle((el) => {
      let node = el;
      while (node && node.scrollHeight <= node.clientHeight + 1) {
        node = node.parentElement;
      }
      return node;
    });
  expect(await inner.evaluate((el) => el.dataset.testid)).not.toBe(
    'chat-scroll',
  );

  // put both scroll areas somewhere in the middle of their range
  await inner.evaluate((el) => {
    el.scrollIntoView({ block: 'center' });
    el.scrollTop = 100;
  });
  await page.waitForTimeout(100);

  const scrollTop = (handle) => handle.evaluate((el) => el.scrollTop);
  const chat = await chatScroller(page).elementHandle();
  const chatBefore = await scrollTop(chat);
  const innerBefore = await scrollTop(inner);

  const box = await inner.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(300);

  expect(await scrollTop(inner)).toBeGreaterThan(innerBefore);
  expect(await scrollTop(chat)).toBe(chatBefore);
});

test('an image loading while scrolled up leaves the view alone', async ({
  page,
  server,
}) => {
  await chatScroller(page).evaluate((el) => {
    el.scrollTop = 0;
  });
  await page.waitForTimeout(100);

  const src = await routeSlowImage(page, { name: 'history', delay: 300 });
  server.chat('bob', `look ![pic](${src})`);
  const img = chatScroller(page).locator(`img[src="${src}"]`);
  await expect
    .poll(() => img.evaluate((el) => el.complete && el.naturalHeight > 0))
    .toBe(true);
  await page.waitForTimeout(100);

  expect(await chatScroller(page).evaluate((el) => el.scrollTop)).toBe(0);
});
