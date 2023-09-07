/**
 * Copyright (c) 2022-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import ReasonFilter from './ReasonFilter';
import i18n from '@/i18n';

jest.mock('@/store', () => ({
  __esModule: true,
  default: {
    state: {
      Dashboard: {
        uebaClusteringReasons: [
          'browser',
          'user_agent',
          'city',
          'country',
          'day_of_week',
          'weekday',
          'model',
          'device',
          'os',
          'os_version',
          'osWithVersion',
          'dayparting',
        ],
      },
    },
  },
}));

describe('Reason Filter', () => {
  let wrapper;
  const expectedOptions = [
    {
      text: 'Advanced Bot Detection',
      value: ['is_advanced_bot_detection'],
    },
    {
      text: 'Automated User Agent',
      value: ['is_automated_user_agent'],
    },
    {
      text: 'Brute Force',
      value: ['is_brute_force'],
    },
    {
      text: 'Credential Stuffing',
      value: ['is_credential_stuffing'],
    },
    {
      text: 'Distributed Attack',
      value: ['is_distributed_attack'],
    },
    {
      text: 'Impossible Travel',
      value: ['is_impossible_travel'],
    },
    {
      text: 'IP Blocklist',
      value: ['is_ip_blocked'],
    },
    {
      text: 'Suspicious IP',
      value: ['is_suspicious_ip'],
    },
    {
      text: 'Unusual Browser',
      value: ['browser'],
    },
    {
      text: 'Unusual Browser Family',
      value: ['user_agent'],
    },
    {
      text: 'Unusual City',
      value: ['city'],
    },
    {
      text: 'Unusual Country',
      value: ['country'],
    },
    {
      text: 'Unusual Day of Week',
      value: ['day_of_week', 'weekday'],
    },
    {
      text: 'Unusual Device',
      value: ['model', 'device'],
    },
    {
      text: 'Unusual OS',
      value: ['os'],
    },
    {
      text: 'Unusual OS Version',
      value: ['os_version', 'osWithVersion'],
    },
    {
      text: 'Unusual Time of Day',
      value: ['dayparting'],
    },
  ];

  beforeEach(() => {
    wrapper = shallowMount(ReasonFilter, {
      global: {
        plugins: [i18n],
      },
    });
  });
  it('Component should render', () => {
    expect(wrapper.vm.reasonOptions).toEqual(expectedOptions);
  });
});
