/**
 * Copyright (c) 2020-2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import LoadingButton from '@/components/utils/LoadingButton';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

describe('ListItem.vue', () => {
  it('List Group component loaded', () => {
    const wrapper = shallowMount(LoadingButton, { localVue });

    expect(wrapper.name()).toBe('LoadingButton');
  });
});
