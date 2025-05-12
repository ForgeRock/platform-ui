/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import i18n from '@/i18n';
import WorkflowControlWidget from './index';

WorkflowControlWidget.created = jest.fn();
let wrapper;

describe('WorkflowControlWidget.vue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = shallowMount(WorkflowControlWidget, {
      global: {
        plugins: [i18n],
        mocks: {
          $t: (key) => (key),
        },
      },
      props: {
        userDetails: {},
        widgetDetails: {},
      },
    });
  });

  it('WorkflowControlWidget loaded', () => {
    expect(wrapper.vm.assignedTasks).toStrictEqual({});
  });
});
