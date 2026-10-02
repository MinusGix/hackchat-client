/**
 * Language provider tests
 */

import languageProviderReducer, { initialState } from '../reducer';
import {
  CHANGE_LOCALE,
  OPEN_LOCALE_MODAL,
  CLOSE_LOCALE_MODAL,
} from '../constants';

describe('languageProviderReducer', () => {
  it('returns the initial state', () => {
    expect(languageProviderReducer(undefined, {})).toEqual(initialState);
    expect(initialState).toEqual({
      locale: expect.any(String),
      isLocaleModalOpen: false,
    });
  });

  it('changes the locale', () => {
    expect(
      languageProviderReducer(undefined, {
        type: CHANGE_LOCALE,
        locale: 'de',
      }),
    ).toEqual({ ...initialState, locale: 'de' });
  });

  it('opens and closes the locale modal', () => {
    const opened = languageProviderReducer(initialState, {
      type: OPEN_LOCALE_MODAL,
    });
    expect(opened.isLocaleModalOpen).toBe(true);

    const closed = languageProviderReducer(opened, {
      type: CLOSE_LOCALE_MODAL,
    });
    expect(closed.isLocaleModalOpen).toBe(false);
  });
});
