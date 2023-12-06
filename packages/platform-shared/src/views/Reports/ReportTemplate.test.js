/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import { findByRole } from '@forgerock/platform-shared/src/utils/testHelpers';
import flushPromises from 'flush-promises';
import * as configApi from '@forgerock/platform-shared/src/api/ConfigApi';
import * as schemaApi from '@forgerock/platform-shared/src/api/SchemaApi';
import * as managedResourceApi from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import * as autoApi from '@forgerock/platform-shared/src/api/AutoApi';
import ReportTemplate from './ReportTemplate';
import {
  getSchemaStub,
  getConfigStub,
  getManagedResourceListStub,
} from './RunReportStubs';
import i18n from '@/i18n';

describe('Report Template component', () => {
  function setup(props) {
    setupTestPinia();
    return mount(ReportTemplate, {
      i18n,
      mocks: {
        $route: {
          params: {
            template: 'template-name',
          },
        },
        $router: { push: jest.fn() },
      },
      propsData: {
        ...props,
      },
    });
  }

  function onMountFetchMocks(parameters) {
    const reportConfig = { parameters };

    autoApi.getReportTemplates = jest.fn().mockReturnValue(Promise.resolve({
      result: [{
        reportConfig: JSON.stringify(reportConfig),
      }],
    }));
    configApi.getConfig = jest.fn().mockReturnValue(Promise.resolve(getConfigStub));
    schemaApi.getSchema = jest.fn().mockReturnValue(Promise.resolve(getSchemaStub));
    managedResourceApi.getManagedResourceList = jest.fn().mockReturnValue(Promise.resolve(getManagedResourceListStub));
  }

  let wrapper;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('@renders', () => {
    it('assures that the Run Report tab is selected on load', async () => {
      onMountFetchMocks({ applications: {} });
      wrapper = setup();
      await flushPromises();

      const activeTab = findByRole(wrapper, 'tablist').find('.nav-link.active');
      expect(activeTab.text()).toBe('Run Report');
    });
  });

  describe('@components', () => {
    it('updates the history.pushState when tabs are clicked', async () => {
      onMountFetchMocks({ applications: {} });
      wrapper = setup();
      await flushPromises();

      const tabs = findByRole(wrapper, 'tablist');
      const runReportTab = tabs.findAll('li').at(0).find('a');
      const runHistoryTab = tabs.findAll('li').at(1).find('a');

      expect(window.location.hash.includes('/history')).toBe(false);
      await runHistoryTab.trigger('click');
      expect(window.location.hash.includes('/history')).toBe(true);

      const activeTab = tabs.find('.nav-link.active');
      expect(activeTab.text()).toBe('Run History');

      expect(window.location.hash.includes('/history')).toBe(true);
      await runReportTab.trigger('click');
      expect(window.location.hash.includes('/history')).toBe(false);
    });
  });
});
