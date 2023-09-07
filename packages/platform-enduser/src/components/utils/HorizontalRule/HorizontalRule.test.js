/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import HorizontalRule from '@/components/utils/HorizontalRule';

describe('HorizontalRule.vue', () => {
  it('Renders insert prop', () => {
    const wrapper = shallowMount(HorizontalRule, {
      props: {
        insert: 'test',
      },
    });

    expect(wrapper.find('.col-auto').text()).toBe('test');
  });
});
