/**
 * Chat input tests
 */

import React from 'react';
import { fireEvent } from '@testing-library/react';

import renderWithProviders from '../../../../internals/testing/renderWithProviders';
import ChatInput from '../index';

const setup = () => {
  const onSendMessage = jest.fn();
  const utils = renderWithProviders(
    <ChatInput channel="lounge" users={{}} onSendMessage={onSendMessage} />,
  );
  const input = utils.container.querySelector('textarea');
  const type = (value) => fireEvent.change(input, { target: { value } });
  const press = (key) => fireEvent.keyDown(input, { key });
  return { ...utils, input, type, press, onSendMessage };
};

describe('<ChatInput />', () => {
  it('should render without logging errors', () => {
    const spy = jest.spyOn(global.console, 'error');
    const { input } = setup();
    expect(input).not.toBeNull();
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('should send the trimmed message on Enter and clear the input', () => {
    const { input, type, press, onSendMessage } = setup();
    type('  hello world  ');
    press('Enter');
    expect(onSendMessage).toHaveBeenCalledWith('lounge', 'hello world');
    expect(input.value).toBe('');
  });

  it('should not send whitespace-only input', () => {
    const { type, press, onSendMessage } = setup();
    type('   ');
    press('Enter');
    expect(onSendMessage).not.toHaveBeenCalled();
  });

  it('should recall previously sent messages with ArrowUp', () => {
    const { input, type, press } = setup();
    type('first');
    press('Enter');
    type('second');
    press('Enter');

    input.setSelectionRange(0, 0);
    press('ArrowUp');
    expect(input.value).toBe('second');
    press('ArrowUp');
    expect(input.value).toBe('first');
  });
});
