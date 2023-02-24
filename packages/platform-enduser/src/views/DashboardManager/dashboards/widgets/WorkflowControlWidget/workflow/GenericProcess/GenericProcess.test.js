/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import GenericProcess from './index';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

describe('GenericProcess.vue', () => {
  let wrapper;
  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = shallowMount(GenericProcess, {
      localVue,
      propsData: {
        workflowDetails: [{
          name: 'myWorkflow',
          type: {
            name: 'boolean',
            value: true,
          },
        }],
        id: 'workflow_id',
      },
      mocks: {
        $t: (key) => (key),
      },
    });
  });

  it('GenericProcess successfully loaded', () => {
    expect(wrapper.name()).toEqual('GenericProcess');
  });

  it('Resets form', () => {
    wrapper.vm.resetForm();
    expect(wrapper.vm.formValues).toEqual({
      _processDefinitionId: 'workflow_id',
      myworkflow: Boolean(),
      undefined: false,
    });
  });

  it('Returns default field types using a switch statement', () => {
    expect(wrapper.vm.setDefaults('boolean')).toEqual(Boolean());
    expect(wrapper.vm.setDefaults('number')).toEqual(Number());
    expect(wrapper.vm.setDefaults('string')).toEqual(String());
    expect(wrapper.vm.setDefaults('')).toEqual(null);
  });
});
