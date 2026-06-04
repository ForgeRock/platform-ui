/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { downloadFile, downloadAsType } from '@forgerock/platform-shared/src/utils/downloadFile';
import DownloadSchemaModal from './DownloadSchemaModal';
import i18n from '@/i18n';

jest.mock('@forgerock/platform-shared/src/utils/downloadFile', () => ({
  downloadFile: jest.fn(),
  downloadAsType: jest.fn(),
}));

const defaultProps = {
  objectTypeId: 'myObjectType',
  properties: {
    firstName: { type: 'string' },
    age: { type: 'integer' },
  },
};

function setup(props = {}) {
  return mount(DownloadSchemaModal, {
    attachTo: document.body,
    global: {
      plugins: [i18n],
      stubs: {
        BModal: {
          template: '<div><slot /><slot name="modal-footer" :cancel="() => {}" :ok="() => {}" /></div>',
          props: ['id', 'title'],
        },
        FrCardRadioInput: {
          name: 'FrCardRadioInput',
          template: '<label><input type="radio" :value="radioValue" /><slot /></label>',
          props: ['radioValue', 'modelValue', 'name'],
          emits: ['update:modelValue'],
        },
      },
    },
    props: {
      ...defaultProps,
      ...props,
    },
  });
}

describe('DownloadSchemaModal', () => {
  afterAll(() => jest.restoreAllMocks());

  describe('@renders', () => {
    it('shows JSON and CSV format options', () => {
      const wrapper = setup();
      expect(wrapper.text()).toContain('JSON');
      expect(wrapper.text()).toContain('CSV');
    });

    it('defaults to JSON format selected', () => {
      const wrapper = setup();
      expect(wrapper.vm.selectedFormat).toBe('json');
    });

    it('shows description text for each format', () => {
      const wrapper = setup();
      const [json, csv] = wrapper.vm.formatOptions;
      expect(json.value).toBe('json');
      expect(json.description).toBeTruthy();
      expect(csv.value).toBe('csv');
      expect(csv.description).toBeTruthy();
    });
  });

  describe('@actions', () => {
    it('calls downloadFile with JSON content and correct filename when JSON is selected', () => {
      const ok = jest.fn();
      const wrapper = setup();
      wrapper.vm.selectedFormat = 'json';
      wrapper.vm.download(ok);

      expect(downloadFile).toHaveBeenCalledWith(
        JSON.stringify(defaultProps.properties, null, 2),
        'application/json',
        'myObjectType-schema.json',
      );
      expect(ok).toHaveBeenCalled();
    });

    it('calls downloadFile with the objectTypeId in the filename', () => {
      const wrapper = setup({ objectTypeId: 'customType' });
      wrapper.vm.selectedFormat = 'json';
      wrapper.vm.download(jest.fn());

      expect(downloadFile).toHaveBeenCalledWith(
        expect.any(String),
        'application/json',
        'customType-schema.json',
      );
    });

    it('calls downloadAsType with CSV rows and correct filename when CSV is selected', async () => {
      const ok = jest.fn();
      const wrapper = setup();
      wrapper.vm.selectedFormat = 'csv';
      await wrapper.vm.download(ok);

      expect(downloadAsType).toHaveBeenCalledWith(
        [{ firstName: '', age: '' }],
        'csv',
        'myObjectType-schema.csv',
      );
      expect(ok).toHaveBeenCalled();
    });

    it('resets selectedFormat to json when the modal is hidden', () => {
      const wrapper = setup();
      wrapper.vm.selectedFormat = 'csv';
      wrapper.vm.resetModal();
      expect(wrapper.vm.selectedFormat).toBe('json');
    });
  });
});
