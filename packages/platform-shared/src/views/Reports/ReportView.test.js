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
  beforeEach(() => {
    Notifications.displayNotification = jest.fn().mockReturnValue(false);
  });
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

  it('Does not show table when report is expired', () => {
    useViewReportTable.mockReturnValue({
      isExpired: ref(true),
      tableItems: ref([]),
    });
    wrapper = setup();
    const reportTable = findByTestId(wrapper, 'report-table');
    const noData = findByTestId(wrapper, 'no-data');
    expect(reportTable.exists()).toBe(false);
    expect(noData.exists()).toBe(true);
  });

  it('Hides No Data component when there is data', () => {
    useViewReportTable.mockReturnValue({
      isExpired: ref(false),
      tableItems: ref([]),
    });
    wrapper = setup();
    const noData = findByTestId(wrapper, 'no-data');
    expect(noData.exists()).toBe(false);
  });

  it('Shows skeleton loader when data is fetching', () => {
    useViewReportTable.mockReturnValue({
      tableLoading: ref(true),
      tableItems: ref([]),
    });
    wrapper = setup();
    const skeleton = findByTestId(wrapper, 'skeleton-loader');
    expect(skeleton.exists()).toBe(true);
  });
});
