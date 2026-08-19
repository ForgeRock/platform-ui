/**
 * Copyright (c) 2025-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount, flushPromises } from '@vue/test-utils';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import * as ThemeApi from '@forgerock/platform-shared/src/api/ThemeApi';
import { useThemeStore } from '@forgerock/platform-shared/src/stores/theme';
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
          ThemeInjector: {
            name: 'ThemeInjector',
            template: '<div id="theme-injector" />',
          },
        },
      },
    });
  }

  describe('@unit', () => {
    window.document.getElementById = () => ({ href: '' });
    ThemeApi.getThemes = jest.fn().mockReturnValue(Promise.resolve({ data: { result: [] } }));
    ThemeApi.getThemerealm = jest.fn().mockReturnValue(Promise.resolve({ data: { realm: { testRealm: [] } } }));
    describe('theme tests for single config file theme storage', () => {
      it('sets up theme using default realm theme, but doesn\'t store in localStorage when no node theme id or tree id is specified', async () => {
        ThemeApi.getThemes.mockReturnValue(Promise.resolve({
          data: {
            result: [
              {
                _id: 'nodeThemeId',
                linkedTrees: [],
                name: 'nodeTheme',
                primaryColor: '#ffffff',
                secondaryColor: '#eeeeee',
                isDefault: true,
              },
            ],
          },
        }));
        const wrapper = shallowMountComponent();
        await flushPromises();

        await wrapper.vm.setupTheme('/testRealm', null, null);
        await flushPromises();
        expect(localStorage.getItem('theme-id')).toBeNull();
        expect(wrapper.vm.theme.primaryColor).toBe('#ffffff');
        expect(wrapper.vm.theme.secondaryColor).toBe('#eeeeee');
      });

      it('sets up theme using node theme id when specified', async () => {
        ThemeApi.getThemes.mockReturnValue(Promise.resolve({
          data: {
            result: [
              {
                _id: 'nodeThemeId',
                linkedTrees: [],
                name: 'nodeTheme',
                primaryColor: '#ffffff',
                secondaryColor: '#eeeeee',
                pageTitle: '#cccccc',
              },
            ],
          },
        }));
        const wrapper = shallowMountComponent();
        await flushPromises();

        await wrapper.vm.setupTheme('/testRealm', null, 'nodeThemeId');
        await flushPromises();
        expect(localStorage.getItem('theme-id')).toBe('nodeThemeId');
        expect(wrapper.vm.theme.primaryColor).toBe('#ffffff');
        expect(wrapper.vm.theme.secondaryColor).toBe('#eeeeee');
        expect(wrapper.vm.theme.pageTitle).toBe('#cccccc');
      });

      it('sets up theme using tree id when specified', async () => {
        ThemeApi.getThemes.mockReturnValue(Promise.resolve({
          data: {
            result: [
              {
                _id: 'treeThemeId',
                linkedTrees: ['treeId'],
                name: 'treeTheme',
                primaryColor: '#ffffff',
                secondaryColor: '#eeeeee',
                pageTitle: '#cccccc',
              },
            ],
          },
        }));
        const wrapper = shallowMountComponent();
        await flushPromises();

        await wrapper.vm.setupTheme('/testRealm', 'treeId', null);
        expect(localStorage.getItem('theme-id')).toBe('treeThemeId');
        expect(wrapper.vm.theme.primaryColor).toBe('#ffffff');
        expect(wrapper.vm.theme.secondaryColor).toBe('#eeeeee');
        expect(wrapper.vm.theme.pageTitle).toBe('#cccccc');
      });
    });

    describe('theme tests for theme storage', () => {
      it('sets up theme', async () => {
        ThemeApi.getThemes = jest.fn().mockReturnValue(Promise.resolve({ data: { result: [{ _id: 'ui/theme-testTheme', name: 'testTheme', linkedTrees: ['treeId'] }] } }));

        const wrapper = shallowMountComponent();
        await flushPromises();

        await wrapper.vm.setupTheme('/testRealm', 'treeId', null);
        expect(localStorage.getItem('theme-id')).toBe('ui/theme-testTheme');
      });

      it('sets up theme using default theme', async () => {
        localStorage.clear();
        ThemeApi.getThemes = jest.fn().mockReturnValue(Promise.resolve({ data: { result: [{ _id: 'defaultLegacyThemeId', isDefault: true }] } }));

        const wrapper = shallowMountComponent();
        await flushPromises();

        await wrapper.vm.setupTheme('/testRealm', null, null);
        await flushPromises();

        // Does not save to localStorage unless a tree or node theme id is specified
        expect(localStorage.getItem('theme-id')).toBeNull();
        expect(wrapper.vm.theme.primaryColor).toBe('#324054');
        expect(wrapper.vm.theme.secondaryColor).toBe('#69788b');
        expect(wrapper.vm.theme.pageTitle).toBe('#23282e');
      });
      it('sets themeLoading to false after attempting to set up theme', async () => {
        const wrapper = shallowMountComponent();
        // Set the store value directly because themeLoading is exposed as a readonly computed.
        const themeStore = useThemeStore();
        themeStore.themeLoading = true;
        await flushPromises();

        await wrapper.vm.setupTheme('/testRealm', null, null);
        await flushPromises();

        expect(wrapper.vm.themeLoading).toBe(false);
      });
    });

    describe('SSO callback suppression behavior', () => {
      it('does not render ThemeInjector before the initial theme setup completes', () => {
        const wrapper = shallowMountComponent();

        expect(wrapper.vm.themeLoading).toBe(true);
        expect(wrapper.vm.themeReady).toBe(false);
        expect(wrapper.findComponent({ name: 'ThemeInjector' }).exists()).toBe(false);
      });

      it('renders ThemeInjector after the initial theme setup completes', async () => {
        const wrapper = shallowMountComponent();

        await wrapper.vm.setupTheme('/testRealm', null, null);
        await flushPromises();

        expect(wrapper.vm.themeReady).toBe(true);
        expect(wrapper.findComponent({ name: 'ThemeInjector' }).exists()).toBe(true);
        expect(wrapper.find('#theme-injector').exists()).toBe(true);
      });

      it('keeps ThemeInjector mounted during subsequent theme loading', async () => {
        const wrapper = shallowMountComponent();
        const themeStore = useThemeStore();

        await wrapper.vm.setupTheme('/testRealm', null, null);
        await flushPromises();
        expect(wrapper.find('#theme-injector').exists()).toBe(true);

        // nextStep sets themeLoading to true for subsequent journey steps.
        themeStore.themeLoading = true;
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.themeReady).toBe(true);
        expect(wrapper.find('#theme-injector').exists()).toBe(true);
      });

      it('setupTheme success path: hideAppOnTransition is false after themeLoading is cleared', async () => {
        ThemeApi.getThemes.mockReturnValue(Promise.resolve({
          data: {
            result: [
              {
                _id: 'defaultThemeId',
                name: 'defaultTheme',
                isDefault: true,
                primaryColor: '#aabbcc',
              },
            ],
          },
        }));
        const wrapper = shallowMountComponent();
        wrapper.vm.hideAppOnTransition = true;
        await flushPromises();

        await wrapper.vm.setupTheme('/testRealm', null, null);
        await flushPromises();

        expect(wrapper.vm.themeLoading).toBe(false);
        expect(wrapper.vm.themeReady).toBe(true);
        expect(wrapper.find('#theme-injector').exists()).toBe(true);
        expect(wrapper.vm.hideAppOnTransition).toBe(false);
      });

      it('keeps the app usable when the theme API request fails', async () => {
        ThemeApi.getThemes.mockReturnValue(Promise.reject(new Error('API error')));
        const wrapper = shallowMountComponent();

        await wrapper.vm.setupTheme('/testRealm', null, null);
        await flushPromises();

        expect(wrapper.vm.themeLoading).toBe(false);
        expect(wrapper.vm.themeReady).toBe(true);
        expect(wrapper.vm.hideAppOnTransition).toBe(false);
      });

      it('setupTheme catch path clears loading and restores the fallback logo', async () => {
        localStorage.clear();
        const wrapper = shallowMountComponent();
        wrapper.vm.hideAppOnTransition = true;
        wrapper.vm.loadTheme = jest.fn().mockRejectedValue(new Error('Theme setup error'));

        await wrapper.vm.setupTheme('/testRealm', null, null);

        expect(wrapper.vm.themeLoading).toBe(false);
        expect(wrapper.vm.themeReady).toBe(true);
        expect(wrapper.vm.hideAppOnTransition).toBe(false);
        expect(wrapper.vm.localizedLogo).toBe('images/ping-logo-square-color.svg');
      });

      it('FraaS root-realm path: loadStaticTheme sets themeLoading to false and app becomes visible', async () => {
        const wrapper = shallowMountComponent({}, { isFraas: true });
        wrapper.vm.hideAppOnTransition = true;

        await wrapper.vm.setupTheme('root', null, null);
        await flushPromises();

        expect(wrapper.vm.themeLoading).toBe(false);
        expect(wrapper.vm.hideAppOnTransition).toBe(false);
      });
    });
  });
});
