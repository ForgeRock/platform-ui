/**
 * Copyright (c) 2020-2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import AccountControls from '@/components/profile/AccountControls';
import i18n from '@/i18n';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

describe('Preferences.vue', () => {
  it('Account Controls page loaded', () => {
    const wrapper = shallowMount(AccountControls, {
      localVue,
      i18n,
    });

    expect(wrapper.name()).toBe('AccountControls');
  });
});
