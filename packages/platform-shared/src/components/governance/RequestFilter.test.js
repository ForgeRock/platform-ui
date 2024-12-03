/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { cloneDeep } from 'lodash';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import RequestFilter from './RequestFilter';

const baseFilter = {
  priorities: {
    high: true,
    medium: true,
    low: true,
    none: true,
  },
  requestType: null,
  query: null,
};

let wrapper;
const setup = () => {
  wrapper = mount(RequestFilter, {
    global: {
      mocks: {
        $t: (text) => text,
      },
    },
  });
};

jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi');

describe('RequestFilter', () => {
  CommonsApi.getResource.mockReturnValue(Promise.resolve({
    data: {
      result: [
        {
          givenName: 'testGivenName',
          sn: 'testSn',
          id: 'testId',
        },
      ],
    },
  }));
  beforeEach(() => {
    setup();
  });

  it('changing priority emits event with filter and count', async () => {
    const highPriority = findByTestId(wrapper, 'priority-high');
    highPriority.setChecked(false);
    await flushPromises();

    const expectedFilter = cloneDeep(baseFilter);
    expectedFilter.priorities.high = false;

    expect(wrapper.emitted()['filter-change'][0]).toEqual([{ count: 1, filter: expectedFilter }]);

    const medPriority = findByTestId(wrapper, 'priority-medium');
    medPriority.setChecked(false);
    expectedFilter.priorities.medium = false;
    await flushPromises();

    expect(wrapper.emitted()['filter-change'][1]).toEqual([{ count: 2, filter: expectedFilter }]);

    const lowPriority = findByTestId(wrapper, 'priority-low');
    lowPriority.setChecked(false);
    expectedFilter.priorities.low = false;
    await flushPromises();

    expect(wrapper.emitted()['filter-change'][2]).toEqual([{ count: 3, filter: expectedFilter }]);
  });

  it('changing requestType emits event with filter and count', async () => {
    jest.useFakeTimers();
    const expectedFilter = cloneDeep(baseFilter);
    expectedFilter.requestType = wrapper.vm.requestTypeOptions[1].value;

    findByTestId(wrapper, 'request-type')
      .findAll('li')[1]
      .find('span')
      .trigger('click');
    await flushPromises();
    // debounce timer
    jest.runAllTimers();

    expect(wrapper.emitted()['filter-change'].pop()).toEqual([{ count: 1, filter: expectedFilter }]);
  });

  it('changing request query emits event with filter and count', async () => {
    jest.useFakeTimers();
    const expectedFilter = cloneDeep(baseFilter);
    expectedFilter.query = 'testId';
    findByTestId(wrapper, 'input-request-query').setValue('testId');
    await flushPromises();
    // debounce timer
    jest.runAllTimers();

    expect(wrapper.emitted()['filter-change'].pop()).toEqual([{ count: 1, filter: expectedFilter }]);
  });
});
