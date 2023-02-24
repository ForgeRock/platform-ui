/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import GenericTask from './index';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

describe('GenericTask.vue', () => {
  let wrapper;
  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = shallowMount(GenericTask, {
      localVue,
      propsData: {
        variables: {
          123: '123var',
        },
        taskFields: {
          formPropertyHandlers: [{
            _id: 123,
            name: 'name',
            type: {
              name: 'enum',
              values: {
                val1: 'val1',
                val2: 'val2',
              },
            },
            writable: true,
          }],
        },
      },
      mocks: {
        $t: (key) => (key),
      },
    });
  });

  it('GenericTask successfully loaded', () => {
    expect(wrapper.name()).toEqual('GenericTask');
  });
});
