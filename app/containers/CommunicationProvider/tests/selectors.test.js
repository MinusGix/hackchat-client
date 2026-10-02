/**
 * Communication provider tests
 */

import {
  selectCommunicationProviderDomain,
  makeSelectChannel,
  makeSelectChannelData,
  makeSelectMeta,
  makeSelectSessionReady,
  makeSelectPendingCaptcha,
  makeSelectPendingPasswordReq,
} from '../selectors';
import { initialState } from '../reducer';

describe('selectCommunicationProviderDomain', () => {
  it('should select the communicationProvider state', () => {
    const substate = { channel: 'lounge' };
    expect(
      selectCommunicationProviderDomain({ communicationProvider: substate }),
    ).toBe(substate);
  });

  it('should fall back to the initial state when not injected', () => {
    expect(selectCommunicationProviderDomain({})).toBe(initialState);
  });
});

describe('CommunicationProvider field selectors', () => {
  it('should select individual fields', () => {
    const substate = {
      ...initialState,
      channel: 'lounge',
      channels: { lounge: { users: {}, messages: [] } },
      sessionReady: true,
      pendingCaptcha: { channel: 'lounge', text: '###' },
      pendingPasswordReq: { channel: 'lounge' },
    };
    const state = { communicationProvider: substate };

    expect(makeSelectChannel()(state)).toBe('lounge');
    expect(makeSelectChannelData()(state)).toBe(substate.channels);
    expect(makeSelectMeta()(state)).toBe(substate.meta);
    expect(makeSelectSessionReady()(state)).toBe(true);
    expect(makeSelectPendingCaptcha()(state)).toEqual({
      channel: 'lounge',
      text: '###',
    });
    expect(makeSelectPendingPasswordReq()(state)).toEqual({
      channel: 'lounge',
    });
  });
});
