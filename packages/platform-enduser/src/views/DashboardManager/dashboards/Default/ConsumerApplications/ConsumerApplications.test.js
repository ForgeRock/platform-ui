/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import i18n from '@/i18n';
import ConsumerApplications from './index';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

describe('Dashboard.vue', () => {
  it('Consumer Applications widget loaded', () => {
    const wrapper = shallowMount(ConsumerApplications, {
      localVue,
      i18n,
      propsData: {
        applicationDetails: {
          dashboardDisplayName: 'Google',
          dashboardLogin: 'https://www.google.com',
          dashboardIcon: 'google.png',
          brandLogoAltText: 'Google logo',
        },
      },
    });

    expect(wrapper.name()).toBe('ConsumerApplications');
  });
});
