/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import store from '@/store';
import apiUtils from './apiUtils';

jest.mock('@/store', () => ({
  __esModule: true,
  default: {
    state: {
      realm: 'root',
      realms: [],
    },
  },
}));

describe('apiUtils', () => {
  describe('getRealmConfigPath', () => {
    it('returns root realm-config path when realm is root', () => {
      store.state.realms = [{ name: '/', parentPath: '' }];
      expect(apiUtils.getRealmConfigPath('root')).toBe('realms/root/realm-config');
    });

    it('returns the correct path for a top-level realm', () => {
      store.state.realms = [{ name: 'alpha', parentPath: '/' }];
      expect(apiUtils.getRealmConfigPath('alpha')).toBe('realms/root/realms/alpha/realm-config');
    });

    it('returns the correct path for a nested realm', () => {
      store.state.realms = [{ name: 'beta', parentPath: '/alpha' }];
      expect(apiUtils.getRealmConfigPath('beta')).toBe('realms/root/realms/alpha/realms/beta/realm-config');
    });

    it('returns simple sub-realm path when realm is not found in store', () => {
      store.state.realms = [];
      expect(apiUtils.getRealmConfigPath('unknown')).toBe('realms/root/realms/unknown/realm-config');
    });
  });

  describe('getCurrentRealmConfigPath', () => {
    it('returns root realm-config path when current realm is root', () => {
      store.state.realm = 'root';
      store.state.realms = [{ name: '/', parentPath: '' }];
      expect(apiUtils.getCurrentRealmConfigPath()).toBe('realms/root/realm-config');
    });

    it('returns the correct path for the current realm', () => {
      store.state.realm = 'alpha';
      store.state.realms = [{ name: 'alpha', parentPath: '/' }];
      expect(apiUtils.getCurrentRealmConfigPath()).toBe('realms/root/realms/alpha/realm-config');
    });
  });

  describe('getCurrentRealmFullPath', () => {
    it('uses getRealmFullPath with current store state', () => {
      store.state.realm = 'alpha';
      store.state.realms = [{ name: 'alpha', parentPath: '/' }];
      expect(apiUtils.getCurrentRealmFullPath()).toBe('/alpha');
    });
  });
});
