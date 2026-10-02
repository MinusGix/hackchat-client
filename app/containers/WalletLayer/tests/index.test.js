/**
 * WalletLayer tests
 */

import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';

import setupStore from '../../../setupStore';
import { initialState } from '../reducer';
import WalletLayer from '../index';

// The real saga probes browser wallet extensions on start
jest.mock('../saga', () =>
  // eslint-disable-next-line func-names
  jest.fn(function* () {}),
);

describe('<WalletLayer />', () => {
  it('should render its child and inject its reducer and saga', () => {
    const store = setupStore();
    const spy = jest.spyOn(global.console, 'error');
    const { queryByText } = render(
      <Provider store={store}>
        <WalletLayer>
          <span>child</span>
        </WalletLayer>
      </Provider>,
    );
    expect(queryByText('child')).not.toBeNull();
    expect(spy).not.toHaveBeenCalled();
    expect(store.getState().walletLayer).toEqual(initialState);
    expect(store.injectedSagas).toHaveProperty('walletLayer');
    spy.mockRestore();
  });
});
