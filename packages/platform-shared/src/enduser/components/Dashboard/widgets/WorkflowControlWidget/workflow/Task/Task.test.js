/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import axios from 'axios';
import { mount, flushPromises } from '@vue/test-utils';
import contractorForm from '@forgerock/platform-shared/src/testing/resources/contractorForm';
import Task from './index';

jest.mock('axios');

describe('Task.vue', () => {
  let wrapper;
  beforeEach(() => {
    jest.clearAllMocks();
    axios.create.mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: contractorForm }),
    });
    wrapper = mount(Task, {
      props: {
        taskInstance: {
          process: {
            processDefinition: null,
          },
          task: {
            _id: 123,
            taskDefinition: {},
          },
        },
        shown: false,
      },
      global: {
        mocks: {
          $t: (key) => (key),
        },
      },
    });
  });

  it('Task successfully loaded', () => {
    expect(wrapper.vm.processDefinition).toStrictEqual(null);
  });

  it('creates taskForm when dynamic form is provided', async () => {
    await wrapper.setProps({ shown: true });
    await flushPromises();

    expect(wrapper.findAll('b-form-input').length).toBe(10);
    const buttons = wrapper.findAll('b-button');
    expect(buttons.length).toBe(2);
    expect(buttons[0].text()).toBe('Reject');
    expect(buttons[1].text()).toBe('Accept');
  });
});
