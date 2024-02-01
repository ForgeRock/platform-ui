/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import Vue from 'vue';
import { mount } from '@vue/test-utils';
import * as AutoApi from '@forgerock/platform-shared/src/api/AutoApi';
import Notifications from '@kyvg/vue3-notification';
import i18n from '@/i18n';
import TenantBehavior from './TenantBehavior';
import DonutChartCard from './DonutChartCard';
import NormalViewToolbar from './NormalViewToolbar';
import store from '../../../../store';

describe('TenantBehavior', () => {
  const defaultProps = {};
  const tenantData = {
    result: [
      {
        count: '499',
        category: 'time_of_day',
        type: 'all',
        value: 'evening',
      },
      {
        count: '182',
        category: 'time_of_day',
        type: 'all',
        value: 'afternoon',
      },
      {
        count: '60',
        category: 'time_of_day',
        type: 'all',
        value: 'night',
      },
      {
        count: '349',
        category: 'os',
        type: 'all',
        value: 'other',
      },
      {
        count: '164',
        category: 'os',
        type: 'all',
        value: 'windows',
      },
      {
        count: '128',
        category: 'os',
        type: 'all',
        value: 'linux',
      },
      {
        count: '79',
        category: 'os',
        type: 'all',
        value: 'ios',
      },
      {
        count: '18',
        category: 'os',
        type: 'all',
        value: 'android',
      },
      {
        count: '3',
        category: 'os',
        type: 'all',
        value: 'Others',
      },
      {
        count: '648',
        category: 'device',
        type: 'all',
        value: 'other',
      },
      {
        count: '72',
        category: 'device',
        type: 'all',
        value: 'iphone',
      },
      {
        count: '18',
        category: 'device',
        type: 'all',
        value: 'generic_smartphone',
      },
      {
        count: '3',
        category: 'device',
        type: 'all',
        value: 'mac',
      },
      {
        count: '725',
        category: 'day_of_week',
        type: 'all',
        value: 'tuesday',
      },
      {
        count: '15',
        category: 'day_of_week',
        type: 'all',
        value: 'monday',
      },
      {
        count: '1',
        category: 'day_of_week',
        type: 'all',
        value: 'thursday',
      },
      {
        count: '223',
        category: 'country',
        type: 'all',
        value: 'united_states',
      },
      {
        count: '132',
        category: 'country',
        type: 'all',
        value: null,
      },
      {
        count: '67',
        category: 'country',
        type: 'all',
        value: 'colombia',
      },
      {
        count: '64',
        category: 'country',
        type: 'all',
        value: 'u^s^_virgin_islands',
      },
      {
        count: '44',
        category: 'country',
        type: 'all',
        value: 'china',
      },
      {
        count: '211',
        category: 'country',
        type: 'all',
        value: 'Others',
      },
      {
        count: '143',
        category: 'city',
        type: 'all',
        value: 'city_unknown_united_states',
      },
      {
        count: '132',
        category: 'city',
        type: 'all',
        value: null,
      },
      {
        count: '64',
        category: 'city',
        type: 'all',
        value: 'frederickstadt_u^s^_virgin_islands',
      },
      {
        count: '54',
        category: 'city',
        type: 'all',
        value: 'medellín_colombia',
      },
      {
        count: '33',
        category: 'city',
        type: 'all',
        value: 'city_unknown_china',
      },
      {
        count: '315',
        category: 'city',
        type: 'all',
        value: 'Others',
      },
      {
        count: '483',
        category: 'browser',
        type: 'all',
        value: 'other',
      },
      {
        count: '161',
        category: 'browser',
        type: 'all',
        value: 'apache-httpclient',
      },
      {
        count: '79',
        category: 'browser',
        type: 'all',
        value: 'mobile_safari_ui^wkwebview',
      },
      {
        count: '10',
        category: 'browser',
        type: 'all',
        value: 'chrome',
      },
      {
        count: '8',
        category: 'browser',
        type: 'all',
        value: 'firefox',
      },
    ],
    totalCount: 33,
    currentCount: 33,
  };

  // Since we don't use the inject $store, use the mockData field doesn't work
  beforeEach(() => {
    store.replaceState({
      tenant: 'default-iam-example.forgeblocks.com',
    });
  });

  function setup() {
    return mount(TenantBehavior, {
      global: {
        plugins: [i18n, Notifications],
      },
      props: {
        ...defaultProps,
      },
    });
  }

  async function initLoad() {
    const getAutoAccessReportResult = jest.spyOn(AutoApi, 'getAutoAccessReportResult').mockResolvedValue(tenantData);

    const wrapper = setup();

    // First tick for userInfo and userData
    await Vue.nextTick();

    // Second tick for template rerender
    await Vue.nextTick();

    expect(getAutoAccessReportResult).toHaveBeenCalled();

    return wrapper;
  }

  describe('@renders', () => {
    it('should render the component', () => {
      const wrapper = setup();
      const tenantBehavior = wrapper.findComponent(TenantBehavior);
      expect(tenantBehavior.exists()).toBeTruthy();
    });

    it('should render the Toolbar with form elements not disabled', async () => {
      const wrapper = await initLoad();
      const normalViewToolbar = wrapper.findComponent(NormalViewToolbar);
      expect(normalViewToolbar.exists()).toBeTruthy();

      // Validate markup
      const featureFilterButton = normalViewToolbar.find('button');
      expect(featureFilterButton.attributes().disabled).toBe(undefined);
    });

    it('should render donut charts', async () => {
      const wrapper = await initLoad();

      // Wait another tick for final render
      await Vue.nextTick();

      const donutChartCards = wrapper.findAllComponents(DonutChartCard);
      expect(donutChartCards).toHaveLength(7);
    });
  });
});
