/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { findByText } from '@forgerock/platform-shared/src/utils/testHelpers';
import ReportSortingModal from './ReportSortingModal';
import i18n from '@/i18n';

describe('Report Sorting Modal component', () => {
  function setup(props) {
    return mount(ReportSortingModal, {
      global: {
        plugins: [i18n],
      },
      props: {
        isTesting: true,
        sortByOptions: [
          {
            class: 'json',
            value: 'applications._id',
            type: 'string',
          },
          {
            class: 'json',
            value: 'applications.name',
            type: 'string',
          },
          {
            class: 'parameter',
            value: 'MyParameter',
            type: 'string',
          },
        ],
        ...props,
      },
    });
  }

  let wrapper;

  describe('@component', () => {
    beforeEach(() => {
      wrapper = setup();
    });

    it('ensures that on load, the save button is disabled until the "Sort by" and "Sort order" fields are selected', async () => {
      let saveButton = findByText(wrapper, 'button', 'Save');
      expect(saveButton.attributes().disabled).toBeDefined();

      const [sortBySelect, sortOrderSelect] = wrapper.findAll('[role="listbox"]');

      // selects the sort by dropdown
      const [sortByNameOption] = sortBySelect.findAll('[role="option"]');
      await sortBySelect.trigger('click');
      await sortByNameOption.find('span').trigger('click');

      // selects the sort order dropdown
      const [sortOrderAscendingOption] = sortOrderSelect.findAll('[role="option"]');
      await sortOrderSelect.trigger('click');
      await sortOrderAscendingOption.find('span').trigger('click');

      saveButton = findByText(wrapper, 'button', 'Save');
      expect(saveButton.attributes().disabled).toBeUndefined();
    });

    it('ensures that the "sortByOptions" prop populates the "Sort by" select with the expected options', async () => {
      const [sortBySelect] = wrapper.findAll('[role="listbox"]');
      const sortByOptions = sortBySelect.findAll('[role="option"]');
      const [sortByMyParameterOption, sortByIdOption, sortByNameOption] = sortByOptions;

      expect(sortByOptions.length).toBe(3);
      expect(sortByNameOption.text()).toBe('applications.name');
      expect(sortByIdOption.text()).toBe('applications._id');
      expect(sortByMyParameterOption.text()).toBe('MyParameter');
    });

    it('ensures that the expected payload is emitted when the save button is clicked', async () => {
      const [sortBySelect, sortOrderSelect] = wrapper.findAll('[role="listbox"]');

      // selects the sort by dropdown
      const [,, sortByNameOption] = sortBySelect.findAll('[role="option"]');
      await sortBySelect.trigger('click');
      await sortByNameOption.find('span').trigger('click');

      // selects the sort order dropdown
      const [sortOrderAscendingOption] = sortOrderSelect.findAll('[role="option"]');
      await sortOrderSelect.trigger('click');
      await sortOrderAscendingOption.find('span').trigger('click');

      // Saves form and emits payload
      const saveButton = findByText(wrapper, 'button', 'Save');
      await saveButton.trigger('click');

      expect(wrapper.emitted('update-sort')).toEqual([['sort', -1, {
        sortBy: 'applications.name',
        direction: 'asc',
      }]]);
    });

    it('ensures that it loads the correct data in the correct fields for an existing sort definition', async () => {
      await wrapper.setProps({
        existingSort: {
          index: 0,
          definition: {
            sortBy: 'applications._id',
            direction: 'desc',
          },
        },
      });

      const [sortBySelectedOption, directionSelectedOption] = wrapper.findAll('.multiselect__option--selected');
      expect(sortBySelectedOption.text()).toEqual('applications._id');
      expect(directionSelectedOption.text()).toEqual('arrow_downward Descending');
    });
  });
});
