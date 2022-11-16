/**
 * Copyright (c) 2019-2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import Alert from './index';

describe('Alert Component', () => {
  let wrapper;

  it('Alert successfully loaded', () => {
    wrapper = shallowMount(Alert);
    expect(wrapper.name()).toEqual('Alert');
  });

  it('Will show alert text passed in through slot', () => {
    wrapper = shallowMount(Alert, {
      slots: {
        default: 'Hello',
      },
    });
    expect(wrapper.text().includes('Hello'));
  });

  it('primary variant is the default variant', () => {
    wrapper = shallowMount(Alert);
    expect(wrapper.vm.variant).toBe('primary');
    expect(wrapper.vm.alertIcon).toBe('info');
  });

  it('warning variant will have a warning icon', () => {
    wrapper = shallowMount(Alert, {
      propsData: {
        variant: 'warning',
      },
    });
    expect(wrapper.vm.alertIcon).toBe('warning_amber');
  });
});
