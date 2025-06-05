/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  getValueFromLocalStorage,
  setLocalStorageValue,
} from './localStorageUtils';

const store = require('@/store');

jest.mock('@/store', () => ({
  state: {
    SharedStore: {
      webStorageAvailable: true,
    },
  },
}));

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

describe('getValueFromLocalStorage', () => {
  it('returns parsed value from localStorage when webStorageAvailable is true', () => {
    localStorage.setItem('testKey', JSON.stringify({ foo: 'bar' }));
    expect(getValueFromLocalStorage('testKey')).toEqual({ foo: 'bar' });
  });

  it('returns null if key does not exist in localStorage', () => {
    expect(getValueFromLocalStorage('missingKey')).toBeNull();
  });

  it('returns null if JSON.parse throws (invalid JSON)', () => {
    localStorage.setItem('badKey', 'not-json');
    expect(getValueFromLocalStorage('badKey')).toBeNull();
  });

  it('returns null if webStorageAvailable is false', () => {
    store.state.SharedStore.webStorageAvailable = false;
    localStorage.setItem('testKey', JSON.stringify({ foo: 'bar' }));
    expect(getValueFromLocalStorage('testKey')).toBeNull();
    store.state.SharedStore.webStorageAvailable = true; // reset for other tests
  });
});

describe('setLocalStorageValue', () => {
  it('sets value in localStorage when webStorageAvailable is true and key is string', () => {
    setLocalStorageValue('myKey', { a: 1 });
    expect(localStorage.getItem('myKey')).toBe(JSON.stringify({ a: 1 }));
  });

  it('does not set value if webStorageAvailable is false', () => {
    store.state.SharedStore.webStorageAvailable = false;
    setLocalStorageValue('myKey', { a: 1 });
    expect(localStorage.getItem('myKey')).toBeNull();
    store.state.SharedStore.webStorageAvailable = true; // reset for other tests
  });

  it('does not set value if key is not a string', () => {
    setLocalStorageValue(123, { a: 1 });
    expect(localStorage.getItem('123')).toBeNull();
  });

  it('stores stringified value for primitive types', () => {
    store.state.SharedStore.webStorageAvailable = true;
    setLocalStorageValue('numKey', 42);
    expect(localStorage.getItem('numKey')).toBe('42');
    setLocalStorageValue('boolKey', true);
    expect(localStorage.getItem('boolKey')).toBe('true');
    setLocalStorageValue('strKey', 'hello');
    expect(localStorage.getItem('strKey')).toBe('"hello"');
  });
});
