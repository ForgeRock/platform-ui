/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import Vue from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import * as ManagedResourceApi from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import * as AutoApi from '@forgerock/platform-shared/src/api/AutoApi';
import i18n from '@/i18n';
import UserBehavior from './UserBehavior';
import DonutChartCard from './DonutChartCard';
import NormalViewHeader from './NormalViewHeader';
import NormalViewToolbar from './NormalViewToolbar';

describe('UserBehavior', () => {
  const userInfo = {
    data: {
      result: [{
        givenName: 'Test', profileImage: 'testUser.jpg', sn: 'User', userName: 'testUser',
      }],
    },
  };
  const userData = {
    result: [
      {
        count: '23',
        category: 'time_of_day',
        type: 'user',
        value: 'night',
      },
      {
        count: '23',
        category: 'time_of_day',
        type: 'user',
        value: 'evening',
      },
      {
        count: '20',
        category: 'time_of_day',
        type: 'user',
        value: 'afternoon',
      },
      {
        count: '66',
        category: 'os',
        type: 'user',
        value: 'other',
      },
      {
        count: '66',
        category: 'device',
        type: 'user',
        value: 'other',
      },
      {
        count: '66',
        category: 'day_of_week',
        type: 'user',
        value: 'tuesday',
      },
      {
        count: '43',
        category: 'country',
        type: 'user',
        value: 'u^s^_virgin_islands',
      },
      {
        count: '23',
        category: 'country',
        type: 'user',
        value: 'colombia',
      },
      {
        count: '43',
        category: 'city',
        type: 'user',
        value: 'frederickstadt_u^s^_virgin_islands',
      },
      {
        count: '23',
        category: 'city',
        type: 'user',
        value: 'medellín_colombia',
      },
      {
        count: '66',
        category: 'browser',
        type: 'user',
        value: 'apache-httpclient',
      },
    ],
    totalCount: 11,
    currentCount: 11,

  };

  function setup() {
    global.window = Object.create(window);
    const url = 'http://default.iam.example.com/platform/?realm=alpha#/dashboard/risk/testUser/normal';
    Object.defineProperty(window, 'location', {
      value: {
        href: url,
      },
      writable: true,
    });
    return mount(UserBehavior, { global: { plugins: [i18n] } });
  }

  async function initLoad() {
    const getManagedResourceList = jest.spyOn(ManagedResourceApi, 'getManagedResourceList').mockResolvedValue(userInfo);
    const getAutoAccessReportResult = jest.spyOn(AutoApi, 'getAutoAccessReportResult').mockResolvedValue(userData);

    const wrapper = setup();
    await flushPromises();

    expect(getManagedResourceList).toHaveBeenCalled();
    expect(getAutoAccessReportResult).toHaveBeenCalled();

    return wrapper;
  }

  describe('@renders', () => {
    it('should render the component', () => {
      const wrapper = setup();
      const userBehavior = wrapper.findComponent(UserBehavior);
      expect(userBehavior.exists()).toBeTruthy();
    });

    it('should render the Header and populate with userInfo data', async () => {
      const wrapper = await initLoad();
      const normalViewHeader = wrapper.findComponent(NormalViewHeader);
      expect(normalViewHeader.exists()).toBeTruthy();

      // Validate markup
      const title = normalViewHeader.find('[data-testid="header-title"]');
      const subtitle = normalViewHeader.find('[data-testid="header-subtitle"]');
      const profileImage = normalViewHeader.find('.media img');
      expect(title.text()).toBe(userInfo.data.result[0].userName);
      expect(subtitle.text()).toBe(`${userInfo.data.result[0].givenName} ${userInfo.data.result[0].sn}`);
      expect(profileImage.attributes().src).toBe(userInfo.data.result[0].profileImage);
    });

    it('should render the Toolbar with form elements not disabled', async () => {
      const wrapper = await initLoad();
      const normalViewToolbar = wrapper.findComponent(NormalViewToolbar);
      expect(normalViewToolbar.exists()).toBeTruthy();

      // Validate markup
      const showLastPeriodCheckbox = normalViewToolbar.find('[data-testid="fr-field-showLastPeriod"]');
      const featureFilterButton = normalViewToolbar.find('button');
      expect(showLastPeriodCheckbox.attributes().disabled).toBe(undefined);
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

  describe('@actions', () => {
    it('can launch compare charts', async () => {
      const wrapper = await initLoad();

      const normalViewToolbar = wrapper.findComponent(NormalViewToolbar);
      const compareCheckbox = normalViewToolbar.find('.custom-switch');
      compareCheckbox.trigger('click');
      const compareCheckboxInput = normalViewToolbar.find('.custom-switch input');
      compareCheckboxInput.setChecked(true);

      // Wait another tick for final render
      await Vue.nextTick();

      const tenantCharts = wrapper.findAll('.tenantchart');
      expect(tenantCharts).toHaveLength(7);
    });
  });
});
