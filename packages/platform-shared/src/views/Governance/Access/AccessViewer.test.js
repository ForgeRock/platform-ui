/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import * as managedResourceApi from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import { mockRouter } from '@forgerock/platform-shared/src/testing/utils/mockRouter';
import i18n from '@/i18n';
import AccessViewer from './AccessViewer';

jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi');
jest.mock('@forgerock/platform-shared/src/api/ManagedResourceApi');

mockRouter({ params: { resourceId: 'managed/alpha_user/testId' } });

beforeEach(() => {
  CommonsApi.getGlossarySchema = jest.fn().mockResolvedValue({
    data: {
      '/iga/governance/account': [],
      '/openidm/managed/assignment': [],
      '/openidm/managed/role': [],
    },
  });
  CommonsApi.getFilterSchema = jest.fn().mockResolvedValue({
    data: { user: [] },
  });
  CommonsApi.getIgaAutoIdConfig = jest.fn().mockResolvedValue({
    data: {},
  });
  CommonsApi.getUserGrants = jest.fn().mockResolvedValue({
    data: { result: [] },
  });
  managedResourceApi.getManagedResource = jest.fn().mockResolvedValue({
    data: {
      givenName: 'Test',
      sn: 'User',
      mail: 'test@example.com',
      id: 'testId',
      userName: 'testuser',
      profileImage: '',
    },
  });
});

async function mountComponent() {
  setupTestPinia();
  const wrapper = mount(AccessViewer, {
    global: {
      plugins: [i18n],
    },
  });
  await flushPromises();
  return wrapper;
}

describe('AccessViewer', () => {
  describe('View tests', () => {
    it('top navbar should exist when not in fullscreen mode', async () => {
      const wrapper = await mountComponent();
      const navbar = wrapper.find('.fr-main-navbar');
      expect(navbar.exists()).toBe(true);
    });

    it('top navbar should not exist when in fullscreen mode', async () => {
      const wrapper = await mountComponent();
      await flushPromises();
      const navbar = wrapper.find('.fr-main-navbar');
      expect(navbar.exists()).toBe(true);

      wrapper.vm.fullscreen = true;
      await wrapper.vm.$nextTick();
      const navbarAfter = wrapper.find('.fr-main-navbar');
      expect(navbarAfter.exists()).toBe(false);
    });

    it('left node list panel should exist when first loading', async () => {
      const wrapper = await mountComponent();
      await flushPromises();
      const nodeListLeftPanelCloseButton = wrapper.find('#btnClosePanel');
      expect(nodeListLeftPanelCloseButton.exists()).toBe(true);
    });

    it('left node list panel should not exist after x is clicked', async () => {
      const wrapper = await mountComponent();
      await flushPromises();
      const nodeListLeftPanelCloseButton = wrapper.find('#btnClosePanel');
      nodeListLeftPanelCloseButton.trigger('click');
      await wrapper.vm.$nextTick();
      const nodeListLeftPanelCloseButtonAfterClick = wrapper.find('#btnClosePanel');
      expect(nodeListLeftPanelCloseButtonAfterClick.exists()).toBe(false);
    });

    it('calls get grants for user on load for all types', async () => {
      await mountComponent();
      await flushPromises();
      expect(CommonsApi.getUserGrants).toHaveBeenCalledTimes(3);
    });
  });

  describe('Emit tests', () => {
    it('zoom emit from toolbar updates the zoom value', async () => {
      const wrapper = await mountComponent();
      await flushPromises();
      expect(wrapper.vm.zoomValue).toBe(80);
      const toolbar = wrapper.findComponent('[role="toolbar"]');
      toolbar.vm.$emit('zoom', 110);
      expect(wrapper.vm.zoomValue).toBe(110);
    });
  });
});
