/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { mockRouter } from '@forgerock/platform-shared/src/testing/utils/mockRouter';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import { useBreadcrumbStore } from '@forgerock/platform-shared/src/stores/breadcrumb';
import { runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as EntitlementApi from '@forgerock/platform-shared/src/api/governance/EntitlementApi';
import EntitlementDetails from './EntitlementDetails';

jest.mock('@forgerock/platform-shared/src/api/governance/EntitlementApi');
jest.mock('@forgerock/platform-shared/src/utils/appSharedUtils', () => ({
  getApplicationLogo: jest.fn().mockReturnValue('app_logo.png'),
  getApplicationDisplayName: jest.fn().mockReturnValue('app display name'),
}));

jest.mock('@/i18n', () => ({
  global: { t: (k) => k },
}));

const testEntitlement = {
  id: 'ent-1',
  application: {
    id: 'app-1',
    name: 'TargetApp',
  },
  descriptor: {
    idx: {
      '/entitlement': {
        displayName: 'template_read_global',
      },
    },
  },
  item: {
    objectType: 'Group',
  },
  permissions: {},
};

function mountComponent(query = {}, { adminUser = false } = {}) {
  mockRouter({ params: { entitlementId: 'ent-1' }, query });
  const adminRoles = adminUser ? ['ui-global-admin'] : [];
  setupTestPinia({
    user: {
      idmUIAdminRoles: adminRoles,
      idmRoles: adminRoles,
    },
  });

  EntitlementApi.getEntitlementById.mockResolvedValue({ data: testEntitlement });

  return mount(EntitlementDetails, {
    global: {
      stubs: {
        FrHeaderWithImage: true,
        FrDetails: true,
        FrUsers: true,
        BTabs: true,
        BTab: true,
      },
      mocks: { $t: (k) => k },
    },
  });
}

describe('EntitlementDetails', () => {
  describe('breadcrumb return route', () => {
    it('returns the breadcrumb to the unmanaged application when entered from its Objects tab', async () => {
      mountComponent({ originAppId: 'app-1', originAppName: 'My App' });
      await flushPromises();

      const breadcrumbStore = useBreadcrumbStore();
      expect(breadcrumbStore.returnRoute).toBe('/applications/unmanaged/edit/app-1/objects');
      expect(breadcrumbStore.returnRouteText).toBe('My App');
    });

    it('returns the breadcrumb to the originating side tab when one was set', async () => {
      mountComponent({ originAppId: 'app-1', originAppName: 'My App', originObjectTab: 'entitlements' });
      await flushPromises();

      const breadcrumbStore = useBreadcrumbStore();
      expect(breadcrumbStore.returnRoute).toBe('/applications/unmanaged/edit/app-1/objects/entitlements');
      expect(breadcrumbStore.returnRouteText).toBe('My App');
    });

    it('falls back to the application label when no origin name is passed', async () => {
      mountComponent({ originAppId: 'app-1' });
      await flushPromises();

      const breadcrumbStore = useBreadcrumbStore();
      expect(breadcrumbStore.returnRoute).toBe('/applications/unmanaged/edit/app-1/objects');
      expect(breadcrumbStore.returnRouteText).toBe('common.application');
    });

    it('uses the admin entitlements breadcrumb for admin users without origin query', async () => {
      mountComponent({}, { adminUser: true });
      await flushPromises();

      const breadcrumbStore = useBreadcrumbStore();
      expect(breadcrumbStore.returnRoute).toBe('/entitlements');
      expect(breadcrumbStore.returnRouteText).toBe('pageTitles.AdministerEntitlements');
    });

    it('uses the enduser administer breadcrumb for non-admin users without origin query', async () => {
      mountComponent({});
      await flushPromises();

      const breadcrumbStore = useBreadcrumbStore();
      expect(breadcrumbStore.returnRoute).toBe('/administer/entitlements');
      expect(breadcrumbStore.returnRouteText).toBe('pageTitles.AdministerEntitlements');
    });
  });

  describe('@a11y', () => {
    it('has no accessibility violations', async () => {
      const wrapper = mountComponent({ originAppId: 'app-1', originAppName: 'My App' });
      await flushPromises();
      await runA11yTest(wrapper);
    });
  });
});
