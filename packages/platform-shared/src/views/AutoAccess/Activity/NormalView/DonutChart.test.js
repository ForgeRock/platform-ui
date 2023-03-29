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
  function setup() {
    return mount(DonutChart, { i18n });
  }

  describe('@renders', () => {
    it('should render the component', () => {
      const wrapper = setup();
      const donutChart = wrapper.findComponent(DonutChart);
      expect(donutChart.exists()).toBeTruthy();
    });
  });
});
