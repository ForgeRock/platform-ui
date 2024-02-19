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

describe('Navbar Component', () => {
  let wrapper = null;

  beforeEach(() => {
    setupTestPinia();
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
      },
      props,
    });
  }

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
