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
        columnCheckboxNames: ['entityOne', 'entityTwo'],
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

    it('enables the next button only if a data source option has been selected', async () => {
      const footer = wrapper.find('footer');
      let nextButton = findByText(footer, 'button', 'Next');
      expect(nextButton.attributes('disabled')).toBeDefined();
      const dataSourceOption = findByRole(wrapper, 'option').find('span');
      await dataSourceOption.trigger('click');

      nextButton = findByText(footer, 'button', 'Next');
      expect(nextButton.attributes('disabled')).toBeUndefined();
    });

    it('disables the cancel and next buttons if the "isSaving" prop is true', async () => {
      const footer = wrapper.find('footer');
      const dataSourceOption = findByRole(wrapper, 'option').find('span');
      let nextButton = findByText(footer, 'button', 'Next');
      let cancelButton = findByText(footer, 'button', 'Cancel');

      await dataSourceOption.trigger('click');
      nextButton = findByText(footer, 'button', 'Next');
      expect(nextButton.attributes('disabled')).toBeUndefined();
      expect(cancelButton.attributes('disabled')).toBeUndefined();

      await wrapper.setProps({ isSaving: true });
      nextButton = findByText(footer, 'button', 'Loading...');
      cancelButton = findByText(footer, 'button', 'Cancel');
      expect(nextButton.attributes('disabled')).toBeDefined();
      expect(cancelButton.attributes('disabled')).toBeDefined();
    });

    it('emits "add-data-source" with the selected value when the next button is clicked', async () => {
      const footer = wrapper.find('footer');
      const dataSourceOption = findByRole(wrapper, 'option').find('span');
      await dataSourceOption.trigger('click');

      const nextButton = findByText(footer, 'button', 'Next');
      await nextButton.trigger('click');
      expect(wrapper.emitted()['add-data-source'][0]).toEqual(['entityOne']);
    });
  });
});
