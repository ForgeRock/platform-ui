/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { cloneDeep } from 'lodash';
import flushPromises from 'flush-promises';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import RequestFilter from './index';

const baseFilter = {
  priorities: {
    high: true,
    medium: true,
    low: true,
  },
  requestType: null,
  requestedFor: null,
  requester: null,
  requestId: null,
};

describe('RequestFilter', () => {
  CommonsApi.getResource = jest.fn().mockReturnValue(Promise.resolve({
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
  let wrapper;
  beforeEach(() => {
    wrapper = mount(RequestFilter, {
      mocks: {
        $t: (text) => text,
      },
    });
  });

  describe(('priorities'), () => {
    it('has three priority checkboxes', () => {
      const highPriority = findByTestId(wrapper, 'priority-high');
      expect(highPriority.exists()).toBeTruthy();

      const medPriority = findByTestId(wrapper, 'priority-medium');
      expect(medPriority.exists()).toBeTruthy();

      const lowPriority = findByTestId(wrapper, 'priority-low');
      expect(lowPriority.exists()).toBeTruthy();
    });

    it('changing priority emits filter-change event with filter and count', async () => {
      const highPriority = findByTestId(wrapper, 'priority-high');
      highPriority.setChecked(false);
      await flushPromises();

      const expectedFilter = cloneDeep(baseFilter);
      expectedFilter.priorities.high = false;

      expect(wrapper.emitted()['filter-change'][0]).toEqual([{
        filter: expectedFilter,
        count: 1,
      }]);

      const medPriority = findByTestId(wrapper, 'priority-medium');
      medPriority.setChecked(false);
      expectedFilter.priorities.medium = false;
      await flushPromises();

      expect(wrapper.emitted()['filter-change'][1]).toEqual([{
        filter: expectedFilter,
        count: 2,
      }]);

      const lowPriority = findByTestId(wrapper, 'priority-low');
      lowPriority.setChecked(false);
      expectedFilter.priorities.low = false;
      await flushPromises();

      expect(wrapper.emitted()['filter-change'][2]).toEqual([{
        filter: expectedFilter,
        count: 3,
      }]);
    });
  });

  it('changing requestType emits filter-change event with filter and count', async () => {
    const expectedFilter = cloneDeep(baseFilter);
    expectedFilter.requestType = wrapper.vm.requestTypeOptions[1].value;

    findByTestId(wrapper, 'request-type')
      .findAll('li')
      .at(1)
      .find('span')
      .trigger('click');
    await flushPromises();

    expect(wrapper.emitted()['filter-change'].pop()).toEqual([{
      filter: expectedFilter,
      count: 1,
    }]);
  });

  it('changing requestedFor emits filter-change event with filter and count', async () => {
    const expectedFilter = cloneDeep(baseFilter);
    expectedFilter.requestedFor = 'managed/user/testId';

    findByTestId(wrapper, 'requested-for')
      .findAll('li')
      .at(1)
      .find('span')
      .trigger('click');
    await flushPromises();

    expect(wrapper.emitted()['filter-change'].pop()).toEqual([{
      filter: expectedFilter,
      count: 1,
    }]);
  });

  it('changing requester emits filter-change event with filter and count', async () => {
    const expectedFilter = cloneDeep(baseFilter);
    expectedFilter.requester = 'managed/user/testId';

    findByTestId(wrapper, 'requester')
      .findAll('li')
      .at(1)
      .find('span')
      .trigger('click');
    await flushPromises();

    expect(wrapper.emitted()['filter-change'].pop()).toEqual([{
      filter: expectedFilter,
      count: 1,
    }]);
  });

  it('changing request id emits filter-change event with filter and count', async () => {
    const expectedFilter = cloneDeep(baseFilter);
    expectedFilter.requestId = 'testId';

    findByTestId(wrapper, 'input-request-id').setValue('testId');
    await flushPromises();

    expect(wrapper.emitted()['filter-change'].pop()).toEqual([{
      filter: expectedFilter,
      count: 1,
    }]);
  });
});
