/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import DonutChartCard from './DonutChartCard';
import i18n from '@/i18n';

describe('DonutChartCard', () => {
  function setup() {
    return mount(DonutChartCard, { i18n });
  }

  describe('@renders', () => {
    it('should render the component', () => {
      const wrapper = setup();
      const donutChartCard = wrapper.findComponent(DonutChartCard);
      expect(donutChartCard.exists()).toBeTruthy();
    });
  });
});
