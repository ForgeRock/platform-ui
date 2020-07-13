/**
 * @license
 * Copyright (c) 2020 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import KbaCreateCallback from '@/components/callbacks/KbaCreateCallback';
import i18n from '@/i18n';

KbaCreateCallback.mounted = jest.fn();

describe('KbaCreateCallback.vue', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(KbaCreateCallback, {
      i18n,
      stubs: {
        'router-link': true,
        mounted: true,
      },
      propsData: {
        callback: {
          getPredefinedQuestions: () => {},
          getPrompt: () => {},
        },
        // Does not currently work
        callbackSubmitButton: document.createElement('button'),
      },
    });
  });

  it('Load KbaCreateCallback component', () => {
    expect(wrapper.name()).toEqual('KbaCreateCallback');
  });
});
