/**
 * Settings page tests
 */

import settingsPageReducer, { settingsInitialState } from '../reducer';
import {
  SET_USERNAME,
  SET_THEME,
  ADD_PREVCHANNEL,
  CLEAR_PREVCHANNELS,
  SET_MENUBTNPOS,
  SET_NOTIFY,
} from '../constants';

describe('settingsPageReducer', () => {
  it('returns the initial state', () => {
    expect(settingsPageReducer(undefined, {})).toEqual(settingsInitialState);
  });

  it('has sensible defaults with empty localStorage', () => {
    expect(settingsInitialState).toEqual(
      expect.objectContaining({
        username: '',
        password: '',
        color: expect.stringMatching(/^#[0-9a-f]+$/),
        storeChannels: true,
        prevChannels: [],
        theme: 'default',
        allowKatex: true,
        allowMarkdown: true,
        allowExternalCode: false,
        menuLeft: false,
        highlightMentions: true,
        wsPath: 'wss://hack.chat/chat-ws',
        notifyEnabled: true,
        loadSafeImages: true,
        loadUnsafeImages: false,
      }),
    );
  });

  it('updates simple settings', () => {
    let state = settingsPageReducer(settingsInitialState, {
      type: SET_USERNAME,
      username: 'bob',
    });
    state = settingsPageReducer(state, { type: SET_THEME, themeName: 'light' });
    state = settingsPageReducer(state, { type: SET_MENUBTNPOS, newPos: true });
    state = settingsPageReducer(state, { type: SET_NOTIFY, enabled: false });

    expect(state).toEqual({
      ...settingsInitialState,
      username: 'bob',
      theme: 'light',
      menuLeft: true,
      notifyEnabled: false,
    });
  });

  it('appends to and clears channel history without mutating', () => {
    const added = settingsPageReducer(settingsInitialState, {
      type: ADD_PREVCHANNEL,
      newChannel: 'programming',
    });
    expect(added.prevChannels).toEqual(['programming']);
    expect(settingsInitialState.prevChannels).toEqual([]);

    const cleared = settingsPageReducer(added, { type: CLEAR_PREVCHANNELS });
    expect(cleared.prevChannels).toEqual([]);
  });
});
