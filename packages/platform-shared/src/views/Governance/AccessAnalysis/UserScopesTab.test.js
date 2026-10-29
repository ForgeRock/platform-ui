/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { createAppContainer, runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import ResizableTable from '@forgerock/platform-shared/src/directives/ResizableTable/ResizableTable';
import UserScopesTab from './UserScopesTab';
import i18n from '@/i18n';

/**
 * jsdom returns all-zero rects, which BootstrapVue treats as "not visible" and
 * refuses to show the tooltip. Stub a real-looking rect on the target so
 * BTooltip's isVisible() check passes and the tooltip actually renders.
 */
function stubTargetVisibility(target) {
  target.getBoundingClientRect = () => ({
    width: 100, height: 20, top: 0, left: 0, right: 100, bottom: 20,
  });
}

/**
 * BTooltip has a default show delay and creates its popper asynchronously;
 * poll a few ticks so the tooltip has actually rendered before asserting on its content.
 */
async function waitForTooltip() {
  /* eslint-disable no-await-in-loop */
  for (let i = 0; i < 10; i += 1) {
    await flushPromises();
    await new Promise((resolve) => { setTimeout(resolve, 50); });
  }
  /* eslint-enable no-await-in-loop */
}

function userWithScopes(scopeIds) {
  return {
    data: {
      result: [{
        scopes: { assigned: scopeIds.map((id) => ({ id })) },
      }],
    },
  };
}

const scopeWithRoleAndUserPermissions = {
  id: 'scope-1',
  name: 'Scope One',
  targetCondition: {
    role: { version: 'v2', filter: {} },
    user: { version: 'v2', filter: {} },
  },
  permissions: { createRole: true, deleteUser: true },
};

const scopeWithNoTargetedCategories = {
  id: 'scope-2',
  name: 'Scope Two',
  targetCondition: {},
};

describe('UserScopesTab', () => {
  let wrapper;

  const app = createAppContainer();
  function mountComponent(props = {}, { realResizeDirective = false } = {}) {
    wrapper = mount(UserScopesTab, {
      attachTo: app,
      global: {
        plugins: [i18n],
        directives: realResizeDirective ? { 'resizable-table': ResizableTable } : {},
      },
      props: {
        userAId: 'userA',
        userBId: 'userB',
        userAName: 'User A',
        userBName: 'User B',
        getScopeById: null,
        ...props,
      },
    });
    return wrapper;
  }

  afterEach(() => {
    wrapper.unmount();
  });

  it('shows a no-data state when neither user has any scopes', async () => {
    CommonsApi.getUserById = jest.fn()
      .mockResolvedValueOnce(userWithScopes([]))
      .mockResolvedValueOnce(userWithScopes([]));
    wrapper = mountComponent();
    await flushPromises();
    expect(wrapper.text()).toContain(i18n.global.t('governance.accessAnalysis.scopes.noScopes'));
  });

  it('renders a permissions icon per targeted category, with none for a scope with no targeted categories', async () => {
    CommonsApi.getUserById = jest.fn()
      .mockResolvedValueOnce(userWithScopes(['scope-1', 'scope-2']))
      .mockResolvedValueOnce(userWithScopes([]));
    const getScopeById = jest.fn((id) => Promise.resolve({
      data: id === 'scope-1' ? scopeWithRoleAndUserPermissions : scopeWithNoTargetedCategories,
    }));
    wrapper = mountComponent({ getScopeById });
    await flushPromises();

    const rows = wrapper.findAll('tbody tr');
    expect(rows).toHaveLength(2);

    const scopeOneRow = rows.filter((row) => row.text().includes('Scope One'))[0];
    expect(scopeOneRow.findAll('[data-testid^="scope-permission-icon-"]')).toHaveLength(2);

    const scopeTwoRow = rows.filter((row) => row.text().includes('Scope Two'))[0];
    expect(scopeTwoRow.findAll('[data-testid^="scope-permission-icon-"]')).toHaveLength(0);
  });

  it('wires each permission icon to a BTooltip targeting it, labeled with the category name, in the form-editor circle colors', async () => {
    CommonsApi.getUserById = jest.fn()
      .mockResolvedValueOnce(userWithScopes(['scope-1']))
      .mockResolvedValueOnce(userWithScopes([]));
    const getScopeById = jest.fn().mockResolvedValue({ data: scopeWithRoleAndUserPermissions });
    wrapper = mountComponent({ getScopeById });
    await flushPromises();

    const roleIcon = wrapper.find('#scope-permissions-scope-1role');
    expect(roleIcon.exists()).toBe(true);
    expect(roleIcon.attributes('aria-label')).toBe(i18n.global.t('governance.accessAnalysis.scopes.categories.role'));
    expect(roleIcon.attributes('role')).toBe('img');
    expect(roleIcon.classes()).toContain('rounded-circle');
    expect(roleIcon.classes()).toContain('fr-scope-permission-icon');
    // form-editor palette: application=green, entitlement=blue, role=orange, user=purple
    expect(roleIcon.classes()).toContain('color-darkorange');
    expect(roleIcon.classes()).toContain('bg-lightorange');

    const userIcon = wrapper.find('#scope-permissions-scope-1user');
    expect(userIcon.classes()).toContain('color-darkpurple');
    expect(userIcon.classes()).toContain('bg-lightpurple');

    const tooltips = wrapper.findAllComponents({ name: 'BTooltip' });
    const roleTooltip = tooltips.filter((t) => t.props('target') === 'scope-permissions-scope-1role')[0];
    expect(roleTooltip.exists()).toBe(true);
    expect(roleTooltip.props('triggers')).toBe('focus hover');
  });

  it('shows the granted permissions for a category once its tooltip is opened', async () => {
    CommonsApi.getUserById = jest.fn()
      .mockResolvedValueOnce(userWithScopes(['scope-1']))
      .mockResolvedValueOnce(userWithScopes([]));
    const getScopeById = jest.fn().mockResolvedValue({ data: scopeWithRoleAndUserPermissions });
    wrapper = mountComponent({ getScopeById });
    await flushPromises();

    const roleIcon = wrapper.find('#scope-permissions-scope-1role');
    stubTargetVisibility(roleIcon.element);
    const roleTooltip = wrapper.findAllComponents({ name: 'BTooltip' })
      .filter((t) => t.props('target') === 'scope-permissions-scope-1role')[0];

    roleTooltip.vm.doOpen();
    await waitForTooltip();

    const tooltipContent = document.querySelector('.tooltip-inner');
    expect(tooltipContent).not.toBeNull();
    expect(tooltipContent.textContent).toContain(i18n.global.t('governance.accessAnalysis.scopes.permissionLabels.viewRoles'));
    expect(tooltipContent.textContent).toContain(i18n.global.t('governance.accessAnalysis.scopes.permissionLabels.createRole'));
    // modifyRole/publishRole/deleteRole were not granted on this scope
    expect(tooltipContent.textContent).not.toContain(i18n.global.t('governance.accessAnalysis.scopes.permissionLabels.modifyRole'));
  });

  it('describes each icon for screen readers via a persistent sr-only permission list, hidden only while its tooltip is shown', async () => {
    CommonsApi.getUserById = jest.fn()
      .mockResolvedValueOnce(userWithScopes(['scope-1']))
      .mockResolvedValueOnce(userWithScopes([]));
    const getScopeById = jest.fn().mockResolvedValue({ data: scopeWithRoleAndUserPermissions });
    wrapper = mountComponent({ getScopeById });
    await flushPromises();

    const roleIcon = wrapper.find('#scope-permissions-scope-1role');
    const roleSrSpan = wrapper.find('#scope-permissions-scope-1role-sr-description');
    expect(roleIcon.attributes('aria-describedby')).toBe('scope-permissions-scope-1role-sr-description');
    expect(roleSrSpan.exists()).toBe(true);
    expect(roleSrSpan.classes()).toContain('sr-only');
    expect(roleSrSpan.text()).toBe(`${i18n.global.t('governance.accessAnalysis.scopes.categories.role')}: ${i18n.global.t('governance.accessAnalysis.scopes.permissionLabels.viewRoles')}, ${i18n.global.t('governance.accessAnalysis.scopes.permissionLabels.createRole')}`);
    // Closed tooltip: the description is live
    expect(roleSrSpan.attributes('hidden')).toBeUndefined();

    // Open tooltip: the span hides so the list is not announced twice per focus
    stubTargetVisibility(roleIcon.element);
    const roleTooltip = wrapper.findAllComponents({ name: 'BTooltip' })
      .filter((t) => t.props('target') === 'scope-permissions-scope-1role')[0];
    roleTooltip.vm.doOpen();
    await waitForTooltip();
    expect(document.querySelector('.tooltip-inner')).not.toBeNull();
    expect(wrapper.find('#scope-permissions-scope-1role-sr-description').attributes('hidden')).toBeDefined();
  });

  it('marks granted/not-granted status for each user against a scope', async () => {
    CommonsApi.getUserById = jest.fn()
      .mockResolvedValueOnce(userWithScopes(['scope-1']))
      .mockResolvedValueOnce(userWithScopes([]));
    const getScopeById = jest.fn().mockResolvedValue({ data: scopeWithRoleAndUserPermissions });
    wrapper = mountComponent({ getScopeById });
    await flushPromises();

    const row = wrapper.find('tbody tr');
    const cells = row.findAll('td');
    expect(cells[2].text()).toContain(i18n.global.t('governance.accessAnalysis.grants.granted'));
    expect(cells[3].text()).toContain(i18n.global.t('governance.accessAnalysis.grants.notGranted'));
  });

  it('renders resizable columns when the resizable-table directive is active', async () => {
    CommonsApi.getUserById = jest.fn()
      .mockResolvedValueOnce(userWithScopes(['scope-1']))
      .mockResolvedValueOnce(userWithScopes([]));
    const getScopeById = jest.fn().mockResolvedValue({ data: scopeWithRoleAndUserPermissions });
    wrapper = mountComponent({ getScopeById }, { realResizeDirective: true });
    await flushPromises();

    const table = wrapper.find('table');
    expect(table.element.parentElement.classList.contains('table-resizable')).toBe(true);
    expect(table.findAll('.resizer')).toHaveLength(4);
  });

  it('passes accessibility checks', async () => {
    CommonsApi.getUserById = jest.fn()
      .mockResolvedValueOnce(userWithScopes(['scope-1']))
      .mockResolvedValueOnce(userWithScopes([]));
    const getScopeById = jest.fn().mockResolvedValue({ data: scopeWithRoleAndUserPermissions });
    wrapper = mountComponent({ getScopeById });
    await flushPromises();
    await runA11yTest(wrapper);
  });
});
