/**
 * Copyright (c) 2020-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import axios from 'axios';
import { mount, flushPromises } from '@vue/test-utils';
import contractorForm from '@forgerock/platform-shared/src/testing/resources/contractorForm';
import ClipLoader from '@forgerock/platform-shared/src/components/Spinner/ClipLoader';
import Task from './index';

jest.mock('axios');

// Task reads loadingColor from `styles.basecolor` — the themed $primary exported by
// platform-shared main.scss. Mocking a distinct value here proves the :color prop
// binding passes it through to the loader.
jest.mock('@forgerock/platform-shared/src/scss/main.scss', () => ({
  basecolor: '#123456',
}));

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
            taskDefinition: contractorForm,
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

  it('Shows the ClipLoader, passing through the loadingColor, while the process definition is loading', () => {
    expect(wrapper.vm.loadingColor).toBe('#123456');
    const clipLoader = wrapper.findComponent(ClipLoader);
    expect(clipLoader.exists()).toBe(true);
    expect(clipLoader.props('color')).toBe('#123456');
  });

  it('Removes the ClipLoader once the task form has loaded', async () => {
    await wrapper.setProps({ shown: true });
    await flushPromises();

    expect(wrapper.findComponent(ClipLoader).exists()).toBe(false);
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
