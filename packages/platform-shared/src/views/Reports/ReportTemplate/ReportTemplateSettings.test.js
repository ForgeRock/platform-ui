/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import i18n from '@/i18n';
import ReportTemplateSettings from './ReportTemplateSettings';

describe('Report Template Settings component', () => {
  function setup(props) {
    return mount(ReportTemplateSettings, {
      global: {
        plugins: [i18n],
      },
      props: {
        ...props,
      },
    });
  }

  let wrapper;

  describe('@component', () => {
    beforeEach(async () => {
      wrapper = setup();
    });

    it('ensures that the "Data" and "Details" tabs are present and showing on mount', async () => {
      wrapper = setup();
      await nextTick();

      const allTabs = wrapper.findAll('[role="tab"]');
      const [dataTab, detailsTab] = allTabs;
      expect(allTabs.length).toBe(2);
      expect(dataTab.classes()).toContain('active');
      expect(dataTab.text()).toBe('Data');
      expect(detailsTab.text()).toBe('Details');
    });
  });
});
