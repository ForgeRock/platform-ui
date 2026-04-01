/**
 * Copyright 2023-2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import {
  DOMWrapper,
  shallowMount,
  mount,
  flushPromises,
} from '@vue/test-utils';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import { createAppContainer, findByTestId, toggleActionsMenu } from '@forgerock/platform-shared/src/utils/testHelpers';
import BootstrapVue from 'bootstrap-vue';
import {
  getTemplateList,
  deleteTemplate,
  duplicateTemplate,
  runPublishedTemplate,
} from '@/api/governance/TemplateApi';
import Templates from './index';

jest.mock('@/api/governance/TemplateApi');

const templateDataMock = {
  data: {
    totalHits: 1,
    result: [
      {
        certificationType: 'identity',
        id: '859be895-0211-4992-bfb7-7248431c1c4f',
        name: 'Demo template test 16',
        status: 'pending',
      },
    ],
  },
};

let wrapper;
describe('test with shallow mount', () => {
  setupTestPinia();
  function shallowMountComponent(options, data) {
    wrapper = shallowMount(Templates, {
      global: {
        mocks: {
          $t: (t) => t,
          $router: { push: jest.fn() },
          $bvModal: {
            show: jest.fn(),
            hide: jest.fn(),
          },
          ...options,
        },
        plugins: [BootstrapVue],
      },
      data() {
        return {
          ...data,
        };
      },
    });
  }
  describe('Templates', () => {
    beforeEach(() => {
      getTemplateList.mockImplementation(() => Promise.resolve({ data: 'results' }));
    });
    afterEach(() => {
      jest.clearAllMocks();
    });
    describe('Methods', () => {
      describe('clear', () => {
        beforeEach(() => {
          shallowMountComponent();
        });
        it('should set search query to the default value', () => {
          wrapper.vm.clear();
          expect(wrapper.vm.searchQuery).toEqual('');
        });
        it('should call the search function', () => {
          const searchSpy = jest.spyOn(wrapper.vm, 'search');
          wrapper.vm.clear();
          expect(searchSpy).toHaveBeenCalled();
        });
      });
      describe('formatDate', () => {
        it('Should return the param date with the format MMM D, YYYY', () => {
          const result = wrapper.vm.formatDate('12/11/2022');
          expect(result).toEqual('Dec 11, 2022');
        });
      });
      describe('sortTemplates', () => {
        beforeEach(() => {
          shallowMountComponent();
        });
        it('Should call getTemplateData with the main page number', () => {
          const getTemplateDataSpy = jest.spyOn(wrapper.vm, 'getTemplateData');
          const mainPageNumber = 1;
          wrapper.vm.mainPageNumber = mainPageNumber;
          wrapper.vm.sortTemplates({ sortBy: 'name' });
          expect(getTemplateDataSpy).toBeCalledWith(mainPageNumber);
        });
        it('Should set the right values for sortBy and sortDesc depending on the params', () => {
          wrapper.vm.sortTemplates({ sortBy: 'name' });
          expect(wrapper.vm.sortBy).toEqual('name');
          expect(wrapper.vm.sortDesc).toEqual(true);
        });
      });
      describe('search', () => {
        beforeEach(() => {
          wrapper.vm.mainPageNumber = 1;
          shallowMountComponent();
        });
        it('should set the current page with the mainPageNumber', () => {
          wrapper.vm.search();
          expect(wrapper.vm.currentPage).toEqual(1);
        });
        it('should call the search function', () => {
          const getTemplateDataSpy = jest.spyOn(wrapper.vm, 'getTemplateData');
          wrapper.vm.clear();
          expect(getTemplateDataSpy).toBeCalledWith(1);
        });
      });
      describe('paginationChange', () => {
        it('should call getTemplateData with the pagination page', async () => {
          shallowMountComponent();
          const getTemplateDataSpy = jest.spyOn(wrapper.vm, 'getTemplateData');
          await flushPromises();
          wrapper.vm.paginationPage = 1;
          wrapper.vm.paginationChange(1);
          await flushPromises();
          expect(getTemplateDataSpy).toBeCalledWith(1);
        });
      });
      describe('loadTemplateList', () => {
        it('should set totalRows with the totalHits property from the endpoint', () => {
          wrapper.vm.loadTemplateList(templateDataMock, 0);
          expect(wrapper.vm.totalRows).toBe(1);
        });
        it('should set the currentPage with the page param', () => {
          wrapper.vm.loadTemplateList(templateDataMock, 0);
          expect(wrapper.vm.currentPage).toBe(0);
        });
        it('should set the templatesData with the result from the endpoint', () => {
          wrapper.vm.loadTemplateList(templateDataMock, 0);
          expect(wrapper.vm.templatesData).toStrictEqual(templateDataMock.data.result);
        });
      });
      describe('buildUrlParams', () => {
        it('should return the urlParams according to the params', () => {
          wrapper.vm.pageSize = 10;
          const expectedValue = {
            queryString: 'queryTest',
            pageSize: 10,
            pageNumber: 2,
            sortBy: 'name',
            sortDesc: false,
          };
          const result = wrapper.vm.buildUrlParams('queryTest', 3, 'name', false);
          expect(result).toStrictEqual(expectedValue);
        });
      });
      describe('createNewTemplate', () => {
        it('createNewTemplate should show the campaign template type modal', () => {
          shallowMountComponent();
          wrapper.vm.createNewTemplate();
          expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('CampaignTemplateTypeModal');
        });
      });
      describe('getTemplateData', () => {
        beforeEach(() => {
          wrapper.vm.searchQuery = 'testQuery';
          wrapper.vm.currentPage = 2;
          wrapper.vm.sortBy = 'name';
          wrapper.vm.sortDesc = false;
          shallowMountComponent();
          getTemplateList.mockImplementation(() => Promise.resolve({ data: 'results' }));
        });
        it('should call loadTemplateList once the result of the call is ready', async () => {
          const loadTemplateListSpy = jest.spyOn(wrapper.vm, 'loadTemplateList');
          wrapper.vm.getTemplateData(2);

          await wrapper.vm.$nextTick();
          expect(loadTemplateListSpy).toHaveBeenCalledWith({ data: 'results' }, 2);
        });
        it('should call buildUrlParams with the required params', () => {
          const buildUrlParamsSpy = jest.spyOn(wrapper.vm, 'buildUrlParams');
          wrapper.vm.getTemplateData(2);
          expect(buildUrlParamsSpy).toHaveBeenCalledWith('', 2, 'name', false);
        });
        it('should call buildUrlParams with the required params', () => {
          wrapper.vm.getTemplateData(2);
          expect(getTemplateList).toHaveBeenCalled();
        });
      });
      describe('isStatusPending', () => {
        it('should set the new template id to rowTemplateSelectedId', () => {
          expect(wrapper.vm.isStatusPending({ status: 'active', id: 'testId' })).toBeFalsy();
          expect(wrapper.vm.isStatusPending({ status: 'pending', id: 'testId' })).toBeTruthy();
        });
      });
      describe('openDeleteModal', () => {
        it('should set the new template id to rowTemplateSelectedId', () => {
          wrapper.vm.openDeleteModal('templateIdTest');
          expect(wrapper.vm.rowTemplateSelectedId).toBe('templateIdTest');
        });
        it('should call $bvModal to show the delete modal', () => {
          wrapper.vm.openDeleteModal();
          expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('deleteModal');
        });
      });
      describe('openRunModal', () => {
        it('should set the new template id to rowTemplateSelectedId', () => {
          wrapper.vm.openRunModal('templateIdTest');
          expect(wrapper.vm.rowTemplateSelectedId).toBe('templateIdTest');
        });
        it('should call $bvModal to run the template', () => {
          wrapper.vm.openRunModal();
          expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('runPublishedTemplateModal');
        });
      });
      describe('openScheduleModal', () => {
        it('should set the new template id to rowTemplateSelectedId', () => {
          wrapper.vm.openScheduleModal('templateIdTest');
          expect(wrapper.vm.rowTemplateSelectedId).toBe('templateIdTest');
        });
        it('should set the schedule param to rowTemplateSelectedSchedule', () => {
          wrapper.vm.openScheduleModal('templateIdTest', {});
          expect(wrapper.vm.rowTemplateSelectedSchedule).toStrictEqual({});
        });
        it('should  call $bvModal to show the schedule form', () => {
          wrapper.vm.openScheduleModal();
          expect(wrapper.vm.$bvModal.show).toHaveBeenCalledWith('scheduleTemplateFormModal');
        });
      });
      describe('deleteTemplate', () => {
        beforeEach(() => {
          wrapper.vm.rowTemplateSelectedId = 'templateIdTest';
          wrapper.vm.mainPageNumber = 1;
          jest.clearAllMocks();
          deleteTemplate.mockImplementation(() => Promise.resolve({ data: 'results' }));
          shallowMountComponent();
        });
        it('should call displayNotification with success the right translation', async () => {
          const displayNotificationSpy = jest.spyOn(wrapper.vm, 'displayNotification');
          wrapper.vm.deleteTemplate();

          await flushPromises();
          expect(displayNotificationSpy).toHaveBeenCalledWith('success', 'governance.templates.notifications.deleteSuccess');
        });
        it('should call getTemplateData once the result of the call is ready with the page number', async () => {
          const getTemplateDataSpy = jest.spyOn(wrapper.vm, 'getTemplateData');
          wrapper.vm.deleteTemplate();

          await flushPromises();
          expect(getTemplateDataSpy).toHaveBeenCalledWith(1);
        });
        it('should set the predifined values after the deletion is completed', async () => {
          wrapper.vm.deleteTemplate();

          await flushPromises();
          expect(wrapper.vm.rowTemplateSelectedId).toBe(null);
          expect(wrapper.vm.paginationPage).toBe(1);
        });
      });
      describe('duplicateTemplate', () => {
        beforeEach(() => {
          wrapper.vm.rowTemplateSelectedId = 'templateIdTest';
          wrapper.vm.mainPageNumber = 1;
          duplicateTemplate.mockImplementation(() => Promise.resolve({ data: 'results' }));
          shallowMountComponent();
        });
        it('should call duplicateTemplate with the template id selected', () => {
          wrapper.vm.duplicateTemplate({ id: 'templateIdTest', name: 'templateName' });
          expect(duplicateTemplate).toBeCalledWith('templateIdTest');
        });
        it('should set the predifined values after the duplication is completed', async () => {
          wrapper.vm.duplicateTemplate({ id: 'templateIdTest', name: 'templateName' });

          await flushPromises();
          expect(wrapper.vm.isLoading).toBe(false);
          expect(wrapper.vm.rowTemplateSelectedId).toBe(null);
        });
      });
      describe('runTemplate', () => {
        beforeEach(() => {
          wrapper.vm.rowTemplateSelectedId = 'templateIdTest';
          jest.clearAllMocks();
          runPublishedTemplate.mockImplementation(() => Promise.resolve({ data: 'results' }));
          shallowMountComponent();
        });
        it('should call getTemplateData once the result of the call is ready with the page number', async () => {
          const getTemplateDataSpy = jest.spyOn(wrapper.vm, 'getTemplateData');
          wrapper.vm.runTemplate();

          await wrapper.vm.$nextTick();
          expect(getTemplateDataSpy).toHaveBeenCalledWith(1);
        });
        it('should call $bvModal to hide runTemplateModal ', () => {
          wrapper.vm.runTemplate();
          expect(wrapper.vm.$bvModal.hide).toHaveBeenCalledWith('runPublishedTemplateModal');
        });
        it('should set the predifined values after running the template', async () => {
          wrapper.vm.runTemplate();

          await wrapper.vm.$nextTick();
          expect(wrapper.vm.rowTemplateSelectedId).toBe(null);
        });
      });
    });
  });
});
describe('test with mount', () => {
  async function flush() {
    await flushPromises();
    jest.runAllTimers();
  }
  function getDomWrapper() {
    return new DOMWrapper(document.body);
  }
  async function mountComponent() {
    jest.useFakeTimers();
    wrapper = mount(Templates, {
      attachTo: createAppContainer(),
      global: {
        mocks: {
          $t: (t) => t,
          $store: { state: { SharedStore: { governanceEnabledV4: true } } },
          $bvModal: {
            show: jest.fn(),
            hide: jest.fn(),
          },
        },
      },
    });
  }
  beforeEach(() => {
    document.body.innerHTML = '';
    const templateMock = {
      data: {
        totalHits: 1,
        result: [
          {
            certificationType: 'identity',
            id: '859be895-0211-4992-bfb7-test',
            name: 'Demo template test pending',
            status: 'pending',
          },
          {
            certificationType: 'identity',
            id: '859be895-0211-4992-bfb7-testActive',
            name: 'Demo template test active',
            status: 'active',
          },
        ],
      },
    };

    getTemplateList.mockImplementation(() => Promise.resolve(templateMock));
    mountComponent();
  });
  it('test elipsis with different Status', async () => {
    const deleteSpy = jest.spyOn(wrapper.vm, 'openDeleteModal');
    const domWrapper = getDomWrapper();

    await toggleActionsMenu(wrapper);

    const deleteCell = findByTestId(domWrapper, 'dropdown-delete-certification-template-0');
    deleteCell.trigger('click');
    await flush();

    expect(deleteSpy).toHaveBeenCalledWith('859be895-0211-4992-bfb7-test');

    const deleteCellActive = findByTestId(wrapper, 'dropdown-delete-certification-template-1');
    expect(deleteCellActive.exists()).toBeFalsy();
  });
  it('should show noData component when there are no templates', async () => {
    wrapper.vm.loadTemplateList({ data: { result: [], totalHits: 0 } }, 0);
    await flushPromises();

    const noData = findByTestId(wrapper, 'templates-no-data');
    expect(noData.exists()).toBeTruthy();
  });
});
