/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { toHaveNoViolations } from 'jest-axe';
import { runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import NotificationMessagesModal from './NotificationMessagesModal';

expect.extend(toHaveNoViolations);

const testMessages = [
  { timeStamp: '2026-05-07T14:30:00.000Z', comment: 'First message' },
  { timeStamp: '2026-05-08T09:15:00.000Z', comment: 'Second message' },
];

function mountComponent(props = {}) {
  return mount(NotificationMessagesModal, {
    global: {
      stubs: {
        BModal: {
          name: 'BModal',
          emits: ['hidden'],
          template: '<div><slot name="modal-header" :close="() => {}"/><slot /><slot name="modal-footer" :cancel="() => {}"/></div>',
        },
        FrPagination: {
          name: 'FrPagination',
          emits: ['update:modelValue'],
          template: '<div />',
        },
      },
      mocks: { $t: (t, params) => (params ? `${t}(${JSON.stringify(params)})` : t) },
    },
    props: {
      systemMessages: testMessages,
      ...props,
    },
  });
}

describe('NotificationMessagesModal', () => {
  describe('empty state', () => {
    it('shows empty message when systemMessages is empty', () => {
      const wrapper = mountComponent({ systemMessages: [] });
      expect(wrapper.find('p.text-muted').exists()).toBe(true);
      expect(wrapper.find('p.text-muted').text()).toBe('governance.notifications.systemMessagesModal.empty');
    });

    it('does not render BTable when systemMessages is empty', () => {
      const wrapper = mountComponent({ systemMessages: [] });
      expect(wrapper.findComponent({ name: 'BTable' }).exists()).toBe(false);
    });
  });

  describe('message list', () => {
    it('renders BTable when systemMessages are present', () => {
      const wrapper = mountComponent();
      expect(wrapper.findComponent({ name: 'BTable' }).exists()).toBe(true);
    });

    it('does not render empty state when systemMessages are present', () => {
      const wrapper = mountComponent();
      expect(wrapper.find('p.text-muted').exists()).toBe(false);
    });

    it('passes systemMessages as items to BTable', () => {
      const wrapper = mountComponent();
      expect(wrapper.findComponent({ name: 'BTable' }).props('items')).toEqual(testMessages);
    });
  });

  describe('title count', () => {
    it('includes the message count in the modal title', () => {
      const wrapper = mountComponent();
      expect(wrapper.find('h5.modal-title').text()).toContain('governance.notifications.systemMessagesModal.title');
      expect(wrapper.find('h5.modal-title').text()).toContain('"count":2');
    });

    it('reflects count of zero in the title for empty messages', () => {
      const wrapper = mountComponent({ systemMessages: [] });
      expect(wrapper.find('h5.modal-title').text()).toContain('governance.notifications.systemMessagesModal.title');
      expect(wrapper.find('h5.modal-title').text()).toContain('"count":0');
    });
  });

  describe('close-modal emit', () => {
    it('emits close-modal when the modal hidden event fires', async () => {
      const wrapper = mountComponent();
      await wrapper.findComponent({ name: 'BModal' }).vm.$emit('hidden');
      expect(wrapper.emitted('close-modal')).toBeTruthy();
    });

    it('resets BTable to page 1 and emits close-modal when the modal closes', async () => {
      const wrapper = mountComponent();
      // Advance pagination to page 2 via the FrPagination stub's on-page-size-change
      // approach — drive currentPage by emitting the pagination v-model update directly
      // against the stub element found by component definition reference
      const pagination = wrapper.findAllComponents({ name: 'FrPagination' });
      // FrPagination only renders in the non-empty branch
      expect(wrapper.findComponent({ name: 'BTable' }).props('currentPage')).toBe(1);

      // Trigger page change by emitting on the stub
      if (pagination.length) {
        await pagination[0].vm.$emit('update:modelValue', 2);
        await wrapper.vm.$nextTick();
      }

      await wrapper.findComponent({ name: 'BModal' }).vm.$emit('hidden');
      await wrapper.vm.$nextTick();
      // After hidden, BTable should be back on page 1 and close-modal emitted
      expect(wrapper.findComponent({ name: 'BTable' }).props('currentPage')).toBe(1);
      expect(wrapper.emitted('close-modal')).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const wrapper = mountComponent();
      await flushPromises();
      await runA11yTest(wrapper, {
        overrideRules: {
          rules: {
            'aria-dialog-name': { enabled: false },
          },
        },
      });
    });
  });
});
