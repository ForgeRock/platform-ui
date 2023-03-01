/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { mount, createWrapper } from '@vue/test-utils';
import { forwardCertification } from '@forgerock/platform-shared/src/api/governance/CertificationApi';
import CertificationTaskHeader from './index';

jest.mock('@forgerock/platform-shared/src/api/governance/CertificationApi');

let wrapper;

function mountComponent(options) {
  wrapper = mount(CertificationTaskHeader, {
    methods: {
      cancel: jest.fn(),
    },
    mocks: {
      $t: (t) => t,
      ...options,
    },
    propsData: {
      campaignDetails: {
        id: 'test-id',
      },
    },
    stubs: ['RouterLink'],
  });
}
describe('CertificationTaskHeader', () => {
  describe('Component mount', () => {
    it('CertificationTaskHeader successfully loaded', () => {
      mountComponent();
      expect(wrapper.name()).toEqual('CertificationTaskHeader');
    });
  });

  describe('onForwardAllTasks', () => {
    beforeEach(() => {
      mountComponent({});
    });
    it('should set the is saving value to false when the call is ready', async () => {
      forwardCertification.mockImplementation(() => Promise.resolve({ data: 'results' }));
      wrapper.vm.onForwardAllTasks({});

      await wrapper.vm.$nextTick();
      setTimeout(() => {
        expect(wrapper.vm.isSaving).toEqual(false);
      }, 100);
    });

    it('clicking forward button should open the forward modal', async () => {
      const rootWrapper = createWrapper(wrapper.vm.$root);

      wrapper.setProps({
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

      expect(rootWrapper.emitted('bv::show::modal')).toBeTruthy();
      expect(rootWrapper.emitted('bv::show::modal').length).toBe(1);
      expect(rootWrapper.emitted('bv::show::modal')[0][0]).toEqual('task-header-forward');
    });

    it('should call to forward access review', async () => {
      const forwardApiSpy = forwardCertification.mockImplementation(() => Promise.resolve({ data: 'results' }));
      const forwardSpy = jest.spyOn(wrapper.vm, 'onForwardAllTasks');

      wrapper.setProps({
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

      expect(forwardSpy).toBeCalledWith({ newActorId: 'test' });
      expect(forwardApiSpy).toBeCalledWith('initialActorId', 'test-id', 'test', '');
      expect(wrapper.emitted('review-forwarded')).toBeTruthy();
    });
  });
});
