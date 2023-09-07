/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import Spinner from './index';

describe('Spinner Component', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(Spinner, {
      global: {
        mocks: {
          $t: () => {},
        },
      },
    });
  });

  it('Is a large spinner by default', () => {
    expect(wrapper.find('.spinner-large').exists()).toBe(true);
  });

  it('Is a small spinner when using sm size', async () => {
    await wrapper.setProps({
      size: 'sm',
    });
    expect(wrapper.find('.spinner-small').exists()).toBe(true);
  });

  it('Has the text-primary class by default', () => {
    expect(wrapper.find('.spinner-primary').exists()).toBe(true);
  });

  it('Does not have the text-primary class when it is a buttonSpinner', () => {
    wrapper.setProps({
      buttonSpinner: true,
    });
    expect(wrapper.find('.spinner-large').classes('text-primary')).toBe(false);
  });
});
