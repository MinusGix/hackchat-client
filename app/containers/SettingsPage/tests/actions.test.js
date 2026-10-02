/**
 * Settings page tests
 */

import {
  setUsername,
  setColor,
  setStoreChannelsFlag,
  addPrevChannel,
  clearPrevChannels,
  setTheme,
  setLtr,
  setWsPath,
  setLoadSafeImages,
  setLoadUnsafeImages,
} from '../actions';
import {
  SET_USERNAME,
  SET_COLOR,
  SET_CHANSTORFLAG,
  ADD_PREVCHANNEL,
  CLEAR_PREVCHANNELS,
  SET_THEME,
  SET_LTR,
  SET_WSPATH,
  SET_LOAD_SAFE_IMAGES,
  SET_LOAD_UNSAFE_IMAGES,
  USERNAME_LSLABEL,
  PREVCHANNELS_LSLABEL,
  THEME_LSLABEL,
} from '../constants';

const readLs = (label) => JSON.parse(localStorage.getItem(label));

describe('SettingsPage actions', () => {
  afterEach(() => {
    localStorage.clear();
  });

  describe('Simple setters', () => {
    it('build the expected actions', () => {
      expect(setUsername('bob')).toEqual({
        type: SET_USERNAME,
        username: 'bob',
      });
      expect(setColor('#fff')).toEqual({ type: SET_COLOR, color: '#fff' });
      expect(setStoreChannelsFlag(false)).toEqual({
        type: SET_CHANSTORFLAG,
        allowed: false,
      });
      expect(setTheme('light')).toEqual({
        type: SET_THEME,
        themeName: 'light',
      });
      expect(setLtr(false)).toEqual({ type: SET_LTR, isLtr: false });
      expect(setWsPath('ws://localhost:6060')).toEqual({
        type: SET_WSPATH,
        wsPath: 'ws://localhost:6060',
      });
      expect(setLoadSafeImages(false)).toEqual({
        type: SET_LOAD_SAFE_IMAGES,
        enabled: false,
      });
      expect(setLoadUnsafeImages(true)).toEqual({
        type: SET_LOAD_UNSAFE_IMAGES,
        enabled: true,
      });
    });

    it('persist their value to localStorage', () => {
      setUsername('bob');
      setTheme('hacker');
      expect(readLs(USERNAME_LSLABEL)).toBe('bob');
      expect(readLs(THEME_LSLABEL)).toBe('hacker');
    });
  });

  describe('Channel history', () => {
    it('adds a new channel and persists it', () => {
      expect(addPrevChannel('programming')).toEqual({
        type: ADD_PREVCHANNEL,
        newChannel: 'programming',
      });
      expect(readLs(PREVCHANNELS_LSLABEL)).toEqual(['programming']);
    });

    it('returns a NO_OP for a channel already in history', () => {
      addPrevChannel('programming');
      expect(addPrevChannel('programming')).toEqual({ type: 'NO_OP' });
      expect(readLs(PREVCHANNELS_LSLABEL)).toEqual(['programming']);
    });

    it('clears the history', () => {
      addPrevChannel('programming');
      expect(clearPrevChannels()).toEqual({ type: CLEAR_PREVCHANNELS });
      expect(readLs(PREVCHANNELS_LSLABEL)).toEqual([]);
    });
  });
});
