/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { createAppContainer, runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import * as RoleApi from '@forgerock/platform-shared/src/api/governance/RoleApi';
import ResizableTable from '@forgerock/platform-shared/src/directives/ResizableTable/ResizableTable';
import SimulatorDetail from './SimulatorDetail';
import i18n from '@/i18n';

const scopeWithRoleAndUserPermissions = {
  id: 'scope-1',
  name: 'Scope One',
  targetCondition: {
    role: { version: 'v2', filter: {} },
    user: { version: 'v2', filter: {} },
  },
  permissions: { createRole: true, deleteUser: true },
};

// A second scope that also grants deleteUser — removing scope-1 must not
// show deleteUser as lost when the user still holds this one.
const overlappingScope = {
  id: 'scope-2',
  name: 'Scope Two',
  targetCondition: {
    user: { version: 'v2', filter: {} },
  },
  permissions: { deleteUser: true },
};

describe('SimulatorDetail', () => {
  let wrapper;

  const app = createAppContainer();
  function mountComponent(props = {}, { realResizeDirective = false } = {}) {
    wrapper = mount(SimulatorDetail, {
      attachTo: app,
      global: {
        plugins: [i18n],
        stubs: { GovResourceSelect: true },
        directives: realResizeDirective ? { 'resizable-table': ResizableTable } : {},
      },
      props: {
        simulationType: 'addScope',
        getScopeList: jest.fn(),
        getScopeById: jest.fn().mockResolvedValue({ data: scopeWithRoleAndUserPermissions }),
        ...props,
      },
    });
    return wrapper;
  }

  /**
   * The GovResourceSelect stubs never emit @loaded, so mark the selectors ready
   * and set the user/role selection directly, then run the simulation.
   */
  async function runSimulation() {
    wrapper.vm.userSelectorReady = true;
    wrapper.vm.roleSelectorReady = true;
    wrapper.vm.selectedUserValue = 'managed/alpha_user/user1';
    await flushPromises();
    wrapper.vm.selectedRoleValue = 'scope/scope-1';
    await flushPromises();
    await wrapper.vm.runSimulation();
    await flushPromises();
    await wrapper.vm.$nextTick();
  }

  afterEach(() => {
    wrapper.unmount();
  });

  it('renders one row per permission the scope grants, with a category icon in the name cell', async () => {
    CommonsApi.getUserById = jest.fn().mockResolvedValue({ data: { result: [{ id: 'user1', scopes: {} }] } });
    wrapper = mountComponent();
    await runSimulation();

    const rows = wrapper.findAll('tbody tr');
    // scope grants: viewRoles, createRole (role), viewUsers, deleteUser (user)
    expect(rows).toHaveLength(4);

    const firstCellIcon = rows[0].find('[data-testid^="scope-permission-icon-"]');
    expect(firstCellIcon.exists()).toBe(true);
    expect(rows[0].text()).toContain(i18n.global.t('governance.accessAnalysis.scopes.permissionLabels.viewRoles'));
  });

  it('shows a granted check before and after when adding a scope the user already holds', async () => {
    CommonsApi.getUserById = jest.fn().mockResolvedValue({
      data: { result: [{ id: 'user1', scopes: { assigned: [{ id: 'scope-1' }] } }] },
    });
    wrapper = mountComponent();
    await runSimulation();

    const rows = wrapper.findAll('tbody tr');
    expect(rows).toHaveLength(4);
    rows.forEach((row) => {
      const cells = row.findAll('td');
      // unchanged permission: granted check icon in both before and after
      expect(cells[1].find('.material-icons-outlined').classes()).toContain('text-success');
      expect(cells[1].find('[aria-label]').attributes('aria-label')).toBe(i18n.global.t('governance.accessAnalysis.grants.granted'));
      expect(cells[2].find('.material-icons-outlined').classes()).toContain('text-success');
      expect(cells[2].find('[aria-label]').attributes('aria-label')).toBe(i18n.global.t('governance.accessAnalysis.grants.granted'));
    });
  });

  it('shows a cancel icon before and a check icon after when adding a scope the user does not hold', async () => {
    CommonsApi.getUserById = jest.fn().mockResolvedValue({ data: { result: [{ id: 'user1', scopes: {} }] } });
    wrapper = mountComponent();
    await runSimulation();

    const rows = wrapper.findAll('tbody tr');
    rows.forEach((row) => {
      const cells = row.findAll('td');
      // icon-only cells; the state icon lives on the outer span, the glyph is the inner one
      const beforeIcon = cells[1].find('[aria-label]');
      const afterIcon = cells[2].find('[aria-label]');
      expect(beforeIcon.exists()).toBe(true);
      expect(beforeIcon.find('.material-icons-outlined').classes()).toContain('text-danger');
      expect(beforeIcon.attributes('aria-label')).toBe(i18n.global.t('governance.accessAnalysis.grants.notGranted'));
      expect(afterIcon.find('.material-icons-outlined').classes()).toContain('text-success');
      expect(afterIcon.attributes('aria-label')).toBe(i18n.global.t('governance.accessAnalysis.grants.granted'));
    });
  });

  it('shows a check icon before and a cancel icon after when removing a scope the user holds', async () => {
    CommonsApi.getUserById = jest.fn().mockResolvedValue({ data: { result: [{ id: 'user1', scopes: {} }] } });
    wrapper = mountComponent({ simulationType: 'removeScope' });
    wrapper.vm.userSelectorReady = true;
    wrapper.vm.selectedUserValue = 'managed/alpha_user/user1';
    await flushPromises();
    // Revoke options load from the user's own scopes via getUserById
    wrapper.vm.revokeOptions = [{
      id: 'scope-1', name: 'Scope One', value: 'scope-1', text: 'Scope One', scope: scopeWithRoleAndUserPermissions,
    }];
    wrapper.vm.selectedRoleValue = 'scope/scope-1';
    await flushPromises();
    await wrapper.vm.runSimulation();
    await flushPromises();
    await wrapper.vm.$nextTick();

    const rows = wrapper.findAll('tbody tr');
    expect(rows).toHaveLength(4);
    rows.forEach((row) => {
      const cells = row.findAll('td');
      const beforeIcon = cells[1].find('[aria-label]');
      const afterIcon = cells[2].find('[aria-label]');
      expect(beforeIcon.exists()).toBe(true);
      expect(beforeIcon.find('.material-icons-outlined').classes()).toContain('text-success');
      expect(beforeIcon.attributes('aria-label')).toBe(i18n.global.t('governance.accessAnalysis.grants.granted'));
      expect(afterIcon.find('.material-icons-outlined').classes()).toContain('text-danger');
      expect(afterIcon.attributes('aria-label')).toBe(i18n.global.t('governance.accessAnalysis.grants.notGranted'));
    });
  });

  it('shows "No change" for a permission another held scope also grants when removing a scope', async () => {
    // The user holds both scopes; scope-2 also grants deleteUser, so removing
    // scope-1 must not show deleteUser as lost — it stays "No change".
    CommonsApi.getUserById = jest.fn().mockResolvedValue({
      data: { result: [{ id: 'user1', scopes: { assigned: [{ id: 'scope-1' }, { id: 'scope-2' }] } }] },
    });
    wrapper = mountComponent({
      simulationType: 'removeScope',
      getScopeById: jest.fn((id) => Promise.resolve({
        data: id === 'scope-2' ? overlappingScope : scopeWithRoleAndUserPermissions,
      })),
    });
    wrapper.vm.userSelectorReady = true;
    wrapper.vm.selectedUserValue = 'managed/alpha_user/user1';
    await flushPromises();
    wrapper.vm.revokeOptions = [
      {
        id: 'scope-1', name: 'Scope One', value: 'scope-1', text: 'Scope One', scope: scopeWithRoleAndUserPermissions,
      },
      {
        id: 'scope-2', name: 'Scope Two', value: 'scope-2', text: 'Scope Two', scope: overlappingScope,
      },
    ];
    wrapper.vm.selectedRoleValue = 'scope/scope-1';
    await flushPromises();
    await wrapper.vm.runSimulation();
    await flushPromises();
    await wrapper.vm.$nextTick();

    const rows = wrapper.findAll('tbody tr');
    expect(rows).toHaveLength(4);

    const rowTexts = rows.map((row) => row.text());
    const deleteUserRow = rows[rowTexts.findIndex((text) => text.includes(i18n.global.t('governance.accessAnalysis.scopes.permissionLabels.deleteUser')))];
    const deleteUserCells = deleteUserRow.findAll('td');
    // deleteUser survives via scope-2: still granted after
    expect(deleteUserCells[2].find('[aria-label]').find('.material-icons-outlined').classes()).toContain('text-success');

    // createRole is unique to scope-1: it flips granted -> not granted
    const createRoleRow = rows[rowTexts.findIndex((text) => text.includes(i18n.global.t('governance.accessAnalysis.scopes.permissionLabels.createRole')))];
    const createRoleCells = createRoleRow.findAll('td');
    expect(createRoleCells[1].find('[aria-label]').find('.material-icons-outlined').classes()).toContain('text-success');
    expect(createRoleCells[2].find('[aria-label]').find('.material-icons-outlined').classes()).toContain('text-danger');
  });

  it('shows "Already granted" for a permission another held scope also grants when adding a scope', async () => {
    // The user holds scope-2, which also grants deleteUser; simulating an add of
    // scope-1 must not show deleteUser as gained — it stays granted in both columns.
    CommonsApi.getUserById = jest.fn().mockResolvedValue({
      data: { result: [{ id: 'user1', scopes: { assigned: [{ id: 'scope-2' }] } }] },
    });
    wrapper = mountComponent({
      getScopeById: jest.fn((id) => Promise.resolve({
        data: id === 'scope-2' ? overlappingScope : scopeWithRoleAndUserPermissions,
      })),
    });
    await runSimulation();

    const rows = wrapper.findAll('tbody tr');
    expect(rows).toHaveLength(4);

    const rowTexts = rows.map((row) => row.text());
    // deleteUser survives via scope-2: granted both before and after
    const deleteUserRow = rows[rowTexts.findIndex((text) => text.includes(i18n.global.t('governance.accessAnalysis.scopes.permissionLabels.deleteUser')))];
    const deleteUserCells = deleteUserRow.findAll('td');
    expect(deleteUserCells[1].find('[aria-label]').find('.material-icons-outlined').classes()).toContain('text-success');
    expect(deleteUserCells[1].find('[aria-label]').attributes('aria-label')).toBe(i18n.global.t('governance.accessAnalysis.grants.granted'));
    expect(deleteUserCells[2].find('[aria-label]').find('.material-icons-outlined').classes()).toContain('text-success');

    // createRole is unique to scope-1: it flips not granted -> granted
    const createRoleRow = rows[rowTexts.findIndex((text) => text.includes(i18n.global.t('governance.accessAnalysis.scopes.permissionLabels.createRole')))];
    const createRoleCells = createRoleRow.findAll('td');
    expect(createRoleCells[1].find('[aria-label]').find('.material-icons-outlined').classes()).toContain('text-danger');
    expect(createRoleCells[2].find('[aria-label]').find('.material-icons-outlined').classes()).toContain('text-success');
  });

  it('uses a name/status table for role simulations, with no empty permissions column', async () => {
    CommonsApi.getUserById = jest.fn().mockResolvedValue({ data: { result: [{ id: 'user1', scopes: {} }] } });
    // One entitlement on the role so the results table renders; it must not produce permission rows
    RoleApi.getRoleDataById = jest.fn().mockResolvedValue({
      data: { result: [{ id: 'ent-1', descriptor: { idx: { '/entitlement': { displayName: 'Ent One' } } } }] },
    });
    CommonsApi.getUserGrants = jest.fn().mockResolvedValue({ data: { result: [] } });
    wrapper = mountComponent({ simulationType: 'addRole' });
    await runSimulation();

    const headerCells = wrapper.findAll('thead th');
    expect(headerCells.map((th) => th.text())).toEqual([
      i18n.global.t('common.name'),
      i18n.global.t('common.status'),
    ]);
    expect(wrapper.find('[data-testid^="scope-permission-icon-"]').exists()).toBe(false);
  });

  it('renders the permission circle icons in the form-editor colors with tooltip-capable ids', async () => {
    CommonsApi.getUserById = jest.fn().mockResolvedValue({ data: { result: [{ id: 'user1', scopes: {} }] } });
    wrapper = mountComponent();
    await runSimulation();

    const roleIcon = wrapper.find('#simulator-permission-viewRolesrole');
    expect(roleIcon.exists()).toBe(true);
    expect(roleIcon.attributes('aria-label')).toBe(i18n.global.t('governance.accessAnalysis.scopes.categories.role'));
    expect(roleIcon.attributes('role')).toBe('img');
    expect(roleIcon.classes()).toContain('rounded-circle');
    // form-editor palette: role=orange, user=purple
    expect(roleIcon.classes()).toContain('color-darkorange');
    expect(roleIcon.classes()).toContain('bg-lightorange');

    const userIcon = wrapper.find('#simulator-permission-deleteUseruser');
    expect(userIcon.classes()).toContain('color-darkpurple');
    expect(userIcon.classes()).toContain('bg-lightpurple');
  });

  it('renders resizable columns when the resizable-table directive is active', async () => {
    CommonsApi.getUserById = jest.fn().mockResolvedValue({ data: { result: [{ id: 'user1', scopes: {} }] } });
    wrapper = mountComponent({}, { realResizeDirective: true });
    await runSimulation();

    const table = wrapper.find('table');
    expect(table.element.parentElement.classList.contains('table-resizable')).toBe(true);
    expect(table.findAll('.resizer')).toHaveLength(3);
  });

  it('passes accessibility checks', async () => {
    CommonsApi.getUserById = jest.fn().mockResolvedValue({ data: { result: [{ id: 'user1', scopes: {} }] } });
    wrapper = mountComponent();
    await runSimulation();
    await runA11yTest(wrapper);
  });
});
