/**
 * Copyright (c) 2022-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { shallowMount, flushPromises } from '@vue/test-utils';
import * as d3 from 'd3';
import PieChart from './index';

const mockData = [
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
];
const emptyMockData = [
  {
    label: 'item1',
    value: 0,
    color: 'red',
  },
  {
    label: 'item2',
    value: 0,
    color: 'yellow',
  },
  {
    label: 'item3',
    value: 0,
    color: 'yellow',
  },
];

const mountComponent = (props, testData = mockData) => shallowMount(PieChart, {
  global: {
    mocks: { $t: () => {} },
  },
  props: {
    data: testData,
    ...props,
  },
});

describe('PieChart', () => {
  let wrapper;

  it('renders the chart div', () => {
    wrapper = mountComponent();
    const chart = findByTestId(wrapper, 'chart');
    expect(chart.exists()).toBe(true);
  });

  it('calls to create chart based on data', () => {
    wrapper = mountComponent();
    const createChartSpy = jest.spyOn(wrapper.vm, 'createChart');
    wrapper.vm.loadData();
    expect(createChartSpy).toHaveBeenCalledWith({
      0: 30,
      1: 20,
      2: 20,
    }, ['red', 'yellow', 'yellow']);
  });
  it('calls to create chart based on data', () => {
    wrapper = mountComponent({ noDataLabel: 'No data' }, emptyMockData);
    const createChartSpy = jest.spyOn(wrapper.vm, 'createChart');
    wrapper.vm.loadData();
    expect(wrapper.vm.legend).toEqual([
      {
        label: 'No data',
        value: 1,
        color: undefined,
      },
    ]);
    expect(createChartSpy).toHaveBeenCalledWith({
      0: 1,
    }, [undefined]);
  });

  describe('legend', () => {
    it('renders a legend', () => {
      wrapper = mountComponent();
      const legend = findByTestId(wrapper, 'legend');
      expect(legend.exists()).toBe(true);
    });

    it('contains list elements for each data object', async () => {
      wrapper = mountComponent();
      await flushPromises();
      const legend = findByTestId(wrapper, 'legend');
      const items = legend.findAll('li');
      expect(items.length).toBe(3);
    });

    it('has correct label text for legend items', () => {
      wrapper = mountComponent();
      const legend = findByTestId(wrapper, 'legend');
      const items = legend.findAll('li');
      items.forEach((item, index) => {
        expect(item.text()).toBe(mockData[index].label);
      });
    });

    it('has correct colors for legend items', () => {
      wrapper = mountComponent();
      const legend = findByTestId(wrapper, 'legend');
      const items = legend.findAll('span');
      items.forEach((item, index) => {
        const bullet = item.find('.rounded-pill');
        expect(bullet.attributes('style')).toBe(`height: 10px; width: 24px; background-color: ${mockData[index].color};`);
      });
    });

    it('displays value in legend when showLegenCount is true', () => {
      wrapper = mountComponent({ showLegendCount: true });
      const legend = findByTestId(wrapper, 'legend');
      const items = legend.findAll('li');
      items.forEach((item, index) => {
        expect(item.text()).toBe(`${mockData[index].label} (${mockData[index].value})`);
      });
    });

    it('applies custom class to legend based on legendClass prop', () => {
      wrapper = mountComponent({ legendClass: 'testClass' });
      const legend = findByTestId(wrapper, 'legend');
      expect(legend.attributes('class')).toBe('testClass');
    });
  });

  describe('tooltip', () => {
    let tooltip;

    beforeEach(() => {
      tooltip = {};
      tooltip.getBoundingClientRect = jest.fn().mockReturnValue({ width: 10, height: 10 });
      tooltip.node = jest.fn().mockReturnValue(tooltip);
      tooltip.style = jest.fn().mockReturnValue(tooltip);
    });

    it('selects the tooltip', () => {
      const selectAllSpy = jest.spyOn(d3, 'selectAll');
      wrapper = mountComponent({ id: 'test' });
      expect(selectAllSpy).toHaveBeenCalledWith('.test-tooltip');
    });

    it('shows tooltip for first data object', () => {
      wrapper = mountComponent();
      let html = '';
      tooltip.html = jest.fn().mockImplementation((cb) => {
        html = cb();
        return tooltip;
      });

      wrapper.vm.tooltip = tooltip;

      wrapper.vm.mouseMove({
        clientX: 100,
        clientY: 100,
        srcElement: {
          __data__: { index: 0 },
        },
      });

      expect(html).toEqual(expect.stringContaining('item1'));
      expect(html).toEqual(expect.stringContaining('30'));
    });

    it('shows tooltip for second object', () => {
      wrapper = mountComponent();
      let html = '';
      tooltip.html = jest.fn().mockImplementation((cb) => {
        html = cb();
        return tooltip;
      });

      wrapper.vm.tooltip = tooltip;

      wrapper.vm.mouseMove({
        clientX: 100,
        clientY: 100,
        srcElement: {
          __data__: { index: 1 },
        },
      });
      expect(html).toEqual(expect.stringContaining('item2'));
      expect(html).toEqual(expect.stringContaining('20'));
    });

    it('shows tooltip for third data object', () => {
      wrapper = mountComponent();
      let html = '';
      tooltip.html = jest.fn().mockImplementation((cb) => {
        html = cb();
        return tooltip;
      });

      wrapper.vm.tooltip = tooltip;

      wrapper.vm.mouseMove({
        clientX: 100,
        clientY: 100,
        srcElement: {
          __data__: { index: 2 },
        },
      });
      expect(html).toEqual(expect.stringContaining('item3'));
      expect(html).toEqual(expect.stringContaining('20'));
    });
  });
});
