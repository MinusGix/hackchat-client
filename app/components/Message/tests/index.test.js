/**
 * Message element tests
 */

import React from 'react';

import renderWithProviders from '../../../../internals/testing/renderWithProviders';
import { Message } from '../index';

const alice = { userid: 1, username: 'alice' };

describe('<Message />', () => {
  it('should render join and leave notices without logging errors', () => {
    const spy = jest.spyOn(global.console, 'error');
    const { queryByText } = renderWithProviders(
      <>
        <Message type="join" user={alice} payload={{ time: 0 }} />
        <Message type="leave" user={alice} payload={{ time: 0 }} />
      </>,
    );
    expect(queryByText('alice joined')).not.toBeNull();
    expect(queryByText('alice left')).not.toBeNull();
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('should split the author name out of an emote', () => {
    const { queryByText } = renderWithProviders(
      <Message
        type="emote"
        user={alice}
        payload={{ content: '@alice waves', time: 0 }}
      />,
    );
    expect(queryByText('@alice')).not.toBeNull();
    expect(queryByText('waves', { exact: false })).not.toBeNull();
  });

  it('should render nothing for blocked users', () => {
    const { container } = renderWithProviders(
      <Message
        type="join"
        user={{ ...alice, blocked: true }}
        payload={{ time: 0 }}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render nothing for unknown message types', () => {
    const { container } = renderWithProviders(
      <Message type="not-a-real-type" payload={{}} />,
    );
    expect(container.firstChild).toBeNull();
  });
});
