/**
 * Shared render helper for component tests.
 *
 * Wraps the element under test in the providers the app normally supplies
 * (see app/app.js and containers/App): redux store, react-intl, the
 * styled-components theme and (optionally) a router.
 */

import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';

import setupStore from '../../app/setupStore';
import { translationMessages } from '../../app/i18n';
import defaultTheme from '../../app/themes/default';

export default function renderWithProviders(
  ui,
  {
    store = setupStore(),
    locale = 'en',
    messages = translationMessages.en,
    theme = defaultTheme,
    route = '/',
    withRouter = true,
    ...renderOptions
  } = {},
) {
  function Wrapper({ children }) {
    const content = (
      <Provider store={store}>
        <IntlProvider locale={locale} messages={messages}>
          <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </IntlProvider>
      </Provider>
    );

    if (!withRouter) return content;

    return (
      <MemoryRouter
        initialEntries={[route]}
        future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
      >
        {content}
      </MemoryRouter>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
