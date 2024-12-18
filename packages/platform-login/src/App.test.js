/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount, flushPromises } from '@vue/test-utils';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import * as ThemeApi from '@forgerock/platform-shared/src/api/ThemeApi';
import i18n from '@/i18n';
import App from '@/App';

describe('App.vue', () => {
  function shallowMountComponent(overrideState, overrideSharedStore) {
    setupTestPinia();
    return shallowMount(App, {
      global: {
        plugins: [i18n],
        mocks: {
          $route: {
            meta: { hideSideMenu: true },
          },
          $store: {
            state: {
              realm: 'testRealm',
              SharedStore: {
                webStorageAvailable: true,
                ...overrideSharedStore,
              },
              ...overrideState,
            },
            commit: jest.fn(),
          },
        },
        stubs: {
          RouterLink: true,
          RouterView: true,
          Notifications: true,
        },
      },
    });
  }

  describe('@unit', () => {
    const testThemeResponse = {
      _id: 'ui/theme-testTheme',
      primaryColor: '#ffffff',
      secondaryColor: '#eeeeee',
      pageTitle: '#cccccc',
    };
    window.document.getElementById = () => ({ href: '' });
    ThemeApi.getThemeMetadata = jest.fn().mockReturnValue(Promise.resolve({ data: { defaultRealmThemeId: { testRealm: 'ui/theme-testTheme' } } }));
    ThemeApi.getRealmTheme = jest.fn().mockReturnValue(Promise.resolve({ data: { _id: 'ui/theme-testTheme' } }));
    ThemeApi.getRealmThemes = jest.fn().mockReturnValue(Promise.resolve({ data: { result: [{ _id: 'ui/theme-defaultThemeId' }, { _id: 'ui/theme-treeThemeId' }] } }));
    ThemeApi.getLegacyThemes = jest.fn().mockReturnValue(Promise.resolve({ data: { realm: { '/': [] } } }));
    ThemeApi.getRealmThemeByName = jest.fn().mockReturnValue(Promise.resolve({ data: { result: [{ _id: 'ui/theme-defaultThemeId' }] } }));
    describe('theme tests for single config file theme storage', () => {
      it('sets up theme using default realm theme, but doesn\'t store in localStorage when no node theme id or tree id is specified', async () => {
        ThemeApi.getThemeMetadata.mockReturnValue(Promise.resolve({ data: { defaultRealmThemeId: { testRealm: 'ui/theme-defaultThemeId' } } }));
        const wrapper = shallowMountComponent();
        await flushPromises();

        await wrapper.vm.setupTheme('/testRealm', null, null);
        await flushPromises();
        expect(localStorage.getItem('theme-id')).toBeNull();
        expect(wrapper.vm.theme.primaryColor).toBe('#324054');
        expect(wrapper.vm.theme.secondaryColor).toBe('#69788b');
        expect(wrapper.vm.theme.pageTitle).toBe('#23282e');
      });

      it('sets up theme using node theme id when specified', async () => {
        ThemeApi.getRealmTheme.mockReturnValue(Promise.resolve({ data: testThemeResponse }));
        const wrapper = shallowMountComponent();
        await flushPromises();

        await wrapper.vm.setupTheme('/testRealm', null, 'ui/theme-nodeThemeId');
        await flushPromises();
        expect(localStorage.getItem('theme-id')).toBe('ui/theme-nodeThemeId');
        expect(wrapper.vm.theme.primaryColor).toBe('#ffffff');
        expect(wrapper.vm.theme.secondaryColor).toBe('#eeeeee');
        expect(wrapper.vm.theme.pageTitle).toBe('#cccccc');
      });

      it('sets up theme using tree id when specified', async () => {
        ThemeApi.getRealmTheme.mockReturnValue(Promise.resolve({ data: testThemeResponse }));
        ThemeApi.getThemeMetadata.mockReturnValue(Promise.resolve({ data: { linkedTrees: { testRealm: { treeId: 'ui/theme-treeThemeId' } }, defaultRealmThemeId: { testRealm: 'ui/theme-testTheme' } } }));
        const wrapper = shallowMountComponent();
        await flushPromises();

        await wrapper.vm.setupTheme('/testRealm', 'treeId', null);
        expect(localStorage.getItem('theme-id')).toBe('ui/theme-treeThemeId');
        expect(wrapper.vm.theme.primaryColor).toBe('#ffffff');
        expect(wrapper.vm.theme.secondaryColor).toBe('#eeeeee');
        expect(wrapper.vm.theme.pageTitle).toBe('#cccccc');
      });

      it('gracefully continues when ThemeApi.getThemeMetadata fails', async () => {
        ThemeApi.getRealmTheme.mockReturnValue(Promise.resolve({ data: { _id: 'ui/theme-defaultTheme' } }));
        const spy = jest.spyOn(ThemeApi, 'getThemeMetadata').mockImplementation(() => Promise.reject(new Error('API Error')));
        const wrapper = shallowMountComponent();
        await flushPromises();

        await wrapper.vm.setupTheme('/testRealm', null, null);
        await expect(spy).rejects.toThrow('API Error');
        expect(wrapper.vm.theme.primaryColor).toBe('#324054');
        expect(wrapper.vm.theme.secondaryColor).toBe('#69788b');
        expect(wrapper.vm.theme.pageTitle).toBe('#23282e');
      });
    });

    describe('theme tests for legacy theme storage', () => {
      it('sets up theme using legacy themes', async () => {
        ThemeApi.getThemeMetadata.mockReturnValue(Promise.resolve({ data: {} }));
        ThemeApi.getRealmThemes.mockReturnValue(Promise.resolve({ data: { testRealm: [{ _id: 'legacyThemeId', linkedTrees: ['treeId'] }] } }));
        ThemeApi.getLegacyThemes = jest.fn().mockReturnValue(Promise.resolve({ data: { realm: { testRealm: [{ _id: 'ui/theme-testTheme', linkedTrees: ['treeId'] }] } } }));

        const wrapper = shallowMountComponent();
        await flushPromises();

        await wrapper.vm.setupTheme('/testRealm', 'treeId', null);
        expect(localStorage.getItem('theme-id')).toBe('ui/theme-testTheme');
      });

      it('sets up theme using default theme from legacy themes', async () => {
        localStorage.clear();
        ThemeApi.getThemeMetadata.mockReturnValue(Promise.resolve({ data: {} }));
        ThemeApi.getRealmThemes.mockReturnValue(Promise.resolve({ data: { testRealm: [{ _id: 'defaultLegacyThemeId', isDefault: true }] } }));
        ThemeApi.getLegacyThemes = jest.fn().mockReturnValue(Promise.resolve({ data: { realm: { testRealm: [{ _id: 'defaultLegacyThemeId', isDefault: true }] } } }));

        const wrapper = shallowMountComponent();
        await flushPromises();

        await wrapper.vm.setupTheme('/testRealm', null, null);
        // Does not save to localStorage unless a tree or node theme id is specified
        expect(localStorage.getItem('theme-id')).toBeNull();
        expect(wrapper.vm.theme.primaryColor).toBe('#324054');
        expect(wrapper.vm.theme.secondaryColor).toBe('#69788b');
        expect(wrapper.vm.theme.pageTitle).toBe('#23282e');
      });
    });
  });
});
