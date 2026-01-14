/**
 * Copyright (c) 2025-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as AutoApi from '@forgerock/platform-shared/src/api/AutoApi';
import {
  createAppContainer,
  findByText,
  findByRole,
  toggleActionsMenu,
} from '@forgerock/platform-shared/src/utils/testHelpers';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import { mockModal } from '@forgerock/platform-shared/src/testing/utils/mockModal';
import { mockNotification } from '@forgerock/platform-shared/src/testing/utils/mockNotification';
import { DOMWrapper, mount, flushPromises } from '@vue/test-utils';
import { cloneDeep } from 'lodash';
import i18n from '@/i18n';
import Reports from './Reports';
import store from '../../store';

store.state.SharedStore.currentPackage = 'admin';
store.state.SharedStore.autoCustomReportsEnabled = true;

mockValidation(['alpha_num_spaces', 'unique']);
let showErrorMessage;
let displayNotification;
jest.mock('vue-router', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

describe('Reports', () => {
  let modalShow;
  function setup(props = {}) {
    ({ modalShow } = mockModal());
    ({ displayNotification, showErrorMessage } = mockNotification());
    const domWrapper = new DOMWrapper(document.body);
    const wrapper = mount(Reports, {
      attachTo: createAppContainer(),
      global: {
        plugins: [i18n],
        mocks: {
          $router: {
            push: jest.fn(),
          },
        },
      },
      props,
    });
    return { wrapper, domWrapper };
  }
  const templates = {
    result: [
      {
        name: 'OOTB-TEMPLATE',
        displayName: 'Ootb Template',
        description: 'Provides the history of when the provided user(s) accessed the provided app integration in the realm for a given period of time',
        version: 0,
        reportConfig: '{"version":"v2"}',
        viewers: [],
        owner: '',
        type: 'published',
        parentName: '',
        parentVersion: -1,
        failureReason: '',
        parameters: '',
        createDate: '2025-02-10T10:30:50.049221962Z',
        updateDate: '2025-02-10T10:30:50.049239299Z',
        ootb: true,
        duplicatable: false,
        editable: false,
        visible: true,
      },
      {
        name: 'DRAFT-TEMPLATE',
        displayName: 'Draft Template',
        description: 'Draft Report',
        version: 0,
        reportConfig: '{"version":"v2"}',
        viewers: [
          'report_viewer',
          '9c10900f-d2d7-42bc-9672-6bdba1ecd1aa',
          '5e4724ff-a802-4e4e-a08c-8cbde05a95a5',
        ],
        owner: 'ddba1ec0-9bda-4cfe-b3cd-c8e6c95ab56b',
        type: 'draft',
        parentName: '',
        parentVersion: -1,
        failureReason: '',
        parameters: '',
        createDate: '2025-02-11T15:38:42.150209479Z',
        updateDate: '2025-02-11T15:38:42.150216547Z',
        ootb: false,
        duplicatable: true,
        editable: true,
        visible: true,
      },
      {
        name: 'PUBLISHED-TEMPLATE',
        displayName: 'Published Template',
        description: 'Published Report',
        version: 1,
        reportConfig: '{"version":"v2"}',
        viewers: [
          'report_viewer',
          '9c10900f-d2d7-42bc-9672-6bdba1ecd1aa',
          '5e4724ff-a802-4e4e-a08c-8cbde05a95a5',
        ],
        owner: 'ddba1ec0-9bda-4cfe-b3cd-c8e6c95ab56b',
        type: 'published',
        parentName: '',
        parentVersion: -1,
        failureReason: '',
        parameters: '',
        createDate: '2025-02-11T15:38:42.150209479Z',
        updateDate: '2025-02-11T15:39:40.022730318Z',
        ootb: false,
        duplicatable: true,
        editable: true,
        visible: true,
      },
      {
        name: 'OOTB-TEMPLATE-DUPLICATABLE',
        displayName: 'Ootb Template Duplicatable',
        description: 'Duplicatable template that provides the history of when the provided user(s) accessed the provided app integration in the realm for a given period of time',
        version: 0,
        reportConfig: '{"version":"v2"}',
        viewers: [],
        owner: '',
        type: 'published',
        parentName: '',
        parentVersion: -1,
        failureReason: '',
        parameters: '',
        createDate: '2025-02-10T10:30:50.049221962Z',
        updateDate: '2025-02-10T10:30:50.049239299Z',
        ootb: true,
        duplicatable: true,
        editable: false,
        visible: true,
      },
      {
        name: 'TEMPLATE-VISIBLE-NOT-VISIBLE',
        displayName: 'Template Visible Not Visible',
        description: 'Not visible template that should not be shown in the Report table',
        version: 0,
        reportConfig: '{"version":"v2"}',
        viewers: [],
        owner: '',
        type: 'published',
        parentName: '',
        parentVersion: -1,
        failureReason: '',
        parameters: '',
        createDate: '2025-02-10T10:30:50.049221962Z',
        updateDate: '2025-02-10T10:30:50.049239299Z',
        ootb: true,
        duplicatable: true,
        editable: false,
        visible: true,
      },
    ],
  };

  beforeEach(() => {
    AutoApi.getReportTemplates = jest.fn().mockResolvedValue(templates);
    document.body.innerHTML = '';

    window.URL.createObjectURL = jest.fn(() => 'mock-url');
    window.URL.revokeObjectURL = jest.fn();

    const originalCreateElement = document.createElement.bind(document);
    document.createElement = jest.fn((tag) => {
      if (tag === 'a') {
        const element = originalCreateElement(tag);
        element.click = jest.fn();
        return element;
      }
      return originalCreateElement(tag);
    });

    const originalAppendChild = document.body.appendChild.bind(document.body);
    document.body.appendChild = jest.fn((node) => originalAppendChild(node));

    const originalRemoveChild = document.body.removeChild.bind(document.body);
    document.body.removeChild = jest.fn((node) => {
      if (node && node.parentNode) {
        return originalRemoveChild(node);
      }
      return node;
    });
  });

  it('Report cards displayed successfully', async () => {
    const { wrapper } = setup();
    await flushPromises();

    const table = wrapper.find('table');
    expect(table.exists()).toBe(true);

    const rows = table.findAll('tbody tr');
    expect(rows.length).toBe(5);
    expect(rows[0].text()).toContain('Draft Template');
    expect(rows[0].text()).toContain('Draft Report');
    expect(rows[0].find('.badge').text()).toBe('Draft');
    expect(rows[1].text()).toContain('Ootb Template');
    expect(rows[1].text()).toContain('Provides the history of when the provided user(s) accessed the provided app integration in the realm for a given period of time');
    expect(rows[1].find('.badge').exists()).toBe(false);
    expect(rows[1].text()).toContain('--');
    expect(rows[2].text()).toContain('Ootb Template Duplicatable');
    expect(rows[2].text()).toContain('Duplicatable template that provides the history of when the provided user(s) accessed the provided app integration in the realm for a given period of time');
    expect(rows[3].text()).toContain('Published Template');
    expect(rows[3].text()).toContain('Published Report');
    expect(rows[3].find('.badge').text()).toBe('Published');
    expect(rows[4].text()).toContain('Template Visible Not Visible');
    expect(rows[4].text()).toContain('Not visible template that should not be shown in the Report table');

    const noData = wrapper.findComponent({ name: 'NoData' });
    expect(noData.exists()).toBe(false);
  });

  it('should not show the report template that is set to visible = false', async () => {
    // Set template to not visible
    const clonedTemplates = cloneDeep(templates);
    clonedTemplates.result[4].visible = false;
    AutoApi.getReportTemplates = jest.fn().mockResolvedValue(clonedTemplates);

    const { wrapper } = setup();
    await flushPromises();

    const table = wrapper.find('table');
    const rows = table.findAll('tbody tr');

    // One fewer row
    expect(rows.length).toBe(4);
  });

  it('should show correct actions for out of the box templates', async () => {
    const { wrapper, domWrapper } = setup();
    await flushPromises();

    const rows = wrapper.findAll('table tbody tr');
    await toggleActionsMenu(rows[1]);
    const actions = domWrapper.findAll('#app > .menu a[role="menuitem"]');
    expect(actions.length).toBe(1);
    expect(actions[0].text()).toBe('list_altRun History');
  });

  it('should show correct actions for draft templates', async () => {
    const { wrapper, domWrapper } = setup();
    await flushPromises();

    const rows = wrapper.findAll('table tbody tr');
    await toggleActionsMenu(rows[0]);
    const actions = domWrapper.findAll('#app > .menu a[role="menuitem"]');
    expect(actions.length).toBe(7);
    expect(actions[0].text()).toBe('list_altRun History');
    expect(actions[1].text()).toBe('person_addAssign Report');
    expect(actions[2].text()).toBe('editEdit Template');
    expect(actions[3].text()).toBe('control_point_duplicateDuplicate');
    expect(actions[4].text()).toBe('published_with_changesPublish');
    expect(actions[5].text()).toBe('file_downloadExport');
    expect(actions[6].text()).toBe('deleteDelete');
  });

  it('should show correct actions for published templates', async () => {
    const { wrapper, domWrapper } = setup();
    await flushPromises();

    const rows = wrapper.findAll('table tbody tr');
    await toggleActionsMenu(rows[3]);
    const actions = domWrapper.findAll('#app > .menu a[role="menuitem"]');
    expect(actions.length).toBe(5);
    expect(actions[0].text()).toBe('list_altRun History');
    expect(actions[1].text()).toBe('editEdit Template');
    expect(actions[2].text()).toBe('control_point_duplicateDuplicate');
    expect(actions[3].text()).toBe('file_downloadExport');
    expect(actions[4].text()).toBe('deleteDelete');
  });

  it('should show correct actions for ootb duplicatable templates', async () => {
    const { wrapper, domWrapper } = setup();
    await flushPromises();

    const rows = wrapper.findAll('table tbody tr');
    await toggleActionsMenu(rows[2]);
    const actions = domWrapper.findAll('#app > .menu a[role="menuitem"]');
    expect(actions.length).toBe(2);
    expect(actions[0].text()).toBe('list_altRun History');
    expect(actions[1].text()).toBe('control_point_duplicateDuplicate');
  });

  it('No data div displayed when error', async () => {
    const error = new Error('Error');
    AutoApi.getReportTemplates = jest.fn().mockRejectedValue(error);

    const { wrapper } = setup();
    await flushPromises();

    const table = wrapper.find('table');
    expect(table.exists()).toBe(false);

    const noData = wrapper.findComponent({ name: 'NoData' });
    expect(noData.exists()).toBe(true);

    expect(showErrorMessage).toHaveBeenCalledWith(error, 'No Report Template found');
  });

  it('ensures that the confirm delete modal call is executed when the delete report button is clicked', async () => {
    const { wrapper, domWrapper } = setup();
    await flushPromises();

    await toggleActionsMenu(wrapper);
    const deleteButton = findByText(domWrapper, 'span', 'Delete');
    await deleteButton.trigger('click');
    expect(modalShow).toHaveBeenCalledWith('deleteModal');
  });

  it('deletes a report', async () => {
    AutoApi.deleteAnalyticsReport = jest.fn().mockResolvedValue({});
    const { wrapper, domWrapper } = setup();
    await flushPromises();

    // Opens delete modal
    await toggleActionsMenu(wrapper);
    await findByText(domWrapper, 'a', 'Delete').trigger('click');

    const { name, type } = templates.result[1];
    const deleteAnalyticsReportSpy = jest.spyOn(AutoApi, 'deleteAnalyticsReport');
    const deleteModal = wrapper.findComponent({ name: 'DeleteModal' });
    deleteModal.vm.$emit('delete-item');
    await flushPromises();
    expect(deleteAnalyticsReportSpy).toHaveBeenCalledWith(name, type);
  });

  it('routes to expected location when the edit report button is clicked for a draft report', async () => {
    const { wrapper, domWrapper } = setup();
    await flushPromises();

    const routerPushSpy = jest.spyOn(wrapper.vm.router, 'push');
    const rows = wrapper.findAll('table tbody tr');
    await toggleActionsMenu(rows[0]);
    const actions = domWrapper.findAll('#app > .menu a[role="menuitem"]');
    const editButton = actions[2];
    await editButton.trigger('click');

    expect(routerPushSpy).toHaveBeenCalledWith({
      name: 'EditReportTemplate',
      params: { state: 'draft', template: 'draft-template' },
    });
  });

  it('routes to expected location when the edit report button is clicked for a published report', async () => {
    AutoApi.editAnalyticsReport = jest.fn().mockReturnValue(Promise.resolve({}));
    const { wrapper, domWrapper } = setup();
    await flushPromises();

    const routerPushSpy = jest.spyOn(wrapper.vm.router, 'push');
    const rows = wrapper.findAll('table tbody tr');
    await toggleActionsMenu(rows[3]);
    const actions = domWrapper.findAll('#app > .menu a[role="menuitem"]');
    const editButton = actions[1];
    await editButton.trigger('click');
    expect(AutoApi.editAnalyticsReport).toHaveBeenCalledWith('PUBLISHED-TEMPLATE');
    expect(routerPushSpy).toHaveBeenCalledWith({
      name: 'EditReportTemplate',
      params: { state: 'draft', template: 'published-template' },
    });
  });

  it('hides the "New Report" button if the autoCustomReportsEnabled property in the store is set to false', async () => {
    let { wrapper } = setup();
    await flushPromises();

    let newReportButton = findByText(wrapper, 'button', 'addNew Report');
    expect(newReportButton.exists()).toBe(true);

    store.state.SharedStore.autoCustomReportsEnabled = false;
    ({ wrapper } = setup());
    await flushPromises();

    newReportButton = findByText(wrapper, 'button', 'addNew Report');
    expect(newReportButton).toBeUndefined();

    // Setting this property back to true so further tests do not fail unexpectedly
    store.state.SharedStore.autoCustomReportsEnabled = true;
  });

  it('opens the new report modal when the "Duplicate" button is clicked', async () => {
    const { wrapper, domWrapper } = setup();
    await flushPromises();

    const showSpy = jest.spyOn(wrapper.vm.bvModal, 'show');
    await toggleActionsMenu(wrapper);

    const duplicateButton = findByText(domWrapper, 'span', 'Duplicate');
    await duplicateButton.trigger('click');
    expect(showSpy).toHaveBeenCalledWith('new-report-modal');
  });

  it('should navigate to report run when run button is clicked', async () => {
    const { wrapper } = setup();
    await flushPromises();

    const routerPushSpy = jest.spyOn(wrapper.vm.$router, 'push');

    const rows = wrapper.findAll('table tbody tr');
    const runButton = findByText(rows[0], 'button', 'Run');
    await runButton.trigger('click');

    expect(routerPushSpy).toHaveBeenCalledWith({
      name: 'ReportRun',
      params: { state: 'draft', template: 'draft-template' },
    });
  });

  it('should navigate to report history wheni run history button is clicked', async () => {
    const { wrapper, domWrapper } = setup();
    await flushPromises();

    const routerPushSpy = jest.spyOn(wrapper.vm.$router, 'push');
    const rows = wrapper.findAll('table tbody tr');
    await toggleActionsMenu(rows[0]);
    const actions = domWrapper.findAll('#app > .menu a[role="menuitem"]');
    const runHistoryButton = actions[0];
    await runHistoryButton.trigger('click');

    expect(routerPushSpy).toHaveBeenCalledWith({
      name: 'ReportHistory',
      params: { state: 'draft', template: 'draft-template' },
    });
  });

  it('should open assign viewers modal when assign viewers button is clicked', async () => {
    const { wrapper, domWrapper } = setup();
    await flushPromises();

    const rows = wrapper.findAll('table tbody tr');
    await toggleActionsMenu(rows[0]);
    const actions = domWrapper.findAll('#app > .menu a[role="menuitem"]');
    const assignViewersButton = actions[1];
    await assignViewersButton.trigger('click');

    expect(modalShow).toHaveBeenCalledWith('assign-viewers-modal');
  });

  it('should open duplicate modal when duplicate button is clicked', async () => {
    const { wrapper, domWrapper } = setup();
    await flushPromises();

    const showSpy = jest.spyOn(wrapper.vm.bvModal, 'show');
    const rows = wrapper.findAll('table tbody tr');
    await toggleActionsMenu(rows[0]);
    const actions = domWrapper.findAll('#app > .menu a[role="menuitem"]');
    const duplicateButton = actions[3];
    await duplicateButton.trigger('click');

    expect(showSpy).toHaveBeenCalledWith('new-report-modal');
  });

  it('should publish correctly a report when publish button is clicked', async () => {
    AutoApi.publishAnalyticsReport = jest.fn().mockResolvedValue({});
    const { wrapper, domWrapper } = setup();
    await flushPromises();

    const rows = wrapper.findAll('table tbody tr');
    await toggleActionsMenu(rows[0]);
    const actions = domWrapper.findAll('#app > .menu a[role="menuitem"]');
    const publishButton = actions[4];
    await publishButton.trigger('click');

    expect(AutoApi.publishAnalyticsReport).toHaveBeenCalledWith('DRAFT-TEMPLATE', 'draft');
    expect(displayNotification).toHaveBeenCalledWith('success', 'Successfully published report');
    expect(wrapper.vm.reportBeingProcessed).toBeUndefined();
    expect(wrapper.vm.isPublishing).toBe(false);
  });

  it('should show error notification when publish fails', async () => {
    const error = new Error('Error');
    AutoApi.publishAnalyticsReport = jest.fn().mockRejectedValue(error);
    const { wrapper, domWrapper } = setup();
    await flushPromises();

    const rows = wrapper.findAll('table tbody tr');
    await toggleActionsMenu(rows[0]);
    const actions = domWrapper.findAll('#app > .menu a[role="menuitem"]');
    const publishButton = actions[4];
    await publishButton.trigger('click');

    expect(AutoApi.publishAnalyticsReport).toHaveBeenCalledWith('DRAFT-TEMPLATE', 'draft');
    expect(showErrorMessage).toHaveBeenCalledWith(error, 'Error publishing report');
    expect(wrapper.vm.reportBeingProcessed).toBeUndefined();
    expect(wrapper.vm.isPublishing).toBe(false);
  });

  it('assign viewers to a draft report correctly', async () => {
    AutoApi.editAnalyticsReport = jest.fn().mockResolvedValue({});
    AutoApi.saveAnalyticsReport = jest.fn().mockResolvedValue({});

    const { wrapper } = setup();
    await flushPromises();

    wrapper.vm.reportBeingProcessed = {
      name: 'DRAFT-TEMPLATE',
      displayName: 'Draft Template',
      type: 'draft',
      viewers: [],
    };
    await flushPromises();

    const assignViewersModal = wrapper.findComponent({ name: 'AssignViewersModal' });
    assignViewersModal.vm.$emit('save', ['1', '2']);
    await flushPromises();

    expect(AutoApi.editAnalyticsReport).not.toHaveBeenCalled();
    expect(AutoApi.saveAnalyticsReport).toHaveBeenCalledWith('DRAFT-TEMPLATE', {}, ['1', '2'], undefined, 'Draft Template');
    expect(displayNotification).toHaveBeenCalledWith('success', 'Report viewers saved successfully');
  });

  it('assign viewers to a published report correctly', async () => {
    AutoApi.editAnalyticsReport = jest.fn().mockResolvedValue({});
    AutoApi.saveAnalyticsReport = jest.fn().mockResolvedValue({});

    const { wrapper } = setup();
    await flushPromises();

    wrapper.vm.reportBeingProcessed = {
      name: 'PUBLISHED-TEMPLATE',
      displayName: 'Published Template',
      type: 'published',
      viewers: [],
    };
    await flushPromises();

    const assignViewersModal = wrapper.findComponent({ name: 'AssignViewersModal' });
    assignViewersModal.vm.$emit('save', ['1', '2']);
    await flushPromises();

    expect(AutoApi.editAnalyticsReport).toHaveBeenCalledWith('PUBLISHED-TEMPLATE');
    expect(AutoApi.saveAnalyticsReport).toHaveBeenCalledWith('PUBLISHED-TEMPLATE', {}, ['1', '2'], undefined, 'Published Template');
    expect(displayNotification).toHaveBeenCalledWith('success', 'Report viewers saved successfully');
  });

  it('should show error notification when assign viewers fails', async () => {
    const error = new Error('Error');
    AutoApi.saveAnalyticsReport = jest.fn().mockRejectedValue(error);

    const { wrapper } = setup();
    await flushPromises();
    wrapper.vm.reportBeingProcessed = {
      name: 'DRAFT-TEMPLATE',
      displayName: 'Draft Template',
      type: 'draft',
      viewers: [],
    };
    await flushPromises();

    const assignViewersModal = wrapper.findComponent({ name: 'AssignViewersModal' });
    assignViewersModal.vm.$emit('save', ['1', '2']);
    await flushPromises();

    expect(AutoApi.saveAnalyticsReport).toHaveBeenCalledWith('DRAFT-TEMPLATE', {}, ['1', '2'], undefined, 'Draft Template');
    expect(showErrorMessage).toHaveBeenCalledWith(error, 'Error saving report viewers');
  });

  it('should show error notification when assign viewers fails saving report', async () => {
    const error = new Error('Error');
    AutoApi.editAnalyticsReport = jest.fn().mockResolvedValue({});
    AutoApi.saveAnalyticsReport = jest.fn().mockRejectedValue(error);

    const { wrapper } = setup();
    await flushPromises();
    wrapper.vm.reportBeingProcessed = {
      name: 'PUBLISHED-TEMPLATE',
      displayName: 'Published Template',
      type: 'published',
      viewers: [],
    };
    await flushPromises();

    const assignViewersModal = wrapper.findComponent({ name: 'AssignViewersModal' });
    assignViewersModal.vm.$emit('save', ['1', '2']);
    await flushPromises();

    expect(AutoApi.editAnalyticsReport).toHaveBeenCalledWith('PUBLISHED-TEMPLATE');
    expect(AutoApi.saveAnalyticsReport).toHaveBeenCalledWith('PUBLISHED-TEMPLATE', {}, ['1', '2'], undefined, 'Published Template');
    expect(showErrorMessage).toHaveBeenCalledWith(error, 'Error saving report viewers');
  });

  it('search and filter report templates', async () => {
    const { wrapper } = setup();
    await flushPromises();

    const reportSearchField = wrapper.find('input[type="search"]');
    await reportSearchField.setValue('Published');
    await flushPromises();

    const rows = wrapper.findAll('table tbody tr');
    expect(rows.length).toBe(1);
    expect(rows[0].text()).toContain('Published Template');
  });

  it('should export a published custom report successfully', async () => {
    const mockBlob = new Blob(['test data'], { type: 'application/json' });
    AutoApi.exportAnalyticsReportTemplate = jest.fn().mockResolvedValue({ data: mockBlob });

    const { wrapper, domWrapper } = setup();
    await flushPromises();

    const rows = wrapper.findAll('table tbody tr');
    await toggleActionsMenu(rows[3]); // Published template
    const exportButton = findByRole(domWrapper, 'menuitem', 'Export');

    expect(exportButton).toBeDefined();
    await exportButton.trigger('click');
    await flushPromises();

    // After export completes, verify API was called correctly
    expect(AutoApi.exportAnalyticsReportTemplate).toHaveBeenCalledWith('PUBLISHED-TEMPLATE', 'published');
    expect(displayNotification).toHaveBeenCalledWith('success', i18n.global.t('reports.exportSuccess'));
    expect(wrapper.vm.templateBeingExported).toBeUndefined();
  });

  it('should export a draft custom report successfully', async () => {
    const mockBlob = new Blob(['test data'], { type: 'application/json' });
    AutoApi.exportAnalyticsReportTemplate = jest.fn().mockResolvedValue({ data: mockBlob });

    const { wrapper, domWrapper } = setup();
    await flushPromises();

    const rows = wrapper.findAll('table tbody tr');
    await toggleActionsMenu(rows[0]); // Draft template
    const exportButton = findByRole(domWrapper, 'menuitem', 'Export');

    expect(exportButton).toBeDefined();
    await exportButton.trigger('click');
    await flushPromises();

    expect(AutoApi.exportAnalyticsReportTemplate).toHaveBeenCalledWith('DRAFT-TEMPLATE', 'draft');
    expect(displayNotification).toHaveBeenCalledWith('success', i18n.global.t('reports.exportSuccess'));
    expect(wrapper.vm.templateBeingExported).toBeUndefined();
  });

  it('should display error message when export fails', async () => {
    const error = new Error('Export failed');
    AutoApi.exportAnalyticsReportTemplate = jest.fn().mockRejectedValue(error);

    const { wrapper, domWrapper } = setup();
    await flushPromises();

    const rows = wrapper.findAll('table tbody tr');
    await toggleActionsMenu(rows[3]); // Published template
    const exportButton = findByRole(domWrapper, 'menuitem', 'Export');

    await exportButton.trigger('click');
    await flushPromises();

    // After error, spinner should be cleared
    expect(wrapper.vm.templateBeingExported).toBeUndefined();
    expect(AutoApi.exportAnalyticsReportTemplate).toHaveBeenCalledWith('PUBLISHED-TEMPLATE', 'published');
    expect(showErrorMessage).toHaveBeenCalledWith(error, i18n.global.t('reports.exportError'));
  });

  it('should show spinner only for the specific report being exported (name-type format)', async () => {
    const mockBlob = new Blob(['test data'], { type: 'application/json' });
    // Create a promise that won't resolve immediately
    let resolveExport;
    const exportPromise = new Promise((resolve) => {
      resolveExport = resolve;
    });
    AutoApi.exportAnalyticsReportTemplate = jest.fn().mockReturnValue(exportPromise);

    const { wrapper, domWrapper } = setup();
    await flushPromises();

    const rows = wrapper.findAll('table tbody tr');
    await toggleActionsMenu(rows[0]); // Draft template
    const exportButton = findByRole(domWrapper, 'menuitem', 'Export');

    await exportButton.trigger('click');
    await wrapper.vm.$nextTick();

    // Verify state uses name-type format (ensures draft and published with same name don't conflict)
    expect(wrapper.vm.templateBeingExported).toBe('DRAFT-TEMPLATE-draft');
    expect(wrapper.vm.templateBeingExported).not.toBe('PUBLISHED-TEMPLATE-published');

    // The FrActionsCell should be hidden and spinner div should be shown for draft only
    const spinnerDivs = wrapper.findAll('.w-42.h-42');
    expect(spinnerDivs.length).toBeGreaterThan(0);

    // Now resolve the export
    resolveExport({ data: mockBlob });
    await flushPromises();

    // After completion, spinner should be cleared
    expect(wrapper.vm.templateBeingExported).toBeUndefined();
  });

  it('should not show export button for out-of-the-box reports', async () => {
    const { wrapper, domWrapper } = setup();
    await flushPromises();

    const rows = wrapper.findAll('table tbody tr');
    await toggleActionsMenu(rows[1]); // OOTB template
    const exportButton = findByRole(domWrapper, 'menuitem', 'Export');

    expect(exportButton).toBeUndefined();
  });

  describe('Import functionality', () => {
    it('should show import button when custom reports are enabled', async () => {
      const { wrapper } = setup();
      await flushPromises();

      const importButton = findByText(wrapper, 'button', 'Import');
      expect(importButton).toBeDefined();
    });

    it('should hide import button when custom reports are disabled', async () => {
      store.state.SharedStore.autoCustomReportsEnabled = false;
      const { wrapper } = setup();
      await flushPromises();

      const importButton = findByText(wrapper, 'button', 'Import');
      expect(importButton).toBeUndefined();

      // Reset for other tests
      store.state.SharedStore.autoCustomReportsEnabled = true;
    });

    it('should open import modal when import button is clicked', async () => {
      const { wrapper } = setup();
      await flushPromises();

      const showSpy = jest.spyOn(wrapper.vm.bvModal, 'show');
      const importButton = findByText(wrapper, 'button', 'Import');
      await importButton?.trigger('click');

      expect(showSpy).toHaveBeenCalledWith('import-report-modal');
    });

    it('should navigate to edit page on successful import with report name', async () => {
      const { wrapper } = setup();
      await flushPromises();

      const routerPushSpy = jest.spyOn(wrapper.vm.router, 'push');
      const importModal = wrapper.findComponent({ name: 'ImportReportModal' });
      importModal.vm.$emit('import-success', 'IMPORTED-REPORT');

      expect(routerPushSpy).toHaveBeenCalledWith({
        name: 'EditReportTemplate',
        params: { state: 'draft', template: 'imported-report' },
      });
    });

    it('should refresh templates on successful import without report name', async () => {
      const getReportTemplatesSpy = jest.spyOn(AutoApi, 'getReportTemplates');
      const { wrapper } = setup();
      await flushPromises();

      // Clear previous calls
      getReportTemplatesSpy.mockClear();

      const importModal = wrapper.findComponent({ name: 'ImportReportModal' });
      importModal.vm.$emit('import-success', null);
      await flushPromises();

      expect(getReportTemplatesSpy).toHaveBeenCalled();
    });
  });
});
