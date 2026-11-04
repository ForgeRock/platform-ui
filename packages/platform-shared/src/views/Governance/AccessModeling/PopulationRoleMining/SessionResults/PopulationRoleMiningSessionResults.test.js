/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { mockRouter } from '@forgerock/platform-shared/src/testing/utils/mockRouter';
import { createAppContainer, runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import { useBreadcrumbStore } from '@forgerock/platform-shared/src/stores/breadcrumb';
import * as RoleMiningSessionApi from '@forgerock/platform-shared/src/api/governance/RoleMiningSessionApi';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import PopulationRoleMiningSessionResults from './PopulationRoleMiningSessionResults';
import i18n from '@/i18n';

jest.mock('@forgerock/platform-shared/src/api/governance/RoleMiningSessionApi');
jest.mock('@forgerock/platform-shared/src/utils/notification', () => ({
  showErrorMessage: jest.fn(),
  displayNotification: jest.fn(),
}));

const session = {
  id: 'session-1',
  name: 'Engineering discovery',
  status: 'complete',
  ownerId: 'user-1',
  populationSize: 40,
  layer1RoleCount: 0,
  candidateRoleCount: 3,
  singletonCount: 34,
  parameters: { roleType: 'job' },
};

const roles = [
  {
    role: {
      id: 'r1',
      name: 'Community 1 (n=44)',
      status: 'candidate',
      memberCount: 44,
      entitlementCount: 1,
      confidence: 0.95,
    },
    permissions: { modifyRole: true, publishRole: true, deleteRole: true },
  },
  {
    role: {
      id: 'r2',
      name: 'Community 0 (n=147)',
      status: 'candidate',
      memberCount: 147,
      entitlementCount: 1,
      confidence: 0.5836,
    },
    permissions: { modifyRole: true, publishRole: true, deleteRole: true },
  },
  {
    role: {
      id: 'r3',
      name: 'Community 2 (n=5)',
      status: 'discarded',
      memberCount: 5,
      entitlementCount: 2,
      confidence: 0.2,
    },
    permissions: { modifyRole: false, publishRole: false, deleteRole: false },
  },
];

const sessionResultsPage = 'governance.accessModeling.populationRoleMining.sessionResultsPage';

describe('PopulationRoleMiningSessionResults', () => {
  let wrapper;
  let routerPush;

  const app = createAppContainer();
  async function mountComponent() {
    ({ routerPush } = mockRouter({ params: { sessionId: 'session-1' } }));
    setupTestPinia();
    if (wrapper) {
      wrapper.unmount();
    }
    wrapper = mount(PopulationRoleMiningSessionResults, {
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

  it('loads the session and renders the results header with analysed/not-grouped counts', async () => {
    RoleMiningSessionApi.getRoleMiningSession.mockResolvedValue({ data: session });
    RoleMiningSessionApi.getRoleMiningSessionRoles.mockResolvedValue({ data: { result: roles } });
    await mountComponent();
    expect(RoleMiningSessionApi.getRoleMiningSession).toHaveBeenCalledWith('session-1');
    const text = wrapper.text();
    expect(text).toContain(i18n.global.t(`${sessionResultsPage}.title`));
    expect(text).toContain('40 identities analysed');
    expect(text).toContain('34 could not be grouped');
  });

  it('unwraps the { role, permissions } rows and renders candidate role cards', async () => {
    RoleMiningSessionApi.getRoleMiningSession.mockResolvedValue({ data: session });
    RoleMiningSessionApi.getRoleMiningSessionRoles.mockResolvedValue({ data: { result: roles } });
    await mountComponent();
    expect(RoleMiningSessionApi.getRoleMiningSessionRoles).toHaveBeenCalledWith('session-1');
    const text = wrapper.text();
    expect(text).toContain('Community 1 (n=44)');
    expect(text).toContain('147 members');
    expect(text).toContain('1 entitlement');
    expect(text).toContain('2 roles');
  });

  it('renders the Specialized Roles heading for a job roleType session and Birthright for birthright', async () => {
    RoleMiningSessionApi.getRoleMiningSession.mockResolvedValue({ data: session });
    RoleMiningSessionApi.getRoleMiningSessionRoles.mockResolvedValue({ data: { result: roles } });
    await mountComponent();
    expect(wrapper.text()).toContain(i18n.global.t(`${sessionResultsPage}.specializedRolesHeading`));

    RoleMiningSessionApi.getRoleMiningSession.mockResolvedValue({
      data: { ...session, parameters: { roleType: 'birthright' } },
    });
    await mountComponent();
    expect(wrapper.text()).toContain(i18n.global.t(`${sessionResultsPage}.birthrightRolesHeading`));
  });

  it('renders the confidence badge using the backend cohesion bands (>=0.7 high, >=0.4 medium)', async () => {
    RoleMiningSessionApi.getRoleMiningSession.mockResolvedValue({ data: session });
    RoleMiningSessionApi.getRoleMiningSessionRoles.mockResolvedValue({ data: { result: roles } });
    await mountComponent();
    const text = wrapper.text();
    // 0.95 -> high, 0.5836 -> medium (matches the backend's cohesionInterpretation bands)
    expect(text).toContain(i18n.global.t(`${sessionResultsPage}.highConfidence`));
    expect(text).toContain(i18n.global.t(`${sessionResultsPage}.mediumConfidence`));
    // discarded roles are hidden until toggled, so their low-confidence badge stays hidden too
    expect(wrapper.text()).not.toContain(i18n.global.t(`${sessionResultsPage}.lowConfidence`));
  });

  it('color-codes the confidence badges: green for high, yellow for medium, red for low', async () => {
    RoleMiningSessionApi.getRoleMiningSession.mockResolvedValue({ data: session });
    RoleMiningSessionApi.getRoleMiningSessionRoles.mockResolvedValue({ data: { result: roles } });
    await mountComponent();
    // each level maps to the standard badge variant used app-wide for its color
    const highBadge = wrapper.find('.badge-success');
    const mediumBadge = wrapper.find('.badge-warning');
    expect(highBadge.exists()).toBe(true);
    expect(highBadge.text()).toBe(i18n.global.t(`${sessionResultsPage}.highConfidence`));
    expect(mediumBadge.exists()).toBe(true);
    expect(mediumBadge.text()).toBe(i18n.global.t(`${sessionResultsPage}.mediumConfidence`));

    // low: toggle to the discarded list where the 0.2-confidence role lives
    await wrapper.find('[data-testid="view-discarded-button"]').trigger('click');
    await wrapper.vm.$nextTick();
    const lowBadge = wrapper.find('.badge-danger');
    expect(lowBadge.exists()).toBe(true);
    expect(lowBadge.text()).toBe(i18n.global.t(`${sessionResultsPage}.lowConfidence`));
  });

  it('renders the confidence badge from a HIGH/MEDIUM/LOW label instead of a score', async () => {
    RoleMiningSessionApi.getRoleMiningSession.mockResolvedValue({ data: session });
    RoleMiningSessionApi.getRoleMiningSessionRoles.mockResolvedValue({
      data: { result: [{ role: { ...roles[0].role, confidence: 'HIGH' } }] },
    });
    await mountComponent();
    expect(wrapper.text()).toContain(i18n.global.t(`${sessionResultsPage}.highConfidence`));
  });

  it('omits the confidence badge when a role has no confidence', async () => {
    RoleMiningSessionApi.getRoleMiningSession.mockResolvedValue({ data: session });
    RoleMiningSessionApi.getRoleMiningSessionRoles.mockResolvedValue({
      data: { result: [{ role: { ...roles[0].role, confidence: undefined } }] },
    });
    await mountComponent();
    expect(wrapper.text()).not.toContain(i18n.global.t(`${sessionResultsPage}.highConfidence`));
  });

  it('navigates to the role detail page when a role card is clicked', async () => {
    RoleMiningSessionApi.getRoleMiningSession.mockResolvedValue({ data: session });
    RoleMiningSessionApi.getRoleMiningSessionRoles.mockResolvedValue({ data: { result: roles } });
    await mountComponent();
    await wrapper.find('[data-testid="role-card-r1"]').trigger('click');
    expect(routerPush).toHaveBeenCalledWith({
      name: 'PopulationRoleMiningRoleDetails',
      params: { sessionId: 'session-1', roleId: 'r1' },
    });
  });

  it('hides discarded roles behind the View Discarded toggle', async () => {
    RoleMiningSessionApi.getRoleMiningSession.mockResolvedValue({ data: session });
    RoleMiningSessionApi.getRoleMiningSessionRoles.mockResolvedValue({ data: { result: roles } });
    await mountComponent();
    expect(wrapper.text()).not.toContain('Community 2 (n=5)');
    expect(wrapper.find('[data-testid="view-discarded-button"]').exists()).toBe(true);

    await wrapper.find('[data-testid="view-discarded-button"]').trigger('click');
    await wrapper.vm.$nextTick();
    const text = wrapper.text();
    expect(text).toContain('Community 2 (n=5)');
    expect(text).not.toContain('Community 1 (n=44)');
    expect(text).toContain(i18n.global.t(`${sessionResultsPage}.discardedRolesHeading`));
  });

  it('shows the roles count for the active list', async () => {
    RoleMiningSessionApi.getRoleMiningSession.mockResolvedValue({ data: session });
    RoleMiningSessionApi.getRoleMiningSessionRoles.mockResolvedValue({ data: { result: roles } });
    await mountComponent();
    expect(wrapper.find('[data-testid="roles-count"]').text()).toContain('2');
    await wrapper.find('[data-testid="view-discarded-button"]').trigger('click');
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-testid="roles-count"]').text()).toContain('1');
  });

  it('renders the empty state when the session produced no roles', async () => {
    RoleMiningSessionApi.getRoleMiningSession.mockResolvedValue({ data: session });
    RoleMiningSessionApi.getRoleMiningSessionRoles.mockResolvedValue({ data: { result: [] } });
    await mountComponent();
    expect(wrapper.text()).toContain(i18n.global.t(`${sessionResultsPage}.noRoles`));
  });

  it('treats the backend 404 for a zero-role session as the empty state, not an error', async () => {
    // the backend responds 404 "Cannot find roles for session" when a completed session
    // produced no roles - that is a legitimate empty result, so no error toast
    RoleMiningSessionApi.getRoleMiningSession.mockResolvedValue({ data: session });
    RoleMiningSessionApi.getRoleMiningSessionRoles.mockRejectedValue({
      response: { status: 404 },
    });
    await mountComponent();
    expect(wrapper.text()).toContain(i18n.global.t(`${sessionResultsPage}.noRoles`));
    expect(showErrorMessage).not.toHaveBeenCalled();
  });

  it('still reports non-404 roles failures as errors', async () => {
    RoleMiningSessionApi.getRoleMiningSession.mockResolvedValue({ data: session });
    RoleMiningSessionApi.getRoleMiningSessionRoles.mockRejectedValue({
      response: { status: 500 },
    });
    await mountComponent();
    expect(showErrorMessage).toHaveBeenCalledWith(
      expect.objectContaining({ response: { status: 500 } }),
      i18n.global.t(`${sessionResultsPage}.failedGettingRoles`),
    );
  });

  it('hides the View Discarded toggle when there are no discarded roles', async () => {
    RoleMiningSessionApi.getRoleMiningSession.mockResolvedValue({ data: session });
    RoleMiningSessionApi.getRoleMiningSessionRoles.mockResolvedValue({
      data: { result: [{ role: roles[0].role }] },
    });
    await mountComponent();
    expect(wrapper.find('[data-testid="view-discarded-button"]').exists()).toBe(false);
  });

  it('accepts a bare array response from the roles endpoint', async () => {
    RoleMiningSessionApi.getRoleMiningSession.mockResolvedValue({ data: session });
    RoleMiningSessionApi.getRoleMiningSessionRoles.mockResolvedValue({ data: [roles[0]] });
    await mountComponent();
    expect(wrapper.text()).toContain('Community 1 (n=44)');
  });

  it('sets the breadcrumb back to the sessions list', async () => {
    RoleMiningSessionApi.getRoleMiningSession.mockResolvedValue({ data: session });
    RoleMiningSessionApi.getRoleMiningSessionRoles.mockResolvedValue({ data: { result: roles } });
    await mountComponent();
    const breadcrumbStore = useBreadcrumbStore();
    expect(breadcrumbStore.returnRoute).toBe('/access-modeling/population-role-mining');
    expect(breadcrumbStore.returnRouteText).toBe(i18n.global.t('governance.accessModeling.populationRoleMining.title'));
  });

  it('shows an error notification when loading the session fails', async () => {
    RoleMiningSessionApi.getRoleMiningSession.mockRejectedValue(new Error('failed'));
    await mountComponent();
    expect(showErrorMessage).toHaveBeenCalled();
  });

  it('shows an error notification when loading the roles fails', async () => {
    RoleMiningSessionApi.getRoleMiningSession.mockResolvedValue({ data: session });
    RoleMiningSessionApi.getRoleMiningSessionRoles.mockRejectedValue(new Error('failed'));
    await mountComponent();
    expect(showErrorMessage).toHaveBeenCalledWith(
      expect.any(Error),
      i18n.global.t(`${sessionResultsPage}.failedGettingRoles`),
    );
  });

  it('passes accessibility checks', async () => {
    RoleMiningSessionApi.getRoleMiningSession.mockResolvedValue({ data: session });
    RoleMiningSessionApi.getRoleMiningSessionRoles.mockResolvedValue({ data: { result: roles } });
    await mountComponent();
    await runA11yTest(wrapper);
  });
});
