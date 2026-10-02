/**
 * Settings and message interaction preferences
 */

import { test, expect, joinChannel, chatScroller } from './fixtures';

// Colour schemes from the legacy client (hack-chat/main: client/schemes/)
const LEGACY_THEMES = [
  'amoled',
  'android',
  'android-white',
  'andromeda',
  'atelier-dune',
  'atelier-forest',
  'atelier-heath',
  'atelier-lakeside',
  'atelier-seaside',
  'banana',
  'bright',
  'bubblegum',
  'carrot',
  'catppuccin',
  'chalk',
  'default',
  'eighties',
  'flamingo',
  'fresh-green',
  'fried-egg',
  'greenscreen',
  'gruvbox-light',
  'hacker',
  'lax',
  'maniac',
  'mariana',
  'military',
  'milkyway',
  'mocha',
  'monokai',
  'nebula',
  'nese',
  'ocean',
  'omega',
  'pop',
  'railscasts',
  'rainbow',
  'retro',
  'solarized',
  'sunlight',
  'tk-night',
  'tomorrow',
  'ubuntu',
  'waifu',
];

// over the 450 character collapse threshold
const LONG_MESSAGE = Array.from(
  { length: 30 },
  (_, i) => `row ${i} of a message long enough to be collapsed`,
).join('\n');

// ISSUES.md: port old themes
test('offers every legacy colour scheme', async ({ page }) => {
  test.fail(
    !process.env.E2E_SHOW_KNOWN,
    'not implemented: old themes not ported',
  );

  await page.goto('/settings');
  const themeSelect = page.locator('select', {
    has: page.locator('option[value="default"]'),
  });
  await expect(themeSelect).toBeVisible();
  const offered = await themeSelect
    .locator('option')
    .evaluateAll((options) => options.map((o) => o.value));

  expect(LEGACY_THEMES.filter((t) => !offered.includes(t))).toEqual([]);
});

test('long messages are collapsed behind "Show more" by default', async ({
  page,
  server,
}) => {
  await joinChannel(page, server);
  server.chat('alice', LONG_MESSAGE);

  await expect(
    chatScroller(page).getByRole('button', { name: 'Show more' }),
  ).toBeVisible();
});

// ISSUES.md: setting for disabling spoilers (show messages in full)
test.fixme('long messages are shown in full when collapsing is disabled', async () => {
  // Turn the new setting off, then post LONG_MESSAGE and expect:
  //  - no "Show more" button
  //  - the last line ("row 29") visible without any interaction
  //  - the message box not scrollable on its own (scrollHeight == clientHeight)
});

test('clicking a message quotes it into the input', async ({
  page,
  server,
}) => {
  await joinChannel(page, server);
  server.chat('alice', 'quote me');
  await chatScroller(page).getByText('quote me').click();

  await expect(page.getByRole('textbox').last()).toHaveValue(
    /^> quote me\n\n@alice $/,
  );
});

// ISSUES.md: setting for whether clicking a message quotes it
test.fixme('clicking a message does nothing when click-to-quote is off', async () => {
  // Turn the new setting off, click a message, and expect the input to stay
  // empty. Quoting should still be available from the context menu.
});
