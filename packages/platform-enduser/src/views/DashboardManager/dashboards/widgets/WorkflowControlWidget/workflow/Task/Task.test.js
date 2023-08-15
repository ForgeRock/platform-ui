/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import Task from './index';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

describe('Task.vue', () => {
  let wrapper;
  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = shallowMount(Task, {
      localVue,
      propsData: {
        taskInstance: {
          process: {
            processDefinition: {},
          },
          task: {
            _id: 123,
            taskDefinition: {},
          },
        },
        shown: false,
      },
      mocks: {
        $t: (key) => (key),
      },
    });
  });

  it('Task successfully loaded', () => {
    expect(wrapper.vm.processDefinition).toStrictEqual({});
  });
});
