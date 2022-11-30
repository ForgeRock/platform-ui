/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import PieChart from './index';

describe('PieChart', () => {
  const wrapper = shallowMount(PieChart, {
    mocks: { $t: () => {} },
    propsData: {
      data: [
        {
          label: 'item1',
          value: 30,
          color: 'red',
        },
        {
          label: 'item2',
          value: 20,
          color: 'yellow',
        },
        {
          label: 'item3',
          value: 20,
          color: 'yellow',
        },
      ],
    },
  });

  it('PieChart successfully loaded', () => {
    expect(wrapper.name()).toEqual('PieChart');
  });

  it('chart exists and contains expected attributes', () => {
    const chart = wrapper.find('#chart');
    expect(chart.exists()).toBe(true);
    expect(chart.attributes('config')).toBeTruthy();
    expect(chart.attributes('datum')).toBeTruthy();
  });

  it('all items are rendered properly', () => {
    const list = wrapper.find('#list');
    expect(list.exists()).toBe(true);
    const items = wrapper.findAll('li');
    expect(items.length).toBe(3);
    items.wrappers.forEach((item, index) => {
      const itemSpan = item.find('span');
      expect(itemSpan.exists()).toBe(true);
      const bullet = itemSpan.find('.bullet');
      expect(bullet.exists()).toBe(true);
      expect(bullet.attributes('style')).toBe(`background-color: ${wrapper.vm.$props.data[index].color};`);
      expect(itemSpan.text()).toBe(wrapper.vm.$props.data[index].label);
    });
  });
});
