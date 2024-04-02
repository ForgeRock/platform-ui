/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { findByText, findByRole } from '@forgerock/platform-shared/src/utils/testHelpers';
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

    it('shows the spinner and hides the title, description and the "add" button if the component isLoading', async () => {
      wrapper = setup({ isLoading: true });

      let spinner = findByRole(wrapper, 'status');
      let title = wrapper.find('h2');
      let subtitle = findByText(wrapper, 'p', 'To get started add a data source to report on.');
      let addButton = findByText(wrapper, 'button', 'addData Source');
      expect(spinner.text()).toBe('Loading...');
      expect(title.exists()).toBe(false);
      expect(subtitle).toBeUndefined();
      expect(addButton).toBeUndefined();

      await wrapper.setProps({ isLoading: false });
      spinner = findByRole(wrapper, 'status');
      title = wrapper.find('h2');
      subtitle = findByText(wrapper, 'p', 'To get started add a data source to report on.');
      addButton = findByText(wrapper, 'button', 'addData Source');
      expect(spinner.exists()).toBe(false);
      expect(title.text()).toBe('Add Data');
      expect(subtitle.exists()).toBe(true);
      expect(addButton.exists()).toBe(true);
    });

    it('emits "open-data-source-modal" when the save button is clicked', async () => {
      wrapper = setup({ disableSave: false });

      const addDataSourceButton = findByText(wrapper, 'button', 'addData Source');
      await addDataSourceButton.trigger('click');
      expect(wrapper.emitted()['open-data-source-modal'][0]).toBeTruthy();
    });
  });
});
