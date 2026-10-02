/**
 * Language provider tests
 */

import { changeLocale, openLocaleModal, closeLocaleModal } from '../actions';
import {
  CHANGE_LOCALE,
  PREVLANG_LSLABEL,
  OPEN_LOCALE_MODAL,
  CLOSE_LOCALE_MODAL,
} from '../constants';

describe('LanguageProvider actions', () => {
  describe('Change Local Action', () => {
    afterEach(() => {
      localStorage.clear();
    });

    it('has a type of CHANGE_LOCALE', () => {
      const expected = {
        type: CHANGE_LOCALE,
        locale: 'de',
      };
      expect(changeLocale('de')).toEqual(expected);
    });

    it('persists the chosen locale to localStorage', () => {
      changeLocale('fr');
      expect(JSON.parse(localStorage.getItem(PREVLANG_LSLABEL))).toBe('fr');
    });
  });

  describe('Locale modal', () => {
    it('has a type of OPEN_LOCALE_MODAL', () => {
      expect(openLocaleModal()).toEqual({ type: OPEN_LOCALE_MODAL });
    });

    it('has a type of CLOSE_LOCALE_MODAL', () => {
      expect(closeLocaleModal()).toEqual({ type: CLOSE_LOCALE_MODAL });
    });
  });
});
