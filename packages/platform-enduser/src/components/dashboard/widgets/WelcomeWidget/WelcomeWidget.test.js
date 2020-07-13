/**
 * @license
 * Copyright (c) 2020 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import i18n from '@/i18n';
import WelcomeWidget from '@/components/dashboard/widgets/WelcomeWidget';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

describe('Dashboard.vue', () => {
  it('Welcome widget loaded', () => {
    const wrapper = shallowMount(WelcomeWidget, {
      localVue,
      i18n,
      propsData: {
        userDetails: {
          givenName: 'test',
          sn: 'test',
        },
      },
    });

    expect(wrapper.name()).toBe('WelcomeWidget');
    expect(wrapper).toMatchSnapshot();
  });
});
