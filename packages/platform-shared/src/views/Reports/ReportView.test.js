/**
 * Copyright 2023 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import * as AutoApi from '@forgerock/platform-shared/src/api/AutoApi';
import * as Notifications from '@forgerock/platform-shared/src/utils/notification';
import ReportView from './ReportView';
import useViewReportTable from './composables/ViewReportTable';

jest.mock('@forgerock/platform-shared/src/utils/notification');

jest.mock('./composables/ViewReportTable');

jest.mock('vue-router', () => ({
  useRoute: jest.fn(() => ({ params: { id: 'job_123abc', template: 'template-name' } })),
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

describe('Report View component', () => {
  function setup() {
    return mount(ReportView, {
      global: {
        mocks: {
          $t: (msg) => msg,
        },
      },
      mocks: {
        route: {
          params: {
            id: 'job_123abc',
            template: 'template-name',
          },
        },
      },
    });
  }
  let wrapper;

  beforeEach(() => {
    Notifications.displayNotification = jest.fn().mockReturnValue(false);
    AutoApi.getReportResult = jest.fn().mockReturnValue(Promise.resolve({
      result: [{
        journey_name: 'PasswordGrant',
        journey_result: 'SUCCESSFUL',
        timestamp: '2024-01-12T19:40:36.490Z',
        user_name: 'reportadmin',
      }],
    }));

    AutoApi.getReportRuns = jest.fn().mockReturnValue(Promise.resolve({
      result: [{
        exportJsonStatus: 'EXPORT_SUCCESS',
        exportCsvStatus: 'EXPORT_SUCCESS',
        createDate: '2024-01-12T19:40:36.490Z',
        name: 'my-report',
        parameters: '{"user_names":["reportadmin"]}',
      }],
    }));
  });

  it('Does not show table when report is expired', () => {
    useViewReportTable.mockReturnValue({ isExpired: ref(true) });
    wrapper = setup();
    const reportTable = findByTestId(wrapper, 'report-table');
    const noData = findByTestId(wrapper, 'no-data');
    expect(reportTable.exists()).toBe(false);
    expect(noData.exists()).toBe(true);
  });

  it('Hides No Data component when there is data', () => {
    useViewReportTable.mockReturnValue({ isExpired: ref(false) });
    wrapper = setup();
    const noData = findByTestId(wrapper, 'no-data');
    expect(noData.exists()).toBe(false);
  });

  it('Shows skeleton loader when data is fetching', () => {
    useViewReportTable.mockReturnValue({ tableLoading: ref(true) });
    wrapper = setup();
    const skeleton = findByTestId(wrapper, 'skeleton-loader');
    expect(skeleton.exists()).toBe(true);
  });
});
