/**
 * Copyright 2019 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
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
    expect(wrapper).toMatchSnapshot();
  });
});
