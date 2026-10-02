/**
 * Main menu tests
 */

import React from 'react';

import renderWithProviders from '../../../../internals/testing/renderWithProviders';
import MainMenu from '../index';

const channelData = {
  programming: {
    users: {
      1: { userid: 1, username: 'alice', online: true, mine: true },
      2: { userid: 2, username: 'bob', online: true },
      3: { userid: 3, username: 'carol', online: false },
    },
  },
  lounge: { users: {} },
};

describe('<MainMenu />', () => {
  it('should render without logging errors', () => {
    const spy = jest.spyOn(global.console, 'error');
    renderWithProviders(
      <MainMenu channel="programming" channelData={channelData} />,
    );
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('should list joined channels and only online users', () => {
    const { queryByText } = renderWithProviders(
      <MainMenu channel="programming" channelData={channelData} />,
    );
    expect(queryByText('lounge')).not.toBeNull();
    expect(queryByText('alice')).not.toBeNull();
    expect(queryByText('bob')).not.toBeNull();
    expect(queryByText('carol')).toBeNull();
  });
});
