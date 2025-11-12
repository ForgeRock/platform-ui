/**
 * Copyright (c) 2019-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import i18n from '@/i18n';
import { setupTestPinia } from '../../utils/testPiniaHelpers';
import Navbar from './index';
import { runA11yTest } from '../../utils/testHelpers';

// Mocking RestMixin module to help ToolbarNotification to render
jest.mock('@forgerock/platform-shared/src/mixins/RestMixin', () => ({
  methods: {
    getRequestService() {
      return {
        get: jest.fn().mockResolvedValue({ data: { _notifications: [] } }),
        post: jest.fn().mockResolvedValue({}),
        delete: jest.fn().mockResolvedValue({}),
      };
    },
  },
}));

// Mocking user store to provide few initial states
jest.mock('@forgerock/platform-shared/src/stores/user', () => ({
  useUserStore: () => ({
    userDetails: {
      name: 'Mock User',
      email: 'mock@example.com',
    },
  }),
}));
describe('Navbar Component', () => {
  let wrapper = null;

  beforeEach(() => {
    setupTestPinia();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
      wrapper = null;
    }
  });

  function setup(props) {
    wrapper = mount(Navbar, {
      global: {
        mocks: {
          $store: {
            state: {},
          },
        },
        plugins: [i18n],
        stubs: {
          RouterLink: { props: ['to'], template: '<a :href="to"><slot /></a>' },
          'transition-group': false,
        },
      },
      props,
    });
  }

  describe('@a11y', () => {
    it('should have no accessibility violations with default props', async () => {
      await setup();
      await runA11yTest(wrapper);
    });

    it('should have no accessibility violations with all props set', async () => {
      // Create a dummy element with ID: fr-sidebar-nav which the Navbar references
      // Append to document body for a11y test along with the Navbar's wrapper element
      const sidebarNav = document.createElement('nav');
      sidebarNav.setAttribute('id', 'fr-sidebar-nav');
      document.body.appendChild(sidebarNav);
      await setup({
        menuIsExpanded: true,
        checkChangesOnNavigate: true,
        showDocsLink: true,
        docsLink: 'https://test.com',
        showHelpLink: true,
        helpUrl: 'https://test-help.com',
        showDropdown: true,
        showToggle: true,
        dropdownItems: [{ text: 'Item 1', href: '#item1' }, { text: 'Item 2', href: '#item2' }],
        lockedPopoverMessage: 'You have unsaved changes!',
        showNotifications: true,
        showProfileLink: true,
        tenantLockedMode: true,
        tenantMenuItems: [{ text: 'Tenant Item 1', href: '#tenantitem1' }],
      });
      try {
        document.body.appendChild(wrapper.element);
        await runA11yTest(document.body);
      } finally {
        // Clean up the added elements irrespective of test pass/fail
        document.body.removeChild(sidebarNav);
        document.body.removeChild(wrapper.element);
      }
    });
  });

  describe('showing links', () => {
    it('shows a docs link when configured to and passed a value', () => {
      setup({
        showDocsLink: true,
        docsLink: 'https://test.com',
      });

      expect(wrapper.find('a[href="https://test.com"]').text()).toContain('Docs');
    });

    it('hides the docs link when configured to', () => {
      setup({
        showDocsLink: false,
        docsLink: 'https://test.com',
      });

      expect(wrapper.find('a[href="https://test.com"]').exists()).toBe(false);
    });

    it('shows a help link when configured to and passed a value', () => {
      setup({
        showHelpLink: true,
        helpUrl: 'https://test-help.com',
      });

      expect(wrapper.find('a[href="https://test-help.com"]').text()).toContain('Help & Support');
    });

    it('hides the help link when configured to', () => {
      setup({
        showHelpLink: false,
        helpUrl: 'https://test-help.com',
      });

      expect(wrapper.find('a[href="https://test-help.com"]').exists()).toBe(false);
    });
  });
});
