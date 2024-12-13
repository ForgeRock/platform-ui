/**
 * Copyright (c) 2023-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount, mount, flushPromises } from '@vue/test-utils';
import Notifications from '@kyvg/vue3-notification';
import { findByTestId, createTooltipContainer } from '@forgerock/platform-shared/src/utils/testHelpers';
import { cloneDeep } from 'lodash';
import * as CertificationApi from '@forgerock/platform-shared/src/api/governance/CertificationApi';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import { setupTestPinia } from '../../../../utils/testPiniaHelpers';
import TaskList from './index';

jest.mock('@forgerock/platform-shared/src/api/CdnApi', () => ({
  getApplicationTemplateList: jest.fn().mockResolvedValue({
    consumer: {
      web: {
        '1_0-web': { id: 'web', displayName: 'Web Application', image: 'web.png' },
      },
    },
  }),
}));

jest.mock('@forgerock/platform-shared/src/api/governance/CertificationApi');

let wrapper;
const resourceDataMock = {
  data: {
    result: [],
    totalCount: 2,
  },
};

function shallowMountComponent(data = {}, propsData = {}) {
  wrapper = shallowMount(TaskList, {
    global: {
      mocks: {
        $t: (t) => t,
        $bvModal: {
          show: jest.fn(),
          hide: jest.fn(),
        },
      },
      plugins: [Notifications],
    },
    data() {
      return {
        ...data,
      };
    },
    props: {
      campaignId: 'test-id',
      campaignDetails: {},
      ...propsData,
    },
  });
}

function mountComponent(propOverrides = {}) {
  createTooltipContainer(['btnCertify-test-id-0', 'btnRevoke-test-id-0', 'btnAllowException-test-id-0']);
  setupTestPinia({ user: { userId: 'testId' } });
  wrapper = mount(TaskList, {
    global: {
      attachTo: document.body,
      mocks: {
        $t: (t) => t,
        $bvModal: {
          show: jest.fn(),
          hide: jest.fn(),
        },
      },
      plugins: [Notifications],
      stubs: ['BTooltip'],
      renderStubDefaultSlot: true,
    },
    props: {
      campaignDetails: {},
      ...propOverrides,
    },
  });
}

describe('TaskList', () => {
  beforeEach(() => {
    CertificationApi.getCertificationTasksListByCampaign.mockImplementation(() => Promise.resolve({ data: 'results' }));
    CertificationApi.getCertificationCounts.mockImplementation(() => Promise.resolve({ data: 'results' }));
    CertificationApi.certifyItems.mockImplementation(() => Promise.resolve({ data: 'results' }));
    CertificationApi.revokeItems.mockImplementation(() => Promise.resolve({ data: 'results' }));
    CertificationApi.exceptionItems.mockImplementation(() => Promise.resolve({ data: 'results' }));
    CertificationApi.saveComment.mockImplementation(() => Promise.resolve({}));
    CertificationApi.reassignItem.mockImplementation(() => Promise.resolve({}));
    CertificationApi.updateActors.mockImplementation(() => Promise.resolve({}));
    CertificationApi.getUserDetails.mockImplementation(() => Promise.resolve({ data: { results: [] } }));
    CertificationApi.getUserDetailsByType.mockImplementation(() => Promise.resolve('data'));
    jest.spyOn(CommonsApi, 'getGlossarySchema').mockImplementation(() => Promise.resolve({ data: {} }));
  });

  describe('Account column display', () => {
    beforeEach(() => {
      CertificationApi.getCertificationTasksListByCampaign.mockImplementation(() => Promise.resolve({
        data: {
          result: [
            {
              id: 'testId',
              user: {},
              account: {},
              application: {},
              entitlement: {},
              decision: {
                certification: {},
              },
              permissions: {},
              descriptor: {
                idx: {
                  '/entitlement': {
                    displayName: 'entitlement name',
                  },
                  '/account': {
                    displayName: 'account name',
                  },
                },
              },
            },
          ],
        },
      }));
    });

    it('shows descriptor.idx./account property in table', async () => {
      mountComponent();
      await flushPromises();

      const account = findByTestId(wrapper, 'account-cell');
      expect(account.text()).toBe('account name');
    });

    it('shows descriptor.idx./entitlement property in table', async () => {
      mountComponent({ certificationGrantType: 'entitlements' });
      await flushPromises();

      const entitlement = findByTestId(wrapper, 'entitlement-cell');
      expect(entitlement.text()).toBe('entitlement name');
    });
  });

  describe('paginationChange', () => {
    it('should call getItems with the pagination page', async () => {
      shallowMountComponent();
      const getCertificationTaskListSpy = jest.spyOn(wrapper.vm, 'getItems');
      await flushPromises();
      wrapper.vm.paginationPage = 1;
      wrapper.vm.paginationChange();
      await flushPromises();
      expect(getCertificationTaskListSpy).toBeCalledWith(1);
    });
  });

  describe('openSortModal', () => {
    it('should emit the bv::show::modal to show the certification task sort', () => {
      wrapper.vm.openSortModal();
      expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('certification-account-sort');
    });
  });
  describe('isItemSelected', () => {
    it('should return true if the allSelected variable is true', () => {
      wrapper.vm.allSelected = true;
      const result = wrapper.vm.isItemSelected('test');
      expect(result).toEqual(true);
    });
    it('should return false if the allSelected variable is false and there is no selected tasks', () => {
      wrapper.vm.allSelected = false;
      wrapper.vm.selectedItems = [];
      const result = wrapper.vm.isItemSelected({ id: 'test' });
      expect(result).toEqual(false);
    });
    it('should return true if the task id is selected', () => {
      wrapper.vm.allSelected = false;
      wrapper.vm.selectedItems = [{ id: 'test-id' }];
      const result = wrapper.vm.isItemSelected('test-id');
      expect(result).toEqual(true);
    });
  });
  describe('loadItemsList', () => {
    it('should set the total rows with the total hits', () => {
      wrapper.vm.loadItemsList(resourceDataMock);
      expect(wrapper.vm.totalRows).toEqual(2);
    });
    it('should set the current page with the page param', () => {
      wrapper.vm.loadItemsList(resourceDataMock, 1);
      expect(wrapper.vm.currentPage).toEqual(1);
    });
    it('should set the tasks data with the mapped data with selected property', () => {
      shallowMountComponent();
      wrapper.vm.selectedItems = [{ id: 'test-id' }];
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
        isAcknowledge: false,
        flags: [
          'NEW_ACCESS',
        ],
      }];
      wrapper.vm.loadItemsList(resource, 1);
      expect(wrapper.vm.items).toEqual(expectedValue);
    });
    it('should add flags to item', () => {
      shallowMountComponent({});
      const resource = {
        data: {
          result: [{}],
        },
      };
      wrapper.vm.loadItemsList(resource, 1);
      expect(wrapper.vm.items[0].flags).toEqual(['NEW_ACCESS']);
    });
    it('should emit check-progress if there is a task in status', () => {
      shallowMountComponent();
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
      wrapper.vm.loadItemsList(resource, 1);
      expect(wrapper.emitted()).toHaveProperty('check-progress');
      expect(wrapper.emitted()['check-progress']).toHaveLength(1);
    });
    it('should show noData component when there are no templates', async () => {
      wrapper.vm.loadItemsList({ data: { result: [], totalHits: 0 } }, 0);
      await flushPromises();

      const noData = findByTestId(wrapper, 'cert-task-list-no-data');
      expect(noData.exists()).toBeTruthy();
    });
  });
  describe('getItems', () => {
    let loadItemsListSpy;
    let buildUrlParamsSpy;

    beforeEach(() => {
      shallowMountComponent({
        currentPage: 2,
        sortBy: 'name',
        sortDir: 'asc',
      });
      loadItemsListSpy = jest.spyOn(wrapper.vm, 'loadItemsList');
      buildUrlParamsSpy = jest.spyOn(wrapper.vm, 'buildUrlParams');
      CertificationApi.getCertificationTasksListByCampaign.mockImplementation(() => Promise.resolve({ data: 'results' }));
      CertificationApi.getCertificationCounts.mockImplementation(() => Promise.resolve({ data: 'results' }));
    });
    it('should call loadItemsList once the result of the call is ready', async () => {
      wrapper.vm.getItems(2);

      await flushPromises();
      expect(loadItemsListSpy).toHaveBeenCalled();
    });
    it('should call buildUrlParams with the required params', () => {
      wrapper.vm.getItems(2);
      expect(buildUrlParamsSpy).toHaveBeenCalledWith(2, 'name', 'asc');
    });
    it('should call getCertificationTasksListByCampaign with the required params', () => {
      wrapper.vm.getItems(2);
      expect(CertificationApi.getCertificationTasksListByCampaign).toHaveBeenCalled();
    });
  });
  describe('buildUrlParams', () => {
    it('should return the urlParams according to the params', () => {
      wrapper.vm.pageSize = 10;
      shallowMountComponent();
      const expectedValue = {
        appendUserPermissions: true,
        pageSize: 10,
        pageNumber: 2,
        sortBy: 'name',
        sortDir: 'asc',
        taskStatus: 'active',
      };
      const result = wrapper.vm.buildUrlParams(3, 'name', 'asc');
      expect(result).toStrictEqual(expectedValue);
    });
    it('should return the urlParams according to the params when isAdmin', async () => {
      wrapper.vm.pageSize = 10;
      shallowMountComponent();
      const expectedValue = {
        appendUserPermissions: true,
        pageSize: 10,
        pageNumber: 2,
        sortBy: 'name',
        sortDir: 'asc',
        isAdmin: true,
        actorId: '123',
        taskStatus: 'active',
      };
      await wrapper.setProps({
        isAdmin: true,
        actorId: '123',
      });
      const result = wrapper.vm.buildUrlParams(3, 'name', 'asc');
      expect(result).toStrictEqual(expectedValue);
    });
    it('should not return task status if task status is staging', async () => {
      wrapper.vm.pageSize = 10;
      shallowMountComponent();
      const expectedValue = {
        appendUserPermissions: true,
        pageSize: 10,
        pageNumber: 2,
        sortBy: 'name',
        sortDir: 'asc',
        isAdmin: true,
        actorId: '123',
      };
      await wrapper.setProps({
        isAdmin: true,
        actorId: '123',
        taskStatus: 'staging',
      });
      const result = wrapper.vm.buildUrlParams(3, 'name', 'asc');
      expect(result).toStrictEqual(expectedValue);
    });
  });
  describe('getBaseFilters', () => {
    it('should return the base filters to load the list', () => {
      shallowMountComponent();
      const expectedValue = [{
        operator: 'EQUALS',
        operand: {
          targetName: 'decision.certification.actors.id',
          targetValue: '',
        },
      }];
      const result = wrapper.vm.getBaseFilters();
      expect(result).toStrictEqual(expectedValue);
    });
  });
  describe('buildBodyParams', () => {
    describe('admin', () => {
      it('should return the base filters to load the list when there is no filters', async () => {
        shallowMountComponent();
        await wrapper.setProps({ isAdmin: true });
        const expectedValue = {
          targetFilter: {
            operator: 'AND',
            operand: [{
              operand: {
                targetName: 'decision.certification.primaryReviewer.id',
                targetValue: '',
              },
              operator: 'EQUALS',
            }],
          },
        };
        const result = wrapper.vm.buildBodyParams();
        expect(result).toStrictEqual(expectedValue);
      });

      it('should return the base filters to load the list when there are filters', async () => {
        shallowMountComponent();
        await wrapper.setProps({ isAdmin: true });
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

    describe('enduser', () => {
      it('should return the base filters to load the list when there is no filters', () => {
        shallowMountComponent();
        const expectedValue = {
          targetFilter: {
            operator: 'AND',
            operand: [{
              operand: {
                targetName: 'decision.certification.actors.id',
                targetValue: '',
              },
              operator: 'EQUALS',
            }],
          },
        };
        const result = wrapper.vm.buildBodyParams();
        expect(result).toStrictEqual(expectedValue);
      });

      it('should return the base filters to load the list when there are filters', () => {
        shallowMountComponent();
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
                  targetName: 'decision.certification.actors.id',
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
      wrapper.vm.items = resource;
      wrapper.vm.selectTasks(true);
      expect(wrapper.vm.items).toStrictEqual(expectedValue);
    });
    it('should return the correct selected values, even if there are duplicated tasks', () => {
      wrapper.vm.selectedItems = [...resource, {
        id: 'test-id',
      }];
      wrapper.vm.selectTasks(true);
      expect(wrapper.vm.selectedItems.length).toEqual(2);
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
      wrapper.vm.items = resource;
      wrapper.vm.selectTasks(false);
      expect(wrapper.vm.items).toStrictEqual(expectedValue);
    });
  });
  describe('updateItemList', () => {
    it('should call display notification with the success message', () => {
      const displayNotificationSpy = jest.spyOn(wrapper.vm, 'displayNotification');
      wrapper.vm.updateItemList();
      expect(displayNotificationSpy).toBeCalledWith('success', 'governance.certificationTask.success.undefined');
    });
    it('should set the selected task to empty', () => {
      wrapper.vm.updateItemList();
      expect(wrapper.vm.selectedItems).toEqual([]);
    });
    it('should call getCertificationTaskList with the main page', () => {
      shallowMountComponent();
      const getCertificationTaskListSpy = jest.spyOn(wrapper.vm, 'getItems');
      wrapper.vm.mainPageNumber = 1;
      wrapper.vm.updateItemList();
      expect(getCertificationTaskListSpy).toBeCalledWith(1);
    });
  });
  describe('filterItems', () => {
    it('should call getCertificationTaskList with the paginationPage', () => {
      shallowMountComponent();
      const getCertificationTaskListSpy = jest.spyOn(wrapper.vm, 'getItems');
      wrapper.vm.paginationPage = 1;
      wrapper.vm.filterItems({ decision: ['noDecision'] });
      expect(getCertificationTaskListSpy).toBeCalledWith(1);
    });
    it('listFilters should contain the new filters', () => {
      shallowMountComponent();
      const filterTest = {
        decision: ['certify'],
      };
      wrapper.vm.filterItems(filterTest);
      expect(wrapper.vm.listFilters).toEqual({ ...filterTest });
    });
  });

  describe('bulk certify', () => {
    beforeEach(() => {
      shallowMountComponent({}, { campaignId: 'test-id' });
      CertificationApi.certifyItems.mockImplementation(() => Promise.resolve({ data: 'results' }));
    });
    it('should toggle the saving status to add a loader in the header', () => {
      wrapper.vm.bulkCertify();
      expect(wrapper.emitted()).toHaveProperty('change-saving');
      expect(wrapper.emitted()['change-saving']).toHaveLength(1);
    });
    it('should call updateItemList after the certification is completed', async () => {
      const updateItemListSpy = jest.spyOn(wrapper.vm, 'updateItemList');
      wrapper.vm.bulkCertify();

      await flushPromises();
      expect(updateItemListSpy).toHaveBeenCalledWith('certifySuccess');
    });
  });
  describe('bulk revoke', () => {
    beforeEach(() => {
      shallowMountComponent({}, { campaignId: 'test-id' });
      CertificationApi.revokeItems.mockImplementation(() => Promise.resolve({ data: 'results' }));
    });
    it('should toggle the saving status to add a loader in the header', () => {
      wrapper.vm.bulkRevoke();
      expect(wrapper.emitted()).toHaveProperty('change-saving');
      expect(wrapper.emitted()['change-saving']).toHaveLength(1);
    });
    it('should call updateItemList after the certification is completed', async () => {
      const updateItemListSpy = jest.spyOn(wrapper.vm, 'updateItemList');
      wrapper.vm.bulkRevoke('comments');

      await flushPromises();
      expect(updateItemListSpy).toHaveBeenCalledWith('revokeSuccess');
    });
  });
  describe('bulk exception', () => {
    beforeEach(() => {
      shallowMountComponent({}, { campaignId: 'test-id' });
      CertificationApi.exceptionItem.mockImplementation(() => Promise.resolve({ data: 'results' }));
    });
    it('should toggle the saving status to add a loader in the header', () => {
      wrapper.vm.bulkException();
      expect(wrapper.emitted()).toHaveProperty('change-saving');
      expect(wrapper.emitted()['change-saving']).toHaveLength(1);
    });
    it('should call updateItemList after exception is complete', async () => {
      const updateItemListSpy = jest.spyOn(wrapper.vm, 'updateItemList');
      wrapper.vm.bulkException('comments');

      await flushPromises();
      expect(updateItemListSpy).toHaveBeenCalledWith('allowExceptionSuccess');
    });
  });
  describe('open confirm action modal', () => {
    it('should set the modal props correctly', () => {
      const expectedValue = {
        confirmDescription: undefined,
        confirmTitle: undefined,
        title: 'title',
        initialStep: 'DETAILS',
        description: 'description',
        placeHolder: 'placeHolder',
        requireJustification: false,
        okLabel: 'okLabel',
        okFunction: () => {},
      };
      wrapper.vm.openActionConfirmModal(expectedValue);
      expect(wrapper.vm.confirmActionModalProps).toEqual(expectedValue);
    });
    it('should emit event to show confirm action modal', () => {
      wrapper.vm.openActionConfirmModal({});
      expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('certification-account-confirm-action');
    });
  });

  describe(('Role based grants'), () => {
    const nonRoleBased = {
      data: {
        result: [
          {
            id: 'testId',
            user: {},
            account: {},
            application: {},
            entitlement: {},
            permissions: {
              certify: true,
              revoke: true,
              exception: true,
            },
            decision: {
              certification: {},
            },
            descriptor: {
              idx: {
                '/entitlement': {
                  displayName: 'entitlement name',
                },
                '/account': {
                  displayName: 'account name',
                },
              },
            },
          },
        ],
      },
    };

    const roleBased = cloneDeep(nonRoleBased);
    roleBased.data.result[0].relationship = {
      properties: {
        grantTypes: [
          {
            grantType: 'role',
          },
        ],
      },
    };

    beforeEach(() => {
      CertificationApi.getCertificationCounts.mockImplementation(() => Promise.resolve({ data: 'results' }));
    });
    it('shows revoke for non-role based', async () => {
      CertificationApi.getCertificationTasksListByCampaign.mockImplementation(() => Promise.resolve(nonRoleBased));
      mountComponent();
      await flushPromises();
      const revoke = findByTestId(wrapper, 'btnRevoke-testId');
      expect(revoke.exists()).toBe(true);
    });

    it('hides revoke action for role based', async () => {
      CertificationApi.getCertificationTasksListByCampaign.mockImplementation(() => Promise.resolve(roleBased));
      mountComponent();
      await flushPromises();
      const revoke = findByTestId(wrapper, 'btnRevoke-testId');
      expect(revoke.exists()).toBe(false);
    });

    it('shows exception for non-role based', async () => {
      CertificationApi.getCertificationTasksListByCampaign.mockImplementation(() => Promise.resolve(nonRoleBased));
      mountComponent({ campaignDetails: { exceptionDuration: 1 } });
      await flushPromises();
      const exception = findByTestId(wrapper, 'btnAllowException-testId');
      expect(exception.exists()).toBe(true);
    });

    it('hides exception action for role based', async () => {
      CertificationApi.getCertificationTasksListByCampaign.mockImplementation(() => Promise.resolve(roleBased));
      mountComponent({ campaignDetails: { exceptionDuration: 1 } });
      await flushPromises();
      const exception = findByTestId(wrapper, 'btnAllowException-testId');
      expect(exception.exists()).toBe(false);
    });

    it('hides multiselect option', async () => {
      CertificationApi.getCertificationTasksListByCampaign.mockImplementation(() => Promise.resolve(roleBased));
      mountComponent();
      await flushPromises();
      const revoke = findByTestId(wrapper, 'multiselect-testId');
      expect(revoke.exists()).toBe(false);
    });

    it('changes tooltip text from certify to acknowledge', async () => {
      CertificationApi.getCertificationTasksListByCampaign.mockImplementation(() => Promise.resolve(roleBased));
      mountComponent();
      await flushPromises();

      const revoke = findByTestId(wrapper, 'tooltip-certify-testId');
      expect(revoke.exists()).toBe(true);
      expect(revoke.text()).toBe('governance.certificationTask.actions.acknowledge');
    });
  });

  describe('line item details', () => {
    jest.spyOn(CommonsApi, 'getGlossarySchema').mockReturnValue(Promise.resolve({ data: { result: [] } }));
    let showErrorMessageSpy;
    beforeEach(() => {
      shallowMountComponent();
      showErrorMessageSpy = jest.spyOn(wrapper.vm, 'showErrorMessage');
    });

    it('openUserModal called saves currentUserSelectedModal data and shows GovernanceUserDetailsModal', async () => {
      const id = 'id-test';
      const user = {
        givenName: 'Test',
        sn: 'Test',
      };

      CertificationApi.getUserDetails.mockImplementation(() => Promise.resolve({ data: user }));
      wrapper.vm.openUserModal(id);
      await flushPromises();

      expect(wrapper.vm.currentUserSelectedModal).toEqual(user);
      expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('GovernanceUserDetailsModal');
    });

    it('openUserModal called saves currentUserSelectedModal and it must not match the user if it has a property that is not allowed.', async () => {
      const id = 'id-test';
      const user = {
        password: 'test-password',
        givenName: 'Test',
        sn: 'Test',
      };

      CertificationApi.getUserDetails.mockImplementation(() => Promise.resolve({ data: user }));
      wrapper.vm.openUserModal(id);
      await flushPromises();

      expect(wrapper.vm.currentUserSelectedModal).not.toEqual(user);
    });

    it('getUserDetails should show error message if api returns error', async () => {
      const error = new Error('ERROR');
      const id = 'id-test';
      CertificationApi.getUserDetails.mockImplementation(() => Promise.reject(error));

      wrapper.vm.openUserModal(id);
      await flushPromises();

      expect(showErrorMessageSpy).toHaveBeenCalledWith(error, 'governance.certificationTask.error.getUserError');
    });

    it('openApplicationModal sets application data and opens application modal', async () => {
      const application = {
        id: '4ab37e2f-9470-45f6-85dd-f8a7b095e0d4',
        name: 'TestADApp',
      };

      const applicationOwners = [{
        id: '44a33897-8647-419d-8148-31defab70467',
        userName: 'igaadmin',
      }];

      await wrapper.vm.openApplicationModal(application, applicationOwners, { test1: 'test1' });
      await flushPromises();

      expect(wrapper.vm.currentApplicationSelectedModal).toEqual({
        ...application,
        applicationOwners,
        glossary: { test1: 'test1' },
      });
      expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('CertificationTaskApplicationModal');
    });

    it('openAccountModal sets account data and opens account modal', async () => {
      const content = {
        account: {
          id: 'test',
          displayName: 'Dani Morales',
        },
        item: {
          decision: {
            certification: {
              decision: 'certify',
              decisionDate: '2023-02-28T15:12:25+00:00',
              decisionBy: {
                givenName: 'Foo',
                id: 'managed/user/1',
                mail: 'foo@test.com',
                sn: 'Test',
                userName: 'FooTest',
              },
            },
          },
        },
        relationship: {},
      };

      wrapper.vm.openAccountModal(content);
      await flushPromises();

      expect(wrapper.vm.currentAccountSelectedModal).toEqual({
        ...content,
      });
      expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('CertificationTaskAccountModal');
    });

    it('openViewCommentsModal sets comment data and opens view comments modal', async () => {
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

      wrapper.vm.openViewCommentsModal(comments, { id: lineItemId });
      await flushPromises();

      expect(wrapper.vm.currentCommentsSelectedModal).toEqual(comments);
      expect(wrapper.vm.currentLineItemIdSelectedModal).toBe(lineItemId);
      expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('certification-account-view-comments');
    });

    it('openAddCommentModalFromCommentsModal hides the view comments modal and opens the add comment modal', async () => {
      wrapper.vm.openAddCommentModalFromCommentsModal();

      await flushPromises();

      expect(wrapper.vm.$bvModal.hide).toHaveBeenCalledWith('certification-account-view-comments');
      expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('certification-account-add-comment');
    });

    it('openAddCommentModal sets the line item id and opens the add comment modal', async () => {
      const lineItemId = '4ab37e2f-9470-45f6-85dd-f8a7b095e0d4';

      wrapper.vm.openAddCommentModal(lineItemId);
      await flushPromises();

      expect(wrapper.vm.currentLineItemIdSelectedModal).toBe(lineItemId);
      expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('certification-account-add-comment');
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
      wrapper.vm.items = [task];
      const spyNotification = jest.spyOn(wrapper.vm, 'displayNotification');

      wrapper.vm.addComment(comment);

      await flushPromises();

      expect(spyNotification).toHaveBeenCalledWith('success', 'governance.certificationTask.lineItemAddCommentModal.addCommentSuccessfullyMessage');
      expect(wrapper.vm.currentCommentsSelectedModal).toEqual(task.decision.certification.comments);
      expect(wrapper.vm.$bvModal.hide).toHaveBeenCalledWith('certification-account-add-comment');
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
      wrapper.vm.items = [task];
      CertificationApi.saveComment.mockImplementation(() => Promise.reject(error));
      const spyNotification = jest.spyOn(wrapper.vm, 'showErrorMessage');

      wrapper.vm.addComment(comment);

      await flushPromises();

      expect(spyNotification).toHaveBeenCalledWith(error, 'governance.certificationTask.error.addCommentErrorDefaultMessage');
    });

    it('openReviewersModal sets reviewer data and opens view reviewers modal', async () => {
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

      expect(wrapper.vm.$bvModal.show).not.toHaveBeenCalledWith('certification-account-view-reviewers');

      wrapper.vm.openReviewersModal(item);

      await flushPromises();

      expect(wrapper.vm.currentLineItemIdSelectedModal).toBe(id);
      expect(wrapper.vm.currentReviewersSelectedModal).toEqual(actors);
      expect(wrapper.vm.currentLineItemReassignPermission).toBe(reassign);
      expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('certification-account-view-reviewers');
    });

    it('closeEditReviewerModal should close edit reviewer modal and open view reviewers modal', async () => {
      expect(wrapper.vm.$bvModal.hide).not.toHaveBeenCalledWith('CertificationTaskEditReviewerModal');
      expect(wrapper.vm.$bvModal.show).not.toHaveBeenCalledWith('CertificationTaskReviewersModal');

      wrapper.vm.closeEditReviewerModal();

      await flushPromises();

      expect(wrapper.vm.$bvModal.hide).toHaveBeenCalledWith('certification-account-edit-reviewers');
      expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('certification-account-view-reviewers');
      expect(wrapper.vm.currentReviewerSelectedModal).toBeNull();
      expect(wrapper.vm.currentUserPermissions).toEqual({});
    });

    describe('edit reviewer', () => {
      let permissions;
      let reviewers;
      let displayNotificationSpy;

      beforeEach(() => {
        CertificationApi.reassignItem.mockImplementation(() => Promise.resolve());
        CertificationApi.updateActors.mockImplementation(() => Promise.resolve());
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

      it('editReviewer should show error when the user is already a reviewer', async () => {
        const reviewerId = '/managed/user/12345';
        const newReviewer = {
          id: '/managed/user/12345',
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
        const closeEditReviewerModalSpy = jest.spyOn(wrapper.vm, 'closeEditReviewerModal');

        wrapper.vm.editReviewer(reviewerId, permissions, newReviewer);

        await flushPromises();

        expect(showErrorMessageSpy).toHaveBeenCalledWith('error', 'governance.certificationTask.lineItemReviewersModal.editReviewerUserExistsErrorMessage');
        expect(wrapper.vm.currentReviewersSelectedModal).toEqual(reviewers);
        expect(closeEditReviewerModalSpy).not.toHaveBeenCalled();
        expect(wrapper.vm.isSavingReviewer).toBe(false);
      });

      it('editReviewer should call api error', async () => {
        const error = new Error('ERROR');
        CertificationApi.reassignItem.mockImplementation(() => Promise.reject(error));

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

      it('deleteReviewer should call api correctly and not close modal', async () => {
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

      it('deleteReviewer should call api correctly and close modal', async () => {
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
        CertificationApi.updateActors.mockImplementation(() => Promise.reject(error));
        const reviewerId = '/managed/user/12345';
        const closeEditReviewerModalSpy = jest.spyOn(wrapper.vm, 'closeEditReviewerModal');

        wrapper.vm.deleteReviewer(reviewerId);

        await flushPromises();

        expect(showErrorMessageSpy).toHaveBeenCalledWith(error, 'governance.certificationTask.lineItemReviewersModal.removeReviewerErrorMessage');
        expect(wrapper.vm.currentReviewersSelectedModal).toEqual(reviewers);
        expect(closeEditReviewerModalSpy).not.toHaveBeenCalled();
        expect(wrapper.vm.isDeletingReviewer).toBe(false);
      });

      it('isLastSignOffReviewer true', () => {
        expect(wrapper.vm.isLastSignOffReviewer()).toBe(false);
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

    it('openEntitlementModal should set entitlement data and open entitlement modal', async () => {
      CertificationApi.getEntitlementDetails.mockImplementation(() => Promise.resolve({
        data: {
          name: 'test',
        },
      }));
      const lineItem = {
        id: '9986d9a5-5ffd-4046-8643-c34a60cddb6e',
        application: {
          templateName: 'salesforce',
        },
        entitlement: { name: 'test' },
        entitlementOwner: { userName: 'mikeTest' },
        glossary: { test1: 'test1' },
      };

      wrapper.vm.openEntitlementModal(lineItem);

      await flushPromises();

      expect(wrapper.vm.currentEntitlementSelected).toEqual({
        name: 'test',
        entitlementOwner: { userName: 'mikeTest' },
        glossary: { test1: 'test1' },
      });
      expect(wrapper.vm.currentApplicationSelectedModal).toEqual(lineItem.application);
      expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('certification-account-entitlement');
    });
  });

  describe('Open edit reviewer modal', () => {
    describe('Admin view', () => {
      beforeEach(() => {
        shallowMountComponent({}, { isAdmin: true });
      });

      it('openEditReviewerModal should set reviewer data and open edit reviewer modal', async () => {
        const reviewers = [
          {
            id: '/managed/user/12345',
            givenName: 'test',
            permissions: {
              certify: true,
              comment: true,
              exception: true,
              forward: false,
              reassign: false,
              reset: true,
              revoke: true,
              signoff: false,
            },
          },
          {
            id: '/managed/rolw/12345',
            name: 'test',
            permissions: {
              certify: true,
              comment: false,
              exception: true,
              forward: true,
              reassign: true,
              reset: true,
              revoke: true,
              signoff: true,
            },
          },
        ];
        const reviewer = {
          id: '/managed/user/12345',
          givenName: 'test',
        };

        expect(wrapper.vm.$bvModal.hide).not.toHaveBeenCalledWith('CertificationTaskReviewersModal');
        expect(wrapper.vm.$bvModal.show).not.toHaveBeenCalledWith('CertificationTaskEditReviewerModal');

        wrapper.vm.currentReviewersSelectedModal = reviewers;
        wrapper.vm.openEditReviewerModal(reviewer);

        await flushPromises();

        expect(wrapper.vm.currentReviewerSelectedModal).toEqual(reviewer);
        expect(wrapper.vm.currentUserPermissions).toEqual({
          certify: true,
          comment: true,
          exception: true,
          forward: true,
          reassign: true,
          reset: true,
          revoke: true,
          signoff: true,
        });
        expect(wrapper.vm.$bvModal.hide).toHaveBeenCalledWith('certification-account-view-reviewers');
        expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('certification-account-edit-reviewers');
      });
    });

    describe('EndUser view', () => {
      beforeEach(() => {
        shallowMountComponent({}, { actorId: '/managed/user/12345' });
      });

      it('openEditReviewerModal should set reviewer data and open edit reviewer modal', async () => {
        const reviewers = [
          {
            id: '/managed/user/12345',
            givenName: 'test',
            permissions: {
              certify: true,
              comment: true,
              exception: true,
              forward: false,
              reassign: false,
              reset: true,
              revoke: true,
              signoff: false,
            },
          },
          {
            id: '/managed/rolw/12345',
            name: 'test',
            permissions: {
              certify: true,
              comment: false,
              exception: true,
              forward: true,
              reassign: true,
              reset: true,
              revoke: true,
              signoff: true,
            },
          },
        ];
        const reviewer = {
          id: '/managed/user/12345',
          givenName: 'test',
        };

        expect(wrapper.vm.$bvModal.hide).not.toHaveBeenCalledWith('CertificationTaskReviewersModal');
        expect(wrapper.vm.$bvModal.show).not.toHaveBeenCalledWith('CertificationTaskEditReviewerModal');

        wrapper.vm.currentReviewersSelectedModal = reviewers;
        wrapper.vm.openEditReviewerModal(reviewer);

        await flushPromises();

        expect(wrapper.vm.currentReviewerSelectedModal).toEqual(reviewer);
        expect(wrapper.vm.currentUserPermissions).toEqual({
          certify: true,
          comment: true,
          exception: true,
          forward: false,
          reassign: false,
          reset: true,
          revoke: true,
          signoff: false,
        });
        expect(wrapper.vm.$bvModal.hide).toHaveBeenCalledWith('certification-account-view-reviewers');
        expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('certification-account-edit-reviewers');
      });
    });
  });

  describe('Entitlements tab', () => {
    let loadItemsListSpy;

    beforeEach(() => {
      wrapper.vm.currentPage = 2;
      wrapper.vm.sortBy = 'name';
      wrapper.vm.sortDir = 'asc';
      shallowMountComponent({}, {
        certificationGrantType: 'entitlements', showGroupBy: false, entitlementUserId: null, modalPrefix: 'entitlement',
      });
      loadItemsListSpy = jest.spyOn(wrapper.vm, 'loadItemsList');
      CertificationApi.getCertificationTasksListByCampaign.mockImplementation(() => Promise.resolve({ data: 'results' }));
      CertificationApi.getCertificationCounts.mockImplementation(() => Promise.resolve({ data: 'results' }));
    });
    it('should call loadItemsList once the result of the call is ready', async () => {
      wrapper.vm.getItems(2);

      await flushPromises();
      expect(loadItemsListSpy).toHaveBeenCalled();
    });
    it('should show the right columns for entilements tab', () => {
      expect(wrapper.vm.certificationListColumns).toEqual([{
        key: 'user', category: 'user', label: 'governance.certificationTask.user', sortable: true, class: 'text-truncate fr-access-cell', show: true,
      }, {
        key: 'application', category: 'application', label: 'governance.certificationTask.application', sortable: true, class: 'text-truncate fr-access-cell', show: true,
      }, {
        key: 'entitlement', category: 'entitlement', label: 'governance.certificationTask.entitlement', sortable: false, class: 'text-truncate fr-access-cell', show: true,
      }, {
        key: 'account', category: 'account', label: 'governance.certificationTask.account', sortable: false, class: 'text-truncate fr-access-cell', show: true,
      }, {
        key: 'flags', category: 'review', label: 'governance.certificationTask.flags', sortable: false, class: 'w-175px text-truncate fr-access-cell', show: true,
      }, {
        key: 'comments', category: 'review', label: 'governance.certificationTask.comments', sortable: false, class: 'w-140px fr-access-cell', show: true,
      }, {
        key: 'actions', class: 'w-200px cert-actions border-left fr-access-cell', label: '', sortable: false, show: true,
      }]);
    });
    it('openAddCommentModalFromCommentsModal called hides CertificationTaskCommentsModal and shows CertificationTaskAddCommentModal', async () => {
      wrapper.vm.openAddCommentModalFromCommentsModal();

      await flushPromises();

      expect(wrapper.vm.$bvModal.hide).toHaveBeenCalledWith('certification-entitlement-view-comments');
      expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('certification-entitlement-add-comment');
    });

    it('openAddCommentModal called saves currentLineItemIdSelectedModal data and shows CertificationTaskAddCommentModal', async () => {
      const lineItemId = '4ab37e2f-9470-45f6-85dd-f8a7b095e0d4';

      wrapper.vm.openAddCommentModal(lineItemId);
      await flushPromises();

      expect(wrapper.vm.currentLineItemIdSelectedModal).toBe(lineItemId);
      expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('certification-entitlement-add-comment');
    });
    it('openEntitlementModal should open entitlement modal with data setted', async () => {
      CertificationApi.getEntitlementDetails.mockImplementation(() => Promise.resolve({
        data: {
          name: 'test',
        },
      }));
      const lineItem = {
        id: '9986d9a5-5ffd-4046-8643-c34a60cddb6e',
        application: {
          templateName: 'salesforce',
        },
        entitlement: { name: 'test' },
        entitlementOwner: { userName: 'mikeTest' },
        glossary: { test1: 'test1' },
      };

      wrapper.vm.openEntitlementModal(lineItem);

      await flushPromises();

      expect(wrapper.vm.currentEntitlementSelected).toEqual({
        name: 'test',
        entitlementOwner: { userName: 'mikeTest' },
        glossary: { test1: 'test1' },
      });
      expect(wrapper.vm.currentApplicationSelectedModal).toEqual(lineItem.application);
      expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('certification-entitlement-entitlement');
    });
    it('openViewCommentsModal called saves currentCommentsSelectedModal, currentLineItemIdSelectedModal data and shows CertificationTaskCommentsModal', async () => {
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

      wrapper.vm.openViewCommentsModal(comments, { id: lineItemId });
      await flushPromises();

      expect(wrapper.vm.currentCommentsSelectedModal).toEqual(comments);
      expect(wrapper.vm.currentLineItemIdSelectedModal).toBe(lineItemId);
      expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('certification-entitlement-view-comments');
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
      wrapper.vm.openReviewersModal(item);

      await flushPromises();

      expect(wrapper.vm.currentLineItemIdSelectedModal).toBe(id);
      expect(wrapper.vm.currentReviewersSelectedModal).toEqual(actors);
      expect(wrapper.vm.currentLineItemReassignPermission).toBe(reassign);
      expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('certification-entitlement-view-reviewers');
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

      expect(wrapper.vm.$bvModal.hide).not.toHaveBeenCalledWith('CertificationTaskReviewersModal');
      expect(wrapper.vm.$bvModal.show).not.toHaveBeenCalledWith('CertificationTaskEditReviewerModal');

      wrapper.vm.currentReviewersSelectedModal = reviewers;
      wrapper.vm.openEditReviewerModal(reviewer);

      await flushPromises();

      expect(wrapper.vm.currentReviewerSelectedModal).toEqual(reviewer);
      expect(wrapper.vm.$bvModal.hide).toHaveBeenCalledWith('certification-entitlement-view-reviewers');
      expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('certification-entitlement-edit-reviewers');
    });

    it('closeEditReviewerModal should close edit reviewer modal and open reviewers modal', async () => {
      expect(wrapper.vm.$bvModal.hide).not.toHaveBeenCalledWith('CertificationTaskEditReviewerModal');
      expect(wrapper.vm.$bvModal.show).not.toHaveBeenCalledWith('CertificationTaskReviewersModal');

      wrapper.vm.closeEditReviewerModal();

      await flushPromises();

      expect(wrapper.vm.$bvModal.hide).toHaveBeenCalledWith('certification-entitlement-edit-reviewers');
      expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('certification-entitlement-view-reviewers');
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
      wrapper.vm.items = [task];
      wrapper.vm.getItems = jest.fn().mockImplementation(() => Promise.resolve({}));
      const spyNotification = jest.spyOn(wrapper.vm, 'displayNotification');

      wrapper.vm.addComment(comment);

      await flushPromises();

      expect(spyNotification).toHaveBeenCalledWith('success', 'governance.certificationTask.lineItemAddCommentModal.addCommentSuccessfullyMessage');
      expect(wrapper.vm.currentCommentsSelectedModal).toEqual(task.decision.certification.comments);
      expect(wrapper.vm.$bvModal.hide).toHaveBeenCalledWith('certification-entitlement-add-comment');
    });
    it('should emit the bv::show::modal to show the certification task sort', () => {
      wrapper.vm.openSortModal();
      expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('certification-entitlement-sort');
    });
    it('should emit the bv::show::modal to show the certification reasign modal', async () => {
      mountComponent({ modalPrefix: 'entitlement' });
      wrapper.vm.selectedItems = [{ id: '123' }];
      await flushPromises();
      const floatingActionBar = wrapper.findComponent('[name="slide-fade"]');
      floatingActionBar.vm.$emit('reassign');
      expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('certification-entitlement-reassign');
    });
    it('should emit the bv::show::modal to show the certification reasign modal', () => {
      wrapper.vm.openActionConfirmModal({});
      expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('certification-entitlement-confirm-action');
    });
  });

  describe('Scenarios For Accounts Tab when group by is true', () => {
    beforeEach(() => {
      shallowMountComponent({}, {
        certificationGrantType: 'accounts', showGroupBy: true, entitlementUserId: null, isAdmin: true,
      });
      CertificationApi.getCertificationTasksListByCampaign.mockImplementation(() => Promise.resolve({ data: 'results' }));
      CertificationApi.getCertificationCounts.mockImplementation(() => Promise.resolve({ data: 'results' }));
    });
    it('should display correct account columns', async () => {
      expect(wrapper.vm.certificationListColumns).toEqual([{
        key: 'user', category: 'user', label: 'governance.certificationTask.user', sortable: true, class: 'text-truncate fr-access-cell', show: true,
      }, {
        key: 'application', category: 'application', label: 'governance.certificationTask.application', sortable: true, class: 'text-truncate fr-access-cell', show: true,
      }, {
        key: 'account', category: 'account', label: 'governance.certificationTask.account', sortable: false, class: 'text-truncate fr-access-cell', show: true,
      }, {
        key: 'flags', category: 'review', label: 'governance.certificationTask.flags', sortable: false, class: 'w-175px text-truncate fr-access-cell', show: true,
      }, {
        key: 'comments', category: 'review', label: 'governance.certificationTask.comments', sortable: false, class: 'w-140px fr-access-cell', show: true,
      }, {
        key: 'actions', class: 'w-230px cert-actions border-left fr-access-cell', label: '', sortable: false, show: true,
      }]);
    });
    it('should have selectable as true', async () => {
      expect(wrapper.vm.isSelectable).toEqual(true);
    });
    it('should clear row selection on filter', async () => {
      const filters = {
        decision: [
          'revoke',
          'exception',
          'noDecision',
        ],
      };
      wrapper.vm.filterItems(filters);
      await flushPromises();
      expect(wrapper.emitted()['clear-item']).toBeTruthy();
    });
    it('should clear row selection on page change', async () => {
      wrapper.vm.paginationChange();
      await flushPromises();
      expect(wrapper.emitted()['clear-item']).toBeTruthy();
    });
    it('should hide group by when accounts count is zero', () => {
      const accountDataMock = {
        data: {
          result: [],
          totalCount: 0,
        },
      };
      wrapper.vm.loadItemsList(accountDataMock, 1);
      expect(wrapper.emitted()).toHaveProperty('hide-group-by');
      expect(wrapper.emitted()['hide-group-by']).toHaveLength(1);
    });
    it('should have the right base filter for account', () => {
      const baseFilters = wrapper.vm.getBaseFilters();
      expect(baseFilters).toEqual([
        {
          operand: { targetName: 'decision.certification.primaryReviewer.id', targetValue: '' },
          operator: 'EQUALS',
        },
        { operand: { targetName: 'item.type', targetValue: 'accountGrant' }, operator: 'EQUALS' }]);
    });
    it('should raise select item event on row select', () => {
      const items = [
        {
          id: 'ebf15835-d35c-4268-bac3-a6ec59302246',
        },
      ];
      wrapper.vm.items = items;
      wrapper.vm.onRowSelected(items);
      expect(wrapper.emitted()).toHaveProperty('select-item');
      expect(wrapper.emitted()['select-item']).toHaveLength(1);
      expect(wrapper.emitted()['select-item'][0]).toEqual([items[0]]);
    });
    it('should raise activity modal event with right modal id', () => {
      const item = {
        decision: {
          certification: {
            comments: ['test'],
          },
        },
      };
      wrapper.vm.openActivityModal(item);
      expect(wrapper.vm.$bvModal.show).toBeCalledWith('certification-account-activity');
    });
    it('should raise activity modal event with right modal id and set the right activity items', () => {
      const item = {
        decision: {
          certification: {
            comments: [{
              action: 'comment',
              comment: 'test comment',
            },
            {
              action: 'exception',
              comment: 'exception comment',
            }],
          },
        },
      };
      wrapper.vm.openActivityModal(item);
      expect(wrapper.vm.currentLineItemActivity).toEqual([
        {
          action: 'comment',
          comment: 'test comment',
        },
        {
          action: 'exception',
          comment: 'exception comment',
        },
      ]);
    });
    it('should raise forward modal event with right modal id', () => {
      wrapper.vm.openForwardModal('1234', true);
      expect(wrapper.vm.$bvModal.show).toBeCalledWith('certification-account-forward');
    });
  });

  describe('Scenarios For Entitlements Tab when group by is true', () => {
    let getCertificationTasksListByCampaignSpy;
    beforeEach(() => {
      shallowMountComponent({}, {
        certificationGrantType: 'entitlements',
        showGroupBy: true,
        entitlementUserId: '66f3b405-60db-42a6-8a7a-59f6470348f6',
        isAdmin: true,
        refreshTasks: true,
        modalPrefix: 'entitlement',
      });
      getCertificationTasksListByCampaignSpy = jest.fn().mockImplementation(() => Promise.resolve({ data: 'results' }));
      CertificationApi.getCertificationTasksListByCampaign = getCertificationTasksListByCampaignSpy;
      CertificationApi.getCertificationCounts.mockImplementation(() => Promise.resolve({ data: 'results' }));
    });
    it('should display correct entitlement columns', async () => {
      expect(wrapper.vm.certificationListColumns).toEqual([{
        key: 'entitlement', category: 'entitlement', label: 'governance.certificationTask.entitlement', sortable: false, class: 'text-truncate fr-access-cell', show: true,
      }, {
        key: 'flags', category: 'review', label: 'governance.certificationTask.flags', sortable: false, class: 'w-175px text-truncate fr-access-cell', show: true,
      }, {
        key: 'comments', category: 'review', label: 'governance.certificationTask.comments', sortable: false, class: 'w-140px fr-access-cell', show: true,
      }, {
        key: 'actions', class: 'w-200px cert-actions border-left fr-access-cell', label: '', sortable: false, show: true,
      }]);
    });
    it('should have the right base filter for account', () => {
      const baseFilters = wrapper.vm.getBaseFilters();
      expect(baseFilters).toEqual([{ operand: { targetName: 'decision.certification.primaryReviewer.id', targetValue: '' }, operator: 'EQUALS' }, { operand: { targetName: 'item.type', targetValue: 'entitlementGrant' }, operator: 'EQUALS' }]);
    });
    it('should call the backend api with correct params when grouped by', async () => {
      const filters = {
        decision: [
          'revoke',
          'exception',
          'noDecision',
        ],
      };
      wrapper.vm.filterItems(filters);
      await flushPromises();
      expect(getCertificationTasksListByCampaignSpy).toHaveBeenCalledWith({
        actorId: '',
        appendUserPermissions: true,
        isAdmin: true,
        pageNumber: 0,
        pageSize: 10,
        sortBy: 'user.givenName',
        sortDir: 'asc',
        taskStatus: 'active',
      },
      'test-id',
      {
        targetFilter: {
          operand: [
            {
              operand: [{ operand: { targetName: 'decision.certification.decision', targetValue: ['revoke', 'exception'] }, operator: 'IN' },
                { operand: [{ operand: { targetName: 'decision.certification.decision', targetValue: undefined }, operator: 'EXISTS' }], operator: 'NOT' },
              ],
              operator: 'OR',
            },
            { operand: { targetName: 'user.id', targetValue: '66f3b405-60db-42a6-8a7a-59f6470348f6' }, operator: 'EQUALS' },
            { operand: { targetName: 'decision.certification.primaryReviewer.id', targetValue: '' }, operator: 'EQUALS' },
            { operand: { targetName: 'item.type', targetValue: 'entitlementGrant' }, operator: 'EQUALS' }],
          operator: 'AND',
        },
      });
    });
    it('should raise activity modal event with right modal id', () => {
      const item = {
        decision: {
          certification: {
            comments: ['test'],
          },
        },
      };
      wrapper.vm.openActivityModal(item);
      expect(wrapper.vm.$bvModal.show).toBeCalledWith('certification-entitlement-activity');
    });
    it('should raise forward modal event with right modal id', () => {
      wrapper.vm.openForwardModal('1234', true);
      expect(wrapper.vm.$bvModal.show).toBeCalledWith('certification-entitlement-forward');
    });
  });
  describe('Verify items', () => {
    const resource = {
      data: {
        result: [{
          decision: {
            certification: {
              status: 'test',
              comments: '',
            },
          },
          user: {
            id: '',
            givenName: '',
            username: '',
          },
          icon: '',
          id: 'test-id-0',
          permissions: {
            certify: true,
            revoke: true,
            exception: true,
            forward: true,
            comment: true,
          },
          application: {
            name: 'testApp',
          },
        }],
      },
    };
    it('are disabled and do not exist if is in staging with showGroupBy and test certificationGrantType, allowing bulk with exception duration and enabled forward', async () => {
      mountComponent({
        campaignDetails: {
          allowBulkCertify: true,
          status: 'staging',
          exceptionDuration: 1,
          enableForward: true,
        },
        certificationGrantType: 'test',
        showGroupBy: true,
      });
      wrapper.vm.loadItemsList(resource, 1);
      await flushPromises();

      const bulkSelectBtn = findByTestId(wrapper, 'bulk-select-btn');
      expect(bulkSelectBtn.exists()).toBeFalsy();
      const bulkSelectDropdown = findByTestId(wrapper, 'bulk-select-dropdown');
      expect(bulkSelectDropdown.exists()).toBeFalsy();
      const itemSelectCheckbox = findByTestId(wrapper, 'multiselect-test-id-0');
      expect(itemSelectCheckbox.exists()).toBeFalsy();

      const revokeBtn = findByTestId(wrapper, 'btnRevoke-test-id-0');
      expect(revokeBtn.attributes('disabled')).toBeDefined();
      const allowExceptionBtn = findByTestId(wrapper, 'btnAllowException-test-id-0');
      expect(allowExceptionBtn.attributes('disabled')).toBeDefined();
      const forwardBtn = findByTestId(wrapper, 'forward-button-test-id-0');
      expect(forwardBtn.classes()).toContain('disabled');
      const addCommentBtn = findByTestId(wrapper, 'add-comment-button-test-id-0');
      expect(addCommentBtn.classes()).toContain('disabled');
      const cartReviewersBtn = findByTestId(wrapper, 'cert-reviewers-button-test');
      expect(cartReviewersBtn.classes()).toContain('disabled');
    });
    it('are enabled and do exist if is not in staging with showGroupBy and test certificationGrantType, allowing bulk with exception duration and enabled forward', async () => {
      mountComponent({
        campaignDetails: {
          allowBulkCertify: true,
          status: 'in-progress',
          exceptionDuration: 1,
          enableForward: true,
        },
        certificationGrantType: 'test',
        showGroupBy: true,
      });
      wrapper.vm.loadItemsList(resource, 1);
      await flushPromises();

      const bulkSelectBtn = findByTestId(wrapper, 'bulk-select-btn');
      expect(bulkSelectBtn.exists()).toBeTruthy();
      const bulkSelectDropdown = findByTestId(wrapper, 'bulk-select-dropdown');
      expect(bulkSelectDropdown.exists()).toBeTruthy();
      const itemSelectCheckbox = findByTestId(wrapper, 'multiselect-test-id-0');
      expect(itemSelectCheckbox.exists()).toBeTruthy();

      const revokeBtn = findByTestId(wrapper, 'btnRevoke-test-id-0');
      expect(revokeBtn.attributes('disabled')).toBeFalsy();
      const allowExceptionBtn = findByTestId(wrapper, 'btnAllowException-test-id-0');
      expect(allowExceptionBtn.attributes('disabled')).toBeFalsy();
      const forwardBtn = findByTestId(wrapper, 'forward-button-test-id-0');
      expect(forwardBtn.classes()).not.toContain('disabled');
      const addCommentBtn = findByTestId(wrapper, 'add-comment-button-test-id-0');
      expect(addCommentBtn.classes()).not.toContain('disabled');
      const cartReviewersBtn = findByTestId(wrapper, 'cert-reviewers-button-test');
      expect(cartReviewersBtn.classes()).not.toContain('disabled');
    });
    it('does exist if it not in staging with showGroupBy and accounts certificationGrantType, allowing bulk with exception duration and enabled forward', async () => {
      mountComponent({
        campaignDetails: {
          allowBulkCertify: true,
          status: 'in-progress',
          exceptionDuration: 1,
          enableForward: true,
        },
        certificationGrantType: 'accounts',
        showGroupBy: true,
      });
      wrapper.vm.loadItemsList(resource, 1);
      await flushPromises();
      const selectEntitlementBtn = findByTestId(wrapper, 'btnSelectEntitlement-test-id-0');
      expect(selectEntitlementBtn.exists()).toBeTruthy();
    });
    it('does not exist if it is in staging with showGroupBy and accounts certificationGrantType, allowing bulk with exception duration and enabled forward', async () => {
      mountComponent({
        campaignDetails: {
          allowBulkCertify: true,
          status: 'staging',
          exceptionDuration: 1,
          enableForward: true,
        },
        certificationGrantType: 'accounts',
        showGroupBy: true,
      });
      await flushPromises();
      wrapper.vm.loadItemsList(resource, 1);
      const selectEntitlementBtn = findByTestId(wrapper, 'btnSelectEntitlement-test-id-0');
      expect(selectEntitlementBtn.exists()).toBeFalsy();
    });
  });
});
