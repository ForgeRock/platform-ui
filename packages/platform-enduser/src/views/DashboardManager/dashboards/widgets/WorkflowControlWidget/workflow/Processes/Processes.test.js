/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import Processes from './index';

describe('Processes.vue', () => {
  let wrapper;
  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = shallowMount(Processes, {
      props: {
        processes: {
          panel_id: 'panel_id',
        },
      },
      global: {
        mocks: {
          $t: (key) => (key),
        },
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
