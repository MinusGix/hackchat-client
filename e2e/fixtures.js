/**
 * Shared Playwright fixtures: a fake hack.chat server and helpers for
 * getting the client into a joined channel.
 *
 * In a browser, hackchat-engine takes its gateway from /config.json (the
 * saved ws path setting is only applied on later reconnects), so we serve a
 * config pointing at a fake URL, seed the setting to match, and intercept
 * that socket with page.routeWebSocket. Payload shapes
 * mirror the real server (hack-chat/main: commands/core/{session,join,chat}).
 */

import zlib from 'zlib';
import * as base from '@playwright/test';

const GATEWAY = 'ws://fake.hack.chat/chat-ws';
const WSPATH_LSLABEL = 'app/Settings/WSPATH_LSLABEL';
const SESSION_TOKEN = 'fake-session-token';

let nextId = 1;

function user(nick, extra = {}) {
  return {
    nick,
    trip: '',
    uType: 'user',
    hash: `hash-${nick}`,
    level: 100,
    userid: 1000 + nick.length * 7 + nick.charCodeAt(0),
    isBot: false,
    color: false,
    flair: '',
    effect: 0,
    online: true,
    ...extra,
  };
}

class FakeServer {
  constructor() {
    this.ws = null;
    this.channel = null;
    this.me = null;
    this.users = [user('alice'), user('bob')];
    this.received = [];
    this.offline = false;
    this.refusedConnections = 0;
    this.connected = new Promise((resolve) => {
      this.resolveConnected = resolve;
    });
  }

  attach(ws) {
    if (this.offline) {
      this.refusedConnections += 1;
      // Pass through to the (unresolvable) real host so the browser fires
      // a genuine error + close, like an actual network failure.
      ws.connectToServer();
      return;
    }
    this.ws = ws;
    this.resolveConnected();
    ws.onMessage((raw) => {
      const packet = JSON.parse(raw);
      this.received.push(packet);
      this.handle(packet);
    });
  }

  send(payload) {
    if (!this.ws) throw new Error('client is not connected');
    this.ws.send(JSON.stringify({ time: Date.now(), ...payload }));
  }

  handle(packet) {
    switch (packet.cmd) {
      case 'session':
        // like the real server, a valid token rejoins the session's channels
        if (packet.token === SESSION_TOKEN && this.channel) {
          this.sendOnlineSet();
          this.send({
            cmd: 'session',
            restored: true,
            token: SESSION_TOKEN,
            channels: [this.channel],
          });
        } else {
          this.send({
            cmd: 'session',
            restored: false,
            token: '',
            channels: [],
          });
        }
        break;

      case 'getchannels':
        this.send({
          cmd: 'publicchannels',
          list: [
            { name: 'lounge', count: 3 },
            { name: 'programming', count: 1 },
          ],
        });
        break;

      case 'join':
        this.channel = packet.channel;
        this.me = user(packet.nick);
        this.sendOnlineSet();
        this.send({
          cmd: 'session',
          restored: false,
          token: SESSION_TOKEN,
          channels: [this.channel],
        });
        break;

      case 'chat':
        this.chat(this.me.nick, packet.text, { userid: this.me.userid });
        break;

      default:
        break;
    }
  }

  sendOnlineSet() {
    const users = [
      ...this.users.map((u) => ({ channel: this.channel, isme: false, ...u })),
      { channel: this.channel, isme: true, ...this.me },
    ];
    this.send({
      cmd: 'onlineSet',
      nicks: users.map((u) => u.nick),
      users,
      channel: this.channel,
    });
  }

  /** Broadcast a chat message as `nick` into the joined channel */
  chat(nick, text, extra = {}) {
    const id = nextId;
    nextId += 1;
    this.send({
      cmd: 'chat',
      nick,
      uType: 'user',
      userid: user(nick).userid,
      channel: this.channel,
      text,
      level: 100,
      flair: '',
      id,
      ...extra,
    });
    return id;
  }

  /** Simulate the server dropping the connection */
  close(code = 1006) {
    this.ws.close({ code });
  }

  /** Drop the connection and refuse reconnects until goOnline() */
  goOffline() {
    this.offline = true;
    this.close();
  }

  goOnline() {
    this.offline = false;
    this.connected = new Promise((resolve) => {
      this.resolveConnected = resolve;
    });
  }
}

const test = base.test.extend({
  // Auto so that no test can accidentally talk to the real hack.chat
  server: [
    async ({ page }, use) => {
      const server = new FakeServer();

      await page.route('**/config.json', (route) =>
        route.fulfill({ json: { gateway: GATEWAY } }),
      );
      await page.routeWebSocket(GATEWAY, (ws) => server.attach(ws));
      await page.addInitScript(
        ([key, value]) => {
          if (!sessionStorage.getItem('e2e-seeded')) {
            localStorage.setItem(key, JSON.stringify(value));
            sessionStorage.setItem('e2e-seeded', '1');
          }
        },
        [WSPATH_LSLABEL, GATEWAY],
      );

      await use(server);
    },
    { auto: true },
  ],
});

/** Encode a solid-colour PNG, so image tests don't need fixture files */
function solidPng(width, height) {
  const crcTable = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  const crc32 = (buf) => {
    let c = 0xffffffff;
    for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body));
    return Buffer.concat([len, body, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // RGB
  const row = Buffer.concat([Buffer.from([0]), Buffer.alloc(width * 3, 0x80)]);
  const raw = Buffer.concat(Array.from({ length: height }, () => row));
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/**
 * Serve images from a whitelisted host (so the client embeds them) after
 * `delay` ms. Returns the URL to use in a message.
 */
async function routeSlowImage(
  page,
  { name = 'slow', width = 600, height = 400, delay = 500 } = {},
) {
  const url = `https://i.imgur.com/e2e-${name}.png`;
  const png = solidPng(width, height);
  await page.route(url, async (route) => {
    await new Promise((r) => setTimeout(r, delay));
    await route.fulfill({ contentType: 'image/png', body: png });
  });
  return url;
}

const chatScroller = (page) => page.getByTestId('chat-scroll');

/** Pixels between the bottom of the chat viewport and the end of the chat */
function distanceFromBottom(page) {
  return chatScroller(page).evaluate(
    (el) => el.scrollHeight - el.scrollTop - el.clientHeight,
  );
}

/** Send `count` short messages and wait for the last one to render */
async function fillHistory(page, server, count, prefix = 'filler') {
  for (let i = 0; i < count; i += 1) {
    server.chat(i % 2 ? 'bob' : 'alice', `${prefix} ${i}`);
  }
  await base
    .expect(
      chatScroller(page).getByText(`${prefix} ${count - 1}`, { exact: true }),
    )
    .toBeVisible();
}

/**
 * Join `channel` as `nick` through the join menu and wait for the chat view
 */
async function joinChannel(
  page,
  server,
  { nick = 'tester', channel = 'e2e' } = {},
) {
  await page.goto('/');
  await server.connected;
  await page.getByText('Create or join a channel').click();
  await page.locator('input[name="username"]').fill(nick);
  await page.locator('input[name="channel"]').fill(channel);
  await page.locator('input[name="channel"]').press('Enter');
  await base.expect.poll(() => server.channel).toBe(channel);
}

const { expect } = base;

export {
  test,
  expect,
  user,
  joinChannel,
  fillHistory,
  chatScroller,
  distanceFromBottom,
  routeSlowImage,
  GATEWAY,
};
