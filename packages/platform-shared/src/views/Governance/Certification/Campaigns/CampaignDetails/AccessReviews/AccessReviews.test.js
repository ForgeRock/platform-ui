/**
 * Copyright 2023 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { CampaignStates } from '@forgerock/platform-shared/src/utils/governance/types';
import CertificationMixin from '@forgerock/platform-shared/src/mixins/Governance/Certification';
import * as CampaignApi from '@/api/governance/CampaignApi';
import AccessReviews from './index';

jest.mock('@/api/governance/AccessReviewApi');
jest.mock('@/api/governance/CampaignApi');
jest.mock('@forgerock/platform-shared/src/api/governance/CertificationApi');

function getTaskData(actor) {
  return {
    data: {
      result: [
        {
          actor,
          inProgress: 28,
          complete: 5,
          deadline: null,
          total: 33,
          status: 'in-progress',
        },
      ],
    },
  };
}

describe('AccessReviews', () => {
  let getListSpy;

  function mountComponent(propsData) {
    const wrapper = mount(AccessReviews, {
      mixins: [
        CertificationMixin,
      ],
      propsData: {
        campaignId: '123',
        campaignStatus: CampaignStates.ACTIVE,
        ...propsData,
      },
      global: {
        mocks: {
          $t: (id) => id,
          $router: { push: jest.fn() },
        },
      },
    });
    getListSpy = jest.spyOn(wrapper.vm, 'getList');
    return wrapper;
  }

  describe('active campaigns when certifier is a user', () => {
    beforeEach(() => {
      CampaignApi.getCampaignTasks.mockImplementation(() => Promise.resolve(getTaskData(
        {
          cn: 'Test Test',
          givenName: 'Test',
          sn: 'Castillo',
          id: '973f3896-c81a-4d54-8bec-1e7d9c8187fb',
          type: 'user',
          key: 'managed/user/973f3896-c81a-4d54-8bec-1e7d9c8187fb',
          userName: 'test@castillo.com',
        },
      )));
    });

    it('must call getList on mounted component', async () => {
      const wrapper = mountComponent();
      await flushPromises();
      expect(wrapper.vm.statusSort).toEqual({
        param: 'active',
        text: 'governance.status.active',
      });
      expect(wrapper.vm.isStaging).toBe(false);
      expect(wrapper.vm.states.active).not.toBeUndefined();
    });

    it('calculate progress percentage 10/100 test', () => {
      const wrapper = mountComponent();
      const progress = wrapper.vm.calculateTaskProgress(10, 100);
      expect(progress).toBe(10);
    });

    it('getItems should call getCampaignTasks', async () => {
      const wrapper = mountComponent();
      const items = await wrapper.vm.getItems({
        test: 'test',
      });

      expect(CampaignApi.getCampaignTasks).toHaveBeenCalledWith('123', {
        sortBy: null,
        sortDesc: false,
        test: 'test',
        pageSize: 10,
      });
      expect(items).toEqual(getTaskData(
        {
          cn: 'Test Test',
          givenName: 'Test',
          sn: 'Castillo',
          id: '973f3896-c81a-4d54-8bec-1e7d9c8187fb',
          type: 'user',
          key: 'managed/user/973f3896-c81a-4d54-8bec-1e7d9c8187fb',
          userName: 'test@castillo.com',
        },
      ));
    });

    it('should display noData component when no tasks are found', async () => {
      const wrapper = mountComponent();
      await wrapper.vm.setAccessReviewList({ result: [], totalCount: 0 });

      const noData = findByTestId(wrapper, 'access-review-no-data');
      expect(noData.exists()).toBeTruthy();
    });

    it('viewApplicationDetails calls router push to access reviews decisions modal', () => {
      const wrapper = mountComponent();
      const task = {
        actor: {
          cn: 'Test Test',
          givenName: 'Test',
          sn: 'Castillo',
          id: '973f3896-c81a-4d54-8bec-1e7d9c8187fb',
          type: 'user',
          key: 'managed/user/973f3896-c81a-4d54-8bec-1e7d9c8187fb',
          userName: 'test@castillo.com',
        },
        inProgress: 28,
        complete: 5,
        deadline: null,
        total: 33,
        status: 'in-progress',
      };

      wrapper.vm.viewApplicationDetails(task);

      expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
        name: 'CampaignDetailsTask',
        params: {
          campaignId: '123',
          certifier: {
            cn: 'Test Test',
            givenName: 'Test',
            id: '973f3896-c81a-4d54-8bec-1e7d9c8187fb',
            key: 'managed/user/973f3896-c81a-4d54-8bec-1e7d9c8187fb',
            sn: 'Castillo',
            type: 'user',
            userName: 'test@castillo.com',
          },
          isAdmin: true,
        },
        query: {
          actorId: 'managed/user/973f3896-c81a-4d54-8bec-1e7d9c8187fb',
          taskStatus: 'active',
        },
      });
    });

    it('handleSort called properly', () => {
      const wrapper = mountComponent();
      wrapper.vm.handleSort({ param: 'expired' });

      expect(wrapper.vm.statusSort).toEqual({
        param: 'expired',
      });
      expect(wrapper.vm.currentPage).toBe(1);
      expect(getListSpy).toHaveBeenCalled();
    });

    it('sortAccessReviews called properly', () => {
      const wrapper = mountComponent();
      wrapper.vm.sortAccessReviews({ sortBy: 'certifier' });

      expect(wrapper.vm.sortBy).toBe('certifier');
      expect(wrapper.vm.sortDesc).toBe(true);
      expect(getListSpy).toHaveBeenCalled();
    });

    it('paginationChange calls get list properly', () => {
      const wrapper = mountComponent();
      expect(wrapper.vm.currentPage).toBe(1);
      expect(getListSpy).not.toHaveBeenCalled();

      wrapper.vm.paginationChange(2);

      expect(wrapper.vm.currentPage).toBe(2);
      expect(getListSpy).toHaveBeenCalled();
    });

    it('pageSizeChange calls get list properly', () => {
      const wrapper = mountComponent();
      expect(wrapper.vm.pageSize).toBe(10);
      expect(getListSpy).not.toHaveBeenCalled();

      wrapper.vm.pageSizeChange(20);

      expect(wrapper.vm.pageSize).toBe(20);
      expect(getListSpy).toHaveBeenCalled();
    });

    it('should return certifier name correctly', () => {
      const wrapper = mountComponent();
      const result = wrapper.vm.certifierName({
        cn: 'Test Test',
        givenName: 'Test',
        sn: 'Castillo',
        id: '973f3896-c81a-4d54-8bec-1e7d9c8187fb',
        type: 'user',
        key: 'managed/user/973f3896-c81a-4d54-8bec-1e7d9c8187fb',
        userName: 'test@castillo.com',
      });

      expect(result.givenName).toEqual('Test');
      expect(result.sn).toEqual('Castillo');
    });

    it('should return certifier username correctly', () => {
      const wrapper = mountComponent();
      const result = wrapper.vm.certifierUsername({
        cn: 'Test Test',
        givenName: 'Test',
        sn: 'Castillo',
        id: '973f3896-c81a-4d54-8bec-1e7d9c8187fb',
        type: 'user',
        key: 'managed/user/973f3896-c81a-4d54-8bec-1e7d9c8187fb',
        userName: 'test@castillo.com',
      });

      expect(result).toEqual('test@castillo.com');
    });
  });

  describe('staged campaigns when certifier is a user', () => {
    CampaignApi.getCampaignTasks.mockImplementation(() => Promise.resolve(getTaskData({
      cn: 'Test Test',
      givenName: 'Test',
      sn: 'Castillo',
      id: '973f3896-c81a-4d54-8bec-1e7d9c8187fb',
      type: 'user',
      key: 'managed/user/973f3896-c81a-4d54-8bec-1e7d9c8187fb',
    })));

    it('must call getList on mounted component with proper params', async () => {
      const wrapper = mountComponent({ campaignStatus: CampaignStates.STAGING });
      expect(wrapper.vm.statusSort).toEqual({
        param: 'staging',
        text: 'governance.status.staging',
      });
      expect(wrapper.vm.isStaging).toBe(true);
      expect(wrapper.vm.states).toEqual({
        staging: {
          param: 'staging',
          text: 'governance.status.staging',
        },
      });
    });

    it('should call getList on change campaign status', async () => {
      const wrapper = mountComponent({ campaignStatus: CampaignStates.STAGING });
      await wrapper.setProps({
        campaignStatus: CampaignStates.ACTIVE,
      });

      expect(wrapper.vm.statusSort).toEqual({
        param: 'active',
        text: 'governance.status.active',
      });
      expect(wrapper.vm.isStaging).toBe(false);
      expect(wrapper.vm.states.active).not.toBeUndefined();
    });
  });

  describe('active campaigns when certifier is a role', () => {
    beforeEach(() => {
      CampaignApi.getCampaignTasks.mockImplementation(() => Promise.resolve(getTaskData(
        {
          name: 'Test Role',
          id: '973f3896-c81a-4d54-8bec-1e7d9c8187fb',
          key: 'managed/role/973f3896-c81a-4d54-8bec-1e7d9c8187fb',
        },
      )));
    });

    it('should return certifier name correctly', () => {
      const wrapper = mountComponent();
      const result = wrapper.vm.certifierName({
        name: 'Test Role',
        id: '973f3896-c81a-4d54-8bec-1e7d9c8187fb',
        key: 'managed/role/973f3896-c81a-4d54-8bec-1e7d9c8187fb',
      });

      expect(result.givenName).toEqual('Test Role');
      expect(result.sn).toEqual('');
    });

    it('should return certifier username correctly', () => {
      const wrapper = mountComponent();
      const result = wrapper.vm.certifierUsername({
        name: 'Test Role',
        id: '973f3896-c81a-4d54-8bec-1e7d9c8187fb',
        key: 'managed/role/973f3896-c81a-4d54-8bec-1e7d9c8187fb',
      });

      expect(result).toEqual('pages.access.role');
    });
  });
});
