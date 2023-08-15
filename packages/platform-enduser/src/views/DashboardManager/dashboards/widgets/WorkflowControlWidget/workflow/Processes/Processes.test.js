/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import Processes from './index';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

describe('Processes.vue', () => {
  let wrapper;
  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = shallowMount(Processes, {
      localVue,
      propsData: {
        processes: {
          panel_id: 'panel_id',
        },
      },
      mocks: {
        $t: (key) => (key),
      },
    });
  });

  it('Sets panelShown id data property to true and emits loadProcess', () => {
    wrapper.vm.show('panel_id');
    expect(wrapper.vm.panelShown).toEqual({
      panel_id: true,
    });
    expect(wrapper.emitted().loadProcess).toEqual([['panel_id']]);
  });
});
