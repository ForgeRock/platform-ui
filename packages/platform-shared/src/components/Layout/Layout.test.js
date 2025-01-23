/**
 * Copyright (c) 2022-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, RouterLinkStub } from '@vue/test-utils';
import Navbar from '@forgerock/platform-shared/src/components/Navbar/';
import { setupTestPinia } from '@/utils/testPiniaHelpers';
import { findByTestId } from '@/utils/testHelpers';
import i18n from '@/i18n';
import Layout from '@/components/Layout';

// https://jestjs.io/docs/en/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    media: query,
    addListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
  })),
});

describe('Layout', () => {
  function setup(props) {
    return mount(Layout, {
      global: {
        stubs: {
          notifications: 'notifications',
          RouterLink: RouterLinkStub,
        },
        plugins: [i18n],
        mocks: {
          $route: {
            meta: { hideSideMenu: false },
          },
          $store: {
            state: {
              isFraas: false,
              promotionTenantInfo: { currentTier: 'dev' },
              tenantInfo: { region: 'europe-west1' },
              SharedStore: {
                currentPackage: 'admin',
              },
            },
          },
        },
      },
      props: {
        releaseInfo: {
          currentVersion: '123',
        },
        ...props,
      },
    });
  }

  beforeEach(() => {
    setupTestPinia();
  });

  describe('@renders', () => {
    it('should render the menu expanded by default', () => {
      const wrapper = setup();
      const appClasses = wrapper.find('#app').classes();
      expect(appClasses.includes('fr-menu-expanded')).toBeTruthy();
    });

    it('should render the release version in the footer', () => {
      const wrapper = setup();
      const release = findByTestId(wrapper, 'release-info');
      const link = release.findComponent(RouterLinkStub);

      expect(release.text()).toContain('Ping Advanced Identity Cloud Version 123');
      expect(link.props().to).toEqual({ name: 'TenantSettings', params: { resourceName: 'details' } });
    });
  });

  describe('setting URLs for external help and docs sites', () => {
    it('should set the correct help URL', () => {
      const wrapper = setup();
      const navBar = wrapper.findComponent(Navbar);
      expect(navBar.props().helpUrl).toBe('https://backstage.forgerock.com/');
    });

    it('should set the correct docs link for cloud environments', () => {
      const wrapper = setup({
        isFraas: true,
      });
      const navBar = wrapper.findComponent(Navbar);
      expect(navBar.props().docsLink).toBe('https://backstage.forgerock.com/docs/idcloud/latest/index.html');
    });

    it('should set the correct docs link for non cloud environments', () => {
      const wrapper = setup();
      const navBar = wrapper.findComponent(Navbar);
      expect(navBar.props().docsLink).toBe('https://backstage.forgerock.com/docs/index.html');
    });
  });
});
