/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import i18n from '@/i18n';
import ReportExportModal from './ReportExportModal';

describe('Report Export modal component', () => {
  function setup(props) {
    return mount(ReportExportModal, {
      i18n,
      propsData: {
        isTesting: true,
        ...props,
      },
    });
  }

  let wrapper;

  describe('@renders', () => {
    beforeEach(() => {
      wrapper = setup();
    });

    it('ensures that the status of the modal is in loading state on mount', () => {
      const spinner = findByTestId(wrapper, 'spinner-large');
      expect(spinner.exists()).toBe(true);
    });

    it('ensures that the status of the modal changes to the download state if the status prop equals to "download"', () => {
      wrapper = setup({ status: 'download' });

      const spinner = findByTestId(wrapper, 'spinner-large');
      expect(spinner.exists()).toBe(false);
    });

    it('ensures that the status of the modal changes to the download state if the status prop equals to "downloading"', () => {
      wrapper = setup({ status: 'downloading' });

      const spinner = findByTestId(wrapper, 'spinner-large');
      expect(spinner.exists()).toBe(false);
    });

    it('ensures that an error image is displayed if the status prop equals to "error"', () => {
      const spinner = findByTestId(wrapper, 'spinner-large');
      expect(spinner.exists()).toBe(true);

      wrapper = setup({ status: 'error' });

      const errorImage = findByTestId(wrapper, 'fr-export-error-image');
      const spinnerAfterError = findByTestId(wrapper, 'spinner-large');
      expect(errorImage.exists()).toBe(true);
      expect(spinnerAfterError.exists()).toBe(false);
    });

    it('ensures that the download button is displayed if the status prop equals to "download"', () => {
      const downloadButton = findByTestId(wrapper, 'fr-history-export-download-button');
      expect(downloadButton.exists()).toBe(false);

      wrapper = setup({ status: 'download' });
      const downloadButtonAfterStatusChange = findByTestId(wrapper, 'fr-history-export-download-button');
      expect(downloadButtonAfterStatusChange.exists()).toBe(true);
    });

    it('ensures that the download button is displayed if the status prop equals to "downloading"', () => {
      const downloadButton = findByTestId(wrapper, 'fr-history-export-download-button');
      expect(downloadButton.exists()).toBe(false);

      wrapper = setup({ status: 'downloading' });
      const downloadButtonAfterStatusChange = findByTestId(wrapper, 'fr-history-export-download-button');
      expect(downloadButtonAfterStatusChange.exists()).toBe(true);
    });

    it('disables the download button when the status prop is equal to "downloading"', () => {
      wrapper = setup({ status: 'downloading' });
      const downloadButton = findByTestId(wrapper, 'fr-history-export-download-button');
      expect(downloadButton.attributes().disabled).toBe('disabled');
    });

    it('emits "download-report" when the download button is clicked', async () => {
      wrapper = setup({
        data: {
          runId: 'job_0123',
        },
        fileType: 'JSON',
        status: 'download',
      });
      const downloadButton = findByTestId(wrapper, 'fr-history-export-download-button');

      await downloadButton.trigger('click');
      expect(wrapper.emitted()['download-report'][0]).toEqual(['JSON', { runId: 'job_0123' }]);
    });
  });
});
