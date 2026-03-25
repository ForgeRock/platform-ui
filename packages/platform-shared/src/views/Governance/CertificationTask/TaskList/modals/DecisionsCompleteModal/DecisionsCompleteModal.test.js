/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { mockModal } from '@forgerock/platform-shared/src/testing/utils/mockModal';
import DecisionsCompleteModal from './DecisionsCompleteModal';

const { modalHide, modalShow } = mockModal();
let wrapper;

describe('DecisionsCompleteModal', () => {
  describe('modal shows expected steps and text', () => {
    it('first step shows expected elements', async () => {
      wrapper = mount(DecisionsCompleteModal, {
        global: {
          mocks: {
            $t: (t) => t,
            $bvModal: { show: modalShow, hide: modalHide },
          },
        },
        props: {
          campaign: {
            exceptionDuration: 10,
          },
          totals: {
            certify: 10,
            revoke: 5,
            exception: 0,
          },
          isTesting: true,
          okFunction: jest.fn(),
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
      expect(buttons[0].text()).toBe('Continue Reviewing');
      expect(buttons[1].text()).toBe('Sign off');

      const chart = wrapper.find('#modal-decisions-chart');
      expect(chart.exists()).toBe(true);

      const spans = wrapper.findAll('span');
      expect(spans[0].text()).toContain('All items in this access review have been decisioned');
    });

    it('confirm step shows expected elements', async () => {
      wrapper = mount(DecisionsCompleteModal, {
        global: {
          mocks: {
            $t: (t) => t,
            $bvModal: { show: modalShow, hide: modalHide },
          },
        },
        props: {
          campaign: {
            exceptionDuration: 10,
          },
          totals: {
            certify: 10,
            revoke: 5,
            exception: 0,
          },
          isTesting: true,
          okFunction: jest.fn(),
        },
      });
      wrapper.vm.step = 'CONFIRM';
      await wrapper.vm.$nextTick();
      const buttons = wrapper.findAll('.btn');
      expect(buttons.length).toBe(2);
      expect(buttons[0].text()).toBe('Back');
      expect(buttons[1].text()).toBe('Sign off');

      const chart = wrapper.find('#modal-decisions-chart');
      expect(chart.exists()).toBe(false);

      const spans = wrapper.findAll('span');
      expect(spans[0].text()).toContain('Signing off on the access review is final');
    });
  });
});
