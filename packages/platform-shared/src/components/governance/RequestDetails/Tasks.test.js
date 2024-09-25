/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import Tasks from './Tasks';

jest.mock('@forgerock/platform-shared/src/composables/bvModal');

let wrapper;

const ITEM = {
  rawData: {
    decision: {
      actors: {
        active: [{ name: 'John Doe', phase: 'Phase-1' }, { name: 'Jane Smith', phase: 'Phase-1' }],
        inactive: [{ name: 'Alice', phase: 'Phase-1' }, { name: 'Bob', phase: 'Phase-2' }],
      },
      pases: [
        {
          name: 'Phase-1',
          displayName: 'Phase Number 1',
        },
        {
          name: 'Phase-2',
          displayName: 'Phase Number 2',
        },
      ],
    },
  },
};

function setup() {
  useBvModal.mockReturnValue({ bvModal: { value: { show: jest.fn(), hide: jest.fn() } } });
  wrapper = mount(Tasks, {
    global: {
      mocks: {
        $t: (t) => t,
      },
    },
    props: {
      item: ITEM,
    },
  });
}

describe('Tasks', () => {
  beforeEach(() => setup());

  it('Should renders table columns correctly', () => {
    const columns = wrapper.findAll('th');
    expect(columns.length).toBe(3);
    expect(columns[0].text()).toBe('Task');
    expect(columns[1].text()).toBe('Approver(s)');
    expect(columns[2].text()).toBe('Status');
  });

  it('should call the appropriate method when opening task details modal', async () => {
    await flushPromises();

    const showSpy = jest.spyOn(wrapper.vm.bvModal.value, 'show');
    expect(showSpy).not.toHaveBeenCalled();

    wrapper.vm.showTaskDetailsModal(ITEM);
    await flushPromises();
    expect(showSpy).toHaveBeenCalledWith('TaskDetailsModal');
  });
});
