/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import SelectIdPCallback from '@/components/callbacks/SelectIdPCallback';
import i18n from '@/i18n';

SelectIdPCallback.mounted = jest.fn();

describe('SelectIdPCallback.vue', () => {
  let wrapper;
  const getOutputByName = () => {};

  beforeEach(() => {
    wrapper = shallowMount(SelectIdPCallback, {
      global: {
        plugins: [i18n],
        stubs: {
          'router-link': true,
        },
      },
      props: {
        callback: {
          getOutputByName,
        },
        // Does not currently work
        callbackSubmitButton: document.createElement('button'),
      },
    });
  });

  it('Load SelectIdPCallback component', () => {
    expect(wrapper.vm.callback).toEqual({ getOutputByName });
  });
});
