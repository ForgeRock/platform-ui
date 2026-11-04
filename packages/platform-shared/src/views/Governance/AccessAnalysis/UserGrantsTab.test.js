/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { DOMWrapper, flushPromises, mount } from '@vue/test-utils';
import { mockRouter } from '@forgerock/platform-shared/src/testing/utils/mockRouter';
import { createAppContainer, toggleActionsMenu } from '@forgerock/platform-shared/src/utils/testHelpers';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import * as AccessRequestApi from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import UserGrantsTab from './UserGrantsTab';
import i18n from '@/i18n';

jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi');
jest.mock('@forgerock/platform-shared/src/api/governance/AccessRequestApi');
jest.mock('@forgerock/platform-shared/src/utils/appSharedUtils', () => ({
  getApplicationLogo: jest.fn().mockReturnValue('app_logo.png'),
}));
jest.mock('@forgerock/platform-shared/src/composables/bvModal', () => ({
  __esModule: true,
  default: () => ({ bvModal: { value: { hide: jest.fn(), show: jest.fn() } } }),
}));

const roleGrants = {
  userA: [{ role: { id: 'role-1', name: 'Analyst' }, item: { type: 'roleMembership' } }],
  userB: [{ role: { id: 'role-2', name: 'Auditor' }, item: { type: 'roleMembership' } }],
};

function mountComponent() {
  const { routerPush } = mockRouter();
  setupTestPinia({ user: {} });
  return {
    routerPush,
    wrapper: mount(UserGrantsTab, {
      attachTo: createAppContainer(),
      global: {
        plugins: [i18n],
      },
      props: {
        userAId: 'user-a',
        userBId: 'user-b',
        userAName: 'User A',
        userBName: 'User B',
        grantType: 'roleMembership',
      },
    }),
  };
}

describe('UserGrantsTab', () => {
  let wrapper;
  const domWrapper = new DOMWrapper(document.body);

  beforeEach(() => {
    CommonsApi.getUserGrants.mockImplementation((userId) => Promise.resolve({
      data: { result: userId === 'user-a' ? roleGrants.userA : roleGrants.userB },
    }));
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
    jest.clearAllMocks();
  });

  it('renders the grants of both users with granted/not granted state', async () => {
    ({ wrapper } = mountComponent());
    await flushPromises();

    const text = wrapper.text();
    expect(text).toContain('Analyst');
    expect(text).toContain('Auditor');
    expect(text).toContain(i18n.global.t('governance.accessAnalysis.grants.granted'));
    expect(text).toContain(i18n.global.t('governance.accessAnalysis.grants.notGranted'));
  });

  it('submits a grant request without a context — the backend defaults it to end-user request context', async () => {
    AccessRequestApi.requestAction.mockResolvedValue({ data: { id: 'req-1' } });
    ({ wrapper } = mountComponent());
    await flushPromises();

    // the floating dropdown menu teleports to document.body; user A lacks 'Auditor'
    // (row 2), so that row's menu shows "Grant to User A"
    await toggleActionsMenu(domWrapper, 1);
    const menuItems = domWrapper.findAll('ul[role="menu"] [role="menuitem"]');
    const grantItem = menuItems.filter((item) => item.text().includes(i18n.global.t('governance.accessAnalysis.grants.grantTo', { name: 'User A' })))[0];
    expect(grantItem.exists()).toBe(true);
    await grantItem.trigger('click');
    await flushPromises();

    expect(AccessRequestApi.requestAction).toHaveBeenCalledWith(
      'roleGrant',
      'publish',
      null,
      {
        common: {
          entitlementId: 'role-2',
          userId: 'user-a',
          roleId: 'role-2',
        },
      },
    );
    // regression guard: 'admin' is a reserved context the backend rejects for non-admins
    const call = AccessRequestApi.requestAction.mock.calls[0];
    expect(call[3].common.context).toBeUndefined();
  });

  it('submits a revoke request without a context', async () => {
    AccessRequestApi.requestAction.mockResolvedValue({ data: { id: 'req-2' } });
    ({ wrapper } = mountComponent());
    await flushPromises();

    await toggleActionsMenu(domWrapper);
    const menuItems = domWrapper.findAll('ul[role="menu"] [role="menuitem"]');
    const revokeItem = menuItems.filter((item) => item.text().includes(i18n.global.t('governance.accessAnalysis.grants.revokeFrom', { name: 'User A' })))[0];
    expect(revokeItem.exists()).toBe(true);
    await revokeItem.trigger('click');
    await flushPromises();

    expect(AccessRequestApi.requestAction).toHaveBeenCalledWith(
      'roleRemove',
      'publish',
      null,
      {
        common: {
          entitlementId: 'role-1',
          userId: 'user-a',
          roleId: 'role-1',
        },
      },
    );
    const call = AccessRequestApi.requestAction.mock.calls[0];
    expect(call[3].common.context).toBeUndefined();
  });
});
