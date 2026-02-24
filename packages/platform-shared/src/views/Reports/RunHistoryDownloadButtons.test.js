/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import i18n from '@/i18n';
import RunHistoryDownloadButtons from './RunHistoryDownloadButtons';

describe('Run History Download Buttons component', () => {
  function setup(props) {
    return mount(RunHistoryDownloadButtons, {
      global: {
        plugins: [i18n],
      },
      props,
    });
  }

  let wrapper;

  describe('@renders', () => {
    it('ensures that on mount, the download icon is default', () => {
      wrapper = setup();
      const downloadIcon = findByTestId(wrapper, 'fr-download-button-icon');
      expect(downloadIcon.text()).toBe('file_download');
    });

    it('ensures that when the downloadStatus prop equals to "download", that the download icon shows', () => {
      wrapper = setup({ downloadStatus: 'download' });

      const downloadIcon = findByTestId(wrapper, 'fr-download-button-icon');
      expect(downloadIcon.text()).toBe('file_download');
    });

    it('ensures that when the downloadStatus prop equals to "downloading", that the spinner shows', () => {
      wrapper = setup({ downloadStatus: 'downloading' });

      const spinnerButton = findByTestId(wrapper, 'fr-download-button-spinner');
      expect(spinnerButton.exists()).toBe(true);

      const downloadIcon = findByTestId(wrapper, 'fr-download-button-icon');
      expect(downloadIcon.exists()).toBe(false);
    });

    it('ensures that the label displays when the "label" prop has a value', () => {
      wrapper = setup({ label: 'JSON' });

      const exportButtonLabelElement = findByTestId(wrapper, 'action-button-label');
      expect(exportButtonLabelElement.text()).toBe('JSON');
    });
  });
});
