/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import ColumnOrganizer from './ColumnOrganizer';

let wrapper;

function setup(options, propsData) {
  wrapper = shallowMount(ColumnOrganizer, {
    global: {
      mocks: {
        $t: (t) => t,
        ...options,
      },
    },
    props: {
      activeColumns: [],
      ...propsData,
    },
  });
}
describe('ColumnOrganizer', () => {
  describe('Component mount', () => {
    it('should render default modalId', () => {
      setup();
      expect(wrapper.find('#ColumnOrganizerModal').exists()).toBeTruthy();
    });

    it('should render prop modalId', () => {
      setup({}, { modalId: 'SortGovernanceColumns' });
      expect(wrapper.find('#SortGovernanceColumns').exists()).toBeTruthy();
    });
  });
});
