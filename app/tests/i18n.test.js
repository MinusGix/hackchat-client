/**
 * Test internationalization
 */

import { appLocales, translationMessages } from '../i18n';

jest.mock('../translations/en.json', () => ({
  message1: 'English one',
  message2: 'English two',
}));

jest.mock('../translations/de.json', () => ({
  message1: 'Deutsch eins',
  message2: '',
}));

describe('translationMessages', () => {
  it('should provide messages for every supported locale', () => {
    appLocales.forEach((locale) => {
      expect(translationMessages).toHaveProperty([locale]);
    });
  });

  it('should use the English messages as-is for the default locale', () => {
    expect(translationMessages.en).toEqual(
      expect.objectContaining({
        message1: 'English one',
        message2: 'English two',
      }),
    );
  });

  it('should fall back to English for missing translations', () => {
    expect(translationMessages.de).toEqual(
      expect.objectContaining({
        message1: 'Deutsch eins',
        message2: 'English two',
      }),
    );
  });
});
