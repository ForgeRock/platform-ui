/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import RealmMixin from './index';
import store from '@/store';

jest.mock('@/store', () => ({
  state: {
    realm: '',
  },
}));

let wrapper;

describe('RealmMixin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = shallowMount({}, {
      render() { },
      global: {
        mixins: [RealmMixin],
        mocks: {
          $t: (id) => id,
        },
      },
    });
  });

  describe('realmInitial computed property', () => {
    it('Returns lowercase initial when realm starts with lowercase letter', () => {
      store.state.realm = 'alpha';
      expect(wrapper.vm.realmInitial).toBe('a');
    });

    it('Returns lowercase initial when realm starts with uppercase letter', () => {
      store.state.realm = 'Alpha';
      expect(wrapper.vm.realmInitial).toBe('a');
    });

    it('Returns lowercase initial when realm starts with ALL CAPS', () => {
      store.state.realm = 'ALPHA';
      expect(wrapper.vm.realmInitial).toBe('a');
    });

    it('Returns empty string when realm is undefined', () => {
      store.state.realm = undefined;
      expect(wrapper.vm.realmInitial).toBe('');
    });

    it('Returns numeric initial when realm starts with number', () => {
      store.state.realm = '123alpha';
      expect(wrapper.vm.realmInitial).toBe('1');
    });
  });

  describe('formatNameTopLevel method', () => {
    it('Returns translated top-level realm name when realm is /', () => {
      const result = wrapper.vm.formatNameTopLevel('/');
      expect(result).toBe('realm.topLevelRealm');
    });

    it('Returns translated top-level realm name when realm is root', () => {
      const result = wrapper.vm.formatNameTopLevel('root');
      expect(result).toBe('realm.topLevelRealm');
    });

    it('Returns realm name when realm is not root or /', () => {
      const result = wrapper.vm.formatNameTopLevel('alpha');
      expect(result).toBe('alpha');
    });
  });
});
