/**
 * Copyright (c) 2023-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { mockRouter } from '@forgerock/platform-shared/src/testing/utils/mockRouter';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import { createTooltipContainer, findByRole } from '@forgerock/platform-shared/src/utils/testHelpers';
import ValidationRules from '@forgerock/platform-shared/src/utils/validationRules';
import * as configApi from '@forgerock/platform-shared/src/api/ConfigApi';
import * as schemaApi from '@forgerock/platform-shared/src/api/SchemaApi';
import * as managedResourceApi from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import * as autoApi from '@forgerock/platform-shared/src/api/AutoApi';
import * as ReportsApiHelper from './utils/ReportsApiHelper';
import i18n from '@/i18n';
import Report from './Report';
import {
  getSchemaStub,
  getConfigStub,
  getManagedResourceListStub,
} from './RunReportStubs';
import HistoryStubs from './ReportHistoryStubs';

mockRouter({ params: { template: 'template-name' } });

const rules = ValidationRules.getRules(i18n);
ValidationRules.extendRules(rules);

describe('Report component that contains the run and history tabs', () => {
  function setup(props) {
    setupTestPinia();
    return mount(Report, {
      attachTo: createTooltipContainer(['tooltip-job_0123', 'tooltip-job_1112', 'tooltip-job_4567']),
      global: {
        plugins: [i18n],
      },
      props: {
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
      ReportsApiHelper.requestReportRuns = jest.fn().mockReturnValue(Promise.resolve(HistoryStubs));
      onMountFetchMocks({ applications: {} });
      autoApi.getReportRuns = jest.fn().mockReturnValue(Promise.resolve({
        result: [{ name: 'my-report', runId: 'job_123', status: 'COMPLETED_SUCCESS' }],
      }));

      wrapper = setup();
      await flushPromises();

      const tabs = findByRole(wrapper, 'tablist');
      const runReportTab = tabs.findAll('li')[0].find('a');
      const runHistoryTab = tabs.findAll('li')[1].find('a');

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
