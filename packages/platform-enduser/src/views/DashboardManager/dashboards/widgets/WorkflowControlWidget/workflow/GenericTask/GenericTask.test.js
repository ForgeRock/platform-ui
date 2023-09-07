/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import GenericTask from './index';

describe('GenericTask.vue', () => {
  let wrapper;
  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = shallowMount(GenericTask, {
      props: {
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
      global: {
        mocks: {
          $t: (key) => (key),
        },
      },
    });
  });

  it('GenericTask successfully loaded', () => {
    expect(wrapper.vm.formValues).toStrictEqual({ 123: '123var' });
  });
});
