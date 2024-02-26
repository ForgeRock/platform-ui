/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount, shallowMount } from '@vue/test-utils';
import ValidationRules from '@forgerock/platform-shared/src/utils/validationRules';
import ConfirmActionModal from './index';

let wrapper;
ValidationRules.extendRules({
  required: jest.fn().mockReturnValue(true),
});

function mountComponent(options) {
  wrapper = shallowMount(ConfirmActionModal, {
    global: {
      mocks: {
        $t: (t) => t,
        ...options,
      },
    },
    props: {
      modalOptions: {
        requireJustification: false,
      },
      isLoading: false,
    },
  });
}
describe('ConfirmActionModal', () => {
  describe('Component shallow mounted', () => {
    beforeEach(() => {
      mountComponent();
    });

    it('ConfirmActionModal successfully loaded', () => {
      expect(wrapper.vm.confirmMessage).toBe('');
    });

    it('reset method should reset the component data values', () => {
      wrapper.vm.confirmMessage = 'test message';

      wrapper.vm.reset();

      expect(wrapper.vm.confirmMessage).toEqual('');
    });
  });

  describe('component mounted', () => {
    it('reset method should reset the component data values and confirm message textarea', async () => {
      wrapper = mount(ConfirmActionModal, {
        global: {
          mocks: {
            $t: (t) => t,
          },
        },
        data() {
          return {
            isTesting: true,
            step: 'DETAILS',
          };
        },
      });

      const comment = 'test message';
      const commentTextarea = wrapper.find('textarea');
      commentTextarea.setValue(comment);

      await flushPromises();

      expect(wrapper.vm.confirmMessage).toBe(comment);
      expect(commentTextarea.element.value).toBe(comment);

      wrapper.vm.reset();

      expect(wrapper.vm.confirmMessage).toBe('');
    });
  });
});
