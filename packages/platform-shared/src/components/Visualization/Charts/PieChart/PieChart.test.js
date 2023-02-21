/**
 * Copyright (c) 2022-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import PieChart from './index';

describe('PieChart', () => {
  window.event = {
    pageY: 10,
    pageX: 10,
  };

  const wrapper = shallowMount(PieChart, {
    mocks: {
      $t: () => {},
      $refs: {
        d3chart: {
          chart: {
            gcenter: {},
            tooltip: {},
          },
        },
      },
    },
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
    stubs: ['D3PieChart'],
  });

  it('PieChart successfully loaded', () => {
    expect(wrapper.name()).toEqual('PieChart');
  });

  it('chart exists and contains expected attributes', () => {
    const chart = wrapper.find('[data-test-id="chart"]');
    expect(chart.exists()).toBe(true);
    expect(chart.attributes('config')).toBeTruthy();
    expect(chart.attributes('datum')).toBeTruthy();
  });

  it('all items are rendered properly', () => {
    const list = wrapper.find('[data-test-id="list"]');
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

  it('adds tooltips', async () => {
    const callbacks = {
      mouseover: null,
      mouseout: null,
      mousemove: null,
    };
    let html = '';
    const gcenter = {};
    const tooltip = {};

    gcenter.selectAll = jest.fn().mockReturnValue(gcenter);
    gcenter.on = jest.fn().mockImplementation((type, callback) => {
      callbacks[type] = () => { callback({ data: { label: 'testlabel', value: 713 } }); };
      return gcenter;
    });

    tooltip.classed = jest.fn().mockReturnValue(tooltip);
    tooltip.getBoundingClientRect = jest.fn().mockReturnValue({ width: 10, height: 10 });
    tooltip.html = jest.fn().mockImplementation((cb) => {
      html = cb();
      return tooltip;
    });
    tooltip.node = jest.fn().mockReturnValue(tooltip);
    tooltip.style = jest.fn().mockReturnValue(tooltip);

    wrapper.vm.$refs.d3chart = {
      chart: {
        gcenter,
        tooltip,
      },
    };

    wrapper.vm.addTooltips();
    await wrapper.vm.$nextTick();
    expect(gcenter.selectAll).toHaveBeenCalledWith('.chart__slice-group');
    expect(gcenter.on).toHaveBeenCalledTimes(3);

    callbacks.mouseover();
    expect(tooltip.html).toHaveBeenCalled();
    expect(tooltip.classed).toBeCalledWith('active', true);
    expect(html).toEqual(expect.stringContaining('testlabel'));
    expect(html).toEqual(expect.stringContaining('713'));

    callbacks.mousemove();
    expect(tooltip.node).toHaveBeenCalled();
    expect(tooltip.getBoundingClientRect).toHaveBeenCalled();
    expect(tooltip.style).toHaveBeenCalledTimes(3);

    callbacks.mouseout();
    expect(tooltip.classed).toBeCalledWith('active', true);
  });

  it('forceRerender method should increment keyComponent value', () => {
    expect(wrapper.vm.componentKey).toBe(0);

    wrapper.vm.forceRerender();

    expect(wrapper.vm.componentKey).toBe(1);
  });
});
