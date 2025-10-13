/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import { mockRouter } from '@forgerock/platform-shared/src/testing/utils/mockRouter';
import RegistrationMock from './mocks/RegistrationMock';
import * as SelfServiceApi from '@/api/SelfServiceApi';
import * as AuthenticationApi from '@/api/AuthenticationApi';
import Registration from './Registration';
import i18n from '@/i18n';

mockValidation();

AuthenticationApi.logout = jest.fn().mockResolvedValue({});
AuthenticationApi.loginWithJwt = jest.fn().mockResolvedValue({});

mockRouter({});

describe('Registration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    SelfServiceApi.loadData = jest.fn().mockResolvedValue({
      data: {
        tag: 'initial',
        type: 'parameters',
      },
    });

    SelfServiceApi.advanceStage = jest.fn().mockResolvedValue({
      data: RegistrationMock,
    });
  });

  let wrapper;
  function mountComponent() {
    return mount(Registration, {
      global: {
        plugins: [i18n],
        stubs: ['PolicyPasswordInput'],
        mocks: {
          $store: { state: {} },
        },
      },
    });
  }

  it('calls to start registration on mount', async () => {
    wrapper = mountComponent();
    await flushPromises();

    expect(SelfServiceApi.loadData).toHaveBeenCalledWith('registration');
    expect(SelfServiceApi.advanceStage).toHaveBeenCalledWith({ input: {} }, 'registration', true);
  });

  it('sets child component to AllInOneRegistration when tag is initial', async () => {
    wrapper = mountComponent();
    await flushPromises();
    expect(wrapper.findComponent({ name: 'AllInOneRegistration' }).exists()).toBe(true);
  });

  it('calls to advance self service to next staget when child component emits advanceStage event', async () => {
    wrapper = mountComponent();
    await flushPromises();
    wrapper.findComponent({ name: 'AllInOneRegistration' }).vm.$emit('advanceStage', { test: 'data' });
    await flushPromises();
    expect(SelfServiceApi.advanceStage).toHaveBeenCalledWith({ input: { test: 'data' } }, 'registration', true);
  });

  it('handles resuming registration when query params are present', async () => {
    SelfServiceApi.advanceStage = jest.fn().mockResolvedValueOnce({
      data: {
        type: 'localAutoLogin',
        additions: {
          credentialJwt: 'MY_JWT',
          successUrl: '',
        },
      },
    });

    const { routerPush } = mockRouter({
      params: { queryParams: '&token=MY_TOKEN&code=MY_CODE' },
    });

    wrapper = mountComponent();
    await flushPromises();
    expect(SelfServiceApi.advanceStage).toHaveBeenCalledWith({
      input: { code: 'MY_CODE', token: 'MY_TOKEN' },
      token: 'MY_TOKEN',
    }, 'registration', true);

    expect(routerPush).toHaveBeenCalledWith({ name: 'Dashboard' });
  });
});
