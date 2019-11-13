/**
 * Copyright 2019 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { shallowMount } from '@vue/test-utils';
import Login from '@/views/Login';
import i18n from '@/i18n';

describe('Login.vue', () => {
  let wrapper;
  const $route = {
    meta: { hideToolbar: true },
    params: {
    },
  };

  beforeEach(() => {
    wrapper = shallowMount(Login, {
      i18n,
      stubs: {
        'router-link': true,
      },
      mocks: {
        $route,
      },
    });
  });

  it('Load login component', () => {
    expect(wrapper.name()).toEqual('Login');
  });
});
