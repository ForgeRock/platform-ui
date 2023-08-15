/**
 * Copyright (c) 2019-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import NoData from './index';

describe('No Data Component', () => {
  it('No data successfully loaded', () => {
    const wrapper = shallowMount(NoData);

    expect(wrapper.vm.icon).toEqual('bug_report');
  });
});
