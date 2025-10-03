/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { DOMWrapper, mount } from '@vue/test-utils';
import {
  createAppContainer,
  findByRole,
  findByText,
  findByTestId,
  toggleActionsMenu,
} from '@forgerock/platform-shared/src/utils/testHelpers';
import i18n from '@/i18n';
import ReportDataSourceDefinition from './ReportDataSourceDefinition';

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('Report Data Source Definition component', () => {
  function setup(props) {
    const domWrapper = new DOMWrapper(document.body);
    const wrapper = mount(ReportDataSourceDefinition, {
      attachTo: createAppContainer(),
      global: {
        plugins: [i18n],
      },
      props: {
        dataSource: 'applications',
        dataSourcePathLabel: 'applications',
        ...props,
      },
    });
    return { wrapper, domWrapper };
  }

  const dataSourceColumns = [{
    format: 'json',
    label: 'firstName',
    columnLabel: 'First Name',
    type: 'string',
    path: 'applications.firstName',
  },
  {
    format: 'json',
    label: 'lastName',
    columnLabel: 'Last Name',
    type: 'string',
    path: 'applications.lastName',
  }];
  const relatedDataSources = [{
    name: 'applications.assignments',
    label: 'Assignments',
  },
  {
    name: 'applications.roles',
    label: 'Roles',
  }];
  const selectedRelatedDataSources = [{ path: 'applications.assignments', label: 'Assignments' }];

  let wrapper;
  let domWrapper;

  describe('@component', () => {
    beforeEach(async () => {
      ({ wrapper, domWrapper } = setup());
    });

    it('displays the definition name as the card title when the "name" prop has a value', () => {
      const dataSourceDefinitionHeading = wrapper.find('h4');
      expect(dataSourceDefinitionHeading.text()).toBe('applications');
    });

    it('renders the "available columns" checkbox options when the "dataSourceColumns" prop has items', () => {
      let emptyColumnsText = wrapper.find('fieldset').find('p');
      expect(emptyColumnsText.text()).toBe('No columns');

      ({ wrapper } = setup({ dataSourceColumns }));

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

      ({ wrapper } = setup({ relatedDataSources }));

      allFieldSets = wrapper.findAll('fieldset');
      expect(allFieldSets.length).toBe(2);

      const allRelatedDataSourceListItems = allFieldSets[1].findAll('.list-group-item');
      expect(allRelatedDataSourceListItems.length).toBe(2);

      const [, relatedDataSourcesFieldset] = allFieldSets;
      const relatedDataSourcesFieldsetLabel = relatedDataSourcesFieldset.find('legend');
      expect(relatedDataSourcesFieldsetLabel.text()).toBe('Related data sources');

      const assignmentsRelatedDataSourceElement = findByText(relatedDataSourcesFieldset, 'p', 'Assignments');
      expect(assignmentsRelatedDataSourceElement.exists()).toBe(true);

      const rolesRelatedDataSourceElement = findByText(relatedDataSourcesFieldset, 'p', 'Roles');
      expect(rolesRelatedDataSourceElement.exists()).toBe(true);
    });

    it('shows a checkmark for any related data sources that appear in the list of the selectedRelatedDataSources prop', () => {
      ({ wrapper } = setup({ relatedDataSources, selectedRelatedDataSources }));

      const allFieldSets = wrapper.findAll('fieldset');
      expect(allFieldSets.length).toBe(2);

      const allRelatedDataSourceListItems = allFieldSets[1].findAll('.list-group-item');
      expect(allRelatedDataSourceListItems.length).toBe(2);

      const [, relatedDataSourcesFieldset] = allFieldSets;
      const assignmentsRelatedDataSourceCheck = findByText(relatedDataSourcesFieldset, 'p + span', 'check');
      expect(assignmentsRelatedDataSourceCheck.exists()).toBe(true);
    });

    it('shows a specific title path that includes the parent data source name for related data source definitions', () => {
      ({ wrapper } = setup({ dataSource: 'applications.assignments', dataSourcePathLabel: 'Applications / Assignments' }));

      const dataSourceDefinitionHeading = wrapper.find('h4');
      expect(dataSourceDefinitionHeading.text()).toBe('Applications / Assignments');
    });

    it('emits the data source columns array when a column checkbox is selected', async () => {
      ({ wrapper } = setup({ dataSourceColumns }));

      const [firstNameCheckbox, lastNameCheckbox] = findByRole(wrapper, 'group').findAll('input[type="checkbox"]');
      await firstNameCheckbox.setValue();
      expect(wrapper.emitted()['set-column-selections'][0][0]).toEqual(['applications.firstName']);
      await lastNameCheckbox.setValue();
      expect(wrapper.emitted()['set-column-selections'][1][0]).toEqual(['applications.firstName', 'applications.lastName']);
    });

    it('emits the related entity value when a related data source is selected', async () => {
      ({ wrapper } = setup({ relatedDataSources }));

      const allFieldSets = wrapper.findAll('fieldset');

      const allRelatedDataSourceListItems = allFieldSets[1].findAll('.list-group-item');
      expect(allRelatedDataSourceListItems.length).toBe(2);

      const [, relatedDataSourcesFieldset] = allFieldSets;
      const [assignmentsRelatedDataSourceButton] = relatedDataSourcesFieldset.findAll('button');
      const [addAssignmentsRelatedDataSourceOption] = relatedDataSourcesFieldset.findAll('a');

      await assignmentsRelatedDataSourceButton.trigger('click');
      await addAssignmentsRelatedDataSourceOption.trigger('click');
      expect(wrapper.emitted()['set-related-data-source'][0]).toEqual([{ path: 'applications.assignments', label: 'Assignments' }]);
    });

    it('emits "delete-data-source" when a data source definition card is deleted', async () => {
      await toggleActionsMenu(wrapper.find('.menu-container'));
      const deleteButton = findByTestId(domWrapper, 'dropdown-delete-');
      await deleteButton.trigger('click');
      expect(wrapper.emitted()['delete-data-source'][0]).toBeTruthy();
    });

    it('only displays the "settings" option in the ellipse menu for related entity definitions', async () => {
      await toggleActionsMenu(wrapper.find('.menu-container'));
      const allMenuItemOptions = domWrapper.findAll('#app > .menu [role="menuitem"]');
      const [deleteOption] = allMenuItemOptions;

      expect(allMenuItemOptions.length).toBe(1);
      expect(deleteOption.text()).toBe('deleteDelete');

      // sets a related entity, closes the previous menu, and opens a new one
      await toggleActionsMenu(wrapper.find('.menu-container'));
      ({ wrapper, domWrapper } = setup({ dataSource: 'applications.roles', dataSourcePathLabel: 'Applications / Roles' }));

      await toggleActionsMenu(wrapper.find('.menu-container'));
      const allMenuItemOptionsForRelatedEntities = domWrapper.findAll('#app > .menu [role="menuitem"]');
      const [settingsOptionForRelatedEntities, deleteOptionForRelatedEntities] = allMenuItemOptionsForRelatedEntities;

      expect(allMenuItemOptionsForRelatedEntities.length).toBe(2);
      expect(settingsOptionForRelatedEntities.text()).toBe('settingsSettings');
      expect(deleteOptionForRelatedEntities.text()).toBe('deleteDelete');
    });

    it('emits "related-entity-settings" when the related entity "settings" ellipse menu option is selected.', async () => {
      // sets a related entity
      ({ wrapper, domWrapper } = setup({ dataSource: 'applications.roles', dataSourcePathLabel: 'Applications / Roles' }));

      await toggleActionsMenu(wrapper.find('.menu-container'));
      const allMenuItemOptions = domWrapper.findAll('#app > .menu [role="menuitem"]');
      const [settingsOption] = allMenuItemOptions;
      await settingsOption.trigger('click');

      expect(wrapper.emitted()['related-entity-settings'][0]).toBeTruthy();
    });
  });
});
