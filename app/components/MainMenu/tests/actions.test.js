/**
 * Main menu tests
 */

import {
  openMainMenu,
  closeMainMenu,
  openLocaleModal,
  closeLocaleModal,
} from '../actions';
import {
  OPEN_MAINMENU,
  CLOSE_MAINMENU,
  OPEN_LOCALEMODAL,
  CLOSE_LOCALEMODAL,
} from '../constants';

describe('MainMenu actions', () => {
  describe('Menu Action', () => {
    it('has a type of OPEN_MAINMENU', () => {
      const expected = {
        type: OPEN_MAINMENU,
      };
      expect(openMainMenu()).toEqual(expected);
    });

    it('has a type of CLOSE_MAINMENU', () => {
      const expected = {
        type: CLOSE_MAINMENU,
      };
      expect(closeMainMenu()).toEqual(expected);
    });
  });

  describe('Locale Modal Control', () => {
    it('has a type of OPEN_LOCALEMODAL', () => {
      const expected = {
        type: OPEN_LOCALEMODAL,
      };
      expect(openLocaleModal()).toEqual(expected);
    });

    it('has a type of CLOSE_LOCALEMODAL', () => {
      const expected = {
        type: CLOSE_LOCALEMODAL,
      };
      expect(closeLocaleModal()).toEqual(expected);
    });
  });
});
