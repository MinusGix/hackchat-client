/**
 * Home page tests
 */

import React from 'react';

import renderWithProviders from '../../../../internals/testing/renderWithProviders';
import HomePage, { mapDispatchToProps } from '../index';
import {
  sendChat,
  leaveChannel,
  clearChannel,
  changeChannel,
} from '../../CommunicationProvider/actions';
import { checkChannelInfo } from '../../WalletLayer/actions';

describe('<HomePage />', () => {
  it('should render the landing page without logging errors', () => {
    const spy = jest.spyOn(global.console, 'error');
    const { getByRole } = renderWithProviders(<HomePage />);
    expect(
      getByRole('button', { name: 'Create or join a channel' }),
    ).not.toBeNull();
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  describe('mapDispatchToProps', () => {
    let dispatch;
    let props;

    beforeEach(() => {
      dispatch = jest.fn();
      props = mapDispatchToProps(dispatch);
    });

    it('should dispatch channel changes', () => {
      props.onChangeChannel('lounge');
      expect(dispatch).toHaveBeenCalledWith(changeChannel('lounge'));
    });

    it('should send ordinary messages as chat', () => {
      props.onSendMessage('lounge', 'hello');
      expect(dispatch).toHaveBeenCalledWith(sendChat('lounge', 'hello'));
    });

    it('should handle client-side slash commands locally', () => {
      props.onSendMessage('lounge', '/leave');
      props.onSendMessage('lounge', ' /clear ');
      props.onSendMessage('lounge', '/channelinfo');

      expect(dispatch.mock.calls.map(([action]) => action)).toEqual([
        leaveChannel('lounge'),
        clearChannel('lounge'),
        checkChannelInfo('lounge'),
      ]);
    });
  });
});
