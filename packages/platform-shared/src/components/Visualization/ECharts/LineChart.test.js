/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import LineChart from './LineChart';

describe('LineChart', () => {
  const chartData = [
    {
      active: true,
      labels: ['Jan', 'Feb', 'Mar'],
      mainSeries: [100, 200, 150],
      seriesName: 'Current',
    },
    {
      active: false,
      compareSeries: [80, 180, 130],
      seriesName: 'Previous',
      showPrevious: true,
    },
  ];

  let wrapper;

  const globalConfig = {
    stubs: { VChart: true },
  };

  beforeEach(() => {
    wrapper = mount(LineChart, { props: { chartData }, global: globalConfig });
  });

  afterEach(() => {
    if (wrapper) wrapper.unmount();
  });

  it('renders the VChart component', () => {
    expect(wrapper.find('v-chart-stub').exists()).toBe(true);
  });

  it('returns an empty chart configuration if no data is provided', () => {
    wrapper = mount(LineChart, { props: { chartData: [] }, global: globalConfig });
    const option = wrapper.vm.chartOption;
    expect(option.series).toEqual([]);
    expect(option.xAxis.data).toEqual([]);
  });

  it('correctly processes chartData into options', () => {
    const option = wrapper.vm.chartOption;
    expect(option.series.length).toBe(2);
    expect(option.series[0].name).toBe('Current');
    expect(option.series[0].data).toEqual([100, 200, 150]);
    expect(option.series[1].name).toBe('Previous');
    expect(option.series[1].data).toEqual([80, 180, 130]);
  });

  it('does not include "Previous" series if showPrevious is false', () => {
    wrapper = mount(LineChart, {
      props: { chartData: [chartData[0], { ...chartData[1], showPrevious: false }] },
      global: globalConfig,
    });
    const option = wrapper.vm.chartOption;
    expect(option.series.length).toBe(1);
  });

  it('tooltip formatter returns correct html with positive change', () => {
    const option = wrapper.vm.chartOption;
    const params = [
      { axisValue: 'Feb', seriesName: 'Current', data: 200 },
      { axisValue: 'Feb', seriesName: 'Previous', data: 180 },
    ];
    const formattedTooltip = option.tooltip.formatter(params);
    expect(formattedTooltip).toContain('+11%');
    expect(formattedTooltip).toContain('color:#2ED47A');
    expect(formattedTooltip).toContain('Current');
    expect(formattedTooltip).toContain('200');
    expect(formattedTooltip).toContain('Previous');
    expect(formattedTooltip).toContain('180');
  });

  it('tooltip formatter returns correct html with negative change', () => {
    const option = wrapper.vm.chartOption;
    const params = [
      { axisValue: 'Jan', seriesName: 'Current', data: 80 },
      { axisValue: 'Jan', seriesName: 'Previous', data: 100 },
    ];
    const formattedTooltip = option.tooltip.formatter(params);
    expect(formattedTooltip).toContain('-20%');
    expect(formattedTooltip).toContain('color:#F7685B');
  });
});
