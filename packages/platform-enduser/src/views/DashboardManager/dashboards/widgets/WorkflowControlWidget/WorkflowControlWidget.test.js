/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import i18n from '@/i18n';
import WorkflowControlWidget from './index';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

WorkflowControlWidget.created = jest.fn();
let wrapper;

describe('WorkflowControlWidget.vue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = shallowMount(WorkflowControlWidget, {
      localVue,
      i18n,
      propsData: {
        userDetails: {},
        widgetDetails: {},
      },
      mocks: {
        $t: (key) => (key),
      },
    });
  });

  it('WorkflowControlWidget loaded', () => {
    expect(wrapper.name()).toBe('WorkflowControlWidget');
  });
});
