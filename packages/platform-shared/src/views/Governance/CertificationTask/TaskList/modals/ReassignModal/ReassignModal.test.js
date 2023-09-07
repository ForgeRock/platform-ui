/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import Notifications from '@kyvg/vue3-notification';
import { reassignCertificationTasks } from '@forgerock/platform-shared/src/api/governance/CertificationApi';
import ReassignModal from './index';

jest.mock('@forgerock/platform-shared/src/api/governance/CertificationApi');

let wrapper;

function mountComponent(mocks = {}, propsData = {}) {
  wrapper = shallowMount(ReassignModal, {
    global: {
      mocks: {
        $t: (t) => t,
        ...mocks,
      },
      plugins: [Notifications],
    },
    props: {
      isLoading: false,
      ...propsData,
    },
  });
}
describe('ReassignModal', () => {
  describe('setReassignBulkAction', () => {
    it('should set the is loading to false to hide the loader in the header', async () => {
      mountComponent({});
      reassignCertificationTasks.mockImplementation(() => Promise.reject(new Error()));
      const showErrorMessage = jest.spyOn(wrapper.vm, 'showErrorMessage');
      wrapper.vm.saveReassignBulkAction();

      await wrapper.vm.$nextTick();
      expect(showErrorMessage).toBeCalled();
    });
  });

  describe('saveReassignBulkAction method', () => {
    beforeEach(() => {
      mountComponent({}, {
        campaignId: 'a96de99c-c638-4bdd-84cb-5fb559225152',
        selectedTasks: [],
      });
    });

    it('should call saveReassignBulkAction method with properly parameters, all permissions true', async () => {
      wrapper.vm.permissions = [
        {
          selected: true,
          label: 'governance.certificationTask.permissions.view',
          key: 'view',
        },
        {
          selected: true,
          label: 'governance.certificationTask.permissions.comment',
          key: 'comment',
        },
        {
          selected: true,
          label: 'governance.certificationTask.permissions.decide',
          key: 'decide',
        },
        {
          selected: true,
          label: 'governance.certificationTask.permissions.assignForward',
          key: 'assignForward',
        },
        {
          selected: true,
          label: 'governance.certificationTask.permissions.signOff',
          key: 'signOff',
        },
      ];
      wrapper.vm.saveReassignBulkAction();
      expect(reassignCertificationTasks).toHaveBeenCalledWith('a96de99c-c638-4bdd-84cb-5fb559225152', {
        ids: [],
        newActorId: '',
        permissions: {
          certify: true, comment: true, exception: true, forward: true, reassign: true, reset: true, revoke: true, signoff: true, view: true,
        },
      });
    });

    it('should call saveReassignBulkAction method with properly parameters, without decide permissions', async () => {
      wrapper.vm.permissions = [
        {
          selected: true,
          label: 'governance.certificationTask.permissions.view',
          key: 'view',
        },
        {
          selected: true,
          label: 'governance.certificationTask.permissions.comment',
          key: 'comment',
        },
        {
          selected: false,
          label: 'governance.certificationTask.permissions.decide',
          key: 'decide',
        },
        {
          selected: true,
          label: 'governance.certificationTask.permissions.assignForward',
          key: 'assignForward',
        },
        {
          selected: true,
          label: 'governance.certificationTask.permissions.signOff',
          key: 'signOff',
        },
      ];
      wrapper.vm.saveReassignBulkAction();
      expect(reassignCertificationTasks).toHaveBeenCalledWith('a96de99c-c638-4bdd-84cb-5fb559225152', {
        ids: [],
        newActorId: '',
        permissions: {
          certify: false, comment: true, exception: false, forward: true, reassign: true, reset: false, revoke: false, signoff: true, view: true,
        },
      });
    });
  });
});
