/**
 * Communication provider tests
 */

import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';

import setupStore from '../../../setupStore';
import { initialState } from '../reducer';
import CommunicationProvider from '../index';

// The real saga opens a websocket to the chat server on start
jest.mock('../saga', () =>
  // eslint-disable-next-line func-names
  jest.fn(function* () {}),
);

describe('<CommunicationProvider />', () => {
  let store;

  beforeEach(() => {
    store = setupStore();
  });

  it('should render its child without logging errors', () => {
    const spy = jest.spyOn(global.console, 'error');
    const { queryByText } = render(
      <Provider store={store}>
        <CommunicationProvider>
          <span>child</span>
        </CommunicationProvider>
      </Provider>,
    );
    expect(queryByText('child')).not.toBeNull();
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('should inject its reducer and saga into the store', () => {
    render(
      <Provider store={store}>
        <CommunicationProvider>
          <span>child</span>
        </CommunicationProvider>
      </Provider>,
    );
    expect(store.getState().communicationProvider).toEqual(initialState);
    expect(store.injectedSagas).toHaveProperty('communicationProvider');
  });
});
