/**
 * Communication provider tests
 */

import reducer, { initialState } from '../reducer';
import {
  CONNECTION_ERROR,
  CHANGE_CHANNEL,
  CONNECTED,
  SESSION_READY,
  SESSION_LS,
  JOINED_CHANNEL,
  USER_JOINED,
  USER_LEFT,
  WARNING,
  GOT_CAPTCHA,
  MESSAGE,
  IGNORE_USER,
  UNIGNORE_USER,
  UPDATE_MSG,
  LEAVE_CHANNEL,
  CLEAR_CHANNEL,
  CLEAR_AUTH_REQS,
} from '../constants';

const alice = { userid: 1, username: 'alice', online: true };
const bob = { userid: 2, username: 'bob', online: true };

const joined = (channel, users) => ({
  type: JOINED_CHANNEL,
  data: { channel, users },
});

const withChannels = (...names) =>
  names.reduce(
    (state, name) => reducer(state, joined(name, { 1: { ...alice } })),
    initialState,
  );

describe('communicationProviderReducer', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('returns the initial state', () => {
    expect(reducer(undefined, {})).toEqual({
      connected: false,
      channel: false,
      channels: {},
      meta: {
        channelCount: 0,
        userCount: 0,
        channels: [],
      },
      sessionReady: false,
      lastSession: false,
      pendingCaptcha: false,
      pendingPasswordReq: false,
    });
  });

  it('tracks connection and the focused channel', () => {
    let state = reducer(initialState, { type: CONNECTED });
    expect(state.connected).toBe(true);

    state = reducer(state, { type: CHANGE_CHANNEL, channel: 'lounge' });
    expect(state.channel).toBe('lounge');
  });

  describe('JOINED_CHANNEL', () => {
    it('creates the channel and clears pending auth requests', () => {
      let state = reducer(initialState, {
        type: GOT_CAPTCHA,
        data: { channel: 'lounge', text: '###' },
      });
      expect(state.pendingCaptcha).toEqual({ channel: 'lounge', text: '###' });

      state = reducer(state, joined('lounge', { 1: alice }));
      expect(state.channels.lounge).toEqual({
        users: { 1: alice },
        messages: [],
      });
      expect(state.pendingCaptcha).toBe(false);
      expect(state.pendingPasswordReq).toBe(false);
    });

    it('on rejoin, keeps history and marks missing users offline', () => {
      let state = reducer(initialState, joined('lounge', { 1: alice, 2: bob }));
      state = reducer(state, {
        type: MESSAGE,
        data: { channel: 'lounge', userid: 1, name: 'alice', content: 'hi' },
      });
      state = reducer(state, joined('lounge', { 2: { ...bob } }));

      expect(state.channels.lounge.messages).toHaveLength(1);
      expect(state.channels.lounge.users[1].online).toBe(false);
      expect(state.channels.lounge.users[2].online).toBe(true);
    });
  });

  it('records join/leave events and online status', () => {
    let state = withChannels('lounge');
    state = reducer(state, { type: USER_JOINED, channel: 'lounge', user: bob });
    expect(state.channels.lounge.users[2]).toEqual(bob);

    state = reducer(state, { type: USER_LEFT, channel: 'lounge', user: bob });
    expect(state.channels.lounge.users[2].online).toBe(false);
    expect(state.channels.lounge.messages.map((m) => m.type)).toEqual([
      'join',
      'leave',
    ]);
  });

  it('appends chat messages to the target channel', () => {
    const state = reducer(withChannels('lounge'), {
      type: MESSAGE,
      data: {
        channel: 'lounge',
        userid: 1,
        name: 'alice',
        content: 'hello',
        id: 7,
      },
    });
    expect(state.channels.lounge.messages).toEqual([
      {
        type: 'chat',
        data: {
          userid: 1,
          name: 'alice',
          content: 'hello',
          id: 7,
          time: expect.any(Number),
        },
      },
    ]);
  });

  it('broadcasts channel-less warnings to every channel without repeating', () => {
    const warning = { type: WARNING, data: { text: 'rate limited' } };
    let state = withChannels('lounge', 'programming');
    state = reducer(state, warning);
    state = reducer(state, warning);

    expect(state.channels.lounge.messages).toHaveLength(1);
    expect(state.channels.programming.messages).toEqual([
      { type: 'warn', data: { text: 'rate limited' } },
    ]);
  });

  it('adds a single disconnect warning per channel on CONNECTION_ERROR', () => {
    let state = reducer(withChannels('lounge'), { type: CONNECTED });
    state = reducer(state, { type: CONNECTION_ERROR });
    state = reducer(state, { type: CONNECTION_ERROR });

    expect(state.connected).toBe(false);
    expect(state.sessionReady).toBe(false);
    expect(state.channels.lounge.messages).toEqual([
      { type: 'warn', data: { id: 987654321 } },
    ]);
  });

  it('stores the session token and drops channels not restored', () => {
    const state = reducer(withChannels('lounge', 'programming'), {
      type: SESSION_READY,
      data: { token: 'abc', restored: true, channels: ['lounge'] },
    });

    expect(JSON.parse(localStorage.getItem(SESSION_LS))).toBe('abc');
    expect(state.sessionReady).toBe(true);
    expect(Object.keys(state.channels)).toEqual(['lounge']);
    expect(state.channels.lounge.messages).toEqual([
      { type: 'warn', data: { id: 987654322 } },
    ]);
  });

  it('ignores and unignores a user once each', () => {
    let state = withChannels('lounge');
    const ignore = { type: IGNORE_USER, channel: 'lounge', userid: 1 };
    state = reducer(state, ignore);
    state = reducer(state, ignore);
    expect(state.channels.lounge.users[1].blocked).toBe(true);
    expect(state.channels.lounge.messages).toHaveLength(1);

    state = reducer(state, {
      type: UNIGNORE_USER,
      channel: 'lounge',
      userid: 1,
    });
    expect(state.channels.lounge.users[1].blocked).toBe(false);
    expect(state.channels.lounge.messages).toHaveLength(2);
  });

  describe('UPDATE_MSG', () => {
    const base = () =>
      reducer(withChannels('lounge'), {
        type: MESSAGE,
        data: { channel: 'lounge', userid: 1, content: 'hello', id: 7 },
      });
    const update = (userid, mode, text) => ({
      type: UPDATE_MSG,
      channel: 'lounge',
      customId: '7',
      userid,
      mode,
      text,
    });
    const content = (state) => state.channels.lounge.messages[0].data.content;

    it('lets the author overwrite, append and prepend', () => {
      expect(content(reducer(base(), update(1, 'append', '!')))).toBe('hello!');
      expect(content(reducer(base(), update(1, 'prepend', '> ')))).toBe(
        '> hello',
      );
      expect(content(reducer(base(), update(1, 'overwrite', 'bye')))).toBe(
        'bye',
      );
    });

    it('rejects edits from another user', () => {
      const spy = jest.spyOn(global.console, 'log').mockImplementation();
      expect(content(reducer(base(), update(2, 'overwrite', 'pwned')))).toBe(
        'hello',
      );
      spy.mockRestore();
    });
  });

  it('switches focus to a remaining channel when leaving the current one', () => {
    let state = withChannels('lounge', 'programming');
    state = reducer(state, { type: CHANGE_CHANNEL, channel: 'lounge' });
    state = reducer(state, { type: LEAVE_CHANNEL, channel: 'lounge' });

    expect(state.channels).not.toHaveProperty('lounge');
    expect(state.channel).toBe('programming');

    state = reducer(state, { type: LEAVE_CHANNEL, channel: 'programming' });
    expect(state.channel).toBe(false);
  });

  it('clears channel history and auth requests', () => {
    let state = reducer(withChannels('lounge'), {
      type: WARNING,
      data: { channel: 'lounge', text: 'x' },
    });
    state = reducer(state, { type: CLEAR_CHANNEL, channel: 'lounge' });
    expect(state.channels.lounge.messages).toEqual([]);

    state = reducer(state, {
      type: GOT_CAPTCHA,
      data: { channel: 'lounge', text: '###' },
    });
    state = reducer(state, { type: CLEAR_AUTH_REQS });
    expect(state.pendingCaptcha).toBe(false);
  });
});
