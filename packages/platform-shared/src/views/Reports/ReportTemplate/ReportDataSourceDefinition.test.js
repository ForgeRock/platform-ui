/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import {
  findByRole,
  findByText,
  findByTestId,
} from '@forgerock/platform-shared/src/utils/testHelpers';
import i18n from '@/i18n';
import ReportDataSourceDefinition from './ReportDataSourceDefinition';

describe('Report Data Source Definition component', () => {
  function setup(props) {
    return mount(ReportDataSourceDefinition, {
      global: {
        plugins: [i18n],
      },
      props: {
        ...props,
      },
    });
  }

  const dataSourceColumns = [{
    format: 'json',
    label: 'firstName',
    type: 'string',
    value: 'applications.firstName',
  },
  {
    format: 'json',
    label: 'lastName',
    type: 'string',
    value: 'applications.lastName',
  }];
  const relatedDataSources = ['users', 'assignments'];

  let wrapper;

  describe('@component', () => {
    beforeEach(async () => {
      wrapper = setup();
    });

    it('displays the definition name as the card title when the "name" prop has a value', () => {
      wrapper = setup({ name: 'Data Source Title' });

      const dataSourceDefinitionHeading = wrapper.find('h4');
      expect(dataSourceDefinitionHeading.text()).toBe('Data Source Title');
    });

    it('renders the "available columns" checkbox options when the "dataSourceColumns" prop has items', () => {
      let emptyColumnsText = wrapper.find('fieldset').find('p');
      expect(emptyColumnsText.text()).toBe('No columns');

      wrapper = setup({ dataSourceColumns });

      emptyColumnsText = wrapper.find('fieldset').find('p');
      expect(emptyColumnsText.exists()).toBe(false);

      const allDataSourceColumnCheckboxes = findByRole(wrapper, 'group').findAll('input[type="checkbox"]');
      expect(allDataSourceColumnCheckboxes.length).toBe(2);
      expect(allDataSourceColumnCheckboxes[0].attributes('value')).toBe('applications.firstName');
      expect(allDataSourceColumnCheckboxes[1].attributes('value')).toBe('applications.lastName');
    });

    it('renders the "related data sources" buttons when the "relatedDataSources" prop has items', () => {
      let allFieldSets = wrapper.findAll('fieldset');
      const firstFieldsetLabel = allFieldSets[0].find('legend');

      expect(allFieldSets.length).toBe(1);
      expect(firstFieldsetLabel.text()).toBe('Available Columns');

      wrapper = setup({ relatedDataSources });

      allFieldSets = wrapper.findAll('fieldset');
      expect(allFieldSets.length).toBe(2);

      const allRelatedDataSourceListItems = allFieldSets[1].findAll('.list-group-item');
      expect(allRelatedDataSourceListItems.length).toBe(2);

      const [, relatedDataSourcesFieldset] = allFieldSets;
      const relatedDataSourcesFieldsetLabel = relatedDataSourcesFieldset.find('legend');
      expect(relatedDataSourcesFieldsetLabel.text()).toBe('Related data sources');

      const usersRelatedDataSourceElement = findByText(relatedDataSourcesFieldset, 'div', 'users');
      expect(usersRelatedDataSourceElement.exists()).toBe(true);

      const assignmentsRelatedDataSourceElement = findByText(relatedDataSourcesFieldset, 'div', 'assignments');
      expect(assignmentsRelatedDataSourceElement.exists()).toBe(true);
    });

    it('emits the data source columns array when a column checkbox is selected', async () => {
      wrapper = setup({ dataSourceColumns });

      const [firstNameCheckbox, lastNameCheckbox] = findByRole(wrapper, 'group').findAll('input[type="checkbox"]');
      await firstNameCheckbox.setValue();
      expect(wrapper.emitted()['set-column-selections'][0][0]).toEqual(['applications.firstName']);
      await lastNameCheckbox.setValue();
      expect(wrapper.emitted()['set-column-selections'][1][0]).toEqual(['applications.firstName', 'applications.lastName']);
    });

    it('emits the related entity value when a related data source is selected', async () => {
      wrapper = setup({ relatedDataSources });

      const allFieldSets = wrapper.findAll('fieldset');

      const allRelatedDataSourceListItems = allFieldSets[1].findAll('.list-group-item');
      expect(allRelatedDataSourceListItems.length).toBe(2);

      const [, relatedDataSourcesFieldset] = allFieldSets;
      const usersRelatedDataSourceElement = findByText(relatedDataSourcesFieldset, 'div', 'users');
      const addUsersRelatedDataSourceButton = findByRole(usersRelatedDataSourceElement, 'menuitem');

      await addUsersRelatedDataSourceButton.trigger('click');
      expect(wrapper.emitted()['set-related-data-sources'][0]).toEqual(['users']);
    });

    it('emits "delete-data-source" when a data source definition card is deleted', async () => {
      const deleteButton = findByTestId(wrapper, 'dropdown-delete-');
      await deleteButton.trigger('click');
      expect(wrapper.emitted()['delete-data-source'][0]).toBeTruthy();
    });
  });
});
