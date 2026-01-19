/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import BarChart from './index';
import { runA11yTest } from '../../../../utils/testHelpers';

describe('BarChart', () => {
  let wrapper;

  const mockData = {
    labels: ['January', 'February', 'March', 'April', 'May'],
    datasets: [
      {
        label: 'Sales',
        data: [65, 59, 80, 81, 56],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const mockOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  it('should render the component', () => {
    wrapper = mount(BarChart, {
      props: {
        data: mockData,
        options: mockOptions,
      },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('should render with empty data', () => {
    wrapper = mount(BarChart, {
      props: {
        data: { labels: [], datasets: [] },
      },
    });
    expect(wrapper.exists()).toBe(true);
  });

  describe('@a11y', () => {
    it('should have no accessibility violations when rendering with mock data', async () => {
      wrapper = mount(BarChart, {
        props: {
          data: mockData,
          options: mockOptions,
        },
      });
      await runA11yTest(wrapper);
    });

    it('should have no accessibility violations when rendering with empty data', async () => {
      wrapper = mount(BarChart, {
        props: {
          data: { labels: [], datasets: [] },
          options: mockOptions,
        },
      });
      await runA11yTest(wrapper);
    });
  });
});
