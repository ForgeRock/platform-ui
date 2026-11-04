/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { BTooltip } from 'bootstrap-vue';
import { mockRouter } from '@forgerock/platform-shared/src/testing/utils/mockRouter';
import { createAppContainer, runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import { useBreadcrumbStore } from '@forgerock/platform-shared/src/stores/breadcrumb';
import * as RoleMiningSessionApi from '@forgerock/platform-shared/src/api/governance/RoleMiningSessionApi';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import * as RoleApi from '@forgerock/platform-shared/src/api/governance/RoleApi';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import PopulationRoleMiningRoleDetails from './PopulationRoleMiningRoleDetails';
import i18n from '@/i18n';

jest.mock('@forgerock/platform-shared/src/api/governance/RoleMiningSessionApi');
jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi');
jest.mock('@forgerock/platform-shared/src/api/governance/RoleApi');
jest.mock('@forgerock/platform-shared/src/utils/notification', () => ({
  showErrorMessage: jest.fn(),
  displayNotification: jest.fn(),
}));
jest.mock('@forgerock/platform-shared/src/composables/bvModal', () => ({
  __esModule: true,
  default: () => ({ bvModal: { value: { hide: jest.fn(), show: jest.fn() } } }),
}));

const roleDetailsPage = 'governance.accessModeling.populationRoleMining.roleDetailsPage';

const session = {
  id: 'session-1',
  name: 'Engineering discovery',
  status: 'complete',
  populationSize: 52,
  singletonCount: 34,
  populationSummary: {
    filterDescription: "frIndexedString4 IN ['studio_governance']",
  },
};

const roleRow = {
  role: {
    id: 'role-1',
    name: 'Community 1 (n=44)',
    status: 'candidate',
    roleType: 'layer2_candidate',
    memberCount: 44,
    entitlementCount: 2,
    confidence: 0.7179,
    memberIds: ['user-1', 'user-2', 'user-1'], // dup: user matched via two entitlement paths
    entitlementMetadata: [
      {
        entId: 'app1/Roles/SourceOneUsers',
        displayName: '',
        appName: 'Active Directory',
        prevalenceInRole: 1,
        tier: 'role_defining',
      },
      {
        entId: 'app1/Roles/HelpDesk',
        displayName: '',
        appName: 'Active Directory',
        prevalenceInRole: 0.7,
        tier: 'common_not_universal',
      },
    ],
    popBasedJustificationMetadata: {
      communityId: 1,
      filterDescription: "frIndexedString4 IN ['studio_governance', 'database_infra']",
    },
  },
  permissions: { modifyRole: true, publishRole: true, deleteRole: true },
};

const users = [
  {
    id: 'user-1', userName: 'fyork', givenName: 'Fred', sn: 'York', mail: 'fyork@example.com', accountStatus: 'active',
  },
  {
    id: 'user-2', userName: 'jdoe', givenName: 'Jane', sn: 'Doe', mail: 'jdoe@example.com', accountStatus: 'inactive',
  },
];

describe('PopulationRoleMiningRoleDetails', () => {
  let wrapper;
  let routerPush;

  const app = createAppContainer();
  async function mountComponent(rolesResponse) {
    ({ routerPush } = mockRouter({ params: { sessionId: 'session-1', roleId: 'role-1' } }));
    setupTestPinia();
    if (wrapper) {
      wrapper.unmount();
    }
    RoleMiningSessionApi.getRoleMiningSessionRoles.mockResolvedValue(
      rolesResponse || { data: { result: [roleRow] } },
    );
    RoleMiningSessionApi.getRoleMiningSession.mockResolvedValue({ data: session });
    CommonsApi.getUsers.mockResolvedValue({ data: { result: users } });
    CommonsApi.getFilterSchema.mockResolvedValue({
      data: { user: [{ key: 'city', displayName: 'City' }] },
    });
    RoleApi.getRoleDataById.mockResolvedValue({ data: { result: users, totalHits: 44 } });
    wrapper = mount(PopulationRoleMiningRoleDetails, {
      attachTo: app,
      global: {
        plugins: [i18n],
      },
    });
    await flushPromises();
    await wrapper.vm.$nextTick();
    return wrapper;
  }

  afterEach(() => {
    jest.clearAllMocks();
    wrapper.unmount();
  });

  it('loads the role and renders its name, type, and status badges', async () => {
    await mountComponent();
    expect(RoleMiningSessionApi.getRoleMiningSessionRoles).toHaveBeenCalledWith('session-1');
    const text = wrapper.text();
    expect(text).toContain('Community 1 (n=44)');
    expect(text).toContain(i18n.global.t(`${roleDetailsPage}.specialized`));
    expect(text).toContain(i18n.global.t('governance.accessModeling.populationRoleMining.status.candidate'));
  });

  it('splits entitlements into Composition and Shared by Some tabs by tier', async () => {
    await mountComponent();
    const text = wrapper.text();
    expect(text).toContain(i18n.global.t(`${roleDetailsPage}.compositionTab`));
    expect(text).toContain(i18n.global.t(`${roleDetailsPage}.supportingAccessTab`));
    // counts render as badges in the tab titles, not parenthesized text
    const tabTitles = wrapper.findAll('.nav-link');
    expect(tabTitles.at(0).text()).toContain('1');
    expect(tabTitles.at(1).text()).toContain('1');
    expect(text).toContain('SourceOneUsers');
    // Supporting Access is lazy - its contents render after the tab is activated
    await wrapper.findAll('.nav-link')[1].trigger('click');
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('HelpDesk');
  });

  it('labels the third tab Members and renders it from the candidate members endpoint', async () => {
    await mountComponent();
    await wrapper.findAll('.nav-link')[2].trigger('click');
    await flushPromises();
    const tabTitles = wrapper.findAll('.nav-link');
    expect(tabTitles.at(2).text()).toContain(i18n.global.t(`${roleDetailsPage}.membersTab`));
    expect(RoleApi.getRoleDataById).toHaveBeenCalledWith('role-1', 'candidate', 'members', expect.objectContaining({
      _pageSize: 10,
      _pagedResultsOffset: 0,
    }));
    expect(wrapper.text()).toContain('fyork');
    expect(wrapper.text()).toContain('jdoe');
    expect(wrapper.findAll('.nav-link').at(2).text()).toContain('44');
  });

  it('renders the Shared by Some tooltip content, wired to hover and focus', async () => {
    await mountComponent();
    // BTooltip renders into its target element's content only once shown in jsdom; assert
    // the wiring (target id + triggers) rather than opening the tooltip itself
    const tooltip = wrapper.findComponent(BTooltip);
    expect(tooltip.exists()).toBe(true);
    expect(tooltip.props('triggers')).toBe('focus hover');
    const label = wrapper.find(`#${tooltip.props('target')}`);
    expect(label.exists()).toBe(true);
    expect(label.text()).toContain(i18n.global.t(`${roleDetailsPage}.supportingAccessTab`));
  });

  it('falls back to the entId path segment for entitlements with an empty displayName', async () => {
    await mountComponent();
    expect(wrapper.text()).toContain('SourceOneUsers');
    expect(wrapper.text()).toContain('Active Directory');
    expect(wrapper.text()).toContain('100%');
  });

  it('renders the entitlements tables without selection checkboxes and with a right-aligned search bar', async () => {
    await mountComponent();
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(false);

    // composition tab's search bar sits right-aligned within its card
    const search = wrapper.find('[data-testid="composition-entitlements-search"]');
    expect(search.exists()).toBe(true);
    expect(search.element.closest('.card-body').classList.contains('justify-content-end')).toBe(true);

    // typing filters the rows client-side
    await search.find('input').setValue('Source');
    await wrapper.vm.$nextTick();
    const names = wrapper.findAll('tbody tr td:nth-child(1)').map((cell) => cell.text());
    expect(names).toEqual(['SourceOneUsers']);
  });

  it('requests only the fields backing the members table columns and pages server-side', async () => {
    await mountComponent();
    await wrapper.findAll('.nav-link')[2].trigger('click');
    await flushPromises();

    expect(RoleApi.getRoleDataById).toHaveBeenCalledWith('role-1', 'candidate', 'members', expect.objectContaining({
      _fields: 'userName,givenName,sn,mail,accountStatus',
      _pageSize: 10,
      _pagedResultsOffset: 0,
    }));

    // moving to page 2 fetches with the page-2 offset
    RoleApi.getRoleDataById.mockClear();
    RoleApi.getRoleDataById.mockResolvedValue({ data: { result: users, totalHits: 44 } });
    await wrapper.findComponent({ name: 'Pagination' }).vm.$emit('input', 2);
    await flushPromises();
    expect(RoleApi.getRoleDataById).toHaveBeenLastCalledWith('role-1', 'candidate', 'members', expect.objectContaining({
      _pagedResultsOffset: 10,
    }));
  });

  it('renders the total from the members endpoint and pages by it', async () => {
    RoleApi.getRoleDataById.mockResolvedValue({ data: { result: users, totalHits: 44 } });
    await mountComponent();
    await wrapper.findAll('.nav-link')[2].trigger('click');
    await flushPromises();
    expect(wrapper.findComponent({ name: 'Pagination' }).props('totalRows')).toBe(44);
  });

  it('shows a spinner while the members call is in flight, then the rows', async () => {
    // mountComponent's mocks resolve immediately, so the pending promise must be
    // installed after it to hold the request in flight
    await mountComponent();
    let resolveMembers;
    RoleApi.getRoleDataById.mockImplementation(() => new Promise((resolve) => { resolveMembers = resolve; }));
    await wrapper.findAll('.nav-link')[2].trigger('click');
    await wrapper.vm.$nextTick();

    // in flight: spinner shows, table does not
    expect(wrapper.find('[data-testid="identities-spinner"]').exists()).toBe(true);

    resolveMembers({ data: { result: users, totalHits: 2 } });
    await flushPromises();
    expect(wrapper.find('[data-testid="identities-spinner"]').exists()).toBe(false);
    expect(wrapper.text()).toContain('fyork');
  });

  it('renders a collapsed Session Context card below the badges that expands on toggle', async () => {
    await mountComponent();
    const card = wrapper.find('[data-testid="session-context-card"]');
    // below the role name + badges, above the tabs: compare positions among the
    // page container's children
    const badgesRow = wrapper.find('.role-type-badge').element.parentElement;
    const tabsRoot = wrapper.findComponent({ name: 'BTabs' }).element;
    const children = Array.from(card.element.parentElement.children);
    const cardIndex = children.indexOf(card.element);
    expect(cardIndex).toBeGreaterThan(children.indexOf(badgesRow));
    expect(cardIndex).toBeLessThan(children.indexOf(tabsRoot));
    const toggle = wrapper.find('[data-testid="session-context-toggle"]');
    expect(toggle.attributes('aria-expanded')).toBe('false');
    // BCollapse hides content by dropping its `show` class (CSS-driven)
    const collapse = card.find('#session-context-collapse');
    expect(collapse.classes()).not.toContain('show');

    // expanding reveals the pairs
    await toggle.trigger('click');
    await wrapper.vm.$nextTick();
    expect(toggle.attributes('aria-expanded')).toBe('true');
    expect(collapse.classes()).toContain('show');
    const text = card.text();
    expect(text).toContain(i18n.global.t(`${roleDetailsPage}.sessionContext`));
    expect(text).toContain('session-1');
    expect(text).toContain('52 identities analysed');
    // the role's own filterDescription wins over the session's
    expect(text).toContain("frIndexedString4 IN ['studio_governance', 'database_infra']");
    expect(text).toContain('1');
    // four key/value pairs, each rendered as a dt/dd column pair; the second pair in each
    // row is offset to add space between the columns
    const labels = card.findAll('dt');
    expect(labels.length).toBe(4);
    expect(labels[0].classes()).toContain('col-md-2');
    expect(labels[1].classes()).toContain('offset-md-1');
    expect(card.findAll('dd').at(0).classes()).toContain('col-md-3');

    // collapsing again hides them
    await toggle.trigger('click');
    await wrapper.vm.$nextTick();
    expect(toggle.attributes('aria-expanded')).toBe('false');
    expect(collapse.classes()).not.toContain('show');
  });

  it('shows the Create Draft Role button when permissions allow', async () => {
    await mountComponent();
    expect(wrapper.find('[data-testid="move-to-draft-button"]').exists()).toBe(true);
    expect(wrapper.text()).toContain(i18n.global.t(`${roleDetailsPage}.createDraftRole`));
  });

  it('does not render a rename control', async () => {
    await mountComponent();
    expect(wrapper.find('[data-testid="rename-role-button"]').exists()).toBe(false);
    expect(wrapper.find('input[type="text"]').exists()).toBe(false);
  });

  it('hides the Create Draft Role button without publish permission', async () => {
    await mountComponent({
      data: {
        result: [{
          ...roleRow,
          permissions: { modifyRole: false, publishRole: false, deleteRole: false },
        }],
      },
    });
    expect(wrapper.find('[data-testid="move-to-draft-button"]').exists()).toBe(false);
  });

  it('creates the draft role from schema-conformant fields and navigates to it', async () => {
    RoleApi.createRole.mockResolvedValue({ data: { role: { id: 'new-draft-1' } } });
    await mountComponent();
    await wrapper.find('[data-testid="move-to-draft-button"]').trigger('click');
    await flushPromises();
    // The mined-only fields (roleType, sessionId, memberIds, popBasedJustificationMetadata)
    // must not be sent - the backend rejects them on draft creation. Only role-defining
    // (composition) entitlements are sent, members ride along as addedRoleMembers, the
    // server-side counts are recomputed, and a null confidence is omitted entirely.
    expect(RoleApi.createRole).toHaveBeenCalledWith({
      role: {
        name: 'Community 1 (n=44)',
        entitlements: ['app1/Roles/SourceOneUsers'],
        addedRoleMembers: ['user-1', 'user-2', 'user-1'],
        confidence: 0.7179,
      },
    });
    // Flags the details page so the members tab hides the attribute-distribution card
    expect(routerPush).toHaveBeenCalledWith({
      name: 'AccessModelingDetails',
      params: { status: 'draft', roleId: 'new-draft-1', tab: 'details' },
      state: { hideAttributeDistribution: true },
    });
    expect(displayNotification).toHaveBeenCalled();
  });

  it('falls back to the entitlements string and omits a null confidence when creating the draft', async () => {
    RoleApi.createRole.mockResolvedValue({ data: { role: { id: 'new-draft-2' } } });
    await mountComponent({
      data: {
        result: [{
          role: {
            ...roleRow.role,
            confidence: null,
            entitlementMetadata: [],
            entitlements: 'app1/Roles/SourceOneUsers app1/Roles/HelpDesk',
          },
          permissions: roleRow.permissions,
        }],
      },
    });
    await wrapper.find('[data-testid="move-to-draft-button"]').trigger('click');
    await flushPromises();
    // Without tier metadata every entitlement counts as composition (the fallback cannot
    // distinguish tiers, so nothing is dropped)
    expect(RoleApi.createRole).toHaveBeenCalledWith({
      role: {
        name: 'Community 1 (n=44)',
        entitlements: ['app1/Roles/SourceOneUsers', 'app1/Roles/HelpDesk'],
        addedRoleMembers: ['user-1', 'user-2', 'user-1'],
      },
    });
  });

  it('uses the entitlements array for the draft when the API returns the new array format', async () => {
    RoleApi.createRole.mockResolvedValue({ data: { role: { id: 'new-draft-3' } } });
    await mountComponent({
      data: {
        result: [{
          role: {
            ...roleRow.role,
            confidence: null,
            entitlementMetadata: [],
            entitlements: ['app1/Roles/SourceOneUsers', 'app1/Roles/HelpDesk'],
          },
          permissions: roleRow.permissions,
        }],
      },
    });
    await wrapper.find('[data-testid="move-to-draft-button"]').trigger('click');
    await flushPromises();
    expect(RoleApi.createRole).toHaveBeenCalledWith({
      role: {
        name: 'Community 1 (n=44)',
        entitlements: ['app1/Roles/SourceOneUsers', 'app1/Roles/HelpDesk'],
        addedRoleMembers: ['user-1', 'user-2', 'user-1'],
      },
    });
  });

  it('labels a layer1_universal role as birthright', async () => {
    await mountComponent({
      data: {
        result: [{
          role: { ...roleRow.role, roleType: 'layer1_universal' },
          permissions: roleRow.permissions,
        }],
      },
    });
    expect(wrapper.text()).toContain(i18n.global.t('governance.accessModeling.populationRoleMining.mode.birthright'));
  });

  it('puts every entitlement of a layer1_universal role in the Composition tab', async () => {
    // Layer-1 entitlement metadata carries tier 'universal', not 'role_defining' —
    // it must not fall into the Supporting Access bucket
    await mountComponent({
      data: {
        result: [{
          role: {
            ...roleRow.role,
            roleType: 'layer1_universal',
            entitlementMetadata: [
              {
                entId: 'app1/Roles/SourceOneUsers',
                displayName: 'Source One Users',
                appName: 'Active Directory',
                prevalenceInRole: 1,
                tier: 'universal',
              },
              {
                entId: 'app1/Roles/HelpDesk',
                displayName: 'Help Desk',
                appName: 'Active Directory',
                prevalenceInRole: 0.9,
                tier: 'universal',
              },
            ],
          },
          permissions: roleRow.permissions,
        }],
      },
    });

    const tabTitles = wrapper.findAll('.nav-link');
    expect(tabTitles.at(0).text()).toContain('2');
    expect(tabTitles.at(1).text()).toContain('0');
    // display names render in the composition table, not the entId path segments
    expect(wrapper.text()).toContain('Source One Users');
    expect(wrapper.text()).toContain('Help Desk');
  });

  it('shows an error notification when the role cannot be found in the session roles', async () => {
    await mountComponent({ data: { result: [] } });
    expect(showErrorMessage).toHaveBeenCalled();
  });

  it('shows an error notification when loading identities fails', async () => {
    await mountComponent();
    RoleApi.getRoleDataById.mockRejectedValue(new Error('failed'));
    await wrapper.findAll('.nav-link')[2].trigger('click');
    await flushPromises();
    expect(showErrorMessage).toHaveBeenCalledWith(
      expect.any(Error),
      i18n.global.t(`${roleDetailsPage}.failedGettingIdentities`),
    );
  });

  it('sets the breadcrumb back to the session results', async () => {
    await mountComponent();
    const breadcrumbStore = useBreadcrumbStore();
    expect(breadcrumbStore.returnRoute).toBe('/access-modeling/population-role-mining/session-1');
    expect(breadcrumbStore.returnRouteText).toBe(i18n.global.t('governance.accessModeling.populationRoleMining.sessionResultsPage.title'));
  });

  it('passes accessibility checks', async () => {
    await mountComponent();
    await runA11yTest(wrapper);
  });
});
