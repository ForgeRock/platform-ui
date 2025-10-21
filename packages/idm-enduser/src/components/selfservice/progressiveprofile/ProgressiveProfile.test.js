/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import { mockRouter } from '@forgerock/platform-shared/src/testing/utils/mockRouter';
import { basicProfileStage } from './mocks/ProgressiveProfileMock';
import * as SelfServiceApi from '@/api/SelfServiceApi';
import * as AuthenticationApi from '@/api/AuthenticationApi';
import ProgressiveProfile from './ProgressiveProfile';
import i18n from '@/i18n';

mockValidation();
mockRouter({
  params: {
    profileProcess: 'profile',
  },
});

AuthenticationApi.logout = jest.fn().mockResolvedValue({});
AuthenticationApi.loginWithJwt = jest.fn().mockResolvedValue({});

describe('ProgressiveProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    SelfServiceApi.loadData = jest.fn().mockResolvedValue({
      data: basicProfileStage,
    });

    SelfServiceApi.advanceStage = jest.fn().mockResolvedValue({
      data: basicProfileStage,
    });
  });

  let wrapper;
  function mountComponent() {
    return mount(ProgressiveProfile, {
      global: {
        plugins: [i18n],
        stubs: ['PolicyPasswordInput'],
      },
    });
  }

  it('calls to get progressive profile on mount', async () => {
    wrapper = mountComponent();
    await flushPromises();

    expect(SelfServiceApi.loadData).toHaveBeenCalledWith('profile');
  });

  it('sets child component to ConditionalUser when type is conditionaluser', async () => {
    wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.findComponent({ name: 'ConditionalUser' }).exists()).toBe(true);
  });

  it('advances stage when child component emits advanceStage', async () => {
    wrapper = mountComponent();
    await flushPromises();

    const conditionalUser = wrapper.findComponent({ name: 'ConditionalUser' });
    conditionalUser.vm.$emit('advanceStage', { attributes: { firstName: 'John' } });
    await flushPromises();

    expect(SelfServiceApi.advanceStage).toHaveBeenCalledWith(
      { input: { attributes: { firstName: 'John' } } },
      'profile',
      true,
    );
  });
});
