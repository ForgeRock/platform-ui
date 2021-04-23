/**
 * Copyright (c) 2020-2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import i18n from '@/i18n';
import MyApplicationsListItem from '@/components/dashboard/applications/MyApplicationsListItem/';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

describe('Dashboard.vue', () => {
  it('My Applications List Item widget loaded', () => {
    const wrapper = shallowMount(MyApplicationsListItem, {
      localVue,
      i18n,
      propsData: {
        dashboardDisplayName: 'Google',
        dashboardLogin: 'https://www.google.com',
        dashboardIcon: 'google.png',
        brandLogoAltText: 'Google logo',
      },
    });

    expect(wrapper.name()).toBe('MyApplicationsListItem');
  });
});
