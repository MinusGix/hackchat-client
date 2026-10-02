/**
 * WalletLayer tests
 */

import {
  selectWalletLayerDomain,
  makeSelectWallets,
  makeSelectPayments,
  makeSelectConnectedTo,
  makeSelectConnectedAccount,
  makeSelectWaitingOnWallet,
  makeSelectAuthToken,
  makeSelectPendingSignRequest,
} from '../selectors';
import { initialState } from '../reducer';

describe('selectWalletLayerDomain', () => {
  it('should select the walletLayer state', () => {
    const substate = { connectedTo: 'Phantom' };
    expect(selectWalletLayerDomain({ walletLayer: substate })).toBe(substate);
  });

  it('should fall back to the initial state when not injected', () => {
    expect(selectWalletLayerDomain({})).toBe(initialState);
  });
});

describe('WalletLayer field selectors', () => {
  it('should select individual fields', () => {
    const substate = {
      connectedTo: 'Phantom',
      connectedAccount: 'acct',
      uiWallets: [{ name: 'Phantom' }],
      recentPayments: [{ amount: 1 }],
      waitingOnWallet: true,
      authToken: 'tok',
      pendingSignRequest: { message: 'x' },
    };
    const state = { walletLayer: substate };

    expect(makeSelectWallets()(state)).toBe(substate.uiWallets);
    expect(makeSelectPayments()(state)).toBe(substate.recentPayments);
    expect(makeSelectConnectedTo()(state)).toBe('Phantom');
    expect(makeSelectConnectedAccount()(state)).toBe('acct');
    expect(makeSelectWaitingOnWallet()(state)).toBe(true);
    expect(makeSelectAuthToken()(state)).toBe('tok');
    expect(makeSelectPendingSignRequest()(state)).toBe(
      substate.pendingSignRequest,
    );
  });
});
