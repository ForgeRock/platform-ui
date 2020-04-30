/**
 * Copyright 2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
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
    expect(wrapper).toMatchSnapshot();
  });
});
