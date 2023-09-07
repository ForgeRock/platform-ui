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
  const defaultProps = {
    feature: 'city',
    isLoading: false,
    shouldCompare: false,
    userInfo: {
      userName: 'TestUser',
    },
  };

  function setup(props) {
    return mount(DonutChartCard, {
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
    it('should render the component', () => {
      const wrapper = setup();
      const donutChartCard = wrapper.findComponent(DonutChartCard);
      expect(donutChartCard.exists()).toBeTruthy();
    });

    it('displays a second column when shouldCompare is true', async () => {
      const wrapper = setup({ shouldCompare: true });
      const tenantchart = wrapper.find('.tenantchart');
      const userchart = wrapper.find('.userchart');
      expect(tenantchart.classes()).toContain('tenantchart');
      expect(userchart.classes()).toContain('userchart');
    });

    it('displays and image and chart name when shouldCompare is true', async () => {
      const wrapper = setup({ shouldCompare: true });
      const chartName = wrapper.find('.chartName > div');
      expect(chartName.find('img')).toBeTruthy();
      expect(chartName.find('h5').text()).toBe(defaultProps.userInfo.userName);
    });
  });
});
