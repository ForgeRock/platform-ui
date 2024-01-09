/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { findByTestId, findComponentByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import { mount, flushPromises } from '@vue/test-utils';
import { forwardCertification } from '@forgerock/platform-shared/src/api/governance/CertificationApi';
import CertificationToolbar from './index';

jest.mock('@forgerock/platform-shared/src/api/governance/CertificationApi');

function mountComponent(options = {}, propsData = {}) {
  setupTestPinia();
  const wrapper = mount(CertificationToolbar, {
    global: {
      stubs: ['RouterLink'],
      mocks: {
        $t: (t) => t,
        $bvModal: {
          show: jest.fn(),
        },
        ...options,
      },
    },
    props: {
      campaignDetails: {
        id: 'test-id',
      },
      ...propsData,
    },
    stubs: ['RouterLink'],
  });
  return wrapper;
}
describe('CertificationToolbar', () => {
  describe('onForwardAllTasks', () => {
    it('should set the is saving value to false when the call is ready', async () => {
      const wrapper = mountComponent({}, { isSaving: false });
      forwardCertification.mockImplementation(() => Promise.resolve({ data: 'results' }));
      wrapper.vm.onForwardAllTasks({});

      await flushPromises();
      expect(wrapper.vm.isSaving).toEqual(false);
    });

    it('clicking forward button should open the forward modal', async () => {
      const wrapper = mountComponent();

      await wrapper.setProps({
        isComplete: true,
        hideSignOff: false,
        campaignDetails: {
          id: 'test-id',
          enableForward: true,
          allowBulkCertify: true,
        },
      });

      const forwardReviewButton = findByTestId(wrapper, 'forward-review-button');
      expect(forwardReviewButton.exists()).toBe(true);

      await forwardReviewButton.trigger('click');
      await flushPromises();

      expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('task-header-forward');
      expect(wrapper.vm.$bvModal.show).toHaveBeenCalledTimes(1);
    });

    it('should call to forward access review', async () => {
      const wrapper = mountComponent();
      const forwardApiSpy = forwardCertification.mockImplementation(() => Promise.resolve({ data: 'results' }));
      const forwardSpy = jest.spyOn(wrapper.vm, 'onForwardAllTasks');

      await wrapper.setProps({
        isComplete: true,
        hideSignOff: false,
        actorId: 'initialActorId',
        campaignDetails: {
          id: 'test-id',
          enableForward: true,
          allowBulkCertify: true,
        },
      });

      const forwardModal = findComponentByTestId(wrapper, 'forward-modal');
      expect(forwardModal.exists()).toBe(true);

      await forwardModal.vm.$emit('forward-bulk', { newActorId: 'test' });
      await flushPromises();

      expect(forwardSpy).toBeCalledWith({ newActorId: 'test' });
      expect(forwardApiSpy).toBeCalledWith('initialActorId', 'test-id', 'test', '');
      expect(wrapper.emitted('review-forwarded')).toBeTruthy();
    });
  });
});
