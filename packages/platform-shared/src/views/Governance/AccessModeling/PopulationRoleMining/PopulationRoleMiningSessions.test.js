/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { DOMWrapper, flushPromises, mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import { mockRouter } from '@forgerock/platform-shared/src/testing/utils/mockRouter';
import {
  createAppContainer,
  findByTestId,
  runA11yTest,
  toggleActionsMenu,
} from '@forgerock/platform-shared/src/utils/testHelpers';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import { useBreadcrumbStore } from '@forgerock/platform-shared/src/stores/breadcrumb';
import * as RoleMiningSessionApi from '@forgerock/platform-shared/src/api/governance/RoleMiningSessionApi';
import * as RoleApi from '@forgerock/platform-shared/src/api/governance/RoleApi';
import { displayNotification, showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import PopulationRoleMiningSessions from './PopulationRoleMiningSessions';
import i18n from '@/i18n';

jest.mock('@forgerock/platform-shared/src/api/governance/RoleMiningSessionApi');
jest.mock('@forgerock/platform-shared/src/api/governance/RoleApi');
jest.mock('@forgerock/platform-shared/src/utils/notification', () => ({
  showErrorMessage: jest.fn(),
  displayNotification: jest.fn(),
}));
jest.mock('@forgerock/platform-shared/src/composables/bvModal', () => ({
  __esModule: true,
  default: () => ({ bvModal: { value: { hide: jest.fn(), show: jest.fn() } } }),
}));

const sessions = [
  {
    id: 's1',
    name: 'Session 1',
    status: 'complete',
    createdAt: '2026-09-20T10:00:00Z',
    sessionOwnerUserName: 'user1',
    sessionOwner: 'user-1',
    layer1RoleCount: 1,
    candidateRoleCount: 4,
    populationSize: 50,
    singletonCount: 30,
  },
];

describe('PopulationRoleMiningSessions', () => {
  let wrapper;
  let routerPush;
  const domWrapper = new DOMWrapper(document.body);

  const app = createAppContainer();
  async function mountComponent({ governanceDevEnabled = false } = {}) {
    ({ routerPush } = mockRouter());
    setupTestPinia({ user: { userId: 'user-1', userName: 'user1' } });
    // unmount any previous mount so its menus/table don't linger in document.body
    if (wrapper) {
      wrapper.unmount();
    }
    const store = createStore({
      state: { SharedStore: { governanceDevEnabled } },
    });
    wrapper = mount(PopulationRoleMiningSessions, {
      attachTo: app,
      global: {
        plugins: [i18n, store],
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

  it('loads and renders the sessions table on mount', async () => {
    RoleMiningSessionApi.getRoleMiningSessionList.mockResolvedValue({ data: { result: sessions, totalHits: 1 } });
    await mountComponent();
    expect(RoleMiningSessionApi.getRoleMiningSessionList).toHaveBeenCalled();
    expect(wrapper.text()).toContain('user1');
    expect(wrapper.text()).toContain(i18n.global.t('governance.accessModeling.populationRoleMining.status.complete'));
  });

  it('requests the first page sorted by createdAt descending with the date sortType', async () => {
    RoleMiningSessionApi.getRoleMiningSessionList.mockResolvedValue({ data: { result: [], totalHits: 0 } });
    await mountComponent();
    expect(RoleMiningSessionApi.getRoleMiningSessionList).toHaveBeenCalledWith({
      _pageSize: 10,
      _pagedResultsOffset: 0,
      _sortKeys: '-createdAt',
      _sortType: 'date',
    });
  });

  it('renders the columns: Date, Status, Username, Identities, combined Roles count, and actions', async () => {
    RoleMiningSessionApi.getRoleMiningSessionList.mockResolvedValue({ data: { result: sessions, totalHits: 1 } });
    await mountComponent();
    // sortable headers get a "(Click to sort ...)" hint appended by BTable - match on prefix
    const headers = wrapper.findAll('th').map((header) => header.text());
    expect(headers[0]).toContain(i18n.global.t('common.date'));
    expect(headers.some((header) => header.startsWith(i18n.global.t('common.status')))).toBe(true);
    expect(headers.some((header) => header.startsWith(i18n.global.t('common.user.userName')))).toBe(true);
    expect(headers.some((header) => header.startsWith(
      i18n.global.t('governance.accessModeling.populationRoleMining.sessionCard.identities'),
    ))).toBe(true);
    expect(headers.some((header) => header.startsWith(i18n.global.t('common.roles')))).toBe(true);
    // only the Date column is sortable
    expect(headers[0]).toContain('Click to sort');
    expect(headers.slice(1, 5).every((header) => !header.includes('Click to sort'))).toBe(true);
  });

  it('re-sorts server-side when the Date column header is clicked, resetting to the first page', async () => {
    RoleMiningSessionApi.getRoleMiningSessionList.mockResolvedValue({ data: { result: sessions, totalHits: 1 } });
    await mountComponent();

    RoleMiningSessionApi.getRoleMiningSessionList.mockClear();
    RoleMiningSessionApi.getRoleMiningSessionList.mockResolvedValue({ data: { result: sessions, totalHits: 1 } });
    await wrapper.findComponent({ name: 'BTable' }).vm.$emit('sort-changed', { sortBy: 'createdAt', sortDesc: false });
    await flushPromises();

    expect(RoleMiningSessionApi.getRoleMiningSessionList).toHaveBeenCalledWith({
      _pageSize: 10,
      _pagedResultsOffset: 0,
      _sortKeys: 'createdAt', // ascending - no minus prefix
      _sortType: 'date',
    });
  });

  it('renders the creation date and combines birthright and candidate role counts into one Roles value', async () => {
    RoleMiningSessionApi.getRoleMiningSessionList.mockResolvedValue({ data: { result: sessions, totalHits: 1 } });
    await mountComponent();
    const text = wrapper.text();
    expect(text).toContain('user1'); // Initiating User column
    expect(text).toContain('2026'); // Date column (dayjs-formatted createdAt)
    expect(text).toContain('5'); // roles = 1 birthright + 4 candidate
    expect(text).toContain('50'); // identities
  });

  it('renders the Date column with the time alongside the date', async () => {
    RoleMiningSessionApi.getRoleMiningSessionList.mockResolvedValue({ data: { result: sessions, totalHits: 1 } });
    await mountComponent();
    // dayjs default locale renders 10:00Z in the test environment's local zone - assert the
    // time-of-day portion is present rather than pinning a timezone-dependent string
    expect(wrapper.text()).toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/);
  });

  it('shows the blank value indicator when a session has no createdAt', async () => {
    const noDate = [{ ...sessions[0], createdAt: undefined }];
    RoleMiningSessionApi.getRoleMiningSessionList.mockResolvedValue({ data: { result: noDate, totalHits: 1 } });
    await mountComponent();
    expect(wrapper.text()).toContain('--');
  });

  it('renders the View Results action in the row actions menu, enabled only for complete sessions', async () => {
    RoleMiningSessionApi.getRoleMiningSessionList.mockResolvedValue({ data: { result: sessions, totalHits: 1 } });
    await mountComponent();
    // the actions kebab menu is present per row
    expect(findByTestId(wrapper, 'actions-s1').exists()).toBe(true);
    // open the menu; its content teleports to #app, so query the DOM wrapper. Both the
    // pagination's page-size dropdown and BPagination's page buttons use role="menuitem",
    // so scope to the actions menu by its View Results content.
    await toggleActionsMenu(domWrapper);
    const viewResultsText = i18n.global.t('governance.accessModeling.populationRoleMining.sessionCard.viewResults');
    const findViewResultsItems = () => domWrapper
      .findAll('ul[role="menu"] [role="menuitem"]')
      .filter((item) => item.text().includes(viewResultsText));
    let menuItems = findViewResultsItems();
    expect(menuItems.length).toBe(1);
    expect(menuItems[0].classes()).not.toContain('disabled');

    const running = [{ ...sessions[0], id: 's2', status: 'running' }];
    RoleMiningSessionApi.getRoleMiningSessionList.mockResolvedValue({ data: { result: running, totalHits: 1 } });
    await mountComponent();
    await toggleActionsMenu(domWrapper);
    menuItems = findViewResultsItems();
    // BDropdownItem renders disabled state as a class + aria-disabled, not a disabled attribute
    expect(menuItems[0].classes()).toContain('disabled');
  });

  it('navigates to the session results page when View Results is clicked', async () => {
    RoleMiningSessionApi.getRoleMiningSessionList.mockResolvedValue({ data: { result: sessions, totalHits: 1 } });
    await mountComponent();
    await toggleActionsMenu(domWrapper);
    const viewResultsText = i18n.global.t('governance.accessModeling.populationRoleMining.sessionCard.viewResults');
    const viewResultsItems = domWrapper
      .findAll('ul[role="menu"] [role="menuitem"]')
      .filter((item) => item.text().includes(viewResultsText));
    const viewResultsItem = viewResultsItems[0];
    await viewResultsItem.trigger('click');
    expect(routerPush).toHaveBeenCalledWith({
      name: 'PopulationRoleMiningSessionResults',
      params: { sessionId: 's1' },
    });
  });

  it('navigates to the session results when a row is clicked, with a pointer cursor', async () => {
    RoleMiningSessionApi.getRoleMiningSessionList.mockResolvedValue({ data: { result: sessions, totalHits: 1 } });
    await mountComponent();
    expect(wrapper.find('tbody tr').classes()).toContain('cursor-pointer');
    await wrapper.find('tbody tr').trigger('click');
    expect(routerPush).toHaveBeenCalledWith({
      name: 'PopulationRoleMiningSessionResults',
      params: { sessionId: 's1' },
    });
  });

  it('offers Duplicate on every row, between View Results and Delete, and hands the session to the new-session page', async () => {
    RoleMiningSessionApi.getRoleMiningSessionList.mockResolvedValue({ data: { result: sessions, totalHits: 1 } });
    const fullSession = {
      id: 's1',
      parameters: {
        roleType: 'job',
        filterCriteria: { department: ['Engineering'] },
        similarityThreshold: 0.4,
      },
    };
    RoleMiningSessionApi.getRoleMiningSession.mockResolvedValue({ data: fullSession });
    await mountComponent();

    await toggleActionsMenu(domWrapper);
    const duplicateText = i18n.global.t('common.duplicate');
    const findMenuItems = () => domWrapper
      .findAll('ul[role="menu"] [role="menuitem"]')
      .filter((item) => item.text().includes(duplicateText));
    // Duplicate renders once in the row's actions menu (earlier mounts' menus can linger
    // in document.body, so filter by content rather than index)
    const menuItems = findMenuItems();
    expect(menuItems.length).toBe(1);
    expect(menuItems[0].text()).toContain(duplicateText);

    await menuItems[0].trigger('click');
    await flushPromises();
    // the full session (with parameters) is fetched fresh and passed through router state
    expect(RoleMiningSessionApi.getRoleMiningSession).toHaveBeenCalledWith('s1');
    expect(routerPush).toHaveBeenCalledWith({
      name: 'PopulationRoleMiningNewSession',
      state: { duplicatedSession: fullSession },
    });
  });

  it('shows an error notification when the duplicated session cannot be fetched', async () => {
    RoleMiningSessionApi.getRoleMiningSessionList.mockResolvedValue({ data: { result: sessions, totalHits: 1 } });
    RoleMiningSessionApi.getRoleMiningSession.mockRejectedValue(new Error('failed'));
    await mountComponent();

    await wrapper.vm.duplicateSession(sessions[0]);
    expect(showErrorMessage).toHaveBeenCalled();
    expect(routerPush).not.toHaveBeenCalled();
  });

  it('renders the initializing status with a translation', async () => {
    const initializing = [{ ...sessions[0], id: 's-init', status: 'initializing' }];
    RoleMiningSessionApi.getRoleMiningSessionList.mockResolvedValue({ data: { result: initializing, totalHits: 1 } });
    await mountComponent();
    expect(wrapper.text()).toContain(
      i18n.global.t('governance.accessModeling.populationRoleMining.status.initializing'),
    );
  });

  it('does not navigate when a non-complete session row is clicked, and gives it no pointer cursor', async () => {
    const pendingSessions = [{ ...sessions[0], id: 's-pending', status: 'pending' }];
    RoleMiningSessionApi.getRoleMiningSessionList.mockResolvedValue({ data: { result: pendingSessions, totalHits: 1 } });
    await mountComponent();
    const row = wrapper.find('tbody tr');
    expect(row.classes()).not.toContain('cursor-pointer');
    await row.trigger('click');
    expect(routerPush).not.toHaveBeenCalled();
  });

  it('hides the delete action when the dev flag is off', async () => {
    RoleMiningSessionApi.getRoleMiningSessionList.mockResolvedValue({ data: { result: sessions, totalHits: 1 } });
    await mountComponent();
    expect(wrapper.find('[data-testid="delete-session-s1"]').exists()).toBe(false);
  });

  it('shows the delete action in the row menu when the dev flag is on, disabled for other users sessions', async () => {
    RoleMiningSessionApi.getRoleMiningSessionList.mockResolvedValue({ data: { result: sessions, totalHits: 1 } });
    await mountComponent({ governanceDevEnabled: true });
    await toggleActionsMenu(domWrapper);
    const deleteText = i18n.global.t('governance.accessModeling.populationRoleMining.sessionCard.deleteSession');
    const ownItems = domWrapper
      .findAll('ul[role="menu"] [role="menuitem"]')
      .filter((item) => item.text().includes(deleteText));
    expect(ownItems.length).toBe(1);
    expect(ownItems[0].classes()).not.toContain('disabled');

    const othersSession = [{ ...sessions[0], id: 's2', sessionOwner: 'someone-else' }];
    RoleMiningSessionApi.getRoleMiningSessionList.mockResolvedValue({ data: { result: othersSession, totalHits: 1 } });
    await mountComponent({ governanceDevEnabled: true });
    await toggleActionsMenu(domWrapper);
    const otherItems = domWrapper
      .findAll('ul[role="menu"] [role="menuitem"]')
      .filter((item) => item.text().includes(deleteText));
    // BDropdownItem renders disabled state as a class + aria-disabled, not a disabled attribute
    expect(otherItems[0].classes()).toContain('disabled');
  });

  it.each([
    ['sessionOwner bare id', { sessionOwner: 'user-1' }],
    ['ownerId bare id', { ownerId: 'user-1' }],
    ['sessionOwner full path', { sessionOwner: 'managed/user/user-1' }],
    ['ownerId full path', { ownerId: 'managed/user/user-1' }],
  ])('recognizes ownership from %s so delete stays enabled', async (_label, owner) => {
    RoleMiningSessionApi.getRoleMiningSessionList.mockResolvedValue({
      data: { result: [{ ...sessions[0], ...owner }], totalHits: 1 },
    });
    await mountComponent({ governanceDevEnabled: true });
    await toggleActionsMenu(domWrapper);
    const deleteText = i18n.global.t('governance.accessModeling.populationRoleMining.sessionCard.deleteSession');
    const items = domWrapper
      .findAll('ul[role="menu"] [role="menuitem"]')
      .filter((item) => item.text().includes(deleteText));
    expect(items[0].classes()).not.toContain('disabled'); // owner can delete
  });

  it('deletes a session after confirmation and reloads the list', async () => {
    RoleMiningSessionApi.getRoleMiningSessionList.mockResolvedValue({ data: { result: sessions, totalHits: 1 } });
    RoleMiningSessionApi.deleteRoleMiningSession.mockResolvedValue({});
    await mountComponent({ governanceDevEnabled: true });

    await toggleActionsMenu(domWrapper);
    const deleteText = i18n.global.t('governance.accessModeling.populationRoleMining.sessionCard.deleteSession');
    const deleteItems = domWrapper
      .findAll('ul[role="menu"] [role="menuitem"]')
      .filter((item) => item.text().includes(deleteText));
    expect(deleteItems.length).toBe(1);
    await deleteItems[0].trigger('click');

    // the confirmation modal opens; confirming calls the delete API
    RoleMiningSessionApi.getRoleMiningSessionList.mockClear();
    await wrapper.vm.deleteSession();
    expect(RoleMiningSessionApi.deleteRoleMiningSession).toHaveBeenCalledWith('s1');
    expect(displayNotification).toHaveBeenCalledWith('success', expect.any(String));
    // the list reloads after a successful delete
    expect(RoleMiningSessionApi.getRoleMiningSessionList).toHaveBeenCalled();
  });

  it('shows an error notification and does not reload when the delete fails', async () => {
    RoleMiningSessionApi.getRoleMiningSessionList.mockResolvedValue({ data: { result: sessions, totalHits: 1 } });
    RoleMiningSessionApi.deleteRoleMiningSession.mockRejectedValue(new Error('failed'));
    await mountComponent({ governanceDevEnabled: true });

    // handleDelete sets the pending session before the modal confirmation
    await wrapper.vm.handleDelete(sessions[0]);
    await wrapper.vm.deleteSession();
    expect(showErrorMessage).toHaveBeenCalled();
    expect(displayNotification).not.toHaveBeenCalled();
  });

  it('renders the sessions-run stat card from the response totalHits', async () => {
    // 12 total sessions but only one in this page of results - the card shows the total, not the row count
    const pageOfOne = [{ ...sessions[0], candidateRoleCount: 4 }];
    RoleMiningSessionApi.getRoleMiningSessionList.mockResolvedValue({ data: { result: pageOfOne, totalHits: 12 } });
    await mountComponent();
    const text = wrapper.text();
    expect(text).toContain(i18n.global.t('governance.accessModeling.populationRoleMining.statCards.sessionsRun'));
    expect(text).toContain('12'); // from totalHits, not the single row returned
  });

  it('requests paginated results and renders pagination when there is more than one page', async () => {
    const fullPage = Array.from({ length: 10 }, (_, index) => ({
      id: `s${index}`,
      status: 'complete',
      sessionOwnerUserName: 'user1',
      createdAt: '2026-09-20T10:00:00Z',
    }));
    RoleMiningSessionApi.getRoleMiningSessionList.mockResolvedValue({ data: { result: fullPage, totalHits: 11 } });
    await mountComponent();
    expect(RoleMiningSessionApi.getRoleMiningSessionList).toHaveBeenCalledWith({
      _pageSize: 10,
      _pagedResultsOffset: 0,
      _sortKeys: '-createdAt',
      _sortType: 'date',
    });
    expect(wrapper.find('.pagination').exists()).toBe(true);

    // changing the page re-requests with the new offset - emit the input event rather than
    // clicking the inner BPagination button, which does not propagate in jsdom
    RoleMiningSessionApi.getRoleMiningSessionList.mockClear();
    RoleMiningSessionApi.getRoleMiningSessionList.mockResolvedValue({ data: { result: fullPage, totalHits: 11 } });
    await wrapper.findComponent({ name: 'Pagination' }).vm.$emit('input', 2);
    await flushPromises();
    expect(RoleMiningSessionApi.getRoleMiningSessionList).toHaveBeenCalledWith({
      _pageSize: 10,
      _pagedResultsOffset: 10,
      _sortKeys: '-createdAt',
      _sortType: 'date',
    });
  });

  it('re-requests from the first page when the page size changes', async () => {
    const fullPage = Array.from({ length: 10 }, (_, index) => ({
      id: `s${index}`,
      status: 'complete',
      sessionOwnerUserName: 'user1',
      createdAt: '2026-09-20T10:00:00Z',
    }));
    RoleMiningSessionApi.getRoleMiningSessionList.mockResolvedValue({ data: { result: fullPage, totalHits: 40 } });
    await mountComponent();

    RoleMiningSessionApi.getRoleMiningSessionList.mockClear();
    RoleMiningSessionApi.getRoleMiningSessionList.mockResolvedValue({ data: { result: fullPage, totalHits: 40 } });
    await wrapper.findComponent({ name: 'Pagination' }).vm.$emit('on-page-size-change', 20);
    await flushPromises();

    expect(RoleMiningSessionApi.getRoleMiningSessionList).toHaveBeenCalledWith({
      _pageSize: 20,
      _pagedResultsOffset: 0,
      _sortKeys: '-createdAt',
      _sortType: 'date',
    });
  });

  it('keeps pagination visible when all sessions fit on one page (size selector stays reachable)', async () => {
    RoleMiningSessionApi.getRoleMiningSessionList.mockResolvedValue({ data: { result: sessions, totalHits: 1 } });
    await mountComponent();
    expect(wrapper.find('.pagination').exists()).toBe(true);
  });

  it('hides pagination when there are no sessions', async () => {
    RoleMiningSessionApi.getRoleMiningSessionList.mockResolvedValue({ data: { result: [], totalHits: 0 } });
    await mountComponent();
    expect(wrapper.find('.pagination').exists()).toBe(false);
  });

  it('renders the header inline with the hub card that opened it', async () => {
    RoleMiningSessionApi.getRoleMiningSessionList.mockResolvedValue({ data: { result: [], totalHits: 0 } });
    await mountComponent();
    expect(wrapper.text()).toContain(i18n.global.t('governance.accessModeling.populationRoleMining.title'));
    expect(wrapper.text()).toContain(i18n.global.t('governance.accessModeling.populationRoleMining.subtitle'));
  });

  it('sets the breadcrumb back to the access modeling hub', async () => {
    RoleMiningSessionApi.getRoleMiningSessionList.mockResolvedValue({ data: { result: [], totalHits: 0 } });
    await mountComponent();
    const breadcrumbStore = useBreadcrumbStore();
    expect(breadcrumbStore.returnRoute).toBe('/access-modeling');
    expect(breadcrumbStore.returnRouteText).toBe(i18n.global.t('governance.accessModeling.hub.title'));
  });

  it('navigates to the new session page when the new discovery session button is clicked', async () => {
    RoleMiningSessionApi.getRoleMiningSessionList.mockResolvedValue({ data: { result: [], totalHits: 0 } });
    await mountComponent();
    await wrapper.find('[data-testid="new-population-role-mining-session-button"]').trigger('click');
    expect(routerPush).toHaveBeenCalledWith({ name: 'PopulationRoleMiningNewSession' });
  });

  it('shows an error notification when loading sessions fails', async () => {
    RoleMiningSessionApi.getRoleMiningSessionList.mockRejectedValue(new Error('failed'));
    await mountComponent();
    expect(showErrorMessage).toHaveBeenCalled();
  });

  it('renders the empty state when there are no sessions', async () => {
    RoleMiningSessionApi.getRoleMiningSessionList.mockResolvedValue({ data: { result: [], totalHits: 0 } });
    await mountComponent();
    expect(wrapper.text()).toContain(i18n.global.t('governance.accessModeling.populationRoleMining.table.noResults'));
  });

  it('disables the new discovery session button once 5 sessions are active', async () => {
    const fiveActiveSessions = Array.from({ length: 5 }, (_, index) => ({
      id: `s${index}`,
      name: `Session ${index}`,
      status: 'running',
      sessionOwnerUserName: 'user1',
    }));
    RoleMiningSessionApi.getRoleMiningSessionList.mockResolvedValue({ data: { result: fiveActiveSessions, totalHits: 5 } });
    await mountComponent();
    expect(wrapper.find('[data-testid="new-population-role-mining-session-button"]').attributes('disabled')).toBeDefined();
    expect(wrapper.text()).toContain(i18n.global.t('governance.accessModeling.populationRoleMining.sessionLimitReached'));
  });

  it('re-requests the current page and sort when the refresh button is clicked', async () => {
    const fullPage = Array.from({ length: 10 }, (_, index) => ({
      id: `s${index}`,
      status: 'complete',
      sessionOwnerUserName: 'user1',
      createdAt: '2026-09-20T10:00:00Z',
    }));
    RoleMiningSessionApi.getRoleMiningSessionList.mockResolvedValue({ data: { result: fullPage, totalHits: 11 } });
    await mountComponent();
    await wrapper.findComponent({ name: 'Pagination' }).vm.$emit('input', 2);

    RoleMiningSessionApi.getRoleMiningSessionList.mockClear();
    RoleMiningSessionApi.getRoleMiningSessionList.mockResolvedValue({ data: { result: fullPage, totalHits: 11 } });
    await wrapper.find('[data-testid="refresh-sessions-button"]').trigger('click');
    await flushPromises();

    expect(RoleMiningSessionApi.getRoleMiningSessionList).toHaveBeenCalledWith({
      _pageSize: 10,
      _pagedResultsOffset: 10, // page 2 preserved, not reset to the first page
      _sortKeys: '-createdAt',
      _sortType: 'date',
    });
  });

  describe('Pop Based Roles tab', () => {
    const popRoles = [
      {
        role: {
          id: 'role1',
          name: 'Pop Role 1',
          status: 'candidate',
          sessionId: 's1',
          memberCount: 12,
          entitlementCount: 3,
        },
      },
    ];

    beforeEach(() => {
      RoleMiningSessionApi.getRoleMiningSessionList.mockResolvedValue({ data: { result: sessions, totalHits: 1 } });
      RoleApi.getRoleList.mockResolvedValue({
        data: { result: popRoles, totalHits: 1 },
      });
    });

    it('shows the Sessions and Pop Based Roles tabs, with Sessions active and no role query on mount', async () => {
      await mountComponent();
      expect(wrapper.text()).toContain(i18n.global.t('governance.accessModeling.populationRoleMining.tabs.sessions'));
      expect(wrapper.text()).toContain(i18n.global.t('governance.accessModeling.populationRoleMining.tabs.popBasedRoles'));
      // The roles list is fetched only when the Pop Based Roles tab is opened
      expect(RoleApi.getRoleList).not.toHaveBeenCalled();
    });

    it('queries roles carrying a sessionId when the Pop Based Roles tab is opened', async () => {
      await mountComponent();
      await wrapper.vm.handleTabChange(1);
      await flushPromises();
      expect(RoleApi.getRoleList).toHaveBeenCalledWith('role', expect.objectContaining({
        roleStatus: 'candidate',
        _queryFilter: 'sessionId co ""',
        _pagedResultsOffset: 0,
        _pageSize: 10,
      }));
      expect(wrapper.text()).toContain('Pop Role 1');
    });

    it('navigates to the pop role details page with the role and its session id when a row is clicked', async () => {
      await mountComponent();
      await wrapper.vm.handleTabChange(1);
      await flushPromises();
      await wrapper.find('tbody tr').trigger('click');
      expect(routerPush).toHaveBeenCalledWith({
        name: 'PopulationRoleMiningRoleDetails',
        params: { sessionId: 's1', roleId: 'role1' },
      });
    });

    it('joins the sessionId clause before toolbar filters, excluded from the filter badge', async () => {
      await mountComponent();
      await wrapper.vm.handleTabChange(1);
      await flushPromises();
      RoleApi.getRoleList.mockClear();
      await wrapper.vm.searchRoles({}, { minMembersFilter: 5, nameFilter: 'test' });
      expect(RoleApi.getRoleList).toHaveBeenCalledWith('role', expect.objectContaining({
        _queryFilter: 'sessionId co "" and memberCount gte 5 and name co "test"',
      }));
      expect(wrapper.vm.roleNumFilters).toBe(1);
    });

    it('encodes descending sort from the table as the minus prefix on sortKeys', async () => {
      await mountComponent();
      await wrapper.vm.handleTabChange(1);
      await flushPromises();
      RoleApi.getRoleList.mockClear();
      await wrapper.vm.searchRoles({ sortKeys: 'name', sortDir: 'desc', pageSize: 10 });
      expect(RoleApi.getRoleList).toHaveBeenCalledWith('role', expect.objectContaining({
        _sortKeys: '-name',
      }));

      RoleApi.getRoleList.mockClear();
      await wrapper.vm.searchRoles({ sortKeys: 'name', sortDir: 'asc', pageSize: 10 });
      expect(RoleApi.getRoleList).toHaveBeenCalledWith('role', expect.objectContaining({
        _sortKeys: 'name',
      }));
    });

    it('keeps the stat cards visible above the tabs on the Pop Based Roles tab', async () => {
      RoleMiningSessionApi.getRoleMiningSessionList.mockResolvedValue({ data: { result: sessions, totalHits: 1 } });
      await mountComponent();
      await wrapper.vm.handleTabChange(1);
      await wrapper.vm.$nextTick();
      // The summary cards sit above the tab selector and stay mounted on either tab
      expect(wrapper.text()).toContain(
        i18n.global.t('governance.accessModeling.populationRoleMining.statCards.sessionsRun'),
      );
    });
  });

  it('passes accessibility checks', async () => {
    RoleMiningSessionApi.getRoleMiningSessionList.mockResolvedValue({ data: { result: sessions, totalHits: 1 } });
    await mountComponent();
    await runA11yTest(wrapper);
  });
});
