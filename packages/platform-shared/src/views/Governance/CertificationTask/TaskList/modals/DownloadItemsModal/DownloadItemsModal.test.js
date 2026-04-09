/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { mockModal } from '@forgerock/platform-shared/src/testing/utils/mockModal';
import DownloadItemsModal from './DownloadItemsModal';

const { modalHide, modalShow } = mockModal();
const okFunctionMock = jest.fn();
let wrapper;

describe('DownloadItemsModal', () => {
  describe('modal shows expected steps and text', () => {
    it('first step shows expected elements', async () => {
      wrapper = mount(DownloadItemsModal, {
        global: {
          mocks: {
            $t: (t) => t,
            $bvModal: { show: modalShow, hide: modalHide },
          },
        },
        props: {
          grantType: 'accounts',
          totals: {
            all: 10,
            currentPage: 5,
          },
          isTesting: true,
          isLoading: false,
          okFunction: okFunctionMock,
        },
      });

      const buttons = wrapper.findAll('.btn');
      expect(buttons.length).toBe(2);
      expect(buttons[0].text()).toBe('Cancel');
      expect(buttons[1].text()).toBe('Next');

      const cardInputs = wrapper.findAll('.fr-card-clickable');
      expect(cardInputs.length).toBe(2);
      expect(cardInputs[0].text()).toContain('5 items');
      expect(cardInputs[1].text()).toContain('10 items');

      buttons[1].trigger('click');
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.step).toBe('EXPORT_TYPE');
    });

    it('confirm step shows expected elements', async () => {
      wrapper = mount(DownloadItemsModal, {
        global: {
          mocks: {
            $t: (t) => t,
            $bvModal: { show: modalShow, hide: modalHide },
          },
        },
        props: {
          grantType: 'accounts',
          totals: {
            all: 10,
            currentPage: 5,
          },
          isTesting: true,
          isLoading: false,
          okFunction: okFunctionMock,
        },
      });
      wrapper.vm.step = 'EXPORT_TYPE';
      await wrapper.vm.$nextTick();
      const buttons = wrapper.findAll('.btn');
      expect(buttons.length).toBe(3);
      expect(buttons[0].text()).toBe('Back');
      expect(buttons[1].text()).toBe('Cancel');
      expect(buttons[2].text()).toBe('Export');

      await buttons[2].trigger('click');
      await wrapper.vm.$nextTick();
      expect(okFunctionMock).toHaveBeenCalled();
    });
  });
});
