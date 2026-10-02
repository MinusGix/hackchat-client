/**
 * App wrapper tests
 */

import React from 'react';

import renderWithProviders from '../../../../internals/testing/renderWithProviders';
import App from '../index';

describe('<App />', () => {
  it('should render the landing page at /', async () => {
    const { findByRole } = renderWithProviders(<App />, { route: '/' });
    // HomePage is lazy-loaded
    const joinButton = await findByRole('button', {
      name: 'Create or join a channel',
    });
    // no websocket session in tests, so joining is not possible yet
    expect(joinButton.disabled).toBe(true);
  });

  it('should route /settings to the settings page', async () => {
    const { findByRole } = renderWithProviders(<App />, {
      route: '/settings',
    });
    expect(
      await findByRole('heading', { name: 'Client Settings' }),
    ).not.toBeNull();
  });
});
