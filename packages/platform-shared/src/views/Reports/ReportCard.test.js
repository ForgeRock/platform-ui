/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  findByTestId,
  findByRole,
  findByText,
} from '@forgerock/platform-shared/src/utils/testHelpers';
import { mount } from '@vue/test-utils';
import i18n from '@/i18n';
import ReportCard from './ReportCard';

describe('Report Card', () => {
  let wrapper;

  const report = {
    name: 'TEMPLATE-NAME',
    version: 0,
    reportConfig: {},
    owner: null,
    type: 'draft',
    createDate: '2010-10-10T10:10:10.123456789Z',
    updateDate: '2010-10-10T10:10:10.123456789Z',
  };

  function setup(props) {
    return mount(ReportCard, {
      global: {
        plugins: [i18n],
      },
      props: {
        report,
        loading: false,
        ...props,
      },
    });
  }

  it('Report card displayed when finish loading and the component receives data', () => {
    wrapper = setup();
    const reportCard = findByTestId(wrapper, 'report-card');
    const skeletonCard = findByTestId(wrapper, 'skeleton-card');
    expect(reportCard.exists()).toBe(true);
    expect(skeletonCard.exists()).toBe(false);
  });

  it('Skeleton card displayed when loading', () => {
    wrapper = setup({ loading: true });
    const reportCard = findByTestId(wrapper, 'report-card');
    const skeletonCard = findByTestId(wrapper, 'skeleton-card');
    expect(reportCard.exists()).toBe(false);
    expect(skeletonCard.exists()).toBe(true);
  });

  it('Nothing is displayed when there is no data', () => {
    wrapper = setup({ report: {} });
    const reportCard = findByTestId(wrapper, 'report-card');
    const skeletonCard = findByTestId(wrapper, 'skeleton-card');
    expect(reportCard.exists()).toBe(false);
    expect(skeletonCard.exists()).toBe(false);
  });

  it('Shows the spinner icon instead of the actions menu when the component is processing', async () => {
    wrapper = setup({
      report: {
        ...report,
        isOotb: false,
      },
    });

    let spinnerButton = findByRole(wrapper, 'status');
    expect(spinnerButton.exists()).toBe(false);

    await wrapper.setProps({ reportNameCurrentlyProcessing: report.name });
    spinnerButton = findByRole(wrapper, 'status');
    expect(spinnerButton.exists()).toBe(true);
  });

  it('hides the delete option for out of the box reports', async () => {
    wrapper = setup({
      report: {
        isOotb: true,
        ...report,
      },
    });
    const menu = findByRole(wrapper, 'menu');
    let deleteOption = findByText(menu, 'a', 'deleteDelete');
    expect(deleteOption).toBeUndefined();

    await wrapper.setProps({ report: { ...report, isOotb: false } });
    deleteOption = findByText(menu, 'a', 'deleteDelete');
    expect(deleteOption.exists()).toBe(true);
  });

  it('emits the correct information when the delete button is clicked', async () => {
    wrapper = setup({
      report: {
        ...report,
        isOotb: false,
      },
    });

    const menu = findByRole(wrapper, 'menu');
    const deleteButton = findByText(menu, 'a', 'deleteDelete');
    await deleteButton.trigger('click');
    expect(wrapper.emitted()['delete-template'][0][0]).toEqual(report.name);
    expect(wrapper.emitted()['delete-template'][0][1]).toEqual(report.type);
  });
});
