/**
 * WalletLayer tests
 */

import walletLayerReducer, { initialState } from '../reducer';
import {
  WAITING_ON_WALLET,
  CONNECT_SUCCESS,
  DISCONNECT_SUCCESS,
  WALLETS_SETTLED,
  PAYMENT_SENT,
  SET_ACCOUNT,
  SET_AUTH_TOKEN,
  SET_PENDING_SIGN_REQUEST,
  SIGN_MESSAGE_REQUEST,
} from '../constants';

describe('walletLayerReducer', () => {
  it('returns the initial state', () => {
    expect(walletLayerReducer(undefined, {})).toEqual({
      connectedTo: false,
      connectedAccount: false,
      uiWallets: [],
      recentPayments: [],
      waitingOnWallet: false,
      authToken: null,
      pendingSignRequest: false,
    });
  });

  it('tracks connect and disconnect', () => {
    let state = walletLayerReducer(initialState, {
      type: CONNECT_SUCCESS,
      wallet: 'Phantom',
    });
    state = walletLayerReducer(state, { type: SET_ACCOUNT, account: 'acct' });
    expect(state.connectedTo).toBe('Phantom');
    expect(state.connectedAccount).toBe('acct');

    state = walletLayerReducer(state, { type: DISCONNECT_SUCCESS });
    expect(state.connectedTo).toBe(false);
    expect(state.connectedAccount).toBe(false);
  });

  it('stores wallets, payments, waiting flag and auth token', () => {
    let state = walletLayerReducer(initialState, {
      type: WALLETS_SETTLED,
      wallets: [{ name: 'Phantom' }],
    });
    state = walletLayerReducer(state, {
      type: PAYMENT_SENT,
      details: { amount: 1 },
    });
    state = walletLayerReducer(state, {
      type: WAITING_ON_WALLET,
      waiting: true,
    });
    state = walletLayerReducer(state, { type: SET_AUTH_TOKEN, token: 'tok' });

    expect(state).toEqual({
      ...initialState,
      uiWallets: [{ name: 'Phantom' }],
      recentPayments: [{ amount: 1 }],
      waitingOnWallet: true,
      authToken: 'tok',
    });
    expect(initialState.recentPayments).toEqual([]);
  });

  it('clears a pending sign request once signing is requested', () => {
    let state = walletLayerReducer(initialState, {
      type: SET_PENDING_SIGN_REQUEST,
      payload: { message: 'sign me' },
    });
    expect(state.pendingSignRequest).toEqual({ message: 'sign me' });

    state = walletLayerReducer(state, { type: SIGN_MESSAGE_REQUEST });
    expect(state.pendingSignRequest).toBe(false);
  });
});
