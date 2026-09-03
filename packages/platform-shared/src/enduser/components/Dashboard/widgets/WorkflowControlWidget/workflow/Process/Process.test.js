/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import contractorForm from '@forgerock/platform-shared/src/testing/resources/contractorForm';
import ClipLoader from '@forgerock/platform-shared/src/components/Spinner/ClipLoader';
import Process from './index';

// Process reads loadingColor from `styles.basecolor` — the themed $primary exported by
// platform-shared main.scss. Mocking a distinct value here proves the :color prop
// binding passes it through to the loader.
jest.mock('@forgerock/platform-shared/src/scss/main.scss', () => ({
  basecolor: '#123456',
}));

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

describe('Process.vue while the process definition is loading', () => {
  it('Shows the ClipLoader, passing through the loadingColor', () => {
    const wrapper = mount(Process, {
      props: {
        processDefinition: null,
      },
      global: {
        mocks: {
          $t: (key) => (key),
        },
      },
    });

    expect(wrapper.vm.loadingColor).toBe('#123456');
    const clipLoader = wrapper.findComponent(ClipLoader);
    expect(clipLoader.exists()).toBe(true);
    expect(clipLoader.props('color')).toBe('#123456');
  });
});
