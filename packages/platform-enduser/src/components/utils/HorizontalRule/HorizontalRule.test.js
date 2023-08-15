/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import HorizontalRule from '@/components/utils/HorizontalRule';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

describe('HorizontalRule.vue', () => {
  it('Renders insert prop', () => {
    const wrapper = shallowMount(HorizontalRule, {
      localVue,
      propsData: {
        insert: 'test',
      },
    });

    expect(wrapper.find('.col-auto').text()).toBe('test');
  });
});
