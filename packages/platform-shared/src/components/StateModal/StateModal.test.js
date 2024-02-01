/**
 * Copyright (c) 2022-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import StateModal from './index';

describe('StateModal', () => {
  it('StateModal successfully loaded', () => {
    const wrapper = shallowMount(StateModal, {
      global: {
        mocks: {
          $t: (t) => t,
        },
      },
      props: {
        translatedItemType: 'Something',
      },
    });

    expect(wrapper.vm.futureState).toEqual('common.activate');
  });
});
