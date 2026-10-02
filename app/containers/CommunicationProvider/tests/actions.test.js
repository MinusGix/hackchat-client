/**
 * Communication provider tests
 */

import {
  changeChannel,
  joinChannel,
  leaveChannel,
  changeColor,
  sendChat,
  enableCaptcha,
  disableCaptcha,
  lockChannel,
  unlockChannel,
  inviteUser,
  ignoreUser,
  unignoreUser,
  kickUser,
  banUser,
  muteUser,
  unmuteUser,
  uwuifyUser,
  clearChannel,
  clearAuthReqs,
} from '../actions';
import {
  CHANGE_CHANNEL,
  START_JOIN,
  LEAVE_CHANNEL,
  CHANGE_COLOR,
  SEND_CHAT,
  ENABLE_CAPTCHA,
  DISABLE_CAPTCHA,
  LOCK_CHANNEL,
  UNLOCK_CHANNEL,
  INVITE_USER,
  IGNORE_USER,
  UNIGNORE_USER,
  KICK_USER,
  BAN_USER,
  MUTE_USER,
  UNMUTE_USER,
  UWUIFY_USER,
  CLEAR_CHANNEL,
  CLEAR_AUTH_REQS,
} from '../constants';

describe('CommunicationProvider actions', () => {
  describe('Channel actions', () => {
    it('has a type of CHANGE_CHANNEL', () => {
      expect(changeChannel('lounge')).toEqual({
        type: CHANGE_CHANNEL,
        channel: 'lounge',
      });
    });

    it('has a type of START_JOIN', () => {
      expect(joinChannel('bob', 'pw', 'lounge', 'ff0000')).toEqual({
        type: START_JOIN,
        username: 'bob',
        password: 'pw',
        channel: 'lounge',
        color: 'ff0000',
      });
    });

    it('has a type of LEAVE_CHANNEL', () => {
      expect(leaveChannel('lounge')).toEqual({
        type: LEAVE_CHANNEL,
        channel: 'lounge',
      });
    });

    it('has a type of CHANGE_COLOR', () => {
      expect(changeColor('ff0000', 'lounge')).toEqual({
        type: CHANGE_COLOR,
        color: 'ff0000',
        channel: 'lounge',
      });
    });

    it('has a type of SEND_CHAT', () => {
      expect(sendChat('lounge', 'hi')).toEqual({
        type: SEND_CHAT,
        channel: 'lounge',
        message: 'hi',
      });
    });

    it('has a type of CLEAR_CHANNEL', () => {
      expect(clearChannel('lounge')).toEqual({
        type: CLEAR_CHANNEL,
        channel: 'lounge',
      });
    });

    it('has a type of CLEAR_AUTH_REQS', () => {
      expect(clearAuthReqs()).toEqual({ type: CLEAR_AUTH_REQS });
    });
  });

  describe('Moderation actions taking a channel', () => {
    it.each([
      [enableCaptcha, ENABLE_CAPTCHA],
      [disableCaptcha, DISABLE_CAPTCHA],
      [lockChannel, LOCK_CHANNEL],
      [unlockChannel, UNLOCK_CHANNEL],
    ])('%p has the right type', (creator, type) => {
      expect(creator('lounge')).toEqual({ type, channel: 'lounge' });
    });
  });

  describe('User actions taking a userid', () => {
    it.each([
      [inviteUser, INVITE_USER],
      [ignoreUser, IGNORE_USER],
      [unignoreUser, UNIGNORE_USER],
    ])('%p has the right type', (creator, type) => {
      expect(creator('lounge', 42)).toEqual({
        type,
        channel: 'lounge',
        userid: 42,
      });
    });
  });

  describe('User actions taking a user', () => {
    const user = { userid: 42, username: 'bob' };

    it.each([
      [kickUser, KICK_USER],
      [banUser, BAN_USER],
      [muteUser, MUTE_USER],
      [unmuteUser, UNMUTE_USER],
      [uwuifyUser, UWUIFY_USER],
    ])('%p has the right type', (creator, type) => {
      expect(creator('lounge', user)).toEqual({
        type,
        channel: 'lounge',
        user,
      });
    });
  });
});
