/**
 * WalletLayer tests
 */

import {
  connectWallet,
  setSelectedAccount,
  disconnectWallet,
  cancelWaiting,
  doTransfer,
  signMessageRequest,
  setAuthToken,
  setActiveAccount,
  signMessageSuccess,
  signMessageFailure,
  setPendingSignRequest,
  checkChannelInfo,
} from '../actions';
import {
  CONNECT_WALLET,
  CONNECT_ACCOUNT,
  DISCONNECT_WALLET,
  WAITING_ON_WALLET,
  DO_TX,
  SIGN_MESSAGE_REQUEST,
  SET_AUTH_TOKEN,
  SET_ACTIVE_ACCOUNT,
  SIGN_MESSAGE_SUCCESS,
  SIGN_MESSAGE_FAILURE,
  SET_PENDING_SIGN_REQUEST,
  CHECK_CHANNEL_INFO,
} from '../constants';

describe('WalletLayer actions', () => {
  it('builds connection actions', () => {
    expect(connectWallet('Phantom')).toEqual({
      type: CONNECT_WALLET,
      name: 'Phantom',
    });
    expect(setSelectedAccount('acct')).toEqual({
      type: CONNECT_ACCOUNT,
      account: 'acct',
    });
    expect(setActiveAccount('acct')).toEqual({
      type: SET_ACTIVE_ACCOUNT,
      account: 'acct',
    });
    expect(disconnectWallet()).toEqual({ type: DISCONNECT_WALLET });
    expect(cancelWaiting()).toEqual({
      type: WAITING_ON_WALLET,
      waiting: false,
    });
  });

  it('builds transaction and signing actions', () => {
    expect(doTransfer('payload')).toEqual({
      type: DO_TX,
      encodedPayload: 'payload',
    });
    expect(signMessageRequest('wallet', 'msg')).toEqual({
      type: SIGN_MESSAGE_REQUEST,
      wallet: 'wallet',
      message: 'msg',
    });
    expect(
      signMessageSuccess({ signature: 'sig', signedMessage: 'msg' }),
    ).toEqual({
      type: SIGN_MESSAGE_SUCCESS,
      signature: 'sig',
      signedMessage: 'msg',
    });
    expect(signMessageFailure('nope')).toEqual({
      type: SIGN_MESSAGE_FAILURE,
      error: 'nope',
    });
    expect(setPendingSignRequest({ id: 1 })).toEqual({
      type: SET_PENDING_SIGN_REQUEST,
      payload: { id: 1 },
    });
  });

  it('builds misc actions', () => {
    expect(setAuthToken('tok')).toEqual({ type: SET_AUTH_TOKEN, token: 'tok' });
    expect(checkChannelInfo('lounge')).toEqual({
      type: CHECK_CHANNEL_INFO,
      channel: 'lounge',
    });
  });
});
