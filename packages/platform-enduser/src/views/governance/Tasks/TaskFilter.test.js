/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { cloneDeep } from 'lodash';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import TaskFilter from './TaskFilter';

const baseFilter = {
  priorities: {
    high: true,
    medium: true,
    low: true,
    none: true,
  },
  assignee: null,
  taskName: null,
};

let wrapper;
const setup = () => {
  wrapper = mount(TaskFilter, {
    global: {
      mocks: {
        $t: (text) => text,
      },
    },
  });
};

describe('TaskFilter', () => {
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
  beforeEach(() => {
    setup();
  });

  it('changing priority emits events with filter and count', async () => {
    const highPriority = findByTestId(wrapper, 'priority-high');
    highPriority.setChecked(false);
    await flushPromises();

    const expectedFilter = cloneDeep(baseFilter);
    expectedFilter.priorities.high = false;

    expect(wrapper.emitted()['filter-change'][0]).toEqual([expectedFilter]);
    expect(wrapper.emitted()['filter-count'][0]).toEqual([1]);

    const medPriority = findByTestId(wrapper, 'priority-medium');
    medPriority.setChecked(false);
    expectedFilter.priorities.medium = false;
    await flushPromises();

    expect(wrapper.emitted()['filter-change'][1]).toEqual([expectedFilter]);
    expect(wrapper.emitted()['filter-count'][1]).toEqual([2]);

    const lowPriority = findByTestId(wrapper, 'priority-low');
    lowPriority.setChecked(false);
    expectedFilter.priorities.low = false;
    await flushPromises();

    expect(wrapper.emitted()['filter-change'][2]).toEqual([expectedFilter]);
    expect(wrapper.emitted()['filter-count'][2]).toEqual([3]);
  });

  it('changing assignee emits events with filter and count', async () => {
    const expectedFilter = cloneDeep(baseFilter);
    expectedFilter.assignee = 'managed/user/testId';
    const assignee = wrapper.find('[label="governance.tasks.assignee"]');
    assignee
      .findAll('li')[1]
      .find('span')
      .trigger('click');
    await flushPromises();

    expect(wrapper.emitted()['filter-change'].pop()).toEqual([expectedFilter]);
    expect(wrapper.emitted()['filter-count'].pop()).toEqual([1]);
  });

  it('changing task name emits events with filter and count', async () => {
    const expectedFilter = cloneDeep(baseFilter);
    expectedFilter.taskName = 'testTaskName';
    const taskName = wrapper.findComponent('[label="governance.tasks.taskName"]');
    taskName.vm.$emit('input', 'testTaskName');
    await flushPromises();

    expect(wrapper.emitted()['filter-change'].pop()).toEqual([expectedFilter]);
    expect(wrapper.emitted()['filter-count'].pop()).toEqual([1]);
  });
});
