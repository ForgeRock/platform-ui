/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { mount } from '@vue/test-utils';
import i18n from '@/i18n';
import ReportCard from './ReportCard';

describe('Report Card', () => {
  const report = {
    name: 'TEMPLATE-NAME',
    version: 0,
    reportConfig: {},
    owner: null,
    createDate: '2010-10-10T10:10:10.123456789Z',
    updateDate: '2010-10-10T10:10:10.123456789Z',
  };
  it('Report card displayed when finish loading and the component receives data', () => {
    const wrapper = mount(ReportCard, {
      i18n,
      propsData: {
        report,
        loading: false,
      },
    });
    const reportCard = findByTestId(wrapper, 'report-card');
    const skeletonCard = findByTestId(wrapper, 'skeleton-card');
    expect(reportCard.exists()).toBe(true);
    expect(skeletonCard.exists()).toBe(false);
  });
  it('Skeleton card displayed when loading', () => {
    const wrapper = mount(ReportCard, {
      i18n,
      propsData: {
        report,
        loading: true,
      },
    });
    const reportCard = findByTestId(wrapper, 'report-card');
    const skeletonCard = findByTestId(wrapper, 'skeleton-card');
    expect(reportCard.exists()).toBe(false);
    expect(skeletonCard.exists()).toBe(true);
  });
  it('Nothing is displayed when there is no data', () => {
    const wrapper = mount(ReportCard, {
      i18n,
      propsData: {
        loading: false,
      },
    });
    const reportCard = findByTestId(wrapper, 'report-card');
    const skeletonCard = findByTestId(wrapper, 'skeleton-card');
    expect(reportCard.exists()).toBe(false);
    expect(skeletonCard.exists()).toBe(false);
  });
});
