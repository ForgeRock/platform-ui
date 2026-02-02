/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import * as AutoApi from '@forgerock/platform-shared/src/api/AutoApi';
import { mockModal } from '@forgerock/platform-shared/src/testing/utils/mockModal';
import { mockNotification } from '@forgerock/platform-shared/src/testing/utils/mockNotification';
import i18n from '@/i18n';
import ImportReportModal from './ImportReportModal';

/**
 * Creates a mock File object with a working text() method
 * @param {String} content - File content
 * @param {String} name - File name
 * @returns {File} Mock file object
 */
function createMockFile(content, name) {
  const file = new File([content], name, { type: 'application/json' });
  file.text = jest.fn().mockResolvedValue(content);
  return file;
}

/**
 * Sets files on an input element for testing
 * @param {Object} input - Input element wrapper
 * @param {Array} files - Array of files to set
 */
function setInputFiles(input, files) {
  Object.defineProperty(input.element, 'files', {
    value: files,
    writable: false,
  });
}

describe('ImportReportModal', () => {
  let wrapper;
  let modalHide;
  let displayNotification;

  function setup(props = {}) {
    ({ modalHide } = mockModal());
    ({ displayNotification } = mockNotification());
    wrapper = mount(ImportReportModal, {
      global: {
        plugins: [i18n],
      },
      props: {
        isTesting: true,
        ...props,
      },
    });
  }

  afterEach(() => {
    wrapper.unmount();
  });

  it('renders the modal with correct title', () => {
    setup();
    const modal = wrapper.findComponent({ name: 'BModal' });
    expect(modal.props('title')).toBe('Import Report');
  });

  it('renders the dropzone with drag and drop', () => {
    setup();
    const dropzoneLabel = i18n.global.t('reports.importReport.dropzoneLabel');
    const dropzone = wrapper.find(`[role="button"][aria-label="${dropzoneLabel}"]`);

    expect(dropzone.exists()).toBe(true);
    expect(dropzone.text()).toContain(i18n.global.t('reports.importReport.dragDrop'));
  });

  it('disables import button when no file is selected', () => {
    setup();
    const importButton = wrapper.findComponent({ name: 'ButtonWithSpinner' });
    expect(importButton.props('disabled')).toBe(true);
  });

  it('validates file on selection and shows error for invalid JSON', async () => {
    setup();
    const testFile = createMockFile('not valid json', 'test.json');

    const fileInputLabel = i18n.global.t('reports.importReport.fileInputLabel');
    const fileInput = wrapper.find(`input[type="file"][aria-label="${fileInputLabel}"]`);

    setInputFiles(fileInput, [testFile]);

    await fileInput.trigger('change');
    await flushPromises();

    const alert = wrapper.find('[role="alert"]');
    expect(alert.text()).toContain(i18n.global.t('reports.importReport.invalidJson'));

    const dropzoneLabel = i18n.global.t('reports.importReport.dropzoneLabel');
    const dropzone = wrapper.find(`[role="button"][aria-label="${dropzoneLabel}"]`);
    expect(dropzone.classes()).toContain('has-error');

    const importButton = wrapper.findComponent({ name: 'ButtonWithSpinner' });
    expect(importButton.props('disabled')).toBe(true);
  });

  it('enables import button when valid file is selected', async () => {
    setup();
    const validTemplate = JSON.stringify({
      displayName: 'Test Report',
      reportConfig: '{"version":"v2"}',
    });
    const testFile = createMockFile(validTemplate, 'test.json');

    const fileInputLabel = i18n.global.t('reports.importReport.fileInputLabel');
    const fileInput = wrapper.find(`input[type="file"][aria-label="${fileInputLabel}"]`);

    setInputFiles(fileInput, [testFile]);

    await fileInput.trigger('change');
    await flushPromises();

    const dropzoneLabel = i18n.global.t('reports.importReport.dropzoneLabel');
    const dropzone = wrapper.find(`[role="button"][aria-label="${dropzoneLabel}"]`);
    expect(dropzone.classes()).toContain('has-file');
    expect(dropzone.text()).toContain('test.json');

    const importButton = wrapper.findComponent({ name: 'ButtonWithSpinner' });
    expect(importButton.props('disabled')).toBe(false);
  });

  it('calls import API and emits success event on successful import', async () => {
    setup();
    const validTemplate = JSON.stringify({
      displayName: 'Test Report',
      reportConfig: '{"version":"v2"}',
    });
    const testFile = createMockFile(validTemplate, 'test.json');
    const mockResponse = { data: { name: 'imported-report' } };

    AutoApi.importAnalyticsReport = jest.fn().mockResolvedValue(mockResponse);

    const fileInputLabel = i18n.global.t('reports.importReport.fileInputLabel');
    const fileInput = wrapper.find(`input[type="file"][aria-label="${fileInputLabel}"]`);

    setInputFiles(fileInput, [testFile]);

    await fileInput.trigger('change');
    await flushPromises();

    const importButton = wrapper.findComponent({ name: 'ButtonWithSpinner' });
    await importButton.trigger('click');
    await flushPromises();

    expect(AutoApi.importAnalyticsReport).toHaveBeenCalledWith(testFile);
    expect(displayNotification).toHaveBeenCalledWith('success', 'Report imported successfully');
    expect(wrapper.emitted('import-success')[0]).toEqual(['imported-report']);
  });

  it('displays raw string error message from server', async () => {
    setup();
    const validTemplate = JSON.stringify({
      displayName: 'Test Report',
      reportConfig: '{"version":"v2"}',
    });
    const testFile = createMockFile(validTemplate, 'test.json');
    const errorMessage = 'Backend validation failed';
    const mockError = {
      response: {
        data: errorMessage,
      },
    };

    AutoApi.importAnalyticsReport = jest.fn().mockRejectedValue(mockError);

    const fileInputLabel = i18n.global.t('reports.importReport.fileInputLabel');
    const fileInput = wrapper.find(`input[type="file"][aria-label="${fileInputLabel}"]`);

    setInputFiles(fileInput, [testFile]);

    await fileInput.trigger('change');
    await flushPromises();

    const importButton = wrapper.findComponent({ name: 'ButtonWithSpinner' });
    await importButton.trigger('click');
    await flushPromises();

    const dropzoneError = wrapper.find('#dropzone-error');
    expect(dropzoneError.exists()).toBe(true);
    expect(dropzoneError.text()).toContain(errorMessage);

    // Check error state styling
    const dropzone = wrapper.find('.dropzone-container');
    expect(dropzone.classes()).toContain('has-error');

    expect(modalHide).not.toHaveBeenCalled();
  });

  it('displays server error message on import failure', async () => {
    setup();
    const validTemplate = JSON.stringify({
      displayName: 'Test Report',
      reportConfig: '{"version":"v2"}',
    });
    const testFile = createMockFile(validTemplate, 'test.json');
    const errorMessage = 'Backend validation failed';
    const mockError = {
      response: {
        data: {
          message: errorMessage,
        },
      },
    };

    AutoApi.importAnalyticsReport = jest.fn().mockRejectedValue(mockError);

    const fileInputLabel = i18n.global.t('reports.importReport.fileInputLabel');
    const fileInput = wrapper.find(`input[type="file"][aria-label="${fileInputLabel}"]`);

    setInputFiles(fileInput, [testFile]);

    await fileInput.trigger('change');
    await flushPromises();

    const importButton = wrapper.findComponent({ name: 'ButtonWithSpinner' });
    await importButton.trigger('click');
    await flushPromises();

    const dropzoneError = wrapper.find('#dropzone-error');
    expect(dropzoneError.exists()).toBe(true);
    expect(dropzoneError.text()).toContain(errorMessage);

    // Check error state styling
    const dropzone = wrapper.find('.dropzone-container');
    expect(dropzone.classes()).toContain('has-error');

    expect(modalHide).not.toHaveBeenCalled();
  });

  it('handles drag and drop file selection', async () => {
    setup();
    const validTemplate = JSON.stringify({
      displayName: 'Test Report',
      reportConfig: '{"version":"v2"}',
    });
    const testFile = createMockFile(validTemplate, 'test.json');

    const dropzoneLabel = i18n.global.t('reports.importReport.dropzoneLabel');
    const dropzone = wrapper.find(`[role="button"][aria-label="${dropzoneLabel}"]`);

    const dragOverEvent = {
      dataTransfer: {
        types: ['Files'],
      },
    };
    await dropzone.trigger('dragover', dragOverEvent);
    expect(dropzone.classes()).toContain('is-dragging');

    const dropEvent = {
      dataTransfer: {
        files: [testFile],
      },
    };
    await dropzone.trigger('drop', dropEvent);
    await flushPromises();

    expect(dropzone.classes()).not.toContain('is-dragging');
    expect(dropzone.classes()).toContain('has-file');

    const importButton = wrapper.findComponent({ name: 'ButtonWithSpinner' });
    expect(importButton.props('disabled')).toBe(false);
  });

  it('shows spinner while importing', async () => {
    setup();
    const validTemplate = JSON.stringify({
      displayName: 'Test Report',
      reportConfig: '{"version":"v2"}',
    });
    const testFile = createMockFile(validTemplate, 'test.json');

    let resolveImport;
    const importPromise = new Promise((resolve) => { resolveImport = resolve; });
    AutoApi.importAnalyticsReport = jest.fn().mockReturnValue(importPromise);

    const fileInputLabel = i18n.global.t('reports.importReport.fileInputLabel');
    const fileInput = wrapper.find(`input[type="file"][aria-label="${fileInputLabel}"]`);

    setInputFiles(fileInput, [testFile]);

    await fileInput.trigger('change');
    await flushPromises();

    expect(wrapper.vm.fileIsValid).toBe(true);

    const importButton = wrapper.findComponent({ name: 'ButtonWithSpinner' });

    importButton.trigger('click');
    await flushPromises();

    expect(wrapper.vm.isImporting).toBe(true);
    expect(importButton.props('showSpinner')).toBe(true);
    expect(importButton.props('disabled')).toBe(true);

    resolveImport({ data: { name: 'test-report' } });
    await flushPromises();

    expect(wrapper.vm.isImporting).toBe(false);
    expect(importButton.props('showSpinner')).toBe(false);
  });

  it('resets state when modal is shown', async () => {
    setup();
    const modal = wrapper.findComponent({ name: 'BModal' });

    await modal.vm.$emit('show');
    await flushPromises();

    const importButton = wrapper.findComponent({ name: 'ButtonWithSpinner' });
    expect(importButton.props('disabled')).toBe(true);
    expect(importButton.props('showSpinner')).toBe(false);

    const dropzoneError = wrapper.find('#dropzone-error');
    expect(dropzoneError.exists()).toBe(false);
  });
});
