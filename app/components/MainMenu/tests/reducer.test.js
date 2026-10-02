/**
 * Main menu tests
 */

import mainMenuReducer, { initialState } from '../reducer';
import {
  OPEN_MAINMENU,
  CLOSE_MAINMENU,
  OPEN_LOCALEMODAL,
  CLOSE_LOCALEMODAL,
} from '../constants';

describe('mainMenuReducer', () => {
  it('returns the initial state', () => {
    expect(mainMenuReducer(undefined, {})).toEqual({
      mainMenuOpen: false,
      localeModelOpen: false,
    });
  });

  it('opens and closes the main menu', () => {
    const opened = mainMenuReducer(initialState, { type: OPEN_MAINMENU });
    expect(opened.mainMenuOpen).toBe(true);
    expect(mainMenuReducer(opened, { type: CLOSE_MAINMENU }).mainMenuOpen).toBe(
      false,
    );
  });

  it('opens and closes the locale modal', () => {
    const opened = mainMenuReducer(initialState, { type: OPEN_LOCALEMODAL });
    expect(opened.localeModelOpen).toBe(true);
    expect(
      mainMenuReducer(opened, { type: CLOSE_LOCALEMODAL }).localeModelOpen,
    ).toBe(false);
  });
});
