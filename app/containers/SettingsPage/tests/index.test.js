/**
 * Settings page tests
 */

import React from 'react';

import renderWithProviders from '../../../../internals/testing/renderWithProviders';
import SettingsPage from '../index';

describe('<SettingsPage />', () => {
  it('should render without logging errors', () => {
    const spy = jest.spyOn(global.console, 'error');
    const { store, getByRole } = renderWithProviders(<SettingsPage />, {
      route: '/settings',
    });
    expect(spy).not.toHaveBeenCalled();
    expect(getByRole('heading', { name: 'Client Settings' })).not.toBeNull();
    expect(store.getState()).toHaveProperty('settingsPage');
    spy.mockRestore();
  });
});
