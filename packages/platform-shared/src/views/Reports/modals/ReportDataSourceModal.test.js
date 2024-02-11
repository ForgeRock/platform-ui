/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { findByText, findByRole } from '@forgerock/platform-shared/src/utils/testHelpers';
import i18n from '@/i18n';
import ReportDataSourceModal from './ReportDataSourceModal';

describe('Report Data Source Modal component', () => {
  function setup(props) {
    return mount(ReportDataSourceModal, {
      global: {
        plugins: [i18n],
      },
      props: {
        isTesting: true,
        ...props,
      },
    });
  }

  let wrapper;

  describe('@component', () => {
    beforeEach(async () => {
      wrapper = setup();
    });

    it('enables the save button only if a data source option has been selected', async () => {
      const footer = wrapper.find('footer');
      let saveButton = findByText(footer, 'button', 'Save');
      expect(saveButton.attributes('disabled')).toBeDefined();

      const dataSourceOption = findByRole(wrapper, 'option').find('span');
      await dataSourceOption.trigger('click');

      saveButton = findByText(footer, 'button', 'Save');
      expect(saveButton.attributes('disabled')).toBeUndefined();
    });
  });
});
