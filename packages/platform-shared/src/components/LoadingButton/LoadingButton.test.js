/**
 * Copyright 2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import LoadingButton from './index';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

describe('ListItem.vue', () => {
  it('List Group component loaded', () => {
    const wrapper = shallowMount(LoadingButton, { localVue });

    expect(wrapper.name()).toBe('LoadingButton');
    expect(wrapper).toMatchSnapshot();
  });
});
