/**
 * @license
 * Copyright (c) 2020 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { createLocalVue, shallowMount } from '@vue/test-utils';
import Vuex from 'vuex';
import i18n from '@/i18n';
import AuthenticationDevices from './index';

const localVue = createLocalVue();
localVue.use(Vuex);

describe('TrustedDevices.vue', () => {
  let wrapper;
  const store = new Vuex.Store({
    state: {
      isFraas: false,
    },
  });

  beforeEach(() => {
    jest.spyOn(AuthenticationDevices, 'mounted')
      .mockImplementation(() => { });

    wrapper = shallowMount(AuthenticationDevices, {
      localVue,
      store,
      mocks: {
        $t: () => {},
      },
      i18n,
      stubs: {
        BModal: true,
      },
    });
  });

  it('Authentication Devices loads', () => {
    expect(wrapper.name()).toBe('AuthenticationDevices');
  });
});
