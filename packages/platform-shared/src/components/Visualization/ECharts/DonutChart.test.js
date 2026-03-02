/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import DonutChart from './DonutChart';

describe('DonutChart', () => {
  const propsData = {
    height: 300,
    width: 300,
    data: [
      { value: 1048, name: 'Search Engine' },
      { value: 735, name: 'Direct' },
      { value: 580, name: 'Email' },
    ],
    colors: ['#5470c6', '#91cc75', '#fac858'],
    legend: true,
  };

  let wrapper;

  const globalConfig = {
    stubs: { VChart: true },
  };

  beforeEach(() => {
    wrapper = mount(DonutChart, { props: propsData, global: globalConfig });
  });

  afterEach(() => {
    if (wrapper) wrapper.unmount();
  });

  it('renders the VChart component with correct styles', () => {
    const chart = wrapper.find('v-chart-stub');
    expect(chart.exists()).toBe(true);
    expect(chart.attributes('style')).toBe('height: 300px; width: 300px;');
  });

  it('passes the correct options to the VChart component', () => {
    const chart = wrapper.find('v-chart-stub');
    expect(chart.attributes('option')).toBeDefined();
  });

  it('includes the correct series data in the options', () => {
    const { option } = wrapper.vm;
    expect(option.series[0].data).toEqual(propsData.data);
  });

  it('shows legend when legend prop is true', () => {
    const { option } = wrapper.vm;
    expect(option.legend.show).toBe(true);
  });

  it('hides legend when legend prop is false', () => {
    wrapper = mount(DonutChart, { props: { ...propsData, legend: false }, global: globalConfig });
    const { option } = wrapper.vm;
    expect(option.legend.show).toBe(false);
  });

  it('tooltip formatter returns correct html', () => {
    const { option } = wrapper.vm;
    const params = {
      color: '#5470c6',
      name: 'Search Engine',
      value: 1048,
      percent: 45,
    };
    const formattedTooltip = option.tooltip.formatter(params);
    expect(formattedTooltip).toContain('Search Engine: 1048 (45%)');
    expect(formattedTooltip).toContain('background:#5470c6');
  });

  it('legend formatter returns correct string', () => {
    const { option } = wrapper.vm;
    const formattedLegend = option.legend.formatter('Search Engine');
    expect(formattedLegend).toBe('{label|Search Engine} {value|(1K)}');
  });

  it('legend formatter truncates long names', () => {
    wrapper = mount(DonutChart, {
      props: {
        ...propsData,
        data: [{ value: 100, name: 'This is a very long name that should be truncated' }],
      },
      global: globalConfig,
    });
    const { option } = wrapper.vm;
    const formattedLegend = option.legend.formatter('This is a very long name that should be truncated');
    expect(formattedLegend).toBe('{label|This is a very lo…} {value|(100)}');
  });
});
