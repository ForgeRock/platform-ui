/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import DateRangePicker from './index';
import { runA11yTest } from '../../utils/testHelpers';

describe('Date Range Picker Component', () => {
  let wrapper;
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2077-01-01'));
    wrapper = mount(DateRangePicker, {
      global: {
        mocks: {
          $t: (text) => text,
        },
      },
      props: {
        dateRange: {
          endDate: '2023-01-27T23:59:59-05:00',
          startDate: '2022-12-28T00:00:00-05:00',
        },
        value: {
          endDate: '2023-01-27T23:59:59-05:00',
          startDate: '2022-12-28T00:00:00-05:00',
        },
      },
    });
  });
  afterEach(() => {
    jest.useRealTimers();
  });
  it('get/set in inputVal computed property works propertly', async () => {
    expect(wrapper.vm.inputVal.startDate).toEqual('2022-12-28T00:00:00-05:00');
    expect(wrapper.vm.inputVal.endDate).toEqual('2023-01-27T23:59:59-05:00');
    await wrapper.setProps({
      value: {
        endDate: '2023-01-27T23:59:59-05:00',
        startDate: '2021-12-28T00:00:00-05:00',
      },
    });
    expect(wrapper.vm.inputVal.startDate).toBe('2021-12-28T00:00:00-05:00');
  });

  it('Component does not have any a11y violations', async () => {
    await flushPromises();
    jest.useRealTimers();
    await runA11yTest(wrapper);
  });
});
