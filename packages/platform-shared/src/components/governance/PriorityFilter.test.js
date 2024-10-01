/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { cloneDeep } from 'lodash';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import PriorityFilter from './PriorityFilter';

const baseFilter = {
  high: true,
  medium: true,
  low: true,
  none: true,
};

let wrapper;
const setup = (props) => {
  wrapper = mount(PriorityFilter, {
    global: {
      mocks: {
        $t: (text) => text,
      },
    },
    props: {
      ...props,
    },
  });
};

describe('PriorityFilter', () => {
  beforeEach(() => {
    setup();
  });

  describe(('priorities'), () => {
    it('has four priority checkboxes', () => {
      const highPriority = findByTestId(wrapper, 'priority-high');
      expect(highPriority.exists()).toBeTruthy();

      const medPriority = findByTestId(wrapper, 'priority-medium');
      expect(medPriority.exists()).toBeTruthy();

      const lowPriority = findByTestId(wrapper, 'priority-low');
      expect(lowPriority.exists()).toBeTruthy();

      const noPriority = findByTestId(wrapper, 'priority-none');
      expect(noPriority.exists()).toBeTruthy();
    });

    it('changing priority emits update:value event', async () => {
      const highPriority = findByTestId(wrapper, 'priority-high');
      highPriority.setChecked(false);
      await flushPromises();

      const expectedFilter = cloneDeep(baseFilter);
      expectedFilter.high = false;

      expect(wrapper.emitted()['update:value'][0]).toEqual([expectedFilter]);

      const medPriority = findByTestId(wrapper, 'priority-medium');
      medPriority.setChecked(false);
      expectedFilter.medium = false;
      await flushPromises();

      expect(wrapper.emitted()['update:value'][1]).toEqual([expectedFilter]);

      const lowPriority = findByTestId(wrapper, 'priority-low');
      lowPriority.setChecked(false);
      expectedFilter.low = false;
      await flushPromises();

      expect(wrapper.emitted()['update:value'][2]).toEqual([expectedFilter]);

      const noPriority = findByTestId(wrapper, 'priority-none');
      noPriority.setChecked(false);
      expectedFilter.none = false;
      await flushPromises();

      expect(wrapper.emitted()['update:value'][3]).toEqual([expectedFilter]);
    });
  });
});
