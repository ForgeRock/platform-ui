/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import InlinePieChart from './index';

describe('InlinePieChart', () => {
  const wrapper = shallowMount(InlinePieChart, {
    mocks: { $t: () => {} },
    propsData: {
      id: 'testId',
      progress: 85,
    },
    stubs: ['D3PieChart'],
  });

  it('InlinePieChart successfully loaded', () => {
    expect(wrapper.name()).toEqual('InlinePieChart');
  });

  it('chart exists and contains expected attributes', () => {
    const chart = wrapper.find('#chart_testId');
    expect(chart.exists()).toBe(true);
  });

  it('percentage is displayed', () => {
    const section = wrapper.find('.chart__percent');
    expect(section.exists()).toBe(true);
    const percent = wrapper.find('small');
    expect(percent.html()).toEqual(expect.stringContaining('85%'));
  });

  it('rounds progress up under 50 or down over 50', () => {
    const roundDown = wrapper.vm.roundProgress(99.12312);
    const roundUp = wrapper.vm.roundProgress(0.12312);

    expect(roundDown).toBe(99);
    expect(roundUp).toBe(1);
  });
});
