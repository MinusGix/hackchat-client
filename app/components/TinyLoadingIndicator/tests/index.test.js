/**
 * Loading indicator tests
 */

import React from 'react';

import renderWithProviders from '../../../../internals/testing/renderWithProviders';
import LoadingIndicator from '../index';

describe('<LoadingIndicator />', () => {
  it('should render a wrapper with twelve circles', () => {
    const { container } = renderWithProviders(<LoadingIndicator />);
    expect(container.firstChild.tagName).toEqual('DIV');
    expect(container.firstChild.children).toHaveLength(12);
  });
});
