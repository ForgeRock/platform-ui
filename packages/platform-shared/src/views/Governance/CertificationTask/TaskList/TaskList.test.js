/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  DOMWrapper,
  shallowMount,
  mount,
  flushPromises,
} from '@vue/test-utils';
import Notifications from '@kyvg/vue3-notification';
import {
  createAppContainer,
  findByTestId,
  findByRole,
  createTooltipContainer,
  toggleActionsMenu,
} from '@forgerock/platform-shared/src/utils/testHelpers';
import { cloneDeep } from 'lodash';
import * as CertificationApi from '@forgerock/platform-shared/src/api/governance/CertificationApi';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import store from '@/store';
import { setupTestPinia } from '../../../../utils/testPiniaHelpers';
import TaskList from './index';
import i18n from '@/i18n';

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
jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi');

const resourceDataMock = {
  data: {
    result: [],
    totalCount: 2,
  },
};

let loadItemsListSpy;
let buildUrlParamsSpy;
let showErrorMessageSpy;
let displayNotificationSpy;
let createdWrappers = [];
function shallowMountComponent(data = {}, propsData = {}) {
  const wrapper = shallowMount(TaskList, {
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
    props: {
      campaignId: 'test-id',
      campaignDetails: {},
      ...propsData,
    },
  });
  // Manually set refs from setup if needed for tests that rely on data property initialization
  // but better to rely on actual wrapper.vm which has them from setup
  Object.assign(wrapper.vm, data);

  loadItemsListSpy = jest.spyOn(wrapper.vm, 'loadItemsList');
  buildUrlParamsSpy = jest.spyOn(wrapper.vm, 'buildUrlParams');
  showErrorMessageSpy = jest.spyOn(wrapper.vm, 'showErrorMessage');
  displayNotificationSpy = jest.spyOn(wrapper.vm, 'displayNotification');
  createdWrappers.push(wrapper);
  return wrapper;
}

function mountComponent(propOverrides = {}) {
  createTooltipContainer(['btnCertify-test-id-0', 'btnRevoke-test-id-0', 'btnAllowException-test-id-0']);
  setupTestPinia({ user: { userId: 'testId' } });
  const wrapper = mount(TaskList, {
    attachTo: createAppContainer(),
    global: {
      attachTo: document.body,
      mocks: {
        $bvModal: {
          show: jest.fn(),
          hide: jest.fn(),
        },
      },
      plugins: [Notifications, i18n],
      stubs: ['BTooltip'],
      renderStubDefaultSlot: true,
    },
    props: {
      campaignDetails: {},
      ...propOverrides,
    },
  });
  createdWrappers.push(wrapper);
  return { wrapper, domWrapper: new DOMWrapper(document.body) };
}

describe('TaskList', () => {
  afterEach(() => {
    createdWrappers.forEach((w) => w.unmount());
    createdWrappers = [];
  });
  beforeEach(() => {
    store.replaceState({
      SharedStore: {
        webStorageAvailable: true,
      },
    });
    CertificationApi.getCertificationUserFilter.mockImplementation(() => Promise.resolve({ data: [{ id: 'user' }] }));
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
    jest.spyOn(CommonsApi, 'getFilterSchema').mockImplementation(() => Promise.resolve({ data: {} }));
    jest.spyOn(CommonsApi, 'getIgaAutoIdConfig').mockImplementation(() => Promise.resolve({ data: {} }));
    jest.spyOn(CommonsApi, 'getResource').mockImplementation(() => Promise.resolve({ data: { result: [] } }));
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
      const { wrapper } = mountComponent();
      await flushPromises();

      const account = findByTestId(wrapper, 'account-cell');
      expect(account.text()).toBe('account name');
    });

    it('shows descriptor.idx./entitlement property in table', async () => {
      const { wrapper } = mountComponent({ certificationGrantType: 'entitlements' });
      await flushPromises();

      const entitlement = findByTestId(wrapper, 'entitlement-cell');
      expect(entitlement.text()).toBe('entitlement name');
    });
  });

  describe('paginationChange', () => {
    it('should call getItems with the pagination page', async () => {
      const wrapper = shallowMountComponent();
      const getCertificationTaskListSpy = jest.spyOn(wrapper.vm, 'getItems');
      await flushPromises();
      wrapper.vm.paginationPage = 1;
      wrapper.vm.paginationChange();
      await flushPromises();
      expect(getCertificationTaskListSpy).toBeCalledWith(1);
    });
  });

  describe('openColumnsModal', () => {
    it('should show the column picker modal', () => {
      const wrapper = shallowMountComponent();
      wrapper.vm.openColumnsModal();
      expect(wrapper.vm.pickerProps.show).toBe(true);
    });
  });

  describe('column picker storageKey', () => {
    it('uses a key scoped to campaignId and certificationGrantType so different campaigns and types do not share column preferences', () => {
      const getItemSpy = jest.spyOn(Storage.prototype, 'getItem');

      shallowMountComponent({}, { campaignId: 'campaign-abc', certificationGrantType: 'roles' });
      expect(getItemSpy).toHaveBeenCalledWith('certification-tasklist-column-picker-campaign-abc-roles');

      getItemSpy.mockClear();

      shallowMountComponent({}, { campaignId: 'campaign-xyz', certificationGrantType: 'entitlements' });
      expect(getItemSpy).toHaveBeenCalledWith('certification-tasklist-column-picker-campaign-xyz-entitlements');

      getItemSpy.mockRestore();
    });
  });

  describe('isItemSelected', () => {
    it('should return true if the allSelected variable is true', () => {
      const wrapper = shallowMountComponent();
      wrapper.vm.allSelected = true;
      const result = wrapper.vm.isItemSelected('test');
      expect(result).toEqual(true);
    });
    it('should return false if the allSelected variable is false and there is no selected tasks', () => {
      const wrapper = shallowMountComponent();
      wrapper.vm.allSelected = false;
      wrapper.vm.selectedItems = [];
      const result = wrapper.vm.isItemSelected({ id: 'test' });
      expect(result).toEqual(false);
    });
    it('should return true if the task id is selected', () => {
      const wrapper = shallowMountComponent();
      wrapper.vm.allSelected = false;
      wrapper.vm.selectedItems = [{ id: 'test-id' }];
      const result = wrapper.vm.isItemSelected('test-id');
      expect(result).toEqual(true);
    });
  });
  describe('loadItemsList', () => {
    it('should set the total rows with the total hits', () => {
      const wrapper = shallowMountComponent();
      wrapper.vm.loadItemsList(resourceDataMock);
      expect(wrapper.vm.totalRows).toEqual(2);
    });
    it('should set the current page with the page param', () => {
      const wrapper = shallowMountComponent();
      wrapper.vm.loadItemsList(resourceDataMock, 1);
      expect(wrapper.vm.currentPage).toEqual(1);
    });
    it('should set the tasks data with the mapped data with selected property', () => {
      const wrapper = shallowMountComponent();
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
        prediction: {},
      }];
      wrapper.vm.loadItemsList(resource, 1);
      expect(wrapper.vm.items).toEqual(expectedValue);
    });
    it('should add flags to item', () => {
      const wrapper = shallowMountComponent();
      const resource = {
        data: {
          result: [{}],
        },
      };
      wrapper.vm.loadItemsList(resource, 1);
      expect(wrapper.vm.items[0].flags).toEqual(['NEW_ACCESS']);
    });
    it('should emit check-progress if there is a task in status', () => {
      const wrapper = shallowMountComponent();
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
      const wrapper = shallowMountComponent();
      wrapper.vm.loadItemsList({ data: { result: [], totalHits: 0 } }, 0);
      await flushPromises();

      const noData = findByTestId(wrapper, 'cert-task-list-no-data');
      expect(noData.exists()).toBeTruthy();
    });
  });
  describe('getItems', () => {
    beforeEach(() => {
      CertificationApi.getCertificationTasksListByCampaign.mockImplementation(() => Promise.resolve({ data: 'results' }));
      CertificationApi.getCertificationCounts.mockImplementation(() => Promise.resolve({ data: 'results' }));
    });
    it('should call loadItemsList once the result of the call is ready', async () => {
      const wrapper = shallowMountComponent({
        currentPage: 2,
        sortBy: 'name',
        sortDir: 'asc',
      });
      wrapper.vm.getItems(2);

      await flushPromises();
      expect(loadItemsListSpy).toHaveBeenCalled();
    });
    it('should call buildUrlParams with the required params', () => {
      const wrapper = shallowMountComponent({
        currentPage: 2,
        sortBy: 'name',
        sortDir: 'asc',
      });
      wrapper.vm.getItems(2);
      expect(buildUrlParamsSpy).toHaveBeenCalledWith(2, 'name', 'asc');
    });
    it('should call getCertificationTasksListByCampaign with the required params', () => {
      const wrapper = shallowMountComponent({
        currentPage: 2,
        sortBy: 'name',
        sortDir: 'asc',
      });
      wrapper.vm.getItems(2);
      expect(CertificationApi.getCertificationTasksListByCampaign).toHaveBeenCalled();
    });
  });
  describe('buildUrlParams', () => {
    it('should return the urlParams according to the params', () => {
      const wrapper = shallowMountComponent();
      wrapper.vm.pageSize = 10;
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
      const wrapper = shallowMountComponent();
      wrapper.vm.pageSize = 10;
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
      const wrapper = shallowMountComponent();
      wrapper.vm.pageSize = 10;
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
      const wrapper = shallowMountComponent();
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
        const wrapper = shallowMountComponent();
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
        const wrapper = shallowMountComponent();
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
        const wrapper = shallowMountComponent();
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
        const wrapper = shallowMountComponent();
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
      const wrapper = shallowMountComponent();
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
      const wrapper = shallowMountComponent();
      wrapper.vm.items = resource;
      wrapper.vm.selectedItems = [...resource, {
        id: 'test-id',
      }];
      wrapper.vm.selectTasks(true);
      expect(wrapper.vm.selectedItems.length).toEqual(2);
    });
    it('should return the task list with all task in selected false', () => {
      const wrapper = shallowMountComponent();
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
    it('should schedule focusActionBarDeselect in $nextTick when selectTasks is called with true', async () => {
      const wrapper = shallowMountComponent();
      const focusSpy = jest.spyOn(wrapper.vm, 'focusActionBarDeselect');
      wrapper.vm.items = [{ id: 'test-id' }];
      wrapper.vm.selectTasks(true);
      await flushPromises();
      expect(focusSpy).toHaveBeenCalled();
    });
    it('should not schedule focusActionBarDeselect when selectTasks is called with false', () => {
      const wrapper = shallowMountComponent();
      const focusSpy = jest.spyOn(wrapper.vm, 'focusActionBarDeselect');
      wrapper.vm.items = [{ id: 'test-id' }];
      wrapper.vm.selectTasks(false);
      expect(focusSpy).not.toHaveBeenCalled();
    });
    it('should call saveSelectTrigger when selectTasks is called with true', () => {
      const wrapper = shallowMountComponent();
      const saveSpy = jest.spyOn(wrapper.vm, 'saveSelectTrigger');
      wrapper.vm.items = [{ id: 'test-id' }];
      wrapper.vm.selectTasks(true);
      expect(saveSpy).toHaveBeenCalled();
    });
    it('should restore focus to selectTriggerEl when selectTasks is called with false and selectTriggerEl is set', async () => {
      const wrapper = shallowMountComponent();
      const mockFocus = jest.fn();
      wrapper.vm.selectTriggerEl = { focus: mockFocus };
      wrapper.vm.selectTasks(false);
      await flushPromises();
      expect(mockFocus).toHaveBeenCalled();
    });
    it('should clear selectTriggerEl after restoring focus', async () => {
      const wrapper = shallowMountComponent();
      wrapper.vm.selectTriggerEl = { focus: jest.fn() };
      wrapper.vm.selectTasks(false);
      await flushPromises();
      expect(wrapper.vm.selectTriggerEl).toBeNull();
    });
    it('should not throw when selectTasks is called with false and selectTriggerEl is null', () => {
      const wrapper = shallowMountComponent();
      wrapper.vm.selectTriggerEl = null;
      expect(() => wrapper.vm.selectTasks(false)).not.toThrow();
    });
  });
  describe('updateItemList', () => {
    it('should call display notification with the success message', () => {
      const wrapper = shallowMountComponent();
      wrapper.vm.updateItemList();
      expect(displayNotificationSpy).toBeCalledWith('success', 'governance.certificationTask.success.undefined');
    });
    it('should set the selected task to empty', () => {
      const wrapper = shallowMountComponent();
      wrapper.vm.updateItemList();
      expect(wrapper.vm.selectedItems).toEqual([]);
    });
    it('should call getCertificationTaskList with the main page', () => {
      const wrapper = shallowMountComponent();
      const getCertificationTaskListSpy = jest.spyOn(wrapper.vm, 'getItems');
      wrapper.vm.mainPageNumber = 1;
      wrapper.vm.updateItemList();
      expect(getCertificationTaskListSpy).toBeCalledWith(1);
    });
  });
  describe('filterItems', () => {
    it('should call getCertificationTaskList with the paginationPage', () => {
      const wrapper = shallowMountComponent();
      wrapper.vm.paginationPage = 1;
      wrapper.vm.updateAccessByFilter({
        decision: {
          operator: 'OR',
          operand: [
            {
              operator: 'NOT',
              operand: [
                {
                  operator: 'EXISTS',
                  operand: {
                    targetName: 'decision.certification.decision',
                  },
                },
              ],
            },
          ],
        },
      });
      expect(CertificationApi.getCertificationTasksListByCampaign).toHaveBeenCalled();
    });
    it('listFilters should contain the new filters', () => {
      const wrapper = shallowMountComponent();
      const filterTest = {
        decision: {
          operator: 'IN',
          operand: {
            targetName: 'decision.certification.decision',
            targetValue: [
              'certify',
            ],
          },
        },
      };
      wrapper.vm.updateAccessByFilter(filterTest);
      expect(CertificationApi.getCertificationTasksListByCampaign).toHaveBeenCalled();
      // expect(wrapper.vm.updateAccessByFilter).toEqual({ ...filterTest });
    });
  });

  describe('bulk certify', () => {
    beforeEach(() => {
      CertificationApi.certifyItems.mockImplementation(() => Promise.resolve({ data: 'results' }));
    });
    it('should toggle the saving status to add a loader in the header', () => {
      const wrapper = shallowMountComponent({}, { campaignId: 'test-id' });
      wrapper.vm.bulkCertify();
      expect(wrapper.emitted()).toHaveProperty('change-saving');
      expect(wrapper.emitted()['change-saving']).toHaveLength(1);
    });
    it('should call updateItemList after the certification is completed', async () => {
      const wrapper = shallowMountComponent({}, { campaignId: 'test-id' });
      const updateItemListSpy = jest.spyOn(wrapper.vm, 'updateItemList');
      wrapper.vm.bulkCertify();

      await flushPromises();
      expect(updateItemListSpy).toHaveBeenCalledWith('certifySuccess');
    });
  });
  describe('bulk revoke', () => {
    beforeEach(() => {
      CertificationApi.revokeItems.mockImplementation(() => Promise.resolve({ data: 'results' }));
    });
    it('should toggle the saving status to add a loader in the header', () => {
      const wrapper = shallowMountComponent({}, { campaignId: 'test-id' });
      wrapper.vm.bulkRevoke();
      expect(wrapper.emitted()).toHaveProperty('change-saving');
      expect(wrapper.emitted()['change-saving']).toHaveLength(1);
    });
    it('should call updateItemList after the certification is completed', async () => {
      const wrapper = shallowMountComponent({}, { campaignId: 'test-id' });
      const updateItemListSpy = jest.spyOn(wrapper.vm, 'updateItemList');
      wrapper.vm.bulkRevoke('comments');

      await flushPromises();
      expect(updateItemListSpy).toHaveBeenCalledWith('revokeSuccess');
    });
  });
  describe('bulk exception', () => {
    beforeEach(() => {
      CertificationApi.exceptionItem.mockImplementation(() => Promise.resolve({ data: 'results' }));
    });
    it('should toggle the saving status to add a loader in the header', () => {
      const wrapper = shallowMountComponent({}, { campaignId: 'test-id' });
      wrapper.vm.bulkException();
      expect(wrapper.emitted()).toHaveProperty('change-saving');
      expect(wrapper.emitted()['change-saving']).toHaveLength(1);
    });
    it('should call updateItemList after exception is complete', async () => {
      const wrapper = shallowMountComponent({}, { campaignId: 'test-id' });
      const updateItemListSpy = jest.spyOn(wrapper.vm, 'updateItemList');
      wrapper.vm.bulkException('comments');

      await flushPromises();
      expect(updateItemListSpy).toHaveBeenCalledWith('allowExceptionSuccess');
    });
  });
  describe('open confirm action modal', () => {
    it('should set the modal props correctly', () => {
      const wrapper = shallowMountComponent({}, { campaignId: 'test-id' });
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
      const wrapper = shallowMountComponent({}, { campaignId: 'test-id' });
      const returnFocusEl = document.createElement('button');
      wrapper.vm.openActionConfirmModal({}, null, returnFocusEl);
      expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('certification-account-confirm-action', returnFocusEl);
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
      const { wrapper } = mountComponent();
      await flushPromises();
      const revoke = findByTestId(wrapper, 'btnRevoke-testId');
      expect(revoke.exists()).toBe(true);
    });

    it('hides revoke action for role based', async () => {
      CertificationApi.getCertificationTasksListByCampaign.mockImplementation(() => Promise.resolve(roleBased));
      const { wrapper } = mountComponent();
      await flushPromises();
      const revoke = findByTestId(wrapper, 'btnRevoke-testId');
      expect(revoke.exists()).toBe(false);
    });

    it('shows exception for non-role based', async () => {
      CertificationApi.getCertificationTasksListByCampaign.mockImplementation(() => Promise.resolve(nonRoleBased));
      const { wrapper } = mountComponent({ campaignDetails: { exceptionDuration: 1 } });
      await flushPromises();
      const exception = findByTestId(wrapper, 'btnAllowException-testId');
      expect(exception.exists()).toBe(true);
    });

    it('hides exception action for role based', async () => {
      CertificationApi.getCertificationTasksListByCampaign.mockImplementation(() => Promise.resolve(roleBased));
      const { wrapper } = mountComponent({ campaignDetails: { exceptionDuration: 1 } });
      await flushPromises();
      const exception = findByTestId(wrapper, 'btnAllowException-testId');
      expect(exception.exists()).toBe(false);
    });

    it('hides multiselect option', async () => {
      CertificationApi.getCertificationTasksListByCampaign.mockImplementation(() => Promise.resolve(roleBased));
      const { wrapper } = mountComponent();
      await flushPromises();
      const revoke = findByTestId(wrapper, 'multiselect-testId');
      expect(revoke.exists()).toBe(false);
    });

    it('changes tooltip text from certify to acknowledge', async () => {
      CertificationApi.getCertificationTasksListByCampaign.mockImplementation(() => Promise.resolve(roleBased));
      const { wrapper } = mountComponent();
      await flushPromises();

      const revoke = findByTestId(wrapper, 'tooltip-certify-testId');
      expect(revoke.exists()).toBe(true);
      expect(revoke.text()).toBe('Acknowledge');
    });
  });

  describe('line item details', () => {
    jest.spyOn(CommonsApi, 'getGlossarySchema').mockReturnValue(Promise.resolve({ data: { result: [] } }));

    it('openUserModal called saves currentUserSelectedModal data and shows GovernanceUserDetailsModal', async () => {
      const wrapper = shallowMountComponent();
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
      const wrapper = shallowMountComponent();
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
      const wrapper = shallowMountComponent();
      const error = new Error('ERROR');
      const id = 'id-test';
      CertificationApi.getUserDetails.mockImplementation(() => Promise.reject(error));

      wrapper.vm.openUserModal(id);
      await flushPromises();

      expect(showErrorMessageSpy).toHaveBeenCalledWith(error, 'governance.certificationTask.error.getUserError');
    });

    it('openApplicationModal sets application data and opens application modal', async () => {
      const wrapper = shallowMountComponent();
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
      const wrapper = shallowMountComponent();
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
      const wrapper = shallowMountComponent();
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
      const wrapper = shallowMountComponent();
      wrapper.vm.openAddCommentModalFromCommentsModal();

      await flushPromises();

      expect(wrapper.vm.$bvModal.hide).toHaveBeenCalledWith('certification-account-view-comments');
      expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('certification-account-add-comment');
    });

    it('openAddCommentModal sets the line item id and opens the add comment modal', async () => {
      const wrapper = shallowMountComponent();
      const lineItemId = '4ab37e2f-9470-45f6-85dd-f8a7b095e0d4';

      wrapper.vm.openAddCommentModal(lineItemId);
      await flushPromises();

      expect(wrapper.vm.currentLineItemIdSelectedModal).toBe(lineItemId);
      expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('certification-account-add-comment', undefined);
    });

    it('addComment calls governance api properly', async () => {
      const wrapper = shallowMountComponent();
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

      wrapper.vm.addComment(comment);

      await flushPromises();

      expect(displayNotificationSpy).toHaveBeenCalledWith('success', 'governance.certificationTask.lineItemAddCommentModal.addCommentSuccessfullyMessage');
      expect(wrapper.vm.currentCommentsSelectedModal).toEqual(task.decision.certification.comments);
      expect(wrapper.vm.$bvModal.hide).toHaveBeenCalledWith('certification-account-add-comment');
    });

    it('addComment calls governance api error', async () => {
      const wrapper = shallowMountComponent();
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

      wrapper.vm.addComment(comment);

      await flushPromises();

      expect(showErrorMessageSpy).toHaveBeenCalledWith(error, 'governance.certificationTask.error.addCommentErrorDefaultMessage');
    });

    it('openReviewersModal sets reviewer data and opens view reviewers modal', async () => {
      const wrapper = shallowMountComponent();
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
      expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('certification-account-view-reviewers', undefined);
    });

    it('closeEditReviewerModal should close edit reviewer modal and open view reviewers modal', async () => {
      const wrapper = shallowMountComponent();
      expect(wrapper.vm.$bvModal.hide).not.toHaveBeenCalledWith('CertificationTaskEditReviewerModal');
      expect(wrapper.vm.$bvModal.show).not.toHaveBeenCalledWith('CertificationTaskReviewersModal');

      wrapper.vm.closeEditReviewerModal();

      await flushPromises();

      expect(wrapper.vm.$bvModal.hide).toHaveBeenCalledWith('certification-account-edit-reviewers');
      expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('certification-account-view-reviewers', undefined);
      expect(wrapper.vm.currentReviewerSelectedModal).toBeNull();
      expect(wrapper.vm.currentUserPermissions).toEqual({});
    });

    describe('focusFirstFilterElement', () => {
      it('moves focus to the first focusable element inside the filters section', () => {
        const wrapper = shallowMountComponent();
        const focusSpy = jest.fn();
        const mockFirstFocusable = { focus: focusSpy };
        jest.spyOn(wrapper.vm.$refs.filtersSectionRef, 'querySelector').mockReturnValue(mockFirstFocusable);

        wrapper.vm.focusFirstFilterElement();

        expect(focusSpy).toHaveBeenCalled();
      });

      it('does nothing when the filters section has no focusable elements', () => {
        const wrapper = shallowMountComponent();
        jest.spyOn(wrapper.vm.$refs.filtersSectionRef, 'querySelector').mockReturnValue(null);

        expect(() => wrapper.vm.focusFirstFilterElement()).not.toThrow();
      });
    });

    describe('focus return after modal close', () => {
      it('getActionMenuTrigger walks up to the menu toggle button via aria-labelledby', () => {
        const wrapper = shallowMountComponent();

        const menuButton = document.createElement('button');
        menuButton.id = 'menu-button-test';
        document.body.appendChild(menuButton);

        const menuList = document.createElement('ul');
        menuList.setAttribute('role', 'menu');
        menuList.setAttribute('aria-labelledby', 'menu-button-test');
        document.body.appendChild(menuList);

        const menuItem = document.createElement('button');
        menuItem.setAttribute('role', 'menuitem');
        menuList.appendChild(menuItem);
        menuItem.focus();

        expect(wrapper.vm.getActionMenuTrigger()).toBe(menuButton);

        document.body.removeChild(menuButton);
        document.body.removeChild(menuList);
      });

      it('getActionMenuTrigger falls back to document.activeElement when not inside a menu', () => {
        const wrapper = shallowMountComponent();

        const button = document.createElement('button');
        document.body.appendChild(button);
        button.focus();

        expect(wrapper.vm.getActionMenuTrigger()).toBe(button);

        document.body.removeChild(button);
      });

      it('handleAction passes the captured trigger element to openForwardModal', () => {
        const wrapper = shallowMountComponent();
        const triggerButton = document.createElement('button');
        document.body.appendChild(triggerButton);
        triggerButton.focus();

        const openForwardSpy = jest.spyOn(wrapper.vm, 'openForwardModal');
        wrapper.vm.handleAction('forward', { id: 'item-1' });

        expect(openForwardSpy).toHaveBeenCalledWith('item-1', false, false, triggerButton);

        document.body.removeChild(triggerButton);
      });

      it('openForwardModal forwards the trigger element to $bvModal.show as return-focus', () => {
        const wrapper = shallowMountComponent();
        const triggerButton = document.createElement('button');

        wrapper.vm.openForwardModal('item-1', false, false, triggerButton);

        expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('certification-account-forward', triggerButton);
      });

      it('openEditReviewerModal forwards the stored reviewers trigger to BV as return-focus', () => {
        const wrapper = shallowMountComponent();
        const triggerButton = document.createElement('button');
        wrapper.vm._reviewersTriggerEl = triggerButton;
        wrapper.vm.currentReviewersSelectedModal = [{ id: wrapper.vm.actorId, permissions: {} }];

        wrapper.vm.openEditReviewerModal({ id: '/managed/user/123' });

        expect(wrapper.vm.$bvModal.hide).toHaveBeenCalledWith('certification-account-view-reviewers');
        expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('certification-account-edit-reviewers', triggerButton);
      });

      it('closeEditReviewerModal re-shows view-reviewers with the stored trigger as return-focus', () => {
        const wrapper = shallowMountComponent();
        const triggerButton = document.createElement('button');
        wrapper.vm._reviewersTriggerEl = triggerButton;

        wrapper.vm.closeEditReviewerModal();

        expect(wrapper.vm.$bvModal.hide).toHaveBeenCalledWith('certification-account-edit-reviewers');
        expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('certification-account-view-reviewers', triggerButton);
      });
    });

    describe('edit reviewer', () => {
      let permissions;
      let reviewers;

      beforeEach(() => {
        CertificationApi.reassignItem.mockImplementation(() => Promise.resolve());
        CertificationApi.updateActors.mockImplementation(() => Promise.resolve());
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
      });

      it('editReviewer should call api correctly new reviewer', async () => {
        const wrapper = shallowMountComponent();
        wrapper.vm.currentReviewersSelectedModal = reviewers;
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
        const wrapper = shallowMountComponent();
        wrapper.vm.currentReviewersSelectedModal = reviewers;
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
        const wrapper = shallowMountComponent();
        wrapper.vm.currentReviewersSelectedModal = reviewers;
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
        const wrapper = shallowMountComponent();
        wrapper.vm.currentReviewersSelectedModal = reviewers;
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
        const wrapper = shallowMountComponent();
        wrapper.vm.currentReviewersSelectedModal = reviewers;
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
        const wrapper = shallowMountComponent();
        wrapper.vm.currentReviewersSelectedModal = reviewers;
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
        const wrapper = shallowMountComponent();
        wrapper.vm.currentReviewersSelectedModal = reviewers;
        expect(wrapper.vm.isLastSignOffReviewer()).toBe(false);
        wrapper.vm.currentReviewersSelectedModal[0].permissions.signoff = false;
        [, wrapper.vm.currentReviewerSelectedModal] = wrapper.vm.currentReviewersSelectedModal;

        expect(wrapper.vm.isLastSignOffReviewer()).toBe(true);
      });

      it('isLastSignOffReviewer false not selected reviewer', () => {
        const wrapper = shallowMountComponent();
        wrapper.vm.currentReviewersSelectedModal = reviewers;
        wrapper.vm.currentReviewersSelectedModal[0].permissions.signoff = false;
        [wrapper.vm.currentReviewerSelectedModal] = wrapper.vm.currentReviewersSelectedModal;

        expect(wrapper.vm.isLastSignOffReviewer()).toBe(false);
      });
    });

    it('openEntitlementModal should set entitlement data and open entitlement modal', async () => {
      const wrapper = shallowMountComponent();
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
        application: {
          templateName: 'salesforce',
        },
        entitlement: {
          name: 'test',
        },
        entitlementOwner: { userName: 'mikeTest' },
        glossary: { test1: 'test1' },
        id: '9986d9a5-5ffd-4046-8643-c34a60cddb6e',
      });
      expect(wrapper.vm.currentApplicationSelectedModal).toEqual(lineItem.application);
      expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('certification-account-entitlement');
    });
  });

  describe('Open edit reviewer modal', () => {
    describe('Admin view', () => {
      it('openEditReviewerModal should set reviewer data and open edit reviewer modal', async () => {
        const wrapper = shallowMountComponent({}, { isAdmin: true });
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
        expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('certification-account-edit-reviewers', undefined);
      });
    });

    describe('EndUser view', () => {
      it('openEditReviewerModal should set reviewer data and open edit reviewer modal', async () => {
        const wrapper = shallowMountComponent({}, { actorId: '/managed/user/12345' });
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
        expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('certification-account-edit-reviewers', undefined);
      });
    });
  });

  describe('Entitlements tab', () => {
    beforeEach(() => {
      CertificationApi.getCertificationTasksListByCampaign.mockImplementation(() => Promise.resolve({ data: 'results' }));
      CertificationApi.getCertificationCounts.mockImplementation(() => Promise.resolve({ data: 'results' }));
    });
    it('should call loadItemsList once the result of the call is ready', async () => {
      const wrapper = shallowMountComponent({}, {
        certificationGrantType: 'entitlements', showGroupBy: false, entitlementUserId: null, modalPrefix: 'entitlement',
      });
      wrapper.vm.currentPage = 2;
      wrapper.vm.sortBy = 'name';
      wrapper.vm.sortDir = 'asc';
      wrapper.vm.getItems(2);

      await flushPromises();
      expect(loadItemsListSpy).toHaveBeenCalled();
    });
    it('should show the right columns for entitlements tab', () => {
      const wrapper = shallowMountComponent({}, {
        certificationGrantType: 'entitlements', showGroupBy: false, entitlementUserId: null, modalPrefix: 'entitlement',
      });
      wrapper.vm.currentPage = 2;
      wrapper.vm.sortBy = 'name';
      wrapper.vm.sortDir = 'asc';

      // Initialize the columns as would happen in mounted()
      wrapper.vm.tasksFields = wrapper.vm.getInitialColumns('entitlements', null, false, null, null, {});
      wrapper.vm.activeColumns = wrapper.vm.tasksFields;

      expect(wrapper.vm.certificationListColumnsToShow).toEqual([{
        key: 'user', category: 'user', label: 'User', sortable: true, class: 'text-truncate fr-access-cell', exportFields: ['user.userName', 'user.givenName', 'user.sn', 'user.mail'], show: true, value: 'user.user',
      }, {
        key: 'application', category: 'application', label: 'Application', sortable: true, class: 'text-truncate fr-access-cell', exportFields: ['application.name'], show: true, value: 'application.application',
      }, {
        key: 'entitlement', category: 'entitlement', label: 'Entitlement', sortable: true, class: 'text-truncate fr-access-cell', exportFields: ['descriptor.idx./entitlement.displayName'], show: true, value: 'entitlement.entitlement',
      }, {
        key: 'account', category: 'account', label: 'Account', sortable: false, class: 'text-truncate fr-access-cell', exportFields: ['descriptor.idx./account.displayName'], show: true, value: 'account.account',
      }, {
        key: 'flags', category: 'review', label: 'Flags', sortable: false, class: 'w-175px text-truncate fr-access-cell', show: true, value: 'review.flags',
      }, {
        key: 'comments', category: 'review', label: 'Comments', sortable: false, class: 'w-140px fr-access-cell', show: true, value: 'review.comments',
      }, {
        key: 'actions', class: 'w-200px cert-actions border-left fr-access-cell fr-no-resize sticky-right', label: 'Actions', sortable: false, show: true, value: 'actions',
      }]);
    });
    it('openAddCommentModalFromCommentsModal called hides CertificationTaskCommentsModal and shows CertificationTaskAddCommentModal', async () => {
      const wrapper = shallowMountComponent({}, {
        certificationGrantType: 'entitlements', showGroupBy: false, entitlementUserId: null, modalPrefix: 'entitlement',
      });
      wrapper.vm.currentPage = 2;
      wrapper.vm.sortBy = 'name';
      wrapper.vm.sortDir = 'asc';
      wrapper.vm.openAddCommentModalFromCommentsModal();

      await flushPromises();

      expect(wrapper.vm.$bvModal.hide).toHaveBeenCalledWith('certification-entitlement-view-comments');
      expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('certification-entitlement-add-comment');
    });

    it('openAddCommentModal called saves currentLineItemIdSelectedModal data and shows CertificationTaskAddCommentModal', async () => {
      const wrapper = shallowMountComponent({}, {
        certificationGrantType: 'entitlements', showGroupBy: false, entitlementUserId: null, modalPrefix: 'entitlement',
      });
      wrapper.vm.currentPage = 2;
      wrapper.vm.sortBy = 'name';
      wrapper.vm.sortDir = 'asc';
      const lineItemId = '4ab37e2f-9470-45f6-85dd-f8a7b095e0d4';

      wrapper.vm.openAddCommentModal(lineItemId);
      await flushPromises();

      expect(wrapper.vm.currentLineItemIdSelectedModal).toBe(lineItemId);
      expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('certification-entitlement-add-comment', undefined);
    });
    it('openEntitlementModal should open entitlement modal with data setted', async () => {
      const wrapper = shallowMountComponent({}, {
        certificationGrantType: 'entitlements', showGroupBy: false, entitlementUserId: null, modalPrefix: 'entitlement',
      });
      wrapper.vm.currentPage = 2;
      wrapper.vm.sortBy = 'name';
      wrapper.vm.sortDir = 'asc';
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
        application: {
          templateName: 'salesforce',
        },
        entitlement: {
          name: 'test',
        },
        entitlementOwner: { userName: 'mikeTest' },
        glossary: { test1: 'test1' },
        id: '9986d9a5-5ffd-4046-8643-c34a60cddb6e',
      });
      expect(wrapper.vm.currentApplicationSelectedModal).toEqual(lineItem.application);
      expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('certification-entitlement-entitlement');
    });
    it('openViewCommentsModal called saves currentCommentsSelectedModal, currentLineItemIdSelectedModal data and shows CertificationTaskCommentsModal', async () => {
      const wrapper = shallowMountComponent({}, {
        certificationGrantType: 'entitlements', showGroupBy: false, entitlementUserId: null, modalPrefix: 'entitlement',
      });
      wrapper.vm.currentPage = 2;
      wrapper.vm.sortBy = 'name';
      wrapper.vm.sortDir = 'asc';
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
      const wrapper = shallowMountComponent({}, {
        certificationGrantType: 'entitlements', showGroupBy: false, entitlementUserId: null, modalPrefix: 'entitlement',
      });
      wrapper.vm.currentPage = 2;
      wrapper.vm.sortBy = 'name';
      wrapper.vm.sortDir = 'asc';
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
      expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('certification-entitlement-view-reviewers', undefined);
    });
    it('openEditReviewerModal should open edit reviewer modal with data setted', async () => {
      const wrapper = shallowMountComponent({}, {
        certificationGrantType: 'entitlements', showGroupBy: false, entitlementUserId: null, modalPrefix: 'entitlement',
      });
      wrapper.vm.currentPage = 2;
      wrapper.vm.sortBy = 'name';
      wrapper.vm.sortDir = 'asc';
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
      expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('certification-entitlement-edit-reviewers', undefined);
    });

    it('closeEditReviewerModal should close edit reviewer modal and open reviewers modal', async () => {
      const wrapper = shallowMountComponent({}, {
        certificationGrantType: 'entitlements', showGroupBy: false, entitlementUserId: null, modalPrefix: 'entitlement',
      });
      wrapper.vm.currentPage = 2;
      wrapper.vm.sortBy = 'name';
      wrapper.vm.sortDir = 'asc';
      expect(wrapper.vm.$bvModal.hide).not.toHaveBeenCalledWith('CertificationTaskEditReviewerModal');
      expect(wrapper.vm.$bvModal.show).not.toHaveBeenCalledWith('CertificationTaskReviewersModal');

      wrapper.vm.closeEditReviewerModal();

      await flushPromises();

      expect(wrapper.vm.$bvModal.hide).toHaveBeenCalledWith('certification-entitlement-edit-reviewers');
      expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('certification-entitlement-view-reviewers', undefined);
    });
    it('addComment calls governance api properly', async () => {
      const wrapper = shallowMountComponent({}, {
        certificationGrantType: 'entitlements', showGroupBy: false, entitlementUserId: null, modalPrefix: 'entitlement',
      });
      wrapper.vm.currentPage = 2;
      wrapper.vm.sortBy = 'name';
      wrapper.vm.sortDir = 'asc';
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

      wrapper.vm.addComment(comment);

      await flushPromises();

      expect(displayNotificationSpy).toHaveBeenCalledWith('success', 'governance.certificationTask.lineItemAddCommentModal.addCommentSuccessfullyMessage');
      expect(wrapper.vm.currentCommentsSelectedModal).toEqual(task.decision.certification.comments);
      expect(wrapper.vm.$bvModal.hide).toHaveBeenCalledWith('certification-entitlement-add-comment');
    });
    it('should emit the bv::show::modal to show the certification task sort', () => {
      const wrapper = shallowMountComponent({}, {
        certificationGrantType: 'entitlements', showGroupBy: false, entitlementUserId: null, modalPrefix: 'entitlement',
      });
      wrapper.vm.currentPage = 2;
      wrapper.vm.sortBy = 'name';
      wrapper.vm.sortDir = 'asc';
      wrapper.vm.openColumnsModal();
      expect(wrapper.vm.pickerProps.show).toBe(true);
    });
    it('should emit the bv::show::modal to show the certification reasign modal', async () => {
      const { wrapper } = mountComponent({ modalPrefix: 'entitlement' });
      wrapper.vm.selectedItems = [{ id: '123' }];
      await flushPromises();
      const floatingActionBar = wrapper.findComponent('[name="slide-fade"]');
      const reassignButton = floatingActionBar.findAll('a').find((a) => a.text().toLowerCase().includes('reassign'));
      await reassignButton.trigger('click');
      expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('certification-entitlement-reassign', expect.anything());
    });
    it('should emit the bv::show::modal to show the certification reasign modal', () => {
      const wrapper = shallowMountComponent({}, {
        certificationGrantType: 'entitlements', showGroupBy: false, entitlementUserId: null, modalPrefix: 'entitlement',
      });
      wrapper.vm.currentPage = 2;
      wrapper.vm.sortBy = 'name';
      wrapper.vm.sortDir = 'asc';
      const returnFocusEl = document.createElement('button');
      wrapper.vm.openActionConfirmModal({}, null, returnFocusEl);
      expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('certification-entitlement-confirm-action', returnFocusEl);
    });
  });

  describe('Scenarios For Accounts Tab when group by is true', () => {
    beforeEach(() => {
      CertificationApi.getCertificationTasksListByCampaign.mockImplementation(() => Promise.resolve({ data: 'results' }));
      CertificationApi.getCertificationCounts.mockImplementation(() => Promise.resolve({ data: 'results' }));
    });
    it('should display correct account columns', async () => {
      const wrapper = shallowMountComponent({}, {
        certificationGrantType: 'accounts', showGroupBy: true, entitlementUserId: null, isAdmin: true,
      });

      // Initialize the columns as would happen in mounted()
      wrapper.vm.tasksFields = wrapper.vm.getInitialColumns('accounts', null, true, null, null, {});
      wrapper.vm.activeColumns = wrapper.vm.tasksFields;

      expect(wrapper.vm.certificationListColumnsToShow).toEqual([{
        key: 'user', category: 'user', label: 'User', sortable: true, class: 'text-truncate fr-access-cell', exportFields: ['user.userName', 'user.givenName', 'user.sn', 'user.mail'], show: true, value: 'user.user',
      }, {
        key: 'application', category: 'application', label: 'Application', sortable: true, class: 'text-truncate fr-access-cell', exportFields: ['application.name'], show: true, value: 'application.application',
      }, {
        key: 'account', category: 'account', label: 'Account', sortable: false, class: 'text-truncate fr-access-cell', exportFields: ['descriptor.idx./account.displayName'], show: true, value: 'account.account',
      }, {
        key: 'flags', category: 'review', label: 'Flags', sortable: false, class: 'w-175px text-truncate fr-access-cell', show: true, value: 'review.flags',
      }, {
        key: 'comments', category: 'review', label: 'Comments', sortable: false, class: 'w-140px fr-access-cell', show: true, value: 'review.comments',
      }, {
        key: 'actions', class: 'w-230px cert-actions border-left fr-access-cell fr-no-resize sticky-right', label: 'Actions', sortable: false, show: true, value: 'actions',
      }]);
    });
    it('should have selectable as true', async () => {
      const wrapper = shallowMountComponent({}, {
        certificationGrantType: 'accounts', showGroupBy: true, entitlementUserId: null, isAdmin: true,
      });
      expect(wrapper.vm.isSelectable).toEqual(true);
    });
    it('should clear row selection on filter', async () => {
      const wrapper = shallowMountComponent({}, {
        certificationGrantType: 'accounts', showGroupBy: true, entitlementUserId: null, isAdmin: true,
      });
      const filters = {
        decision: [
          'revoke',
          'exception',
          'noDecision',
        ],
      };
      wrapper.vm.updateAccessByFilter(filters);
      await flushPromises();
      expect(wrapper.emitted()['clear-item']).toBeTruthy();
    });
    it('should clear row selection on page change', async () => {
      const wrapper = shallowMountComponent({}, {
        certificationGrantType: 'accounts', showGroupBy: true, entitlementUserId: null, isAdmin: true,
      });
      wrapper.vm.paginationChange();
      await flushPromises();
      expect(wrapper.emitted()['clear-item']).toBeTruthy();
    });
    it('should hide group by when accounts count is zero', () => {
      const wrapper = shallowMountComponent({}, {
        certificationGrantType: 'accounts', showGroupBy: true, entitlementUserId: null, isAdmin: true,
      });
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
      const wrapper = shallowMountComponent({}, {
        certificationGrantType: 'accounts', showGroupBy: true, entitlementUserId: null, isAdmin: true,
      });
      const baseFilters = wrapper.vm.getBaseFilters();
      expect(baseFilters).toEqual([
        {
          operand: { targetName: 'decision.certification.primaryReviewer.id', targetValue: '' },
          operator: 'EQUALS',
        },
        { operand: { targetName: 'item.type', targetValue: 'accountGrant' }, operator: 'EQUALS' }]);
    });
    it('should raise select item event on row select', () => {
      const wrapper = shallowMountComponent({}, {
        certificationGrantType: 'accounts', showGroupBy: true, entitlementUserId: null, isAdmin: true,
      });
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
      const wrapper = shallowMountComponent({}, {
        certificationGrantType: 'accounts', showGroupBy: true, entitlementUserId: null, isAdmin: true,
      });
      const item = {
        decision: {
          certification: {
            comments: ['test'],
          },
        },
      };
      wrapper.vm.openActivityModal(item);
      expect(wrapper.vm.$bvModal.show).toBeCalledWith('certification-account-activity', undefined);
    });
    it('should raise activity modal event with right modal id and set the right activity items', () => {
      const wrapper = shallowMountComponent({}, {
        certificationGrantType: 'accounts', showGroupBy: true, entitlementUserId: null, isAdmin: true,
      });
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
      const wrapper = shallowMountComponent({}, {
        certificationGrantType: 'accounts', showGroupBy: true, entitlementUserId: null, isAdmin: true,
      });
      wrapper.vm.openForwardModal('1234', true);
      expect(wrapper.vm.$bvModal.show).toBeCalledWith('certification-account-forward', undefined);
    });
  });

  describe('Scenarios For Entitlements Tab when group by is true', () => {
    let getCertificationTasksListByCampaignSpy;
    beforeEach(() => {
      getCertificationTasksListByCampaignSpy = jest.fn().mockImplementation(() => Promise.resolve({ data: 'results' }));
      CertificationApi.getCertificationTasksListByCampaign = getCertificationTasksListByCampaignSpy;
      CertificationApi.getCertificationCounts.mockImplementation(() => Promise.resolve({ data: 'results' }));
    });
    it('should display correct entitlement columns', async () => {
      const wrapper = shallowMountComponent({}, {
        certificationGrantType: 'entitlements',
        showGroupBy: true,
        entitlementUserId: '66f3b405-60db-42a6-8a7a-59f6470348f6',
        isAdmin: true,
        refreshTasks: true,
        modalPrefix: 'entitlement',
      });

      // Initialize the columns as would happen in mounted()
      wrapper.vm.tasksFields = wrapper.vm.getInitialColumns('entitlements', '66f3b405-60db-42a6-8a7a-59f6470348f6', false, null, null, {});
      wrapper.vm.activeColumns = wrapper.vm.tasksFields;

      expect(wrapper.vm.certificationListColumnsToShow).toEqual([{
        key: 'entitlement', category: 'entitlement', label: 'Entitlement', sortable: true, class: 'text-truncate fr-access-cell', exportFields: ['descriptor.idx./entitlement.displayName'], show: true, value: 'entitlement.entitlement',
      }, {
        key: 'flags', category: 'review', label: 'Flags', sortable: false, class: 'w-175px text-truncate fr-access-cell', show: true, value: 'review.flags',
      }, {
        key: 'comments', category: 'review', label: 'Comments', sortable: false, class: 'w-140px fr-access-cell', show: true, value: 'review.comments',
      }, {
        key: 'actions', class: 'w-200px cert-actions border-left fr-access-cell fr-no-resize sticky-right', label: 'Actions', sortable: false, show: true, value: 'actions',
      }]);
    });
    it('should have the right base filter for account', () => {
      const wrapper = shallowMountComponent({}, {
        certificationGrantType: 'entitlements',
        showGroupBy: true,
        entitlementUserId: '66f3b405-60db-42a6-8a7a-59f6470348f6',
        isAdmin: true,
        refreshTasks: true,
        modalPrefix: 'entitlement',
      });
      const baseFilters = wrapper.vm.getBaseFilters();
      expect(baseFilters).toEqual([{ operand: { targetName: 'decision.certification.primaryReviewer.id', targetValue: '' }, operator: 'EQUALS' }, { operand: { targetName: 'item.type', targetValue: 'entitlementGrant' }, operator: 'EQUALS' }]);
    });
    it('should call the backend api with correct params when grouped by', async () => {
      const wrapper = shallowMountComponent({}, {
        certificationGrantType: 'entitlements',
        showGroupBy: true,
        entitlementUserId: '66f3b405-60db-42a6-8a7a-59f6470348f6',
        isAdmin: true,
        refreshTasks: true,
        modalPrefix: 'entitlement',
      });
      wrapper.vm.leftPanelExpanded = true;
      wrapper.vm.updateAccessByFilter({});
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
            { operand: { targetName: 'decision.certification.primaryReviewer.id', targetValue: '' }, operator: 'EQUALS' },
            { operand: { targetName: 'item.type', targetValue: 'entitlementGrant' }, operator: 'EQUALS' },
          ],
          operator: 'AND',
        },
      });
    });
    it('should raise activity modal event with right modal id', () => {
      const wrapper = shallowMountComponent({}, {
        certificationGrantType: 'entitlements',
        showGroupBy: true,
        entitlementUserId: '66f3b405-60db-42a6-8a7a-59f6470348f6',
        isAdmin: true,
        refreshTasks: true,
        modalPrefix: 'entitlement',
      });
      const item = {
        decision: {
          certification: {
            comments: ['test'],
          },
        },
      };
      wrapper.vm.openActivityModal(item);
      expect(wrapper.vm.$bvModal.show).toBeCalledWith('certification-entitlement-activity', undefined);
    });
    it('should raise forward modal event with right modal id', () => {
      const wrapper = shallowMountComponent({}, {
        certificationGrantType: 'entitlements',
        showGroupBy: true,
        entitlementUserId: '66f3b405-60db-42a6-8a7a-59f6470348f6',
        isAdmin: true,
        refreshTasks: true,
        modalPrefix: 'entitlement',
      });
      wrapper.vm.openForwardModal('1234', true);
      expect(wrapper.vm.$bvModal.show).toBeCalledWith('certification-entitlement-forward', undefined);
    });
  });
  describe('Verify items', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
      jest.clearAllMocks();
    });
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
    it('are disabled and do not exist if is in staging with showGroupBy and accounts certificationGrantType, allowing bulk with exception duration and enabled forward', async () => {
      const { domWrapper, wrapper } = mountComponent({
        campaignDetails: {
          allowBulkCertify: true,
          status: 'staging',
          exceptionDuration: 1,
          enableForward: true,
        },
        certificationGrantType: 'accounts',
        showGroupBy: true,
      });
      wrapper.vm.loadItemsList(resource, 1);
      await flushPromises();

      const bulkSelectDropdown = findByTestId(wrapper, 'bulk-select-dropdown');
      expect(bulkSelectDropdown.exists()).toBeFalsy();
      const itemSelectCheckbox = findByTestId(wrapper, 'multiselect-test-id-0');
      expect(itemSelectCheckbox.exists()).toBeFalsy();

      const revokeBtn = findByTestId(wrapper, 'btnRevoke-test-id-0');
      expect(revokeBtn.attributes('disabled')).toBeDefined();
      const allowExceptionBtn = findByTestId(wrapper, 'btnAllowException-test-id-0');
      expect(allowExceptionBtn.attributes('disabled')).toBeDefined();

      await toggleActionsMenu(domWrapper);
      const forwardBtn = findByRole(domWrapper, 'menuitem', 'Forward');
      expect(forwardBtn.classes()).toContain('disabled');
      const addCommentBtn = findByRole(domWrapper, 'menuitem', 'Add Comment');
      expect(addCommentBtn.classes()).toContain('disabled');
      const cartReviewersBtn = findByRole(domWrapper, 'menuitem', 'View Reviewers');
      expect(cartReviewersBtn.classes()).toContain('disabled');
    });
    it('are enabled and do exist if is not in staging with showGroupBy and accounts certificationGrantType, allowing bulk with exception duration and enabled forward', async () => {
      const { domWrapper, wrapper } = mountComponent({
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

      const bulkSelectDropdown = findByTestId(wrapper, 'bulk-select-dropdown');
      expect(bulkSelectDropdown.exists()).toBeTruthy();
      const itemSelectCheckbox = findByTestId(wrapper, 'multiselect-test-id-0');
      expect(itemSelectCheckbox.exists()).toBeTruthy();

      const revokeBtn = findByTestId(wrapper, 'btnRevoke-test-id-0');
      expect(revokeBtn.attributes('disabled')).toBeFalsy();
      const allowExceptionBtn = findByTestId(wrapper, 'btnAllowException-test-id-0');
      expect(allowExceptionBtn.attributes('disabled')).toBeFalsy();

      await toggleActionsMenu(domWrapper);
      const forwardBtn = findByRole(domWrapper, 'menuitem', 'Forward');
      expect(forwardBtn.classes()).not.toContain('disabled');
      const addCommentBtn = findByRole(domWrapper, 'menuitem', 'Add Comment');
      expect(addCommentBtn.classes()).not.toContain('disabled');
      const cartReviewersBtn = findByRole(domWrapper, 'menuitem', 'View Reviewers');
      expect(cartReviewersBtn.classes()).not.toContain('disabled');
    });
    it('does exist if it not in staging with showGroupBy and accounts certificationGrantType, allowing bulk with exception duration and enabled forward', async () => {
      const { wrapper } = mountComponent({
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
      const { wrapper } = mountComponent({
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

  describe('rowAttrs', () => {
    it('returns a data-item-id attribute for row type', () => {
      const wrapper = shallowMountComponent();
      expect(wrapper.vm.rowAttrs({ id: 'abc-123' }, 'row')).toEqual({ 'data-item-id': 'abc-123' });
    });

    it('returns empty object for non-row type', () => {
      const wrapper = shallowMountComponent();
      expect(wrapper.vm.rowAttrs({ id: 'abc-123' }, 'row-details')).toEqual({});
    });
  });

  describe('restoreFocus', () => {
    it('is a no-op when itemId is falsy', () => {
      const wrapper = shallowMountComponent();
      wrapper.vm.$refs.selectableTable = null;
      expect(() => wrapper.vm.restoreFocus(null)).not.toThrow();
    });

    it('focuses the more-actions button in the matching row', () => {
      const wrapper = shallowMountComponent();
      const tableEl = document.createElement('div');
      const row = document.createElement('tr');
      row.setAttribute('data-item-id', 'item-999');
      const btn = document.createElement('button');
      btn.setAttribute('aria-haspopup', 'true');
      row.appendChild(btn);
      tableEl.appendChild(row);
      const focusSpy = jest.spyOn(btn, 'focus').mockImplementation(() => {});

      wrapper.vm.restoreFocus('item-999', tableEl);

      expect(focusSpy).toHaveBeenCalled();
    });

    it('falls back to the first table more-actions button when the item row is no longer in the list', () => {
      const wrapper = shallowMountComponent();
      const tableEl = document.createElement('div');
      const row = document.createElement('tr');
      row.setAttribute('data-item-id', 'other-item');
      const btn = document.createElement('button');
      btn.setAttribute('aria-haspopup', 'true');
      row.appendChild(btn);
      tableEl.appendChild(row);
      const focusSpy = jest.spyOn(btn, 'focus').mockImplementation(() => {});

      wrapper.vm.restoreFocus('missing-item', tableEl);

      expect(focusSpy).toHaveBeenCalled();
    });
  });

  describe('focus restoration after item list reload', () => {
    it('handleAction sets refocusItemId to the acting item id', () => {
      const wrapper = shallowMountComponent();
      jest.spyOn(wrapper.vm, 'openForwardModal').mockImplementation(() => {});
      wrapper.vm.handleAction('forward', { id: 'item-abc' });
      expect(wrapper.vm.refocusItemId).toBe('item-abc');
    });

    it('updateItemList captures refocusItemId and passes it to restoreFocus after reload', async () => {
      const wrapper = shallowMountComponent();
      const restoreFocusSpy = jest.spyOn(wrapper.vm, 'restoreFocus').mockImplementation(() => {});
      wrapper.vm.refocusItemId = 'item-xyz';
      wrapper.vm.updateItemList('saveSuccessful', 1);
      await flushPromises();
      expect(restoreFocusSpy).toHaveBeenCalledWith('item-xyz');
    });

    it('updateItemList clears refocusItemId before the reload fires', () => {
      const wrapper = shallowMountComponent();
      jest.spyOn(wrapper.vm, 'restoreFocus').mockImplementation(() => {});
      wrapper.vm.refocusItemId = 'item-xyz';
      wrapper.vm.updateItemList('saveSuccessful', 1);
      expect(wrapper.vm.refocusItemId).toBe(null);
    });

    it('updateItemList passes null to restoreFocus when called from a bulk action path', async () => {
      const wrapper = shallowMountComponent();
      const restoreFocusSpy = jest.spyOn(wrapper.vm, 'restoreFocus').mockImplementation(() => {});
      // refocusItemId is never set by bulk action handlers
      wrapper.vm.updateItemList('certifySuccess', 1);
      await flushPromises();
      expect(restoreFocusSpy).toHaveBeenCalledWith(null);
    });

    it('addComment calls restoreFocus with the stored item id after the list reloads', async () => {
      const wrapper = shallowMountComponent();
      const restoreFocusSpy = jest.spyOn(wrapper.vm, 'restoreFocus').mockImplementation(() => {});
      wrapper.vm.refocusItemId = 'comment-item';
      wrapper.vm.currentLineItemIdSelectedModal = '1';
      wrapper.vm.items = [{
        id: '1',
        decision: { certification: { comments: [] } },
      }];
      wrapper.vm.addComment('test comment');
      await flushPromises();
      expect(restoreFocusSpy).toHaveBeenCalledWith('comment-item');
    });
  });
});
