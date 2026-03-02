/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import BarChart from './BarChart';

jest.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key) => key,
  }),
}));

describe('BarChart', () => {
  const propsData = {
    labels: ['Jan', 'Feb', 'Mar'],
    values: [100, 200, 150],
    rate: [10, 20, 15],
    totalAttempts: [1000, 2000, 1500],
    color: '#ff0000',
    showPrevious: true,
    previousValues: [80, 180, 130],
  };

  let wrapper;

  const globalConfig = {
    stubs: { VChart: true },
  };

  beforeEach(() => {
    wrapper = mount(BarChart, { props: propsData, global: globalConfig });
  });

  afterEach(() => {
    if (wrapper) wrapper.unmount();
  });

  it('renders the VChart component', () => {
    expect(wrapper.find('v-chart-stub').exists()).toBe(true);
  });

  it('passes the correct options to the VChart component', () => {
    const chart = wrapper.find('v-chart-stub');
    expect(chart.attributes('option')).toBeDefined();
  });

  it('includes current data series in the options', () => {
    const { option } = wrapper.vm;
    const currentSeries = option.series.find((s) => s.name === 'dashboard.analytics.charts.current');
    expect(currentSeries).toBeDefined();
    expect(currentSeries.data).toEqual(propsData.values);
  });

  it('includes rolling average series in the options', () => {
    const { option } = wrapper.vm;
    const rollingSeries = option.series.find((s) => s.name === 'dashboard.analytics.charts.rollingAverage');
    expect(rollingSeries).toBeDefined();
    expect(rollingSeries.data).toEqual([100, 150, 150]); // Manual calculation of rolling average
  });

  it('includes previous period series when showPrevious is true', () => {
    const { option } = wrapper.vm;
    const previousSeries = option.series.find((s) => s.name === 'dashboard.analytics.charts.previousPeriod');
    expect(previousSeries).toBeDefined();
    expect(previousSeries.data).toEqual(propsData.previousValues);
  });

  it('does not include previous period series when showPrevious is false', () => {
    wrapper = mount(BarChart, { props: { ...propsData, showPrevious: false }, global: globalConfig });
    const { option } = wrapper.vm;
    const previousSeries = option.series.find((s) => s.name === 'dashboard.analytics.charts.previousPeriod');
    expect(previousSeries).toBeUndefined();
  });

  it('tooltip formatter returns correct html', () => {
    const { option } = wrapper.vm;
    const params = [
      {
        dataIndex: 0, seriesName: 'dashboard.analytics.charts.current', value: 100, marker: '<div></div>',
      },
      {
        dataIndex: 0, seriesName: 'dashboard.analytics.charts.rollingAverage', value: 100, marker: '<div></div>',
      },
      {
        dataIndex: 0, seriesName: 'dashboard.analytics.charts.previousPeriod', value: 80, marker: '<div></div>',
      },
    ];
    const formattedTooltip = option.tooltip.formatter(params);
    expect(formattedTooltip).toContain('<strong>Jan</strong>');
    expect(formattedTooltip).toContain('dashboard.analytics.charts.current');
    expect(formattedTooltip).toContain('100 (10.00%)');
    expect(formattedTooltip).toContain('dashboard.analytics.charts.rollingAverage');
    expect(formattedTooltip).toContain('100');
    expect(formattedTooltip).toContain('dashboard.analytics.charts.previousPeriod');
    expect(formattedTooltip).toContain('80');
    expect(formattedTooltip).toContain('Total Attempts 1000');
  });
});
