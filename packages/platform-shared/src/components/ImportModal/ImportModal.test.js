/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import i18n from '@/i18n';
import ImportModal from './ImportModal';

const mockImportFunctionSuccess = jest.fn(() => Promise.resolve({ data: { created: { test: {} } } }));
const genericError = { response: { status: 400 } };
const conflictError = { response: { status: 409, data: { message: '"conflicting": ["0b3a96bf7af34783bb0d7cc76b03d6ab-1"], "non-conflicting": []' } } };
const mockImportFunctionGenericError = jest.fn(() => Promise.reject(genericError));
const mockImportFunctionConflictError = jest.fn(() => Promise.reject(conflictError));

describe('ImportModal', () => {
  function setup(props) {
    return mount(ImportModal, {
      global: {
        plugins: [i18n],
      },
      props: {
        isTesting: true,
        modalDesc: 'Test modal description.',
        itemType: 'TestType',
        importFunction: mockImportFunctionSuccess,
        ...props,
      },
    });
  }

  describe('@renders', () => {
    it('should render title with correct itemType, description and file input field', async () => {
      const wrapper = setup();
      await wrapper.vm.$nextTick();

      const title = wrapper.find('h2');
      const description = wrapper.find('p');
      const field = wrapper.find('.b-form-file');
      const fieldType = field.find('input').attributes('type');
      const fieldLabel = field.find('label');

      expect(title.text()).toBe('Import TestType');
      expect(description.text()).toBe('Test modal description.');
      expect(fieldType).toBe('file');
      expect(fieldLabel.text()).toBe('JSON File');
    });
  });

  describe('@actions', () => {
    it('Should upload a file and view its configuration', async () => {
      const wrapper = setup();
      await wrapper.vm.$nextTick();

      const input = wrapper.find('input[type="file"]');

      const mockFile = new File(['{ "mock": true }'], 'mock.json', { type: 'application/json' });
      // Input files are not normally writable, so override them
      Object.defineProperty(input.element, 'files', {
        get: () => [mockFile],
        set: (files) => files,
      });
      // Set value of file input
      input.element.files = [mockFile];
      await input.trigger('change');

      const importBtn = wrapper.find('.btn-primary');
      await importBtn.trigger('click');

      // expect spinner to display while upload is in progress
      let spinner = findByTestId(wrapper, 'import-spinner');
      expect(spinner.exists()).toBeTruthy();

      // both flushPromises are required here
      await flushPromises();
      await flushPromises();
      expect(mockImportFunctionSuccess).toHaveBeenCalled();

      spinner = findByTestId(wrapper, 'import-spinner');
      const importComplete = wrapper.find('h3');
      const viewConfig = wrapper.find('.btn-link');

      // now spinner is hidden and complete text shown
      expect(spinner.exists()).toBeFalsy();
      expect(importComplete.text()).toBe('Import Complete');
      expect(viewConfig.text()).toBe('View testtype configuration');
      expect(wrapper.emitted().viewConfiguration).toBeFalsy();

      await viewConfig.trigger('click');
      expect(wrapper.emitted().viewConfiguration[0][0]).toBe('test');
    });

    it('Should display generic errors', async () => {
      const wrapper = setup({ importFunction: mockImportFunctionGenericError });
      await wrapper.vm.$nextTick();

      const input = wrapper.find('input[type="file"]');

      const mockFile = new File(['{ "mock": true }'], 'mock.json', { type: 'application/json' });
      // Input files are not normally writable, so override them
      Object.defineProperty(input.element, 'files', {
        get: () => [mockFile],
        set: (files) => files,
      });
      // Set value of file input
      input.element.files = [mockFile];
      await input.trigger('change');

      const importBtn = wrapper.find('.btn-primary');
      await importBtn.trigger('click');

      // both flushPromises are required here
      await flushPromises();
      await flushPromises();
      expect(mockImportFunctionGenericError).toHaveBeenCalled();

      const errorMessage = wrapper.find('.error-message');

      expect(errorMessage.text()).toBe('Error importing items');
    });

    it('Should display conflict errors', async () => {
      const wrapper = setup({ importFunction: mockImportFunctionConflictError });
      await wrapper.vm.$nextTick();

      const input = wrapper.find('input[type="file"]');

      const mockFile = new File(['{ "mock": true }'], 'mock.json', { type: 'application/json' });
      // Input files are not normally writable, so override them
      Object.defineProperty(input.element, 'files', {
        get: () => [mockFile],
        set: (files) => files,
      });
      // Set value of file input
      input.element.files = [mockFile];
      await input.trigger('change');

      const importBtn = wrapper.find('.btn-primary');
      await importBtn.trigger('click');

      // both flushPromises are required here
      await flushPromises();
      await flushPromises();
      expect(mockImportFunctionConflictError).toHaveBeenCalled();

      const errorMessage = wrapper.find('.error-message');

      expect(errorMessage.text()).toBe('Error importing - items with the following ids already exist: 0b3a96bf7af34783bb0d7cc76b03d6ab-1');
    });
  });
});
