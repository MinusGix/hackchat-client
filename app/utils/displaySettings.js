/**
 * Settings that affect how messages are rendered, provided through context.
 *
 * Message components used to read these with useSelector directly. Every
 * subscription runs on every store update, so with a few per message (one
 * per bold/italic span, image, ...) a long channel ran thousands of
 * selectors for each incoming message. One subscription here replaces them.
 */

import React, { createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import { shallowEqual, useSelector } from 'react-redux';

import { selectSettingsPageDomain } from 'containers/SettingsPage/selectors';

const DEFAULTS = {
  allowMarkdown: true,
  allowKatex: true,
  allowExternalCode: false,
  loadSafeImages: true,
  loadUnsafeImages: false,
  highlightMentions: true,
  username: '',
};

const selectDisplaySettings = (state) => {
  const settings = selectSettingsPageDomain(state);
  return {
    allowMarkdown: settings.allowMarkdown ?? DEFAULTS.allowMarkdown,
    allowKatex: settings.allowKatex ?? DEFAULTS.allowKatex,
    allowExternalCode: settings.allowExternalCode ?? DEFAULTS.allowExternalCode,
    loadSafeImages: settings.loadSafeImages ?? DEFAULTS.loadSafeImages,
    loadUnsafeImages: settings.loadUnsafeImages ?? DEFAULTS.loadUnsafeImages,
    highlightMentions: settings.highlightMentions ?? DEFAULTS.highlightMentions,
    username: settings.username ?? DEFAULTS.username,
  };
};

const DisplaySettingsContext = createContext(DEFAULTS);

export function DisplaySettingsProvider({ children }) {
  // shallowEqual keeps the same object (and so skips re-rendering
  // consumers) unless one of these settings actually changed
  const settings = useSelector(selectDisplaySettings, shallowEqual);

  return (
    <DisplaySettingsContext.Provider value={settings}>
      {children}
    </DisplaySettingsContext.Provider>
  );
}

DisplaySettingsProvider.propTypes = {
  children: PropTypes.node,
};

export const useDisplaySettings = () => useContext(DisplaySettingsContext);
