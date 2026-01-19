/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import LineChart from './index';
import { runA11yTest } from '../../../../utils/testHelpers';

describe('LineChart', () => {
  let wrapper;

  const defaultProps = {
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
      datasets: [
        {
          label: 'Dataset 1',
          data: [10, 20, 30, 40, 50],
          borderColor: '#4285F4',
          backgroundColor: 'rgba(66, 133, 244, 0.1)',
        },
      ],
    },
    options: {},
  };

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  it('should render line chart component', () => {
    wrapper = mount(LineChart, {
      props: defaultProps,
    });

    expect(wrapper.exists()).toBe(true);
  });

  describe('@a11y', () => {
    it('should have no accessibility violations', async () => {
      wrapper = mount(LineChart, {
        props: defaultProps,
      });
      await runA11yTest(wrapper);
    });
  });
});
