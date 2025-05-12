/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import Process from './index';

describe('Process.vue', () => {
  let wrapper;
  const formGenerationTemplate = () => {};
  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = shallowMount(Process, {
      props: {
        processDefinition: {
          formGenerationTemplate,
        },
        tasks: {},
      },
      global: {
        mocks: {
          $t: (key) => (key),
        },
      },
    });
  });

  it('Process successfully loaded', () => {
    expect(wrapper.vm.processDefinition).toEqual({ formGenerationTemplate });
  });
});
