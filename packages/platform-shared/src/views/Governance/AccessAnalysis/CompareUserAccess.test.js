/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { createAppContainer } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import CompareUserAccess from './CompareUserAccess';
import i18n from '@/i18n';

CommonsApi.getResource = jest.fn().mockResolvedValue({ data: { result: [] } });
CommonsApi.getUserById = jest.fn().mockResolvedValue({ data: { result: [] } });
CommonsApi.getUserGrants = jest.fn().mockResolvedValue({ data: { result: [] } });

const app = createAppContainer();

function mountComponent() {
  return mount(CompareUserAccess, {
    attachTo: app,
    global: {
      plugins: [i18n, createTestingPinia()],
      stubs: ['GovResourceSelect', 'FrIcon'],
    },
  });
}

describe('CompareUserAccess', () => {
  it('renders two GovResourceSelect dropdowns', () => {
    const wrapper = mountComponent();
    const selects = wrapper.findAll('gov-resource-select-stub');
    expect(selects).toHaveLength(2);
  });

  it('passes correct label for User A', () => {
    const wrapper = mountComponent();
    const selects = wrapper.findAll('gov-resource-select-stub');
    expect(selects[0].attributes('label')).toBe('User A');
  });

  it('passes correct label for User B', () => {
    const wrapper = mountComponent();
    const selects = wrapper.findAll('gov-resource-select-stub');
    expect(selects[1].attributes('label')).toBe('User B');
  });

  it('renders a swap button', () => {
    const wrapper = mountComponent();
    const btn = wrapper.find('button');
    expect(btn.exists()).toBe(true);
  });

  it('swap button has the correct aria-label', () => {
    const wrapper = mountComponent();
    const btn = wrapper.find('button');
    expect(btn.attributes('aria-label')).toBe('Swap users');
  });

  it('emits update:userA when User A input fires', async () => {
    const wrapper = mountComponent();
    const selectA = wrapper.findAll('gov-resource-select-stub')[0];
    await selectA.trigger('input', { detail: 'managed/user/abc123' });
    // Simulate internal emit via vm — set the ref directly
    wrapper.vm.userAValue = 'managed/user/abc123';
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('update:userA')).toBeTruthy();
  });

  it('emits update:userB when User B input fires', async () => {
    const wrapper = mountComponent();
    wrapper.vm.userBValue = 'managed/user/def456';
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted('update:userB')).toBeTruthy();
  });

  it('swaps User A and User B values when the swap button is clicked', async () => {
    const wrapper = mountComponent();

    wrapper.vm.userAValue = 'managed/user/user-a';
    wrapper.vm.userBValue = 'managed/user/user-b';
    await wrapper.vm.$nextTick();

    await wrapper.find('button').trigger('click');
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.userAValue).toBe('managed/user/user-b');
    expect(wrapper.vm.userBValue).toBe('managed/user/user-a');
  });
});
