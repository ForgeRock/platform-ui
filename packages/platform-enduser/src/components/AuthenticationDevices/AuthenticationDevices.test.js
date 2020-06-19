/**
 * Copyright 2019 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { createLocalVue, shallowMount } from '@vue/test-utils';
import i18n from '@/i18n';
import AuthenticationDevices from './index';

const localVue = createLocalVue();

describe('TrustedDevices.vue', () => {
  let wrapper;

  beforeEach(() => {
    jest.spyOn(AuthenticationDevices, 'mounted')
      .mockImplementation(() => { });

    wrapper = shallowMount(AuthenticationDevices, {
      localVue,
      mocks: {
        $t: () => {},
        $store: () => {},
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
