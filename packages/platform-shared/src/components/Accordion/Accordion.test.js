/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import Accordion from './index';

describe('Accordion Component', () => {
  let wrapper;

  it('Accordion successfully loaded', () => {
    wrapper = shallowMount(Accordion, {
      propsData: {
        accordionGroup: 'my-accordion',
        items: [],
      },
    });
    expect(wrapper.vm.wasOpen).toEqual(false);
  });
});
