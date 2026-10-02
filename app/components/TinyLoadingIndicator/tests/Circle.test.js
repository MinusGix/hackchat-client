/**
 * Loading indicator tests
 */

import React from 'react';

import renderWithProviders from '../../../../internals/testing/renderWithProviders';
import Circle from '../Circle';

describe('<Circle />', () => {
  it('should render a <div> tag', () => {
    const { container } = renderWithProviders(<Circle />);
    expect(container.firstChild.tagName).toEqual('DIV');
  });

  it('should have a class attribute', () => {
    const { container } = renderWithProviders(<Circle />);
    expect(container.firstChild.hasAttribute('class')).toBe(true);
  });

  it('should not forward transient ($-prefixed) props to the DOM', () => {
    const { container } = renderWithProviders(
      <Circle $rotate={30} $delay={-1} />,
    );
    expect(container.firstChild.hasAttribute('$rotate')).toBe(false);
    expect(container.firstChild.hasAttribute('$delay')).toBe(false);
  });
});
