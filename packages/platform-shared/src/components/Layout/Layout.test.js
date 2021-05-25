/**
 * Copyright (c) 2019-2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { createLocalVue, shallowMount } from '@vue/test-utils';
import Vuex from 'vuex';
import Layout from './index';

const localVue = createLocalVue();
localVue.use(Vuex);

// https://jestjs.io/docs/en/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

const store = new Vuex.Store({
  state: {
    UserStore: {},
  },
  getters: {
    'UserStore/userDetails': (state) => state.UserStore,
  },
});

describe('Layout Component', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(Layout, {
      localVue,
      store,
      mocks: {
        $t: () => {},
      },
      propsData: {
        menuItems: [
          {
            columns: 'testColumns',
            displayName: 'test',
            icon: 'testIcon',
            order: 'testOrder',
            routeName: 'ListResource',
            resourceType: 'testType',
          },
          {
            displayName: 'Local Route Item',
            icon: '',
            routeName: 'Local Route',
          },
          {
            displayName: 'External URL Item',
            icon: '',
            url: 'http://example.com',
          },
        ],
      },
    });
  });

  it('Component successfully loaded', () => {
    expect(wrapper.name()).toEqual('Layout');
  });
});
