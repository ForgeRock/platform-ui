/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import DonutChart from './DonutChart';
import i18n from '@/i18n';

describe('DonutChart', () => {
  const defaultProps = {
    chartData: [{
      label: 'night', value: 23, valueFormatted: '23', color: '#2ed47a',
    }, {
      label: 'evening', value: 23, valueFormatted: '23', color: '#ffb946',
    }, {
      label: 'afternoon', value: 20, valueFormatted: '20', color: '#109cf1',
    }],
    isLoading: false,
    shouldCompare: false,
  };

  function setup(props) {
    return mount(DonutChart, {
      global: {
        plugins: [i18n],
      },
      props: {
        ...defaultProps,
        ...props,
      },
    });
  }

  describe('@renders', () => {
    it('shows skeleton loader when isLoading', async () => {
      const wrapper = setup({ isLoading: true });
      const skeletonDonutChart = wrapper.find('.fr-skeleton-donutchart');
      expect(skeletonDonutChart.exists()).toBeTruthy();
    });

    it('should set large columns to 6 when shouldCompare is true', async () => {
      const wrapper = setup({ shouldCompare: true });
      expect(wrapper.classes()).toContain('col-lg-6');
    });

    it('should set large columns to 12 when shouldCompare is false', async () => {
      const wrapper = setup({ shouldCompare: false });
      expect(wrapper.classes()).toContain('col-lg-12');
    });

    it('should render a legend table with the correct fields', async () => {
      const wrapper = setup();
      const labels = wrapper.findAll('tbody[role="rowgroup"] tr[role="row"] td:first-child');
      const values = wrapper.findAll('tbody[role="rowgroup"] tr[role="row"] td:last-child');
      expect(labels).toHaveLength(defaultProps.chartData.length);
      defaultProps.chartData.forEach((data, i) => {
        expect(labels[i].text()).toBe(data.label);
        expect(values[i].text()).toBe(data.valueFormatted);
      });
    });

    it('should render the component', () => {
      const wrapper = setup();
      const donutChart = wrapper.findComponent(DonutChart);
      expect(donutChart.exists()).toBeTruthy();
    });
  });
});
