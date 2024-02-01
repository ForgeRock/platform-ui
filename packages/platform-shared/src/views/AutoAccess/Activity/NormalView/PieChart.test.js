/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import PieChart from './DonutChart';
import i18n from '@/i18n';

describe('PieChart', () => {
  function setup() {
    return mount(PieChart, { global: { plugins: [i18n] } });
  }

  describe('@renders', () => {
    it('should render the component', () => {
      const wrapper = setup();
      const pieChart = wrapper.findComponent(PieChart);
      expect(pieChart.exists()).toBeTruthy();
    });
  });
});
