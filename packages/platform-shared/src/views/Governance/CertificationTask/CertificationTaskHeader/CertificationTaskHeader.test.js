/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import flushPromises from 'flush-promises';
import { mount, createWrapper } from '@vue/test-utils';
import { forwardCertification } from '@forgerock/platform-shared/src/api/governance/CertificationApi';
import CertificationTaskHeader from './index';

jest.mock('@forgerock/platform-shared/src/api/governance/CertificationApi');

function mountComponent(options = {}, propsData = {}) {
  const wrapper = mount(CertificationTaskHeader, {
    mocks: {
      $t: (t) => t,
      ...options,
    },
    propsData: {
      campaignDetails: {
        id: 'test-id',
      },
      ...propsData,
    },
    stubs: ['RouterLink'],
  });
  return wrapper;
}
describe('CertificationTaskHeader', () => {
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
      const rootWrapper = createWrapper(wrapper.vm.$root);

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

      expect(rootWrapper.emitted('bv::show::modal')).toBeTruthy();
      expect(rootWrapper.emitted('bv::show::modal').length).toBe(1);
      expect(rootWrapper.emitted('bv::show::modal')[0][0]).toEqual('task-header-forward');
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

      const forwardModal = findByTestId(wrapper, 'forward-modal');
      expect(forwardModal.exists()).toBe(true);

      await forwardModal.vm.$emit('forward-bulk', { newActorId: 'test' });
      await flushPromises();

      expect(forwardSpy).toBeCalledWith({ newActorId: 'test' });
      expect(forwardApiSpy).toBeCalledWith('initialActorId', 'test-id', 'test', '');
      expect(wrapper.emitted('review-forwarded')).toBeTruthy();
    });
  });
});
