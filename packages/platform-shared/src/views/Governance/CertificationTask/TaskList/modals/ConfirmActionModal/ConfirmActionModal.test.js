/**
 * Copyright (c) 2023-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount, shallowMount } from '@vue/test-utils';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import ConfirmActionModal from './index';

let wrapper;
mockValidation(['required']);

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

  describe('modal shows expected steps and text', () => {
    it('normal case does show next button', async () => {
      wrapper = mount(ConfirmActionModal, {
        global: {
          mocks: {
            $t: (t) => t,
          },
        },
        props: {
          modalOptions: {
            requireJustification: false,
            okLabel: 'okLabel',
          },
        },
        data() {
          return {
            isTesting: true,
            step: 'DETAILS',
          };
        },
      });

      const buttons = wrapper.findAll('.btn');
      expect(buttons.length).toBe(2);
      expect(buttons[1].text()).toBe('common.next');
    });

    it('no confirmation does not show next button', async () => {
      wrapper = mount(ConfirmActionModal, {
        global: {
          mocks: {
            $t: (t) => t,
          },
        },
        props: {
          modalOptions: {
            requireJustification: false,
            okLabel: 'okLabel',
            noConfirmation: true,
          },
        },
        data() {
          return {
            isTesting: true,
            step: 'DETAILS',
          };
        },
      });

      const buttons = wrapper.findAll('.btn');
      expect(buttons.length).toBe(2);
      expect(buttons[1].text()).toBe('governance.certificationTask.actionsModal.okLabel');
    });
  });
});
