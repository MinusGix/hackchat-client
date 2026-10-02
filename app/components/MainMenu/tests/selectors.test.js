/**
 * Main menu tests
 */

import {
  selectMainMenuDomain,
  makeSelectMainMenuStatus,
  makeSelectLocaleMenuStatus,
} from '../selectors';
import { initialState } from '../reducer';

describe('selectMainMenuDomain', () => {
  it('should select the main menu state', () => {
    const mainMenuState = {
      mainMenuOpen: true,
      localeModelOpen: false,
    };
    const mockedState = {
      mainMenu: mainMenuState,
    };
    expect(selectMainMenuDomain(mockedState)).toEqual(mainMenuState);
    expect(makeSelectMainMenuStatus()(mockedState)).toBe(true);
    expect(makeSelectLocaleMenuStatus()(mockedState)).toBe(false);
  });

  it('should fall back to the initial state', () => {
    expect(selectMainMenuDomain({})).toBe(initialState);
  });
});
