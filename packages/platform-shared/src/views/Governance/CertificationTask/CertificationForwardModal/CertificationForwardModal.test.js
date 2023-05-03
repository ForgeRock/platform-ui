/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, shallowMount } from '@vue/test-utils';
import CertificationForwardModal from './index';

describe('CertificationForwardModal', () => {
  let wrapper;

  describe('component shallow mounted', () => {
    beforeEach(() => {
      wrapper = shallowMount(CertificationForwardModal, {
        mocks: {
          $t: (t) => t,
        },
      });
    });

    it('component should load correctly', () => {
      expect(wrapper.name()).toBe('CertificationForwardModal');
      expect(wrapper.vm.comment).toBe('');
      expect(wrapper.vm.forwardToUser).toBe('');
      expect(wrapper.vm.forwardToRole).toBe('');
    });

    it('reset method should reset the component data values', () => {
      wrapper.vm.comment = 'Test comment';
      wrapper.vm.forwardToUser = 'Test user';
      wrapper.vm.forwardToRole = 'Test role';

      wrapper.vm.reset();

      expect(wrapper.vm.comment).toBe('');
      expect(wrapper.vm.forwardToUser).toBe('');
      expect(wrapper.vm.forwardToRole).toBe('');
    });
  });

  describe('component mounted', () => {
    it('reset method should reset the component data values and textarea comment value', () => {
      wrapper = mount(CertificationForwardModal, {
        mocks: {
          $t: (t) => t,
        },
        data() {
          return {
            isTesting: true,
          };
        },
      });

      const comment = 'test comment';
      const commentTextarea = wrapper.find('textarea');
      commentTextarea.setValue(comment);

      expect(wrapper.vm.comment).toBe(comment);
      expect(commentTextarea.element.value).toBe(comment);

      wrapper.vm.reset();

      expect(wrapper.vm.comment).toBe('');
      expect(commentTextarea.element.value).toBe('');
    });
  });
});
