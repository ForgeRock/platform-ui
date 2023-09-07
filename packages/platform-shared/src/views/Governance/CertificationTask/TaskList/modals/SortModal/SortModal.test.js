/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import SortModal from './SortModal';

let wrapper;

function setup(options, propsData) {
  wrapper = shallowMount(SortModal, {
    global: {
      mocks: {
        $t: (t) => t,
        ...options,
      },
    },
    props: {
      taskListColumns: [],
      ...propsData,
    },
  });
}
describe('SortModal', () => {
  describe('Component mount', () => {
    it('should render default modalId', () => {
      setup();
      expect(wrapper.find('#CertificationTaskSortConfirmAccountModal').exists()).toBeTruthy();
    });

    it('should render prop modalId', () => {
      setup({}, { modalId: 'CertificationTaskSortConfirmEntitlementModal' });
      expect(wrapper.find('#CertificationTaskSortConfirmEntitlementModal').exists()).toBeTruthy();
    });
  });
});
