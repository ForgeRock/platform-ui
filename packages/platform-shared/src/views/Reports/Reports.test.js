/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as AutoApi from '@forgerock/platform-shared/src/api/AutoApi';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { mount, flushPromises } from '@vue/test-utils';
import i18n from '@/i18n';
import Reports from './Reports';

jest.mock('vue-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

describe('Reports', () => {
  function setup() {
    return mount(Reports, {
      global: {
        plugins: [i18n],
      },
    });
  }
  const returnDataSuccess = {
    result: [
      {
        name: 'TEMPLATE-NAME',
        description: 'Lorem ipsum.',
        version: 0,
        reportConfig: {},
        owner: null,
        createDate: '2010-10-10T10:10:10.123456789Z',
        updateDate: '2010-10-10T10:10:10.123456789Z',
      },
    ],
  };
  const returnDataFail = {
    result: [],
  };
  it('Report cards displayed successfully', async () => {
    AutoApi.getReportTemplates = jest.fn().mockReturnValue(Promise.resolve(returnDataSuccess));
    const wrapper = setup();
    await flushPromises();
    const reportTemplatesGrid = findByTestId(wrapper, 'report-templates-grid');
    const noData = findByTestId(wrapper, 'no-data');
    expect(reportTemplatesGrid.exists()).toBe(true);
    expect(noData.exists()).toBe(false);
  });
  it('No data div displayed when error', async () => {
    AutoApi.getReportTemplates = jest.fn().mockReturnValue(Promise.resolve(returnDataFail));
    const wrapper = setup();
    await flushPromises();
    const reportTemplatesGrid = findByTestId(wrapper, 'report-templates-grid');
    const noData = findByTestId(wrapper, 'no-data');
    expect(reportTemplatesGrid.exists()).toBe(false);
    expect(noData.exists()).toBe(true);
  });
});
