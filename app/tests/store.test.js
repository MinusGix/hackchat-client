/**
 * Test store & addons
 */

import setupStore from '../setupStore';

describe('setupStore', () => {
  let store;

  beforeAll(() => {
    store = setupStore();
  });

  describe('injectedReducers', () => {
    it('should contain an object for reducers', () => {
      expect(typeof store.injectedReducers).toBe('object');
    });
  });

  describe('injectedSagas', () => {
    it('should contain an object for sagas', () => {
      expect(typeof store.injectedSagas).toBe('object');
    });
  });

  describe('runSaga', () => {
    it('should contain a hook for `sagaMiddleware.run`', () => {
      expect(typeof store.runSaga).toBe('function');
    });
  });

  describe('root reducers', () => {
    it('should register the language and settings slices', () => {
      const state = store.getState();
      expect(state).toHaveProperty('language');
      expect(state).toHaveProperty('settings');
    });
  });
});
