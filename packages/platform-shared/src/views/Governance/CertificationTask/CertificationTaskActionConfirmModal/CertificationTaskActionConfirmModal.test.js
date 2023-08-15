/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, shallowMount } from '@vue/test-utils';
import CertificationTaskActionConfirmModal from './index';

let wrapper;

function mountComponent(options) {
  wrapper = shallowMount(CertificationTaskActionConfirmModal, {
    mocks: {
      $t: (t) => t,
      ...options,
    },
    propsData: {
      modalOptions: {},
      isLoading: false,
    },
  });
}
describe('CertificationTaskActionConfirmModal', () => {
  describe('Component shallow mounted', () => {
    beforeEach(() => {
      mountComponent();
    });

    it('CertificationTaskActionConfirmModal successfully loaded', () => {
      expect(wrapper.vm.confirmMessage).toBe('');
    });

    it('reset method should reset the component data values', () => {
      wrapper.vm.confirmMessage = 'test message';

      wrapper.vm.reset();

      expect(wrapper.vm.confirmMessage).toEqual('');
    });
  });

  describe('component mounted', () => {
    it('reset method should reset the component data values and confirm message textarea', () => {
      wrapper = mount(CertificationTaskActionConfirmModal, {
        mocks: {
          $t: (t) => t,
        },
        data() {
          return {
            isTesting: true,
          };
        },
      });

      const comment = 'test message';
      const commentTextarea = wrapper.find('textarea');
      commentTextarea.setValue(comment);

      expect(wrapper.vm.confirmMessage).toBe(comment);
      expect(commentTextarea.element.value).toBe(comment);

      wrapper.vm.reset();

      expect(wrapper.vm.confirmMessage).toBe('');
    });
  });
});
