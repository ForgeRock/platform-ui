/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import * as VueRouter from 'vue-router';
import MyRequest from './MyRequest';
import i18n from '@/i18n';
import { setupTestPinia } from '../../../utils/testPiniaHelpers';
import store from '@/store';

jest.mock('vue-router');

describe('MyRequests', () => {
  function setup(user = { userId: '1234' }) {
    setupTestPinia({ user });
    return mount(MyRequest, {
      global: {
        plugins: [i18n],
        stubs: ['RequestsTab', 'RequestTypesTab'],
      },
    });
  }

  it('should load header texts correctly', () => {
    VueRouter.useRoute.mockReturnValue({
      params: {
        requestsTab: '',
      },
    });
    const wrapper = setup();

    expect(wrapper.find('h1').text()).toBe('pageTitles.MyRequests');
    expect(wrapper.find('p').text()).toBe('pages.myRequests.subTitle');
  });

  it('should load initial state correctly for admin with list tab selected when no tab is setted on the route and governance dev flag is enabled', async () => {
    VueRouter.useRoute.mockReturnValue({
      params: {
        requestsTab: '',
      },
    });
    store.state.SharedStore.governanceDevEnabled = true;

    const wrapper = setup({
      userId: '1234',
      idmRoles: ['openidm-admin'],
    });
    await wrapper.vm.$nextTick();

    const tabsWrapper = wrapper.find('.tabs');
    expect(tabsWrapper.exists()).toBe(true);
    const tabs = wrapper.findAll('[role="tab"]');
    expect(tabs.length).toBe(2);
    expect(tabs[0].text()).toBe('pageTitles.MyRequests');
    expect(tabs[1].text()).toBe('Request Types');
    expect(tabs[0].classes()).toContain('active');
    const requestsTab = wrapper.findComponent({ name: 'RequestsTab' });
    expect(requestsTab.exists()).toBe(true);
  });

  it('should load initial state correctly for admin with list tab selected when no tab is setted on the route and governance dev flag is disabled', async () => {
    VueRouter.useRoute.mockReturnValue({
      params: {
        requestsTab: '',
      },
    });
    store.state.SharedStore.governanceDevEnabled = false;

    const wrapper = setup({
      userId: '1234',
      idmRoles: ['openidm-admin'],
    });
    await wrapper.vm.$nextTick();

    const tabsWrapper = wrapper.find('.tabs');
    expect(tabsWrapper.exists()).toBe(true);
    const tabs = wrapper.findAll('[role="tab"]');
    expect(tabs.length).toBe(1);
    expect(tabs[0].text()).toBe('pageTitles.MyRequests');
    expect(tabs[0].classes()).toContain('active');
    const requestsTab = wrapper.findComponent({ name: 'RequestsTab' });
    expect(requestsTab.exists()).toBe(true);
  });

  it('should load initial state correctly for non-admin with list tab selected when no tab is setted on the route', async () => {
    VueRouter.useRoute.mockReturnValue({
      params: {
        requestsTab: '',
      },
    });
    store.state.SharedStore.governanceDevEnabled = true;

    const wrapper = setup({
      userId: '1234',
      idmRoles: [],
    });
    await wrapper.vm.$nextTick();

    const tabsWrapper = wrapper.find('.tabs');
    expect(tabsWrapper.exists()).toBe(false);
    const requestsTab = wrapper.findComponent({ name: 'RequestsTab' });
    expect(requestsTab.exists()).toBe(true);
  });

  it('should load initial state correctly for admin with Request Types tab selected when tab is setted on the route', async () => {
    VueRouter.useRoute.mockReturnValue({
      params: {
        requestsTab: 'request-types',
      },
    });
    store.state.SharedStore.governanceDevEnabled = true;

    const wrapper = setup({
      userId: '1234',
      idmRoles: ['openidm-admin'],
    });
    await wrapper.vm.$nextTick();
    console.log(wrapper.html());

    const tabsWrapper = wrapper.find('.tabs');
    expect(tabsWrapper.exists()).toBe(true);
    const tabs = wrapper.findAll('[role="tab"]');
    expect(tabs.length).toBe(2);
    expect(tabs[0].text()).toBe('pageTitles.MyRequests');
    expect(tabs[1].text()).toBe('Request Types');
    expect(tabs[1].classes()).toContain('active');
    const requestTypesTab = wrapper.findComponent({ name: 'RequestTypesTab' });
    expect(requestTypesTab.exists()).toBe(true);
  });
});
