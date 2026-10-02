/**
 * Locale modal tests
 */

import React from 'react';
import { fireEvent } from '@testing-library/react';

import renderWithProviders from '../../../../internals/testing/renderWithProviders';
import ConnectedLocaleModal, {
  LocaleModal,
  mapDispatchToProps,
} from '../index';
import { appLocales } from '../../../i18n';
import {
  CHANGE_LOCALE,
  CLOSE_LOCALE_MODAL,
} from '../../../containers/LanguageProvider/constants';

describe('<LocaleModal />', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('should render a button per supported locale without logging errors', () => {
    const spy = jest.spyOn(global.console, 'error');
    const { getAllByRole } = renderWithProviders(<ConnectedLocaleModal />);
    expect(getAllByRole('button')).toHaveLength(appLocales.length);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('should change locale and close when a language is picked', () => {
    const onLocaleToggle = jest.fn();
    const doToggle = jest.fn();
    const { getAllByRole } = renderWithProviders(
      <LocaleModal
        locale="en"
        onLocaleToggle={onLocaleToggle}
        doToggle={doToggle}
        intl={{ formatMessage: (m) => m.defaultMessage }}
      />,
    );
    const index = appLocales.indexOf('de');
    fireEvent.click(getAllByRole('button')[index]);
    expect(onLocaleToggle).toHaveBeenCalledWith('de');
    expect(doToggle).toHaveBeenCalledTimes(1);
  });

  describe('mapDispatchToProps', () => {
    it('should dispatch locale changes and modal close', () => {
      const dispatch = jest.fn();
      const props = mapDispatchToProps(dispatch);
      props.onLocaleToggle('fr');
      props.doToggle();
      expect(dispatch).toHaveBeenCalledWith({
        type: CHANGE_LOCALE,
        locale: 'fr',
      });
      expect(dispatch).toHaveBeenCalledWith({ type: CLOSE_LOCALE_MODAL });
    });
  });
});
