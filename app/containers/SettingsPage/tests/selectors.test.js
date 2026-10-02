/**
 * Settings page tests
 */

import {
  selectSettingsPageDomain,
  makeSelectCachedUsername,
  makeSelectCachedTheme,
} from '../selectors';
import { settingsInitialState } from '../reducer';

describe('selectSettingsPageDomain', () => {
  it('should select the settingsPage state', () => {
    const settingsState = {};
    const mockedState = {
      settingsPage: settingsState,
    };
    expect(selectSettingsPageDomain(mockedState)).toEqual(settingsState);
  });

  it('should fall back to the initial state when not injected', () => {
    expect(selectSettingsPageDomain({})).toBe(settingsInitialState);
  });
});

describe('settings field selectors', () => {
  it('should select individual settings', () => {
    const mockedState = {
      settingsPage: { username: 'bob', theme: 'hacker' },
    };
    expect(makeSelectCachedUsername()(mockedState)).toBe('bob');
    expect(makeSelectCachedTheme()(mockedState)).toBe('hacker');
  });
});
