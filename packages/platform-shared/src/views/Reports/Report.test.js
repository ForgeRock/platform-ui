/**
 * Copyright 2023-2024 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import { createTooltipContainer, findByRole } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as configApi from '@forgerock/platform-shared/src/api/ConfigApi';
import * as schemaApi from '@forgerock/platform-shared/src/api/SchemaApi';
import * as managedResourceApi from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import * as autoApi from '@forgerock/platform-shared/src/api/AutoApi';
import * as ReportsUtils from '@forgerock/platform-shared/src/utils/reportsUtils';
import i18n from '@/i18n';
import Report from './Report';
import {
  getSchemaStub,
  getConfigStub,
  getManagedResourceListStub,
} from './RunReportStubs';
import HistoryStubs from './ReportHistoryStubs';

jest.mock('vue-router', () => ({
  useRoute: jest.fn(() => ({ params: { template: 'template-name' } })),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

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
      ReportsUtils.requestReportRuns = jest.fn().mockReturnValue(Promise.resolve(HistoryStubs));
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
