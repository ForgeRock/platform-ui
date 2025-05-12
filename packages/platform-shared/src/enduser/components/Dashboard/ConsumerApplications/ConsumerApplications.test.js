/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import i18n from '@/i18n';
import ConsumerApplications from './index';

describe('ConsumerApplications', () => {
  it('Consumer Applications widget loaded', () => {
    const wrapper = shallowMount(ConsumerApplications, {
      global: {
        plugins: [i18n],
      },
      props: {
        applicationDetails: {
          dashboardDisplayName: ['Google'],
          dashboardLogin: ['https://www.google.com'],
          dashboardIcon: ['google.png'],
          brandLogoAltText: 'Google logo',
        },
      },
    });

    expect(wrapper.vm.applicationName).toBe('Google');
  });
});
