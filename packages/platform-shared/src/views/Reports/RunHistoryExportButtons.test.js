/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import i18n from '@/i18n';
import RunHistoryExportButtons from './RunHistoryExportButtons';

describe('Run History Export Buttons component', () => {
  function setup(props) {
    return mount(RunHistoryExportButtons, {
      global: {
        plugins: [i18n],
      },
      props,
    });
  }

  let wrapper;

  describe('@renders', () => {
    it('ensures that on mount, the export icon is default', () => {
      wrapper = setup();
      const exportIcon = findByTestId(wrapper, 'fr-export-button-icon');
      expect(exportIcon.text()).toBe('sync');
    });

    it('ensures that when the exportStatus prop equals to "exporting", that the spinner icon shows', () => {
      wrapper = setup({ exportStatus: 'exporting' });

      const exportIcon = findByTestId(wrapper, 'fr-export-button-icon');
      expect(exportIcon.exists()).toBe(false);

      const spinnerIcon = findByTestId(wrapper, 'fr-export-button-spinner');
      expect(spinnerIcon.exists()).toBe(true);
    });

    it('ensures that when the exportStatus prop equals to "download", that the download icon shows', () => {
      wrapper = setup({ exportStatus: 'download' });

      const downloadIcon = findByTestId(wrapper, 'fr-download-button-icon');
      expect(downloadIcon.text()).toBe('file_download');
    });

    it('ensures that when the exportStatus prop equals to "downloading", that the download icon shows', () => {
      wrapper = setup({ exportStatus: 'downloading' });

      const spinnerButton = findByTestId(wrapper, 'fr-export-button-spinner');
      expect(spinnerButton.exists()).toBe(true);
    });

    it('ensures that when the exportStatus prop equals to "error", that the error icon shows', () => {
      wrapper = setup({ exportStatus: 'error' });

      const errorBadge = findByTestId(wrapper, 'fr-error-report-badge');
      expect(errorBadge.text()).toBe('Error');
    });

    it('ensures that the label displays when the "label" prop has a value', () => {
      wrapper = setup({ label: 'JSON' });

      const exportButtonLabelElement = findByTestId(wrapper, 'action-button-label');
      expect(exportButtonLabelElement.text()).toBe('JSON');
    });
  });
});
