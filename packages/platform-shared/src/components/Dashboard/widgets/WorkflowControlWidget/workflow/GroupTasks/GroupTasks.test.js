/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import GroupTasks from './index';

describe('GroupTasks.vue', () => {
  let wrapper;
  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = shallowMount(GroupTasks, {
      props: {
        tasks: {
          name: {},
        },
      },
      global: {
        mocks: {
          $t: (key) => (key),
        },
      },
    });
  });

  it('Sets panelShown id data property to true', () => {
    wrapper.vm.setShown('panel_id');
    expect(wrapper.vm.panelShown).toEqual({
      panel_id: true,
    });
  });

  it('Sets panelShown id data property to false', () => {
    wrapper.vm.setHidden('panel_id');
    expect(wrapper.vm.panelShown).toEqual({
      panel_id: false,
    });
  });
});
