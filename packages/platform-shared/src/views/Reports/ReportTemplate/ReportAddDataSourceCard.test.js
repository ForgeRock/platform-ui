/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { findByText } from '@forgerock/platform-shared/src/utils/testHelpers';
import i18n from '@/i18n';
import ReportAddDataSourceCard from './ReportAddDataSourceCard';

describe('Report Add Data Source card component', () => {
  function setup(props) {
    return mount(ReportAddDataSourceCard, {
      global: {
        plugins: [i18n],
      },
      props: {
        ...props,
      },
    });
  }

  let wrapper;

  describe('@component', () => {
    beforeEach(async () => {
      wrapper = setup();
    });

    it('emits "open-data-source-modal" when the save button is clicked', async () => {
      wrapper = setup({ disableSave: false });

      const addDataSourceButton = findByText(wrapper, 'button', 'add Data Source');
      await addDataSourceButton.trigger('click');
      expect(wrapper.emitted()['open-data-source-modal'][0]).toBeTruthy();
    });
  });
});
