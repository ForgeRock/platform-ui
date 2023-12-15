/**
 * Copyright 2023 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { mount } from '@vue/test-utils';
import ReportViewTable from './ReportViewTable';

describe('Report View Table component', () => {
  function setup(props) {
    return mount(ReportViewTable, {
      global: {
        mocks: {
          $t: (msg) => msg,
        },
      },
      propsData: {
        ...props,
      },
    });
  }
  let wrapper;

  it('Shows skeleton when is loading', () => {
    wrapper = setup({
      loading: true,
      isEmpty: false,
      fields: [],
      items: [],
    });
    const skeletonTable = findByTestId(wrapper, 'skeleton-table');
    expect(skeletonTable.exists()).toBe(true);
    const noTableData = findByTestId(wrapper, 'no-table-data');
    expect(noTableData.exists()).toBe(false);
    const reportTable = findByTestId(wrapper, 'report-table');
    expect(reportTable.exists()).toBe(false);
  });

  it('Shows No Data component when there is no data', () => {
    wrapper = setup({
      loading: false,
      isEmpty: true,
      fields: [],
      items: [],
    });
    const skeletonTable = findByTestId(wrapper, 'skeleton-table');
    expect(skeletonTable.exists()).toBe(false);
    const noTableData = findByTestId(wrapper, 'no-table-data');
    expect(noTableData.exists()).toBe(true);
    const reportTable = findByTestId(wrapper, 'report-table');
    expect(reportTable.exists()).toBe(false);
  });

  it('Shows table when data has been retrieved', () => {
    wrapper = setup({
      loading: false,
      isEmpty: false,
      fields: [{ key: 'user', label: 'user' }],
      items: [{ user: 'username' }],
    });
    const skeletonTable = findByTestId(wrapper, 'skeleton-table');
    expect(skeletonTable.exists()).toBe(false);
    const noTableData = findByTestId(wrapper, 'no-table-data');
    expect(noTableData.exists()).toBe(false);
    const reportTable = findByTestId(wrapper, 'report-table');
    expect(reportTable.exists()).toBe(true);
  });
});
