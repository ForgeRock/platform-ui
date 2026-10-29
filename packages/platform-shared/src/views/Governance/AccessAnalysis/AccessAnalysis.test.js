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
import AccessAnalysis from './AccessAnalysis';
import i18n from '@/i18n';

jest.mock('@forgerock/platform-shared/src/views/Governance/AccessAnalysis/CompareUserAccess', () => ({
  name: 'FrCompareUserAccess',
  props: ['getScopeById'],
  render: () => null,
}));
jest.mock('@forgerock/platform-shared/src/views/Governance/AccessAnalysis/AccessSimulator', () => ({
  name: 'FrAccessSimulator',
  props: ['getScopeList', 'getScopeById'],
  render: () => null,
}));

describe('AccessAnalysis', () => {
  let wrapper;
  let mockRoute;
  let routerPush;

  const app = createAppContainer();
  async function mountComponent(props = {}, routeParams = {}) {
    mockRoute = { params: { ...routeParams } };
    ({ routerPush } = mockRouter(mockRoute));
    setupTestPinia();
    wrapper = mount(AccessAnalysis, {
      attachTo: app,
      global: {
        plugins: [i18n],
      },
      props,
    });
    await flushPromises();
    await wrapper.vm.$nextTick();
    return { wrapper };
  }

  afterEach(() => {
    wrapper.unmount();
    window.location.hash = '';
  });

  describe('@renders', () => {
    it('defaults to the first tab when no accessAnalysisTab param is set', async () => {
      await mountComponent();
      expect(wrapper.vm.tabIndex).toBe(0);
    });

    it('seeds the tab from the accessAnalysisTab param (deep links)', async () => {
      await mountComponent({}, { accessAnalysisTab: 'access-simulator' });
      expect(wrapper.vm.tabIndex).toBe(1);
    });

    it('falls back to the first tab for an unknown accessAnalysisTab param', async () => {
      await mountComponent({}, { accessAnalysisTab: 'bogus' });
      expect(wrapper.vm.tabIndex).toBe(0);
    });

    it('renders only the compare and simulator tabs, with no settings tab (admin)', async () => {
      await mountComponent();
      const tabTitles = wrapper.findAll('.nav-link').map((tab) => tab.text());
      expect(tabTitles).toEqual([
        i18n.global.t('governance.accessAnalysis.tabs.compareUserAccess'),
        i18n.global.t('governance.accessAnalysis.tabs.accessSimulator'),
      ]);
    });

    it('renders only the compare and simulator tabs, with no settings tab (enduser)', async () => {
      await mountComponent({ showBackButton: true });
      const tabTitles = wrapper.findAll('.nav-link').map((tab) => tab.text());
      expect(tabTitles).toEqual([
        i18n.global.t('governance.accessAnalysis.tabs.compareUserAccess'),
        i18n.global.t('governance.accessAnalysis.tabs.accessSimulator'),
      ]);
    });

    it('passes the scope functions to the tab content components', async () => {
      await mountComponent();
      const compare = wrapper.findComponent({ name: 'FrCompareUserAccess' });
      const simulator = wrapper.findComponent({ name: 'FrAccessSimulator' });
      expect(compare.props('getScopeById')).toEqual(expect.any(Function));
      expect(simulator.props('getScopeList')).toEqual(expect.any(Function));
      expect(simulator.props('getScopeById')).toEqual(expect.any(Function));
    });
  });

  describe('@actions', () => {
    it('reflects an activated tab in the params without a router navigation', async () => {
      window.location.hash = '#/access-analysis/compare-user-access';
      await mountComponent();

      wrapper.vm.tabActivated(1);
      expect(mockRoute.params.accessAnalysisTab).toBe('access-simulator');
      expect(routerPush).not.toHaveBeenCalled();
    });

    it('rewrites only the tab segment of the admin URL (/#/access-analysis/:tab)', async () => {
      window.location.hash = '#/access-analysis/compare-user-access';
      await mountComponent();

      wrapper.vm.tabActivated(1);
      expect(window.location.hash).toBe('#/access-analysis/access-simulator');
    });

    it('rewrites only the tab segment of the enduser URL (/#/access-modeling/access-analysis/:tab)', async () => {
      window.location.hash = '#/access-modeling/access-analysis/compare-user-access';
      await mountComponent();

      wrapper.vm.tabActivated(1);
      expect(window.location.hash).toBe('#/access-modeling/access-analysis/access-simulator');
    });

    it('preserves the query string and unrelated hash path when rewriting the tab segment', async () => {
      window.location.hash = '#/access-modeling/access-analysis/compare-user-access?realm=alpha';
      await mountComponent();

      wrapper.vm.tabActivated(0);
      expect(window.location.hash).toBe('#/access-modeling/access-analysis/compare-user-access?realm=alpha');

      wrapper.vm.tabActivated(1);
      expect(window.location.hash).toBe('#/access-modeling/access-analysis/access-simulator?realm=alpha');
    });
  });

  describe('@breadcrumb', () => {
    it('does not set a back button breadcrumb by default (admin)', async () => {
      await mountComponent();
      const breadcrumbStore = useBreadcrumbStore();
      expect(breadcrumbStore.returnRoute).toBe('');
    });

    it('sets a breadcrumb back to the access modeling hub when showBackButton is true (enduser)', async () => {
      await mountComponent({ showBackButton: true });
      const breadcrumbStore = useBreadcrumbStore();
      expect(breadcrumbStore.returnRoute).toBe('/access-modeling');
      expect(breadcrumbStore.returnRouteText).toBe(i18n.global.t('governance.accessModeling.hub.title'));
    });
  });

  describe('@a11y', () => {
    it('has no accessibility violations', async () => {
      await mountComponent();
      await runA11yTest(wrapper);
    });
  });
});
