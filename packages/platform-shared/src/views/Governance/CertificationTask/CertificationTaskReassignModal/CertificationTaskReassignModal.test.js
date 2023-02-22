/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import { reassignCertificationTasks } from '@forgerock/platform-shared/src/api/governance/CertificationApi';
import CertificationTaskReassignModal from './index';

jest.mock('@forgerock/platform-shared/src/api/governance/CertificationApi');

let wrapper;

function mountComponent(options, methods) {
  wrapper = shallowMount(CertificationTaskReassignModal, {
    methods: {
      cancel: jest.fn(),
      ...methods,
    },
    mocks: {
      $t: (t) => t,
      ...options,
    },
    propsData: {
      isLoading: false,
    },
  });
}
describe('CertificationTaskReassignModal', () => {
  describe('Component mount', () => {
    it('CertificationTaskReassignModal successfully loaded', () => {
      mountComponent();
      expect(wrapper.name()).toEqual('CertificationTaskReassignModal');
    });
  });

  describe('setReassignBulkAction', () => {
    const methods = {
      updateCertificationTaskList: jest.fn(),
      emitSavingStatus: jest.fn(),
      toggleSaving: jest.fn(),
    };
    beforeEach(() => {
      jest.spyOn(wrapper.vm, 'showErrorMessage');
      mountComponent({}, {}, methods);
      reassignCertificationTasks.mockImplementation(() => Promise.resolve({ data: 'results' }));
    });
    it('should set the is loading to false to hide the loader in the header', async () => {
      reassignCertificationTasks.mockImplementation(() => Promise.reject(new Error()));
      const showErrorMessage = jest.spyOn(wrapper.vm, 'showErrorMessage');
      wrapper.vm.saveReassignBulkAction();

      await wrapper.vm.$nextTick();
      expect(showErrorMessage).toBeCalled();
    });
  });
});
