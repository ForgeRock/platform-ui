/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import { forwardCertificationTasks } from '@forgerock/platform-shared/src/api/governance/CertificationApi';
import CertificationTaskHeader from './index';

jest.mock('@forgerock/platform-shared/src/api/governance/CertificationApi');

let wrapper;

function mountComponent(options) {
  wrapper = shallowMount(CertificationTaskHeader, {
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
      forwardCertificationTasks.mockImplementation(() => Promise.resolve({ data: 'results' }));
    });
    it('should set the is saving value to false when the call is ready', async () => {
      wrapper.vm.onForwardAllTasks();

      await wrapper.vm.$nextTick();
      setTimeout(() => {
        expect(wrapper.vm.isSaving).toEqual(false);
      }, 100);
    });
  });
});
