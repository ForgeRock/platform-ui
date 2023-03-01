/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import flushPromises from 'flush-promises';
import * as CertificationApi from '@forgerock/platform-shared/src/api/governance/CertificationApi';
import CertificationTaskList from './index';

jest.mock('@forgerock/platform-shared/src/api/governance/CertificationApi');

let wrapper;
let $emit;
const resourceDataMock = {
  data: {
    result: [],
    totalCount: 2,
  },
};

function mountComponent(options, data, methods, propsData = {}) {
  $emit = jest.fn();
  wrapper = shallowMount(CertificationTaskList, {
    methods: {
      cancel: jest.fn(),
      showErrorMessage: jest.fn(),
      ...methods,
    },
    mocks: {
      $t: (t) => t,
      $emit,
      $root: {
        $emit,
      },
      ...options,
    },
    data() {
      return {
        ...data,
      };
    },
    propsData: {
      campaignId: 'test-id',
      campaignDetails: {},
      ...propsData,
    },
  });
}
describe('CertificationTaskList', () => {
  beforeEach(() => {
    CertificationApi.getCertificationTasksListByCampaign.mockImplementation(() => Promise.resolve({ data: 'results' }));
    CertificationApi.getCertificationCountsByCampaign.mockImplementation(() => Promise.resolve({ data: 'results' }));
    CertificationApi.certifyCertificationTasks.mockImplementation(() => Promise.resolve({ data: 'results' }));
    CertificationApi.revokeCertificationTasks.mockImplementation(() => Promise.resolve({ data: 'results' }));
    CertificationApi.exceptionCertificationTasks.mockImplementation(() => Promise.resolve({ data: 'results' }));
    CertificationApi.saveComment.mockImplementation(() => Promise.resolve({}));
    CertificationApi.reassignLineItem.mockImplementation(() => Promise.resolve({}));
    CertificationApi.updateLineItemReviewers.mockImplementation(() => Promise.resolve({}));
  });
  describe('Component mount', () => {
    it('CertificationTaskList successfully loaded', () => {
      mountComponent();
      expect(wrapper.name()).toEqual('CertificationTaskList');
    });
  });

  describe('paginationChange', () => {
    it('should call getCertificationTaskList with the pagination page', () => {
      const methods = {
        getCertificationTaskList: jest.fn(),
      };
      mountComponent({}, {}, methods);
      wrapper.vm.paginationPage = 1;
      wrapper.vm.paginationChange();
      expect(methods.getCertificationTaskList).toBeCalledWith(1);
    });
  });

  describe('openCertificationTaskSortModal', () => {
    it('should emit the bv::show::modal to show the certification task sort', () => {
      wrapper.vm.openCertificationTaskSortModal();
      expect($emit).toHaveBeenCalledWith('bv::show::modal', 'CertificationTaskSortModal');
    });
  });
  describe('isTaskSelected', () => {
    it('should return true if the allSelected variable is true', () => {
      wrapper.vm.allSelected = true;
      const result = wrapper.vm.isTaskSelected('test');
      expect(result).toEqual(true);
    });
    it('should return false if the allSelected variable is false and there is no selected tasks', () => {
      wrapper.vm.allSelected = false;
      wrapper.vm.selectedTasks = [];
      const result = wrapper.vm.isTaskSelected('test');
      expect(result).toEqual(false);
    });
    it('should return true if the task id is selected', () => {
      wrapper.vm.allSelected = false;
      wrapper.vm.selectedTasks = ['test-id'];
      const result = wrapper.vm.isTaskSelected('test-id');
      expect(result).toEqual(true);
    });
  });
  describe('loadTasksList', () => {
    it('should set to true if there is no data', () => {
      wrapper.vm.loadTasksList(resourceDataMock);
      expect(wrapper.vm.noData).toEqual(true);
    });
    it('should set the total rows with the total hits', () => {
      wrapper.vm.loadTasksList(resourceDataMock);
      expect(wrapper.vm.totalRows).toEqual(2);
    });
    it('should set the current page with the page param', () => {
      wrapper.vm.loadTasksList(resourceDataMock, 1);
      expect(wrapper.vm.currentPage).toEqual(1);
    });
    it('should set the tasks data with the mapped data with selected property', () => {
      wrapper.vm.selectedTasks = ['test-id'];
      const resource = {
        data: {
          result: [{
            id: 'test-id',
          }],
        },
      };
      const expectedValue = [{
        id: 'test-id',
        selected: true,
      }];
      wrapper.vm.loadTasksList(resource, 1);
      expect(wrapper.vm.tasksData).toEqual(expectedValue);
    });
    it('should emit check-progress if there is a task in status', () => {
      mountComponent({}, {}, { isTaskSelected: jest.fn() });
      const resource = {
        data: {
          result: [{
            decision: {
              certification: {
                status: 'signed-off',
              },
            },
            id: 'test-id',
          }],
        },
      };
      wrapper.vm.loadTasksList(resource, 1);
      expect($emit).toBeCalledWith('check-progress');
    });
  });
  describe('getCertificationTaskList', () => {
    const methods = {
      buildUrlParams: jest.fn(),
      loadTasksList: jest.fn(),
      showErrorMessage: jest.fn(),
    };
    let addCertificationTaskAccountDetailsSpy;

    beforeEach(() => {
      wrapper.vm.currentPage = 2;
      wrapper.vm.sortBy = 'name';
      wrapper.vm.sortDesc = false;
      mountComponent({}, {}, methods);
      CertificationApi.getCertificationTasksListByCampaign.mockImplementation(() => Promise.resolve({ data: 'results' }));
      CertificationApi.getCertificationCountsByCampaign.mockImplementation(() => Promise.resolve({ data: 'results' }));
      CertificationApi.getCertificationTaskAccountDetails.mockImplementation(() => Promise.resolve({ data: 'results' }));
      addCertificationTaskAccountDetailsSpy = jest.spyOn(wrapper.vm, 'addCertificationTaskAccountDetails').mockImplementation(() => Promise.resolve({ data: 'results' }));
    });
    it('should call loadTasksList once the result of the call is ready', async () => {
      wrapper.vm.getCertificationTaskList(2);

      await wrapper.vm.$nextTick();
      expect(addCertificationTaskAccountDetailsSpy).toHaveBeenCalled();
      expect(methods.loadTasksList).toHaveBeenCalled();
    });
    it('should call buildUrlParams with the required params', () => {
      wrapper.vm.getCertificationTaskList(2);
      expect(methods.buildUrlParams).toHaveBeenCalledWith(1, 'user.givenName', false);
    });
    it('should call getCertificationTasksListByCampaign with the required params', () => {
      wrapper.vm.getCertificationTaskList(2);
      expect(CertificationApi.getCertificationTasksListByCampaign).toHaveBeenCalled();
    });
  });
  describe('addCertificationTaskAccountDetails', () => {
    let getCertificationTaskAccountDetailsSpy;
    const resourceData = {
      data: {
        result: [
          {
            id: '1',
          },
          {
            id: '2',
          },
        ],
        totalHits: 1,
      },
    };
    const accountData = {
      // eslint-disable-next-line quote-props
      '1': {
        accountEnabled: true,
        displayName: 'Barbara Walters',
        givenName: 'Barbara',
      },
      // eslint-disable-next-line quote-props
      '2': {
        accountEnabled: true,
        displayName: 'Dania Nunez',
        givenName: 'Dania',
        jobTitle: 'bigboss',
      },
    };
    beforeEach(() => {
      jest.clearAllMocks();
      mountComponent({}, {}, {});
      getCertificationTaskAccountDetailsSpy = jest.spyOn(CertificationApi, 'getCertificationTaskAccountDetails').mockImplementation((campaignId, taskId) => Promise.resolve({ data: accountData[`${taskId}`] }));

      wrapper.vm.campaignId = 'test-id';
    });

    it('should call getCertificationTaskAccountDetails per each item', () => {
      wrapper.vm.addCertificationTaskAccountDetails(resourceData);

      expect(getCertificationTaskAccountDetailsSpy).toHaveBeenCalledTimes(2);
    });

    it('should return the account data for each item', async () => {
      const response = await wrapper.vm.addCertificationTaskAccountDetails(resourceData);

      await flushPromises();
      const mappedItems = resourceData.data.result.map((item) => ({
        ...item,
        account: accountData[`${item.id}`],
      }));

      expect(response).toEqual({
        ...resourceData,
        data: {
          ...resourceData.data,
          result: [
            ...mappedItems,
          ],
        },
      });
    });
  });
  describe('buildUrlParams', () => {
    it('should return the urlParams according to the params', () => {
      wrapper.vm.pageSize = 10;
      mountComponent({}, {}, {});
      const expectedValue = {
        appendUserPermissions: true,
        pageSize: 10,
        pageNumber: 2,
        sortBy: 'name',
        sortDesc: false,
      };
      const result = wrapper.vm.buildUrlParams(3, 'name', false);
      expect(result).toStrictEqual(expectedValue);
    });
    it('should return the urlParams according to the params when isAdmin', async () => {
      wrapper.vm.pageSize = 10;
      mountComponent({}, {}, {});
      const expectedValue = {
        appendUserPermissions: true,
        pageSize: 10,
        pageNumber: 2,
        sortBy: 'name',
        sortDesc: false,
        isAdmin: true,
        actorId: '123',

      };
      await wrapper.setProps({
        isAdmin: true,
        actorId: '123',
      });
      const result = wrapper.vm.buildUrlParams(3, 'name', false);
      expect(result).toStrictEqual(expectedValue);
    });
  });
  describe('getBaseFilters', () => {
    it('should return the base filters to load the list', () => {
      mountComponent();
      const expectedValue = {
        operator: 'EQUALS',
        operand: {
          targetName: 'decision.certification.primaryReviewer.id',
          targetValue: '',
        },
      };
      const result = wrapper.vm.getBaseFilters();
      expect(result).toStrictEqual(expectedValue);
    });
  });
  describe('buildBodyParams', () => {
    it('should return the base filters to load the list when there is no filters', () => {
      mountComponent();
      const expectedValue = {
        targetFilter: {
          operator: 'EQUALS',
          operand: {
            targetName: 'decision.certification.primaryReviewer.id',
            targetValue: '',
          },
        },
      };
      const result = wrapper.vm.buildBodyParams();
      expect(result).toStrictEqual(expectedValue);
    });
    it('should return the base filters to load the list when there is no filters', () => {
      mountComponent();
      wrapper.vm.listFilters = {
        user: 'useris',
        application: 'appid',
        decision: ['certify'],
      };
      const expectedValue = {
        targetFilter: {
          operator: 'AND',
          operand: [
            {
              operator: 'AND',
              operand: [
                {
                  operator: 'IN',
                  operand: {
                    targetName: 'decision.certification.decision',
                    targetValue: [
                      'certify',
                    ],
                  },
                },
                {
                  operator: 'EQUALS',
                  operand: {
                    targetName: 'application.id',
                    targetValue: 'appid',
                  },
                },
                {
                  operator: 'EQUALS',
                  operand: {
                    targetName: 'user.id',
                    targetValue: 'useris',
                  },
                },
              ],
            },
            {
              operator: 'EQUALS',
              operand: {
                targetName: 'decision.certification.primaryReviewer.id',
                targetValue: '',
              },
            },
          ],
        },
      };
      const result = wrapper.vm.buildBodyParams();
      expect(result).toStrictEqual(expectedValue);
    });
  });
  describe('selectTask', () => {
    const resource = [{
      id: 'test-id',
    },
    {
      id: 'test-id-2',
    }];
    it('should return the task list with all selected tasks', () => {
      const expectedValue = [{
        id: 'test-id',
        selected: true,
      },
      {
        id: 'test-id-2',
        selected: true,
      }];
      wrapper.vm.tasksData = resource;
      wrapper.vm.selectTask(true, true);
      expect(wrapper.vm.tasksData).toStrictEqual(expectedValue);
    });
    it('should return the task list with all task in selected false', () => {
      const expectedValue = [{
        id: 'test-id',
        selected: false,
      },
      {
        id: 'test-id-2',
        selected: false,
      }];
      wrapper.vm.tasksData = resource;
      wrapper.vm.selectTask(false);
      expect(wrapper.vm.tasksData).toStrictEqual(expectedValue);
    });
  });
  describe('updateCertificationTaskList', () => {
    it('should call display notification with the success message', () => {
      const displayNotificationSpy = jest.spyOn(wrapper.vm, 'displayNotification');
      wrapper.vm.updateCertificationTaskList();
      expect(displayNotificationSpy).toBeCalledWith('success', 'governance.certificationTask.success.undefined');
    });
    it('should set the selected task to empty', () => {
      wrapper.vm.updateCertificationTaskList();
      expect(wrapper.vm.selectedTasks).toEqual([]);
    });
    it('should call getCertificationTaskList with the main page', () => {
      const methods = {
        getCertificationTaskList: jest.fn(),
      };
      mountComponent({}, {}, methods);
      wrapper.vm.mainPageNumber = 1;
      wrapper.vm.updateCertificationTaskList();
      expect(methods.getCertificationTaskList).toBeCalledWith(1);
    });
  });
  describe('filterCertificationItems', () => {
    it('should call getCertificationTaskList with the paginationPage', () => {
      const methods = {
        getCertificationTaskList: jest.fn(),
      };
      mountComponent({}, {}, methods);
      wrapper.vm.paginationPage = 1;
      wrapper.vm.filterCertificationItems({});
      expect(methods.getCertificationTaskList).toBeCalledWith(1);
    });
    it('listFilters should contain the new filters', () => {
      const methods = {
        getCertificationTaskList: jest.fn(),
      };
      mountComponent({}, {}, methods);
      const filterTest = {
        decision: 'certify',
      };
      wrapper.vm.filterCertificationItems(filterTest);
      expect(wrapper.vm.listFilters).toEqual({ ...filterTest });
    });
  });

  describe('saveCertifyBulkAction', () => {
    const methods = {
      updateCertificationTaskList: jest.fn(),
    };
    beforeEach(() => {
      wrapper.vm.campaignId = 'test-id';
      mountComponent({}, {}, methods);
      CertificationApi.certifyCertificationTasks.mockImplementation(() => Promise.resolve({ data: 'results' }));
    });
    it('should toggle the saving status to add a loader in the header', () => {
      wrapper.vm.saveCertifyBulkAction();
      expect($emit).toBeCalledWith('change-saving');
    });
    it('should call updateCertificationTaskList after the certification is completed', async () => {
      wrapper.vm.saveCertifyBulkAction('comments');

      await wrapper.vm.$nextTick();
      expect(methods.updateCertificationTaskList).toHaveBeenCalledWith('certifySuccess');
    });
  });
  describe('saveRevokeCertificationTasks', () => {
    const methods = {
      updateCertificationTaskList: jest.fn(),
    };
    beforeEach(() => {
      wrapper.vm.campaignId = 'test-id';
      mountComponent({}, {}, methods);
      CertificationApi.revokeCertificationTasks.mockImplementation(() => Promise.resolve({ data: 'results' }));
    });
    it('should toggle the saving status to add a loader in the header', () => {
      wrapper.vm.saveRevokeCertificationTasks();
      expect($emit).toBeCalledWith('change-saving');
    });
    it('should call updateCertificationTaskList after the certification is completed', async () => {
      wrapper.vm.saveRevokeCertificationTasks('comments');

      await wrapper.vm.$nextTick();
      expect(methods.updateCertificationTaskList).toHaveBeenCalledWith('revokeSuccess');
    });
  });
  describe('saveAllowExceptionBulkAction', () => {
    const methods = {
      updateCertificationTaskList: jest.fn(),
    };
    beforeEach(() => {
      wrapper.vm.campaignId = 'test-id';
      mountComponent({}, {}, methods);
      CertificationApi.exceptionCertificationTasks.mockImplementation(() => Promise.resolve({ data: 'results' }));
    });
    it('should toggle the saving status to add a loader in the header', () => {
      wrapper.vm.saveAllowExceptionBulkAction();
      expect($emit).toBeCalledWith('change-saving');
    });
    it('should call updateCertificationTaskList after the certification is completed', async () => {
      wrapper.vm.saveAllowExceptionBulkAction('comments');

      await wrapper.vm.$nextTick();
      expect(methods.updateCertificationTaskList).toHaveBeenCalledWith('allowExceptionSuccess');
    });
  });
  describe('showReassignBulkActionModal', () => {
    it('should emit the bv::show::modal to show the certification reasign modal', () => {
      wrapper.vm.showReassignBulkActionModal();
      expect($emit).toHaveBeenCalledWith('bv::show::modal', 'CertificationTaskReassignModal');
    });
  });
  describe('openActionConfirmationModal', () => {
    it('should set the actionConfirmationModalProps with the params', () => {
      const expectedValue = {
        title: 'title',
        description: 'description',
        placeHolder: 'placeHolder',
        okLabel: 'okLabel',
        okFunction: () => {},
      };
      wrapper.vm.openActionConfirmationModal(expectedValue);
      expect(wrapper.vm.actionConfirmationModalProps).toEqual(expectedValue);
    });
    it('should emit the bv::show::modal to show the certification reasign modal', () => {
      wrapper.vm.openActionConfirmationModal({});
      expect($emit).toHaveBeenCalledWith('bv::show::modal', 'CertificationTaskActionConfirmModal');
    });
  });

  describe('field property', () => {
    it('should contain the new entitlement column when the prop showEntitlementColumn is true', () => {
      mountComponent({}, {}, {}, {
        showEntitlementColumn: true,
      });
      wrapper.setData({});
      expect(wrapper.vm.tasksFields).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            key: 'entitlement',
          }),
        ]),
      );
    });
    it('should not contain the new entitlement column when the prop showEntitlementColumn is false', () => {
      mountComponent({}, {}, {}, {
        showEntitlementColumn: false,
      });
      wrapper.setData({});
      expect(wrapper.vm.tasksFields).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            key: 'entitlement',
          }),
        ]),
      );
    });
  });

  describe('line item details', () => {
    let showErrorMessageSpy;
    const methods = {
      getCertificationTaskList: jest.fn(),
    };
    beforeEach(() => {
      mountComponent({}, {}, methods);
      showErrorMessageSpy = jest.spyOn(wrapper.vm, 'showErrorMessage');
    });

    it('openUserModal called saves currentUserSelectedModal data and shows CertificationTaskUserModal', async () => {
      const id = 'id-test';
      const user = {
        givenName: 'Test',
        sn: 'Test',
      };

      CertificationApi.getCertificationLineItemUser.mockImplementation(() => Promise.resolve({ data: user }));
      wrapper.vm.openUserModal(id);
      await flushPromises();

      expect(wrapper.vm.currentUserSelectedModal).toEqual(user);
      expect($emit).toHaveBeenCalledWith('bv::show::modal', 'CertificationTaskUserModal');
    });

    it('openUserModal called saves currentUserSelectedModal and it must not match the user if it has a property that is not allowed.', async () => {
      const id = 'id-test';
      const user = {
        password: 'test-password',
        givenName: 'Test',
        sn: 'Test',
      };

      CertificationApi.getCertificationLineItemUser.mockImplementation(() => Promise.resolve({ data: user }));
      wrapper.vm.openUserModal(id);
      await flushPromises();

      expect(wrapper.vm.currentUserSelectedModal).not.toEqual(user);
    });

    it('getCertificationLineItemUser should call api error', async () => {
      const error = new Error('ERROR');
      const id = 'id-test';
      CertificationApi.getCertificationLineItemUser.mockImplementation(() => Promise.reject(error));

      wrapper.vm.openUserModal(id);
      await flushPromises();

      expect(showErrorMessageSpy).toHaveBeenCalledWith(error, 'governance.certificationTask.error.getUserError');
    });

    it('openApplicationModal called saves currentApplicationSelectedModal data and shows CertificationTaskApplicationModal', async () => {
      const application = {
        id: '4ab37e2f-9470-45f6-85dd-f8a7b095e0d4',
        name: 'TestADApp',
      };

      const applicationOwners = [{
        id: '44a33897-8647-419d-8148-31defab70467',
        userName: 'igaadmin',
      }];

      wrapper.vm.openApplicationModal(application, applicationOwners);
      await flushPromises();

      expect(wrapper.vm.currentApplicationSelectedModal).toEqual({
        ...application,
        applicationOwners,
      });
      expect($emit).toHaveBeenCalledWith('bv::show::modal', 'CertificationTaskApplicationModal');
    });

    it('openAccountModal called saves currentAccountSelectedModal data and shows CertificationTaskAccountModal', async () => {
      const account = {
        id: '4ab37e2f-9470-45f6-85dd-f8a7b095e0d4',
        displayName: 'Dani Morales',
      };

      const lastCertified = '2022-12-16T03:51:49.729Z';

      wrapper.vm.openAccountModal(account, lastCertified);
      await flushPromises();

      expect(wrapper.vm.currentAccountSelectedModal).toEqual({
        ...account,
        lastCertified,
      });
      expect($emit).toHaveBeenCalledWith('bv::show::modal', 'CertificationTaskAccountModal');
    });

    it('openCommentsModal called saves currentCommentsSelectedModal, currentLineItemIdSelectedModal data and shows CertificationTaskCommentsModal', async () => {
      const comments = [
        {
          action: 'comment',
          comment: 'test comment',
          user: {
            givenName: 'Testuser',
          },
        },
      ];
      const lineItemId = '4ab37e2f-9470-45f6-85dd-f8a7b095e0d4';

      wrapper.vm.openCommentsModal(comments, { id: lineItemId });
      await flushPromises();

      expect(wrapper.vm.currentCommentsSelectedModal).toEqual(comments);
      expect(wrapper.vm.currentLineItemIdSelectedModal).toBe(lineItemId);
      expect($emit).toHaveBeenCalledWith('bv::show::modal', 'CertificationTaskCommentsModal');
    });

    it('openAddCommentModalFromCommentsModal called hides CertificationTaskCommentsModal and shows CertificationTaskAddCommentModal', async () => {
      wrapper.vm.openAddCommentModalFromCommentsModal();

      await flushPromises();

      expect($emit).toHaveBeenCalledWith('bv::hide::modal', 'CertificationTaskCommentsModal');
      expect($emit).toHaveBeenCalledWith('bv::show::modal', 'CertificationTaskAddCommentModal');
    });

    it('openAddCommentModal called saves currentLineItemIdSelectedModal data and shows CertificationTaskAddCommentModal', async () => {
      const lineItemId = '4ab37e2f-9470-45f6-85dd-f8a7b095e0d4';

      wrapper.vm.openAddCommentModal(lineItemId);
      await flushPromises();

      expect(wrapper.vm.currentLineItemIdSelectedModal).toBe(lineItemId);
      expect($emit).toHaveBeenCalledWith('bv::show::modal', 'CertificationTaskAddCommentModal');
    });

    it('addComment calls governance api properly', async () => {
      const comment = 'Test comment';
      const task = {
        id: '1',
        decision: {
          certification: {
            comments: [
              {
                action: 'comment',
                comment: 'comment 1',
              },
              {
                action: 'comment',
                comment: 'comment 2',
              },
            ],
          },
        },
      };

      wrapper.vm.currentLineItemIdSelectedModal = '1';
      wrapper.vm.tasksData = [task];
      methods.getCertificationTaskList.mockImplementation(() => Promise.resolve({}));
      const spyNotification = jest.spyOn(wrapper.vm, 'displayNotification');

      wrapper.vm.addComment(comment);

      await flushPromises();

      expect(spyNotification).toHaveBeenCalledWith('success', 'governance.certificationTask.lineItemAddCommentModal.addCommentSuccessfullyMessage');
      expect(wrapper.vm.currentCommentsSelectedModal).toEqual(task.decision.certification.comments);
      expect($emit).toHaveBeenCalledWith('bv::hide::modal', 'CertificationTaskAddCommentModal');
      expect($emit).toHaveBeenCalledWith('bv::show::modal', 'CertificationTaskCommentsModal');
    });

    it('addComment calls governance api error', async () => {
      const comment = 'Test comment';
      const task = {
        id: '1',
        decision: {
          certification: {
            comments: [
              {
                comment: 'comment 1',
              },
              {
                comment: 'comment 2',
              },
            ],
          },
        },
      };
      const error = new Error();

      wrapper.vm.currentLineItemIdSelectedModal = '1';
      wrapper.vm.tasksData = [task];
      CertificationApi.saveComment.mockImplementation(() => Promise.reject(error));
      const spyNotification = jest.spyOn(wrapper.vm, 'showErrorMessage');

      wrapper.vm.addComment(comment);

      await flushPromises();

      expect(spyNotification).toHaveBeenCalledWith(error, 'governance.certificationTask.error.addCommentErrorDefaultMessage');
    });

    it('openReviewersModal should open reviewers modal with data setted', async () => {
      const id = '12345';
      const actors = [
        {
          id: '/managed/user/12345',
          givenName: 'test',
        },
        {
          id: '/managed/rolw/12345',
          name: 'test',
        },
      ];
      const reassign = true;
      const item = {
        id,
        decision: {
          certification: {
            actors,
          },
        },
        permissions: {
          reassign,
        },
      };

      expect($emit).not.toHaveBeenCalledWith('bv::show::modal', 'CertificationTaskReviewersModal');

      wrapper.vm.openReviewersModal(item);

      await wrapper.vm.$nextTick();

      expect(wrapper.vm.currentLineItemIdSelectedModal).toBe(id);
      expect(wrapper.vm.currentReviewersSelectedModal).toEqual(actors);
      expect(wrapper.vm.currentLineItemReassignPermission).toBe(reassign);
      expect($emit).toHaveBeenCalledWith('bv::show::modal', 'CertificationTaskReviewersModal');
    });

    it('openEditReviewerModal should open edit reviewer modal with data setted', async () => {
      const reviewers = [
        {
          id: '/managed/user/12345',
          givenName: 'test',
          permissions: {
            comment: true,
            delegate: true,
            forward: true,
            reassign: true,
            consult: true,
            signoff: true,
            certify: true,
            exception: true,
            revoke: true,
            reset: true,
            save: true,
            removeActor: true,
            accept: true,
            challenge: true,
          },
        },
        {
          id: '/managed/rolw/12345',
          name: 'test',
          permissions: {
            comment: true,
            delegate: true,
            forward: true,
            reassign: true,
            consult: true,
            signoff: false,
            certify: true,
            exception: true,
            revoke: true,
            reset: true,
            save: true,
            removeActor: true,
            accept: true,
            challenge: true,
          },
        },
      ];
      const reviewer = {
        id: '/managed/user/12345',
        givenName: 'test',
      };

      expect($emit).not.toHaveBeenCalledWith('bv::hide::modal', 'CertificationTaskReviewersModal');
      expect($emit).not.toHaveBeenCalledWith('bv::show::modal', 'CertificationTaskEditReviewerModal');

      wrapper.vm.currentReviewersSelectedModal = reviewers;
      wrapper.vm.openEditReviewerModal(reviewer);

      await wrapper.vm.$nextTick();

      expect(wrapper.vm.currentReviewerSelectedModal).toEqual(reviewer);
      expect($emit).toHaveBeenCalledWith('bv::hide::modal', 'CertificationTaskReviewersModal');
      expect($emit).toHaveBeenCalledWith('bv::show::modal', 'CertificationTaskEditReviewerModal');
    });

    it('closeEditReviewerModal should close edit reviewer modal and open reviewers modal', async () => {
      expect($emit).not.toHaveBeenCalledWith('bv::hide::modal', 'CertificationTaskEditReviewerModal');
      expect($emit).not.toHaveBeenCalledWith('bv::show::modal', 'CertificationTaskReviewersModal');

      wrapper.vm.closeEditReviewerModal();

      await wrapper.vm.$nextTick();

      expect($emit).toHaveBeenCalledWith('bv::hide::modal', 'CertificationTaskEditReviewerModal');
      expect($emit).toHaveBeenCalledWith('bv::show::modal', 'CertificationTaskReviewersModal');
    });

    describe('edit reviewer', () => {
      let permissions;
      let reviewers;
      let displayNotificationSpy;

      beforeEach(() => {
        CertificationApi.reassignLineItem.mockImplementation(() => Promise.resolve());
        CertificationApi.updateLineItemReviewers.mockImplementation(() => Promise.resolve());
        displayNotificationSpy = jest.spyOn(wrapper.vm, 'displayNotification');
        showErrorMessageSpy = jest.spyOn(wrapper.vm, 'showErrorMessage');
        permissions = {
          comment: true,
          delegate: true,
          forward: true,
          reassign: true,
          consult: true,
          signoff: false,
          certify: false,
          exception: false,
          revoke: false,
          reset: false,
          save: true,
          removeActor: true,
          accept: true,
          challenge: true,
        };
        reviewers = [
          {
            id: '/managed/user/12345',
            givenName: 'test',
            permissions: {
              comment: true,
              delegate: true,
              forward: true,
              reassign: true,
              consult: true,
              signoff: true,
              certify: true,
              exception: true,
              revoke: true,
              reset: true,
              save: true,
              removeActor: true,
              accept: true,
              challenge: true,
            },
          },
          {
            id: '/managed/role/123456',
            name: 'test',
            permissions: {
              comment: true,
              delegate: true,
              forward: true,
              reassign: true,
              consult: true,
              signoff: true,
              certify: true,
              exception: true,
              revoke: true,
              reset: true,
              save: true,
              removeActor: true,
              accept: true,
              challenge: true,
            },
          },
        ];
        wrapper.vm.currentReviewersSelectedModal = reviewers;
      });

      it('editReviewer should call api correctly', async () => {
        const reviewerId = '/managed/user/12345';
        [wrapper.vm.currentReviewerSelectedModal] = reviewers;
        const closeEditReviewerModalSpy = jest.spyOn(wrapper.vm, 'closeEditReviewerModal');

        expect(closeEditReviewerModalSpy).not.toHaveBeenCalled();

        wrapper.vm.editReviewer(reviewerId, permissions);

        await flushPromises();

        expect(displayNotificationSpy).toHaveBeenCalledWith('success', 'governance.certificationTask.lineItemReviewersModal.editReviewerSuccessfullyMessage');
        expect(wrapper.vm.currentReviewersSelectedModal.find((reviewer) => reviewer.id === reviewerId).permissions).toEqual(permissions);
        expect(closeEditReviewerModalSpy).toHaveBeenCalled();
        expect(wrapper.vm.isSavingReviewer).toBe(false);
      });

      it('editReviewer should call api correctly new reviewer', async () => {
        const reviewerId = '/managed/user/123457';
        const newReviewer = {
          id: '/managed/user/123457',
          givenName: 'test',
          permissions: {
            comment: true,
            delegate: true,
            forward: true,
            reassign: true,
            consult: true,
            signoff: false,
            certify: false,
            exception: false,
            revoke: false,
            reset: false,
            save: true,
            removeActor: true,
            accept: true,
            challenge: true,
          },
        };
        const newReviewers = reviewers.concat([newReviewer]);
        const closeEditReviewerModalSpy = jest.spyOn(wrapper.vm, 'closeEditReviewerModal');

        wrapper.vm.editReviewer(reviewerId, permissions, newReviewer);

        await flushPromises();

        expect(displayNotificationSpy).toHaveBeenCalledWith('success', 'governance.certificationTask.lineItemReviewersModal.addReviewerSuccessfullyMessage');
        expect(wrapper.vm.currentReviewersSelectedModal).toEqual(newReviewers);
        expect(closeEditReviewerModalSpy).toHaveBeenCalled();
        expect(wrapper.vm.isSavingReviewer).toBe(false);
      });

      it('editReviewer should call api error', async () => {
        const error = new Error('ERROR');
        CertificationApi.reassignLineItem.mockImplementation(() => Promise.reject(error));

        const reviewerId = '/managed/user/12345';
        [wrapper.vm.currentReviewerSelectedModal] = reviewers;
        const closeEditReviewerModalSpy = jest.spyOn(wrapper.vm, 'closeEditReviewerModal');

        wrapper.vm.editReviewer(reviewerId, permissions);

        await flushPromises();

        expect(showErrorMessageSpy).toHaveBeenCalledWith(error, 'governance.certificationTask.lineItemReviewersModal.editReviewerErrorMessage');
        expect(wrapper.vm.currentReviewersSelectedModal.find((reviewer) => reviewer.id === reviewerId).permissions).toEqual({
          comment: true,
          delegate: true,
          forward: true,
          reassign: true,
          consult: true,
          signoff: true,
          certify: true,
          exception: true,
          revoke: true,
          reset: true,
          save: true,
          removeActor: true,
          accept: true,
          challenge: true,
        });
        expect(closeEditReviewerModalSpy).not.toHaveBeenCalled();
        expect(wrapper.vm.isSavingReviewer).toBe(false);
      });

      it('deleteReviewer should call api correctly do not close modal', async () => {
        const reviewerId = '/managed/user/12345';
        const closeEditReviewerModalSpy = jest.spyOn(wrapper.vm, 'closeEditReviewerModal');
        const newReviewers = [
          {
            id: '/managed/role/123456',
            name: 'test',
            permissions: {
              comment: true,
              delegate: true,
              forward: true,
              reassign: true,
              consult: true,
              signoff: true,
              certify: true,
              exception: true,
              revoke: true,
              reset: true,
              save: true,
              removeActor: true,
              accept: true,
              challenge: true,
            },
          },
        ];

        wrapper.vm.deleteReviewer(reviewerId);

        await flushPromises();

        expect(displayNotificationSpy).toHaveBeenCalledWith('success', 'governance.certificationTask.lineItemReviewersModal.removeReviewerSuccessfullyMessage');
        expect(wrapper.vm.currentReviewersSelectedModal).toEqual(newReviewers);
        expect(closeEditReviewerModalSpy).not.toHaveBeenCalled();
        expect(wrapper.vm.isDeletingReviewer).toBe(false);
      });

      it('deleteReviewer should call api correctly close modal', async () => {
        const reviewerId = '/managed/user/12345';
        const closeEditReviewerModalSpy = jest.spyOn(wrapper.vm, 'closeEditReviewerModal');
        const newReviewers = [
          {
            id: '/managed/role/123456',
            name: 'test',
            permissions: {
              comment: true,
              delegate: true,
              forward: true,
              reassign: true,
              consult: true,
              signoff: true,
              certify: true,
              exception: true,
              revoke: true,
              reset: true,
              save: true,
              removeActor: true,
              accept: true,
              challenge: true,
            },
          },
        ];

        wrapper.vm.deleteReviewer(reviewerId, true);

        await flushPromises();

        expect(displayNotificationSpy).toHaveBeenCalledWith('success', 'governance.certificationTask.lineItemReviewersModal.removeReviewerSuccessfullyMessage');
        expect(wrapper.vm.currentReviewersSelectedModal).toEqual(newReviewers);
        expect(closeEditReviewerModalSpy).toHaveBeenCalled();
        expect(wrapper.vm.isDeletingReviewer).toBe(false);
      });

      it('deleteReviewer should call api error', async () => {
        const error = new Error('ERROR');
        CertificationApi.updateLineItemReviewers.mockImplementation(() => Promise.reject(error));
        const reviewerId = '/managed/user/12345';
        const closeEditReviewerModalSpy = jest.spyOn(wrapper.vm, 'closeEditReviewerModal');

        wrapper.vm.deleteReviewer(reviewerId);

        await flushPromises();

        expect(showErrorMessageSpy).toHaveBeenCalledWith(error, 'governance.certificationTask.lineItemReviewersModal.removeReviewerErrorMessage');
        expect(wrapper.vm.currentReviewersSelectedModal).toEqual(reviewers);
        expect(closeEditReviewerModalSpy).not.toHaveBeenCalled();
        expect(wrapper.vm.isDeletingReviewer).toBe(false);
      });

      it('isLastSignOffReviewer false', () => {
        expect(wrapper.vm.isLastSignOffReviewer()).toBe(false);
      });

      it('isLastSignOffReviewer true', () => {
        wrapper.vm.currentReviewersSelectedModal[0].permissions.signoff = false;
        [, wrapper.vm.currentReviewerSelectedModal] = wrapper.vm.currentReviewersSelectedModal;

        expect(wrapper.vm.isLastSignOffReviewer()).toBe(true);
      });

      it('isLastSignOffReviewer false not selected reviewer', () => {
        wrapper.vm.currentReviewersSelectedModal[0].permissions.signoff = false;
        [wrapper.vm.currentReviewerSelectedModal] = wrapper.vm.currentReviewersSelectedModal;

        expect(wrapper.vm.isLastSignOffReviewer()).toBe(false);
      });
    });
  });
});