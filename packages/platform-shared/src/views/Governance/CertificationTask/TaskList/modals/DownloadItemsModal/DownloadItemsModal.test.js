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

  describe('skipScopeStep', () => {
    it('opens directly on the format step with no Back button and no scope cards', async () => {
      wrapper = mount(DownloadItemsModal, {
        global: {
          mocks: {
            $t: (t) => t,
            $bvModal: { show: modalShow, hide: modalHide },
          },
        },
        props: {
          grantType: 'campaigns',
          totals: {
            all: 0,
            currentPage: 0,
          },
          isTesting: true,
          isLoading: false,
          okFunction: okFunctionMock,
          skipScopeStep: true,
        },
      });

      // Straight to the format options — three format cards, no Back button
      const cardInputs = wrapper.findAll('.fr-card-clickable');
      expect(cardInputs.length).toBe(3);
      const buttons = wrapper.findAll('.btn');
      expect(buttons.map((b) => b.text())).toEqual(['Cancel', 'Export']);

      // Exporting passes the default options straight through
      await buttons[1].trigger('click');
      await wrapper.vm.$nextTick();
      expect(okFunctionMock).toHaveBeenCalledWith({ format: 'csv', rows: 'currentPage', itemType: null });

      // Closing resets back to the format step, not the scope step
      wrapper.vm.resetModal();
      expect(wrapper.vm.step).toBe('EXPORT_TYPE');
    });
  });

  describe('itemTypeOptions', () => {
    const mountWithTypeStep = async () => mount(DownloadItemsModal, {
      global: {
        mocks: {
          $t: (t) => t,
          $bvModal: { show: modalShow, hide: modalHide },
        },
      },
      props: {
        grantType: 'campaigns',
        totals: { all: 12, currentPage: 0 },
        isTesting: true,
        isLoading: false,
        okFunction: okFunctionMock,
        skipScopeStep: true,
        itemTypeOptions: [
          { value: 'accountGrants', count: 4 },
          { value: 'entitlementGrants', count: 7 },
          { value: 'roleMemberships', count: 1 },
        ],
      },
    });

    it('opens on the item-type step with an all-types card followed by a card per type', async () => {
      wrapper = await mountWithTypeStep();
      expect(wrapper.vm.step).toBe('EXPORT_ITEM_TYPE');
      // the leading all-types card plus one per non-empty type
      const cardInputs = wrapper.findAll('.fr-card-clickable');
      expect(cardInputs.length).toBe(4);
      // the modal reads the real i18n instance (@/i18n), not the $t mock —
      // the all card renders the English label and the summed count
      expect(cardInputs[0].text()).toContain('All item types');
      expect(cardInputs[0].text()).toContain('12');
      expect(cardInputs[1].text()).toContain('Accounts');
      expect(cardInputs[1].text()).toContain('4');
      expect(cardInputs[2].text()).toContain('Entitlements');
      expect(cardInputs[2].text()).toContain('7');
      // Next leads to the format step carrying the selected type
      const buttons = wrapper.findAll('.btn');
      expect(buttons.map((b) => b.text())).toEqual(['Cancel', 'Next']);
      await buttons[1].trigger('click');
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.step).toBe('EXPORT_TYPE');
    });

    it('Back from the format step returns to the item-type step', async () => {
      wrapper = await mountWithTypeStep();
      wrapper.vm.step = 'EXPORT_TYPE';
      await wrapper.vm.$nextTick();
      const buttons = wrapper.findAll('.btn');
      expect(buttons.map((b) => b.text())).toEqual(['Back', 'Cancel', 'Export']);
      await buttons[0].trigger('click');
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.step).toBe('EXPORT_ITEM_TYPE');
    });

    it('Export passes the chosen item type through the download options', async () => {
      wrapper = await mountWithTypeStep();
      // pick the second type through the radio input's change event (the
      // card label click does not reach the hidden input in jsdom)
      const radioInputs = wrapper.findAll('input[type="radio"]');
      await radioInputs[2].setValue('entitlementGrants');
      await wrapper.vm.$nextTick();
      const buttons = wrapper.findAll('.btn');
      await buttons[1].trigger('click'); // Next
      await wrapper.vm.$nextTick();
      const exportButtons = wrapper.findAll('.btn');
      await exportButtons[2].trigger('click'); // Export
      await wrapper.vm.$nextTick();
      expect(okFunctionMock).toHaveBeenCalledWith({ format: 'csv', rows: 'currentPage', itemType: 'entitlementGrants' });
    });

    it('Export passes the all-types choice through the download options', async () => {
      wrapper = await mountWithTypeStep();
      // the all-types card is the first radio in the group
      const radioInputs = wrapper.findAll('input[type="radio"]');
      await radioInputs[0].setValue('all');
      await wrapper.vm.$nextTick();
      const buttons = wrapper.findAll('.btn');
      await buttons[1].trigger('click'); // Next
      await wrapper.vm.$nextTick();
      const exportButtons = wrapper.findAll('.btn');
      await exportButtons[2].trigger('click'); // Export
      await wrapper.vm.$nextTick();
      expect(okFunctionMock).toHaveBeenCalledWith({ format: 'csv', rows: 'currentPage', itemType: 'all' });
    });

    it('a first open after async probe results lands on the item-type step, not a stale one', async () => {
      // the caller mounts the modal, then awaits its totals probes before
      // calling $bvModal.show — the step must resolve from the options that
      // exist at show time, not from the empty list at mount time
      wrapper = mount(DownloadItemsModal, {
        global: {
          mocks: {
            $t: (t) => t,
            $bvModal: { show: modalShow, hide: modalHide },
          },
        },
        props: {
          grantType: 'campaigns',
          totals: { all: 12, currentPage: 0 },
          isTesting: true,
          isLoading: false,
          okFunction: okFunctionMock,
          skipScopeStep: true,
        },
      });
      expect(wrapper.vm.step).toBe('EXPORT_TYPE');

      await wrapper.setProps({
        itemTypeOptions: [
          { value: 'accountGrants', count: 4 },
          { value: 'entitlementGrants', count: 7 },
          { value: 'roleMemberships', count: 1 },
        ],
      });
      // the shown event fires after the caller's $bvModal.show
      wrapper.findComponent({ name: 'BModal' }).vm.$emit('shown');
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.step).toBe('EXPORT_ITEM_TYPE');
    });
  });
});
