/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import contractorForm from '@forgerock/platform-shared/src/testing/resources/contractorForm';
import Process from './index';

describe('Process.vue', () => {
  let wrapper;
  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = mount(Process, {
      props: {
        processDefinition: contractorForm,
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
    expect(wrapper.vm.processDefinition).toEqual(contractorForm);
  });

  it('creates startForm from dynamic form', async () => {
    await flushPromises();

    expect(wrapper.findAll('b-form-input').length).toBe(10);
    const buttons = wrapper.findAll('b-button');
    expect(buttons.length).toBe(2);
    expect(buttons[0].text()).toBe('Cancel');
    expect(buttons[1].text()).toBe('Submit');
  });
});
