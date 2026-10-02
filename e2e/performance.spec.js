/**
 * Rendering cost as the channel history grows
 */

import { test, expect, joinChannel, chatScroller } from './fixtures';

// Trace snapshots copy the whole DOM, which would dominate these timings
test.use({ trace: 'off' });

/**
 * Milliseconds from sending `count` messages at once until the last one is
 * in the DOM. Timed in the page with a MutationObserver, since polling the
 * page from the test would itself cost time proportional to its size.
 */
async function burstTime(page, server, label, count) {
  const last = `${label} ${count - 1}`;
  const rendered = page.evaluate(
    (text) =>
      new Promise((resolve) => {
        const chat = document.querySelector('[data-testid="chat-scroll"]');
        const start = performance.now();
        const observer = new MutationObserver((records) => {
          const done = records.some((r) =>
            [...r.addedNodes].some((n) => n.textContent.includes(text)),
          );
          if (done) {
            observer.disconnect();
            resolve(performance.now() - start);
          }
        });
        observer.observe(chat, { childList: true, subtree: true });
        window.e2eObserving = true;
      }),
    last,
  );
  await page.waitForFunction(() => window.e2eObserving);
  await page.evaluate(() => {
    window.e2eObserving = false;
  });

  for (let i = 0; i < count; i += 1) {
    server.chat(i % 2 ? 'bob' : 'alice', `${label} ${i}`);
  }
  return rendered;
}

async function growHistory(page, server, from, to) {
  for (let i = from; i < to; i += 1) {
    server.chat(i % 2 ? 'bob' : 'alice', `history **${i}** \`with\` _markup_`);
  }
  await page
    .getByText(`history ${to - 1} with markup`, { exact: true })
    .waitFor({ timeout: 120000 });
  await page.waitForTimeout(300);
}

// ISSUES.md: lag with lots of messages
//
// A burst of messages (a busy channel, or catching up after a stall) used
// to render once per message, each render walking the whole history, so
// bursts got slower the longer the channel. Compared against a short
// channel rather than a fixed budget, so the result doesn't depend on how
// fast the machine is.
test('a burst of messages costs about the same in a long channel', async ({
  page,
  server,
}) => {
  test.setTimeout(180000);

  await joinChannel(page, server);
  await growHistory(page, server, 0, 100);
  const short = await burstTime(page, server, 'short', 200);

  await growHistory(page, server, 100, 1500);
  const long = await burstTime(page, server, 'long', 200);

  test.info().annotations.push({
    type: 'burst of 200',
    description: `100 msgs: ${Math.round(short)}ms, 1500 msgs: ${Math.round(long)}ms`,
  });
  expect(long).toBeLessThan(short * 3);

  // events are batched before rendering; none may be dropped
  await expect(chatScroller(page).getByText(/^long \d+$/)).toHaveCount(200);
});
