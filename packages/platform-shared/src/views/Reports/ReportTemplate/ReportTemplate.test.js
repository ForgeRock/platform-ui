/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { nextTick } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import {
  findAllByTestId,
  findByRole,
  findByText,
  findByTestId,
} from '@forgerock/platform-shared/src/utils/testHelpers';
import * as AutoApi from '@forgerock/platform-shared/src/api/AutoApi';
import * as managedResourceApi from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import ValidationRules from '@forgerock/platform-shared/src/utils/validationRules';
import i18n from '@/i18n';
import ReportTemplate from './ReportTemplate';

ValidationRules.extendRules({
  alpha_num_spaces: ValidationRules.getRules(i18n).alpha_num_spaces,
  whitespace: ValidationRules.getRules(i18n).whitespace,
  required: ValidationRules.getRules(i18n).required,
  unique: ValidationRules.getRules(i18n).unique,
});

jest.mock('@forgerock/platform-shared/src/composables/bvModal');
jest.mock('@forgerock/platform-shared/src/components/filterBuilder/utils/QueryFilterDefaults');
jest.mock('vue-router', () => ({
  useRoute: jest.fn(() => ({ params: { template: 'template-name', state: 'published' } })),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

describe('Component for creating custom analytics reports', () => {
  function setup(props, mocks) {
    const bvModalOptions = { show: jest.fn(), hide: jest.fn() };
    useBvModal.mockReturnValue({ bvModal: { value: bvModalOptions, ...bvModalOptions } });
    setupTestPinia();
    return mount(ReportTemplate, {
      global: {
        mocks: {
          $bvModal: { show: jest.fn(), hide: jest.fn() },
          ...mocks,
        },
        plugins: [i18n],
      },
      props: {
        isTesting: true,
        ...props,
      },
    });
  }

  let wrapper;

  const fieldOptionsStub = {
    data: {
      'applications._id': {
        class: 'json',
        label: 'Applications Id',
        column_label: 'Applications Id',
        type: 'string',
      },
      'applications.name': {
        class: 'json',
        label: 'Applications Name',
        column_label: 'Applications Name',
        type: 'string',
      },
      MyParameter: {
        class: 'parameter',
        type: 'string',
        label: 'My Parameter Name',
      },
    },
  };

  const fieldOptionsStubWithoutParameter = {
    data: {
      'applications._id': {
        class: 'json',
        label: 'Applications Id',
        column_label: 'Applications Id',
        type: 'string',
      },
      'applications.name': {
        class: 'json',
        label: 'Applications Name',
        column_label: 'Applications Name',
        type: 'string',
      },
    },
  };

  const fieldOptionsStubForApplicationRolesRelatedEntities = {
    data: {
      'applications.roles.admin': {
        class: 'json',
        label: 'Application Role Admin',
        column_label: 'Application Role Admin',
        type: 'string',
      },
      'applications.roles.manager': {
        class: 'json',
        label: 'Application Role Manager',
        column_label: 'Application Role Manager',
        type: 'string',
      },
    },
  };

  const fieldOptionsStubForApplicationOwnersRelatedEntities = {
    data: {
      'applications.owners.admin': {
        class: 'json',
        label: 'Application Owner Admin',
        column_label: 'Application Owner Admin',
        type: 'string',
      },
      'applications.owners.manager': {
        class: 'json',
        label: 'Application Owner Manager',
        column_label: 'Application Owner Manager',
        type: 'string',
      },
    },
  };

  beforeEach(() => {
    AutoApi.getReportEntities = jest.fn().mockReturnValue(Promise.resolve({
      data: {
        result: [
          {
            name: 'applications',
            label: 'Applications',
          },
          {
            name: 'users',
            label: 'Users',
          },
          {
            name: 'roles',
            label: 'Roles',
          },
        ],
      },
    }));

    AutoApi.getReportOperators = jest.fn().mockReturnValue(Promise.resolve([{
      displayName: 'contains',
      name: 'contains',
      schema: [
        {
          left: { value: 'search_string' },
          right: { value: 'in_string_array' },
        },
        {
          left: { value: 'search_integer' },
          right: { value: 'in_integer_array' },
        },
        {
          left: { value: 'search_string' },
          right: { value: 'in_string' },
        },
      ],
    }]));

    AutoApi.getReportTemplates = jest.fn().mockReturnValue(Promise.resolve({
      result: [{
        name: 'TEST-REPORT',
        description: '',
        reportConfig: JSON.stringify({
          version: 'v2',
        }),
        viewers: ['reportadmin'],
        type: 'draft',
      }],
    }));

    AutoApi.getReportParameterTypes = jest.fn().mockReturnValue(Promise.resolve({
      data: [{
        description: 'String',
        label: 'String',
        type: 'string',
      }],
    }));

    AutoApi.getAggregateTypes = jest.fn().mockReturnValue(Promise.resolve([{
      displayName: 'Count of specific rows',
      name: 'count',
      schema: [],
    }]));

    AutoApi.getReportFieldOptions = jest.fn().mockReturnValue(Promise.resolve(fieldOptionsStub));

    managedResourceApi.getManagedResourceList = jest.fn().mockReturnValue(Promise.resolve({
      data: {
        result: [
          { name: 'prop1' },
          { name: 'prop2' },
          { name: 'prop3' },
        ],
      },
    }));

    managedResourceApi.getManagedResource = jest.fn().mockResolvedValue({
      data: {
        _id: 'reportadmin',
        sn: 'Doe',
        givenName: 'John',
        profileImage: 'image',
        userName: 'johndoe',
      },
    });

    jest.useFakeTimers();
    wrapper = setup();
    jest.clearAllMocks();
  });

  describe('@renders', () => {
    it('ensures that the "Add Data" empty state loads on mount', () => {
      const mainHeading = wrapper.find('h2');
      expect(mainHeading.text()).toBe('Add Data');
    });

    it('populates the data sources dropdown on load for the "Add a Data Source" modal', async () => {
      const dataSourcesDropdown = findByRole(wrapper, 'listbox');
      const dataSourcesOptions = dataSourcesDropdown.findAll('[role="option"]');
      expect(dataSourcesOptions.length).toBe(3);

      // expected to show up in alphabetical order
      const [applicationsOption, rolesOption, usersOption] = dataSourcesOptions;
      expect(applicationsOption.text()).toBe('Applications');
      expect(rolesOption.text()).toBe('Roles');
      expect(usersOption.text()).toBe('Users');
    });

    it('ensures that the report badge does show the expected report state on load', async () => {
      const headerNavElement = wrapper.find('header > nav');
      const badgeElement = headerNavElement.find('h1 + span');
      expect(badgeElement.text()).toBe('Published');
    });
  });

  describe('@actions', () => {
    async function addDataSource(entitySelection = 'applications') {
      const dataSourcesDropdown = findByRole(wrapper, 'listbox');
      const [applicationsOption,, usersOption] = dataSourcesDropdown.findAll('[role="option"]');

      if (entitySelection === 'applications') {
        // related entities response
        AutoApi.getReportEntities = jest.fn().mockReturnValue(Promise.resolve({
          data: {
            result: [
              {
                name: 'applications.members',
                label: 'Members',
              },
              {
                name: 'applications.roles',
                label: 'Roles',
              },
              {
                name: 'applications.owners',
                label: 'Owners',
              },
            ],
          },
        }));
        await applicationsOption.find('span').trigger('click');
      }

      if (entitySelection === 'users') {
        // empty related entities response
        AutoApi.getReportEntities = jest.fn().mockReturnValue(Promise.resolve({
          data: {
            result: [],
          },
        }));
        await usersOption.find('span').trigger('click');
      }

      const modalFooter = wrapper.find('footer');
      const nextButton = findByText(modalFooter, 'button', 'Next');

      await nextButton.trigger('click');
      await flushPromises();
      jest.runAllTimers();
      await nextTick();
    }

    async function addRelatedDataSource() {
      const dataSourceContainer = findByTestId(wrapper, 'entities-settings-container');
      const [, relatedDataSourcesFieldset] = dataSourceContainer.findAll('fieldset');
      const [, ownersRelatedDataSourceButton, rolesRelatedDataSourceButton] = relatedDataSourcesFieldset.findAll('button');
      const [, ownersRelatedDataSourceOption, rolesRelatedDataSourceOption] = relatedDataSourcesFieldset.findAll('a');

      AutoApi.getReportFieldOptions = jest.fn().mockReturnValue(Promise.resolve(fieldOptionsStubForApplicationRolesRelatedEntities));
      AutoApi.getReportEntities = jest.fn().mockReturnValue(Promise.resolve({
        data: {
          result: [
            {
              name: 'applications.roles.admin',
              label: 'Admin',
            },
            {
              name: 'applications.roles.manager',
              label: 'Manager',
            },
          ],
        },
      }));

      await rolesRelatedDataSourceButton.trigger('click');
      await rolesRelatedDataSourceOption.trigger('click');
      await flushPromises();
      jest.runAllTimers();
      await nextTick();

      AutoApi.getReportFieldOptions = jest.fn().mockReturnValue(Promise.resolve(fieldOptionsStubForApplicationOwnersRelatedEntities));
      AutoApi.getReportEntities = jest.fn().mockReturnValue(Promise.resolve({
        data: {
          result: [
            {
              name: 'applications.owners.name',
              label: 'Owner Name',
            },
            {
              name: 'applications.owners.groups',
              label: 'Owner Groups',
            },
          ],
        },
      }));
      await ownersRelatedDataSourceButton.trigger('click');
      await ownersRelatedDataSourceOption.trigger('click');

      await flushPromises();
      jest.runAllTimers();
      await nextTick();
    }

    it('adds a related data source', async () => {
      await addDataSource();
      await addRelatedDataSource();

      // verifies that the related entities were added
      const dataSourceContainer = findByTestId(wrapper, 'entities-settings-container');
      const [, ownersHeading, rolesHeading] = dataSourceContainer.findAll('h4');
      expect(ownersHeading.text()).toBe('Applications / Owners');
      expect(rolesHeading.text()).toBe('Applications / Roles');
    });

    it('deletes a related data source', async () => {
      await addDataSource();
      await addRelatedDataSource();
      const dataSourceContainer = findByTestId(wrapper, 'entities-settings-container');

      let allDataSourceHeadings = dataSourceContainer.findAll('h4');
      expect(allDataSourceHeadings.length).toBe(3);

      // deletes the "owners" related entity
      const [, applicationOwners] = dataSourceContainer.findAll('.card');
      const deleteMenu = applicationOwners.find('[role="menu"]');
      await findByText(deleteMenu, 'a', 'deleteDelete').trigger('click');
      await flushPromises();
      jest.runAllTimers();
      await nextTick();

      // should now only show the parent "applications" entity and "applications / roles" related entity.
      allDataSourceHeadings = dataSourceContainer.findAll('h4');
      expect(allDataSourceHeadings.length).toBe(2);
      expect(allDataSourceHeadings[0].text()).toBe('Applications');
      expect(allDataSourceHeadings[1].text()).toBe('Applications / Roles');
    });

    it('deletes a data source', async () => {
      await addDataSource();

      const dataSourceContainer = findByTestId(wrapper, 'entities-settings-container');
      const dataSourceDeleteButton = findByText(dataSourceContainer, 'a', 'deleteDelete');
      await dataSourceDeleteButton.trigger('click');

      // Should take user to initial view asking to add a Data Source
      const mainHeading = wrapper.find('h2');
      expect(mainHeading.text()).toBe('Add Data');
    });

    it('deletes a report template', async () => {
      AutoApi.saveAnalyticsReport = jest.fn().mockReturnValue(Promise.resolve({}));
      await addDataSource();

      // selects entity so save button can be enabled
      const dataSourcesSettingsContainer = findByTestId(wrapper, 'entities-settings-container');
      const definitionBody = findByTestId(dataSourcesSettingsContainer, 'definition-body');
      const [_idCheckbox] = definitionBody.findAll('input[type="checkbox"]');
      await _idCheckbox.setValue(true);

      // saves the template
      const saveAnalyticsReportSpy = jest.spyOn(AutoApi, 'saveAnalyticsReport');
      const headerToolbar = findByRole(wrapper, 'toolbar');
      const saveButton = findByText(headerToolbar, 'button', 'Save');
      await saveButton.trigger('click');
      expect(saveAnalyticsReportSpy).toHaveBeenCalledWith('TEMPLATE-NAME', {
        entities: [{ entity: 'applications' }],
        fields: [{ label: 'Applications Id', value: 'applications._id' }],
      }, ['reportadmin'], '');
    });

    it('ensures that the "Add Data" empty state does not show if a data source has been selected', async () => {
      await addDataSource();

      const mainHeading = wrapper.find('main h2');
      expect(mainHeading.text()).toBe('Settings');

      // Data source columns
      const dataSourceColumnLabels = findByRole(wrapper.find('main'), 'group').findAll('label');
      const [_id, name] = dataSourceColumnLabels;
      expect(_id.text()).toBe('Applications Id');
      expect(name.text()).toBe('Applications Name');
    });

    it('ensures that the related data sources block for the corresponding entity shows up for the expected API response', async () => {
      await addDataSource();

      // Should show related entities for the applications entity since the getReportEntities
      // API call returns a value for the relatedEntities property.
      let entitiesSettingContainer = findByTestId(wrapper, 'entities-settings-container');
      let relatedDataSourcesLegend = findByText(entitiesSettingContainer, 'legend', 'Related data sources');
      expect(relatedDataSourcesLegend.exists()).toBe(true);

      // should detect roles and assignments as related entity options
      const [membersRelatedEntity, ownersRelatedEntity, rolesRelatedEntity] = findAllByTestId(entitiesSettingContainer, 'related-entity-list-item');
      expect(membersRelatedEntity.find('p').text()).toBe('Members');
      expect(ownersRelatedEntity.find('p').text()).toBe('Owners');
      expect(rolesRelatedEntity.find('p').text()).toBe('Roles');

      // We want to change the data source to Users since it does not have any
      // related entities and test that there are no related entity elements.

      // delete current entity
      await findByText(entitiesSettingContainer, 'a', 'deleteDelete').trigger('click');
      await flushPromises();
      jest.runAllTimers();
      await nextTick();

      // add users related entity
      await addDataSource('users');

      // ensure that there are no related entities because users does not have related entities.
      entitiesSettingContainer = findByTestId(wrapper, 'entities-settings-container');
      relatedDataSourcesLegend = findByText(entitiesSettingContainer, 'legend', 'Related data sources');
      expect(relatedDataSourcesLegend).toBeUndefined();

      const relatedEntities = findAllByTestId(entitiesSettingContainer, 'related-entity-list-item');
      expect(relatedEntities.length).toBe(0);
    });

    it('ensures that a selected data source column shows up in the left hand table and enables the save button', async () => {
      await addDataSource('applications', fieldOptionsStubWithoutParameter);

      // Left hand table empty state
      const emptyStateHeading = wrapper.find('h3');
      expect(emptyStateHeading.text()).toBe('No columns added');

      // Checks a data source checkbox
      const dataSourceDefinition = findByTestId(wrapper, 'definition-body');
      const [_idCheckbox] = dataSourceDefinition.findAll('input[type="checkbox"]');
      await _idCheckbox.setChecked();
      await flushPromises();

      // Ensures that the left preview table displays the selected data source checkbox label as a column header
      const [_idHeader] = wrapper.findAll('[role="columnheader"]');
      expect(wrapper.findAll('[role="columnheader"]').length).toBe(1);

      const _idInputValue = _idHeader.find('input').element.value;
      expect(_idInputValue).toBe('Applications Id');

      // Ensures that the left preview table displays the selected data source checkbox value as a column row
      const [_idRow] = wrapper.findAll('[role="cell"]');
      expect(_idRow.text()).toBe('{applications._id}');
    });

    it('saves the form with the selected data source columns in the order that they were selected', async () => {
      await addDataSource('applications', fieldOptionsStubWithoutParameter);

      const saveAnalyticsReportSpy = jest.spyOn(AutoApi, 'saveAnalyticsReport');
      const dataSourceDefinition = findByTestId(wrapper, 'definition-body');
      const [_idCheckbox, name] = dataSourceDefinition.findAll('input[type="checkbox"]');

      // Checks the data source columns in specific order
      await name.setChecked();
      await _idCheckbox.setChecked();
      await nextTick();
      // Saves the form with the fields property containing the selected columns in the order they were checked
      const headerToolbar = findByRole(wrapper, 'toolbar');
      const saveButton = findByText(headerToolbar, 'button', 'Save');
      await saveButton.trigger('click');
      expect(saveAnalyticsReportSpy).toHaveBeenCalledWith('TEMPLATE-NAME', {
        entities: [{ entity: 'applications' }],
        fields: [
          { label: 'Applications Name', value: 'applications.name' },
          { label: 'Applications Id', value: 'applications._id' },
        ],
      }, ['reportadmin'], '');
    });

    it('ensures that the correct payload is sent when a related data source join type is saved', async () => {
      await addDataSource();
      await addRelatedDataSource();

      AutoApi.saveAnalyticsReport = jest.fn().mockReturnValue(Promise.resolve({}));
      const entitiesSettingContainer = findByTestId(wrapper, 'entities-settings-container');
      const [, applicationRolesRelatedEntity] = entitiesSettingContainer.findAll('.card-body');
      const ellipseMenu = applicationRolesRelatedEntity.find('[role="menu"]');
      const allMenuItemOptions = ellipseMenu.findAll('[role="menuitem"]');
      const [settingsOption] = allMenuItemOptions;

      // loads current related entity data to edit
      await ellipseMenu.trigger('click');
      await settingsOption.trigger('click');

      const saveAnalyticsReportSpy = jest.spyOn(AutoApi, 'saveAnalyticsReport');
      const [,,,,, relatedEntitySettingsModal] = wrapper.findAll('[role="dialog"]');
      const joinRadios = relatedEntitySettingsModal.findAll('[type="radio"]');
      const [, rightRadioOption] = joinRadios;

      // selects the 'right' join radio option
      await rightRadioOption.setChecked();

      const saveButton = findByText(relatedEntitySettingsModal, 'button', 'Save');
      await saveButton.trigger('click');

      expect(saveAnalyticsReportSpy).toHaveBeenCalledWith('TEMPLATE-NAME', {
        entities: [
          { entity: 'applications' },
          { entity: 'applications.owners', type: 'right' },
          { entity: 'applications.roles', type: 'left' },
        ],
        fields: [],
      }, ['reportadmin'], '');
    });

    describe('@settings', () => {
      async function addParameterDefinition() {
        const [, parametersModal] = wrapper.findAll('[role="dialog"]');
        const nameField = parametersModal.find('[name="parameter-name"]');
        const labelField = parametersModal.find('[name="parameter-label"]');
        const typeSelect = findByRole(parametersModal, 'listbox');
        const typeStringOption = findByRole(typeSelect, 'option').find('span');
        const saveButton = findByText(parametersModal, 'button', 'Save');

        // ensures that there are no parameter definitions
        const parametersSettingContainer = findByTestId(wrapper, 'parameters-settings-container');
        const parameterHeading = parametersSettingContainer.find('h4');
        expect(parameterHeading.exists()).toBe(false);

        AutoApi.saveAnalyticsReport = jest.fn().mockReturnValue(Promise.resolve({}));

        await nameField.setValue('MyParameter');
        await labelField.setValue('My Parameter Name');
        await typeSelect.trigger('click');
        await typeStringOption.trigger('click');
        await flushPromises();
        await saveButton.trigger('click');
        await nextTick();
      }

      describe('@parameters', () => {
        it('adds a parameter definition', async () => {
          await addDataSource();
          await addParameterDefinition();

          const parametersSettingContainer = findByTestId(wrapper, 'parameters-settings-container');
          const newParameterDefinitionHeading = findByText(parametersSettingContainer, 'h4', 'MyParameter basic');
          expect(newParameterDefinitionHeading.exists()).toBe(true);
        });

        it('deletes a parameter definition', async () => {
          await addDataSource();
          await addParameterDefinition();

          const parametersSettingContainer = findByTestId(wrapper, 'parameters-settings-container');
          const actionsMenu = findByRole(parametersSettingContainer, 'menu');
          const deleteOption = findByText(actionsMenu, 'a', 'deleteDelete');

          let newParameterDefinitionHeading = findByText(parametersSettingContainer, 'h4', 'MyParameter basic');
          expect(newParameterDefinitionHeading.exists()).toBe(true);

          await actionsMenu.trigger('click');
          await deleteOption.trigger('click');

          newParameterDefinitionHeading = findByText(parametersSettingContainer, 'h4', 'MyParameter basic');
          expect(newParameterDefinitionHeading).toBeUndefined();
        });

        it('modifies an existing parameter definition', async () => {
          await addDataSource();
          await addParameterDefinition();

          const parametersSettingContainer = findByTestId(wrapper, 'parameters-settings-container');
          const newParameterDefinitionHeading = findByText(parametersSettingContainer, 'h4', 'MyParameter basic');
          expect(newParameterDefinitionHeading.exists()).toBe(true);

          const parameterActionsMenu = findByRole(parametersSettingContainer, 'menu');
          const parametersEditOption = findByText(parameterActionsMenu, 'a', 'editEdit Parameter');

          await parameterActionsMenu.trigger('click');
          await parametersEditOption.trigger('click');

          const [, parametersModal] = wrapper.findAll('[role="dialog"]');
          const nameField = parametersModal.find('[name="parameter-name"]');

          await nameField.setValue('My Updated Parameter');

          const saveButton = findByText(parametersModal, 'button', 'Save');
          await saveButton.trigger('click');
          await flushPromises();

          const updatedParameterDefinitionHeading = findByText(parametersSettingContainer, 'h4', 'My Updated Parameter basic');
          expect(updatedParameterDefinitionHeading.exists()).toBe(true);
        });
      });

      describe('@filter', () => {
        async function addFilterDefinition() {
          // ensures that there is no current filter definition
          const filterSettingsContainer = findByTestId(wrapper, 'filter-settings-container');
          const activeFilterCard = findByText(filterSettingsContainer, 'p', 'checkFilter active');
          expect(activeFilterCard).toBeUndefined();

          const [,, filtersModal] = wrapper.findAll('[role="dialog"]');
          const [, leftValueSelect, ruleOperatorSelect] = filtersModal.findAll('[role="listbox"]');
          const [, nameLeftValOption] = leftValueSelect.findAll('[role="option"]');
          const containsRuleOperatorOption = ruleOperatorSelect.find('[role="option"]');
          const [rightValueTypeMenu] = filtersModal.findAll('[role="menu"]');
          const [, variableOption] = rightValueTypeMenu.findAll('[role="menuitem"]');

          // selects the left value option (name)
          await leftValueSelect.trigger('click');
          await nameLeftValOption.find('span').trigger('click');

          // selects the rule operator option (contains)
          await ruleOperatorSelect.trigger('click');
          await containsRuleOperatorOption.find('span').trigger('click');

          // selects the right value "Variable" select menu option
          await rightValueTypeMenu.trigger('click');
          await variableOption.trigger('click');

          const rightValueSelect = findByTestId(filtersModal, 'right-value-select-inputValue__1');
          const [MyParameterOption] = rightValueSelect.findAll('[role="option"]');

          // selects the right value select menu and chooses the "MyParameter" option
          await findByRole(rightValueSelect, 'listbox').trigger('click');
          await MyParameterOption.find('span').trigger('click');

          // adds another rule that does not contain a parameter for any values
          const filterBuilderButtons = wrapper.find('.filter-builder-row-buttons');
          const addRuleButton = findByText(filterBuilderButtons, 'button', 'add');
          const [addRuleOption] = filterBuilderButtons.findAll('[role="menuitem"]');
          await addRuleButton.trigger('click');
          await addRuleOption.trigger('click');
          await flushPromises();

          const [, secondRule] = filtersModal.findAll('.queryfilter-row');
          const [secondLeftValueSelect, secondRuleOperatorSelect] = secondRule.findAll('[role="listbox"]');
          const [_idLeftValOption] = secondLeftValueSelect.findAll('[role="option"]');
          const secondContainsRuleOperatorOption = secondRuleOperatorSelect.find('[role="option"]');
          const [, rightLiteralInput] = secondRule.findAll('input');

          // Selects the left value for the second rule
          await secondLeftValueSelect.trigger('click');
          await _idLeftValOption.find('span').trigger('click');

          // Selects the operator for the second rule
          await secondRuleOperatorSelect.trigger('click');
          await secondContainsRuleOperatorOption.find('span').trigger('click');

          // Sets the right value literal
          await rightLiteralInput.setValue('My second rule right literal value');

          // saves filter
          const saveButton = findByText(filtersModal, 'button', 'Save');
          await saveButton.trigger('click');
          await flushPromises();
        }

        it('adds a filter definition', async () => {
          await addDataSource('applications', fieldOptionsStub);
          await addFilterDefinition();

          // ensures that the filter definition exists
          const filterSettingsContainer = findByTestId(wrapper, 'filter-settings-container');
          const activeFilterCard = findByText(filterSettingsContainer, 'p', 'checkFilter active');
          expect(activeFilterCard.exists()).toBe(true);
        });

        it('deletes a filter definition', async () => {
          await addDataSource();
          await addFilterDefinition();

          const filterSettingsContainer = findByTestId(wrapper, 'filter-settings-container');
          const actionsMenu = findByRole(filterSettingsContainer, 'menu');
          const deleteOption = findByText(actionsMenu, 'a', 'deleteDelete');

          // ensures that the filter definition exists
          let activeFilterCard = findByText(filterSettingsContainer, 'p', 'checkFilter active');
          expect(activeFilterCard.exists()).toBe(true);

          await actionsMenu.trigger('click');
          await deleteOption.trigger('click');

          // ensures that the filter definition does NOT exist anymore
          activeFilterCard = findByText(filterSettingsContainer, 'p', 'checkFilter active');
          expect(activeFilterCard).toBeUndefined();
        });

        it('updates any parameter names that are chosen as a right value filter variable if the original parameter definition name is updated', async () => {
          await addDataSource();
          await addParameterDefinition();
          await addFilterDefinition();

          // ensures that the existing filter's first rule parameter right value option name is the existing name
          const [, parametersModal, filtersModal] = wrapper.findAll('[role="dialog"]');
          const firstRule = findByTestId(filtersModal, 'fr-field-inputValue__1');
          const selectedOption = firstRule.find('.multiselect__option--selected');
          expect(selectedOption.text()).toBe('MyParameter');

          // field options API response needs to be updated to the changed parameter name to be edited
          const fieldOptionsWithUpdatedParameter = Object.entries(fieldOptionsStub.data).map(([key, val]) => {
            if (key === 'MyParameter') {
              return ['MyParameterUpdated', val];
            }
            return [key, val];
          });
          const fieldOptionsStubFiltered = {
            data: Object.fromEntries(fieldOptionsWithUpdatedParameter),
          };
          AutoApi.getReportFieldOptions = jest.fn().mockReturnValue(Promise.resolve(fieldOptionsStubFiltered));

          const parametersSettingContainer = findByTestId(wrapper, 'parameters-settings-container');
          const parameterActionsMenu = findByRole(parametersSettingContainer, 'menu');
          const parametersEditOption = findByText(parameterActionsMenu, 'a', 'editEdit Parameter');

          await parameterActionsMenu.trigger('click');
          await parametersEditOption.trigger('click');

          // ensures that the original parameter name is set
          const nameField = parametersModal.find('[name="parameter-name"]');
          expect(nameField.element.value).toBe('MyParameter');

          // changes the parameter name to a new value
          await nameField.setValue('MyParameterUpdated');
          await flushPromises();

          // saves parameter
          const saveButton = findByText(parametersModal, 'button', 'Save');
          await saveButton.trigger('click');
          await flushPromises();

          // ensures that the existing filter rule's parameter right value options is now the new parameter Name
          const updatedSelectOption = firstRule.find('.multiselect__option--selected');
          expect(updatedSelectOption.text()).toBe('MyParameterUpdated');
        });

        it('deletes a filter rule that has a chosen right value variable that matches a parameter that has been deleted', async () => {
          await addDataSource();
          await addParameterDefinition();
          await addFilterDefinition();

          // ensures that the existing filter's first rule parameter right
          // value option has the paremeter to be deleted as the selection.
          let [,, filtersModal] = wrapper.findAll('[role="dialog"]');
          let [firstRule, secondRule] = filtersModal.findAll('.queryfilter-row');
          let rightValueContainer = findByTestId(firstRule, 'fr-field-inputValue__1');
          const [,, MyParameterOption] = rightValueContainer.findAll('[role="option"]');
          expect(MyParameterOption.text()).toBe('applications.name');

          // ensures that all 2 rules exist
          expect(firstRule.exists()).toBe(true);
          expect(secondRule.exists()).toBe(true);

          // field options API response needs to be updated to exclude the parameter to be deleted
          const fieldOptionsWithoutParameter = Object.entries(fieldOptionsStub.data).filter(([key]) => key !== 'MyParameter');
          const fieldOptionsStubFiltered = {
            data: Object.fromEntries(fieldOptionsWithoutParameter),
          };
          AutoApi.getReportFieldOptions = jest.fn().mockReturnValue(Promise.resolve(fieldOptionsStubFiltered));

          const parametersSettingContainer = findByTestId(wrapper, 'parameters-settings-container');
          const parameterActionsMenu = findByRole(parametersSettingContainer, 'menu');
          const parametersDeleteOption = findByText(parameterActionsMenu, 'a', 'deleteDelete');

          // Deletes the parameter
          await parameterActionsMenu.trigger('click');
          await parametersDeleteOption.trigger('click');

          [,, filtersModal] = wrapper.findAll('[role="dialog"]');
          [firstRule, secondRule] = filtersModal.findAll('.queryfilter-row');
          rightValueContainer = findByTestId(firstRule, 'fr-field-inputValue__1');

          // ensures that only one rule exists now
          expect(firstRule.exists()).toBe(true);
          expect(secondRule).toBeUndefined();
          expect(rightValueContainer.exists()).toBe(false);

          // ensures that the first rule does not exist with the 'My Parameter Name' selection by checking
          // for the existence of the right value of the second rule which has now become the first rule.
          const [, rightItemInput] = firstRule.findAll('input');
          expect(rightItemInput.element.value).toBe('My second rule right literal value');
        });

        it('deletes the filter definition altogether when there is only one rule that has the right value selected to a parameter that is deleted', async () => {
          await addDataSource();
          await addParameterDefinition();
          await addFilterDefinition();

          const [,, filtersModal] = wrapper.findAll('[role="dialog"]');
          const [, secondRule] = filtersModal.findAll('.queryfilter-row');

          // deletes the second rule, which is not the rule that has the right value selected to the paremeter we are deleting.
          const deleteSecondRuleButton = findByText(secondRule, 'button', 'remove');
          await deleteSecondRuleButton.trigger('click');
          await flushPromises();

          // field options API response needs to be updated to exclude the parameter to be deleted
          const fieldOptionsWithoutParameter = Object.entries(fieldOptionsStub.data).filter(([key]) => key !== 'MyParameter');
          const fieldOptionsStubFiltered = {
            data: Object.fromEntries(fieldOptionsWithoutParameter),
          };
          AutoApi.getReportFieldOptions = jest.fn().mockReturnValue(Promise.resolve(fieldOptionsStubFiltered));

          const parametersSettingContainer = findByTestId(wrapper, 'parameters-settings-container');
          const parameterActionsMenu = findByRole(parametersSettingContainer, 'menu');
          const parametersDeleteOption = findByText(parameterActionsMenu, 'a', 'deleteDelete');

          // Deletes the parameter
          await parameterActionsMenu.trigger('click');
          await parametersDeleteOption.trigger('click');

          // ensures that the filter definition does NOT exist anymore
          const filterSettingsContainer = findByTestId(wrapper, 'filter-settings-container');
          const activeFilterCard = findByText(filterSettingsContainer, 'p', 'checkFilter active');
          expect(activeFilterCard).toBeUndefined();
        });

        it('deletes a filter rule that has a chosen value that matches a data source column that has been deleted', async () => {
          await addDataSource();
          await addRelatedDataSource();
          // fieldoptions endpoint should include both parent entity and all related entity results so the expected filter options get selected
          AutoApi.getReportFieldOptions = jest.fn().mockReturnValue(Promise.resolve({
            data: {
              ...fieldOptionsStub.data,
              ...fieldOptionsStubForApplicationRolesRelatedEntities.data,
              ...fieldOptionsStubForApplicationOwnersRelatedEntities.data,
            },
          }));
          await addFilterDefinition();

          let filterSettingsContainer = findByTestId(wrapper, 'filter-settings-container');
          let editFilterButton = filterSettingsContainer.find('button');
          let editFilterOptionButton = findByText(filterSettingsContainer, 'a', 'editEdit Filter');
          await editFilterButton.trigger('click');
          await editFilterOptionButton.trigger('click');
          await flushPromises();
          await nextTick();

          // modifies the second rule that will contain a data source column to be deleted
          const [,, filtersModal] = wrapper.findAll('[role="dialog"]');
          const [, secondRule] = filtersModal.findAll('.queryfilter-row');
          const [leftValueSelect] = secondRule.findAll('[role="listbox"]');
          const [,,, applicationsRolesAdminOption] = leftValueSelect.findAll('[role="option"]');

          // Selects the applications.roles.admin left value option
          await leftValueSelect.trigger('click');
          await applicationsRolesAdminOption.find('span').trigger('click');

          // saves filter
          const saveButton = findByText(filtersModal, 'button', 'Save');
          await saveButton.trigger('click');
          await flushPromises();

          // field options API response needs to be updated to exclude the applications.roles related data source to be deleted
          AutoApi.getReportFieldOptions = jest.fn().mockReturnValue(Promise.resolve({
            data: {
              ...fieldOptionsStub.data,
              ...fieldOptionsStubForApplicationOwnersRelatedEntities.data,
            },
          }));

          // deletes the "applications / roles" data source
          const dataSourceContainer = findByTestId(wrapper, 'entities-settings-container');
          const [,, applicationsRoles] = dataSourceContainer.findAll('.card');
          const deleteMenu = applicationsRoles.find('[role="menu"]');
          await findByText(deleteMenu, 'a', 'deleteDelete').trigger('click');

          // opens filter modal to ensure that the second rule that had the deleted data source selection is also deleted
          filterSettingsContainer = findByTestId(wrapper, 'filter-settings-container');
          editFilterButton = filterSettingsContainer.find('button');
          editFilterOptionButton = findByText(filterSettingsContainer, 'a', 'editEdit Filter');
          await editFilterButton.trigger('click');
          await editFilterOptionButton.trigger('click');
          await flushPromises();

          // should now only be one rule
          const rules = filtersModal.findAll('.queryfilter-row');
          expect(rules.length).toBe(1);

          // verify that the left value for the remaining rule does not have applications.roles.admin selected since it was deleted
          const [firstRule] = rules;
          const firstRuleLeftVariableOptionSelection = firstRule.find('.multiselect__option--selected');
          expect(firstRuleLeftVariableOptionSelection.text()).toBe('applications.name');
        });
      });

      describe('@aggregates', () => {
        async function addAggregate(valueOptionIndex = 0, aggregateName = 'My aggregate') {
          const aggregateSettingContainer = findByTestId(wrapper, 'aggregate-settings-container');
          const addDefinitionButton = findByText(aggregateSettingContainer, 'button', 'add');
          await addDefinitionButton.trigger('click');
          await flushPromises();

          const [,,, aggregatesModal] = wrapper.findAll('[role="dialog"]');

          // Sets the aggregate name
          const [aggregateNameField] = aggregatesModal.findAll('input');
          aggregateNameField.setValue(aggregateName);

          const [aggregateTypeSelect, aggregateValueSelect] = aggregatesModal.findAll('[role="listbox"]');

          // Sets the aggregate type
          const aggregateCountOption = findByRole(aggregateTypeSelect, 'option');
          await aggregateTypeSelect.trigger('click');
          await aggregateCountOption.find('span').trigger('click');
          await flushPromises();

          // Sets the aggregate value
          const aggregateValueOptions = aggregateValueSelect.findAll('[role="option"]');
          await aggregateValueOptions[valueOptionIndex].find('span').trigger('click');

          const saveButton = findByText(aggregatesModal, 'button', 'Save');
          await saveButton.trigger('click');
          await flushPromises();
        }

        it('adds an aggregate', async () => {
          await addDataSource();
          // ensures that there are no aggregate definitions
          let aggregateSettingContainer = findByTestId(wrapper, 'aggregate-settings-container');
          const aggregateHeading = aggregateSettingContainer.find('h4');
          expect(aggregateHeading.exists()).toBe(false);
          await addAggregate();

          // ensures that the new aggregate definition exists
          aggregateSettingContainer = findByTestId(wrapper, 'aggregate-settings-container');
          const newAggregateDefinitionHeading = findByText(aggregateSettingContainer, 'h4', 'My aggregate');
          expect(newAggregateDefinitionHeading.exists()).toBe(true);
        });

        it('deletes an aggregate', async () => {
          await addDataSource();
          await addAggregate();

          const aggregateSettingContainer = findByTestId(wrapper, 'aggregate-settings-container');

          // ensures that the aggregate definition exists
          let newParameterDefinitionHeading = findByText(aggregateSettingContainer, 'h4', 'My aggregate');
          expect(newParameterDefinitionHeading.exists()).toBe(true);

          // deletes the aggregate
          const actionsMenu = findByRole(aggregateSettingContainer, 'menu');
          const deleteOption = findByText(actionsMenu, 'a', 'deleteDelete');
          await actionsMenu.trigger('click');
          await deleteOption.trigger('click');

          // ensures that the aggregate definition does NOT exist anymore
          newParameterDefinitionHeading = findByText(aggregateSettingContainer, 'h4', 'My aggregate');
          expect(newParameterDefinitionHeading).toBeUndefined();
        });

        it('deletes an aggregate that has a chosen value that matches a data source column that has been deleted', async () => {
          await addDataSource();
          await addRelatedDataSource();
          AutoApi.getReportFieldOptions = jest.fn().mockReturnValue(Promise.resolve({
            data: {
              ...fieldOptionsStub.data,
              ...fieldOptionsStubForApplicationRolesRelatedEntities.data,
              ...fieldOptionsStubForApplicationOwnersRelatedEntities.data,
            },
          }));
          await addAggregate();
          // first param is the index of the value option to select, second param is the name of the aggregate (applications.roles.admin)
          await addAggregate(4, 'Application Role Admin Aggregate');

          let aggregateSettingContainer = findByTestId(wrapper, 'aggregate-settings-container');
          let allTitles = aggregateSettingContainer.findAll('h4');
          expect(allTitles.length).toBe(2);

          const [aggregate1Title, aggregate2Title] = allTitles;
          expect(aggregate1Title.text()).toBe('My aggregate');
          expect(aggregate2Title.text()).toBe('Application Role Admin Aggregate');

          // field options API response needs to be updated to exclude the applications.roles related data source to be deleted
          AutoApi.getReportFieldOptions = jest.fn().mockReturnValue(Promise.resolve({
            data: {
              ...fieldOptionsStub.data,
              ...fieldOptionsStubForApplicationOwnersRelatedEntities.data,
            },
          }));

          // deletes the "applications / roles" data source
          const dataSourceContainer = findByTestId(wrapper, 'entities-settings-container');
          const [,, applicationsRoles] = dataSourceContainer.findAll('.card');
          const deleteMenu = applicationsRoles.find('[role="menu"]');
          await findByText(deleteMenu, 'a', 'deleteDelete').trigger('click');
          await flushPromises();

          // Checks to make sure that only the aggregate that had the deleted data source is not present
          aggregateSettingContainer = findByTestId(wrapper, 'aggregate-settings-container');
          allTitles = aggregateSettingContainer.findAll('h4');
          expect(allTitles.length).toBe(1);
          expect(allTitles[0].text()).toBe('My aggregate');
        });
      });

      describe('@sorting', () => {
        async function addSortDefinition(sortByOptionIndex = 0) {
          // must trigger fieldoptions manually since modal's @show event does not trigger correctly because it's being mocked
          await wrapper.vm.fetchFieldOptionsForSorting();
          const [,,,, sortModal] = wrapper.findAll('[role="dialog"]');
          const [sortBySelect, sortOrderSelect] = sortModal.findAll('[role="listbox"]');

          // selects the sort by dropdown
          const sortByOptions = sortBySelect.findAll('[role="option"]');
          await sortBySelect.trigger('click');
          await sortByOptions[sortByOptionIndex].find('span').trigger('click');

          // selects the sort order dropdown
          const [sortOrderAscendingOption] = sortOrderSelect.findAll('[role="option"]');
          await sortOrderSelect.trigger('click');
          await sortOrderAscendingOption.find('span').trigger('click');

          const saveButton = findByText(sortModal, 'button', 'Save');
          await saveButton.trigger('click');
          await flushPromises();
        }

        it('adds a sort definition', async () => {
          await addDataSource();

          // ensures that there are no sort definitions
          let sortSettingsContainer = findByTestId(wrapper, 'sort-settings-container');
          let definitionBody = findByTestId(sortSettingsContainer, 'definition-body');
          expect(definitionBody.exists()).toBe(false);

          await addSortDefinition();

          // ensures that the new sort definition exists
          sortSettingsContainer = findByTestId(wrapper, 'sort-settings-container');
          definitionBody = findAllByTestId(sortSettingsContainer, 'definition-body');
          expect(definitionBody.length).toBe(1);

          const definitionHeading = definitionBody[0].find('.card-text');
          expect(definitionHeading.text()).toBe('arrow_upwardSort by: applications._id');
        });

        it('modifies an existing sort definition', async () => {
          await addDataSource();
          await addSortDefinition();

          // ensures that the existing sort definition has the expect heading
          let sortSettingsContainer = findByTestId(wrapper, 'sort-settings-container');
          let definitionBody = findAllByTestId(sortSettingsContainer, 'definition-body');
          let definitionHeading = definitionBody[0].find('.card-text');
          expect(definitionHeading.text()).toBe('arrow_upwardSort by: applications._id');

          // sets the existing definition to edit
          const actionsMenu = findByRole(sortSettingsContainer, 'menu');
          const editOption = findByText(actionsMenu, 'a', 'editEdit Sorting');
          await actionsMenu.trigger('click');
          await editOption.trigger('click');

          const [,,,, sortModal] = wrapper.findAll('[role="dialog"]');
          const [sortBySelect, sortOrderSelect] = sortModal.findAll('[role="listbox"]');
          // selects the sort by dropdown to the _id option now
          const [, sortByNameOption] = sortBySelect.findAll('[role="option"]');
          await sortBySelect.trigger('click');
          await sortByNameOption.find('span').trigger('click');

          // selects the new sort order dropdown to descending
          const [, descendingOption] = sortOrderSelect.findAll('[role="option"]');
          await sortOrderSelect.trigger('click');
          await descendingOption.find('span').trigger('click');

          // saves form
          const saveButton = findByText(sortModal, 'button', 'Save');
          await saveButton.trigger('click');
          await flushPromises();

          // ensures that the sort definition has the updated heading
          sortSettingsContainer = findByTestId(wrapper, 'sort-settings-container');
          definitionBody = findAllByTestId(sortSettingsContainer, 'definition-body');
          definitionHeading = definitionBody[0].find('.card-text');
          expect(definitionHeading.text()).toBe('arrow_downwardSort by: applications.name');
        });

        it('deletes a sort definition', async () => {
          await addDataSource();
          await addSortDefinition();

          // ensures that the sort definition exists
          const sortSettingsContainer = findByTestId(wrapper, 'sort-settings-container');
          let definitionBody = findAllByTestId(sortSettingsContainer, 'definition-body');
          const definitionHeading = definitionBody[0].find('.card-text');
          expect(definitionHeading.text()).toBe('arrow_upwardSort by: applications._id');

          // deletes the sort definition
          const actionsMenu = findByRole(sortSettingsContainer, 'menu');
          const deleteOption = findByText(actionsMenu, 'a', 'deleteDelete');
          await actionsMenu.trigger('click');
          await deleteOption.trigger('click');

          // ensures that the sort definition does NOT exist anymore
          definitionBody = findAllByTestId(sortSettingsContainer, 'definition-body');
          expect(definitionBody.length).toBe(0);
        });

        it('deletes a sort definition that has a chosen value that matches a data source column that has been deleted', async () => {
          await addDataSource();
          await addRelatedDataSource();
          AutoApi.getReportFieldOptions = jest.fn().mockReturnValue(Promise.resolve({
            data: {
              ...fieldOptionsStub.data,
              ...fieldOptionsStubForApplicationRolesRelatedEntities.data,
              ...fieldOptionsStubForApplicationOwnersRelatedEntities.data,
            },
          }));
          await addSortDefinition();
          await addSortDefinition(4);

          let sortSettingContainer = findByTestId(wrapper, 'sort-settings-container');
          let definitionHeadings = sortSettingContainer.findAll('.card-text');
          expect(definitionHeadings.length).toBe(2);

          const [sort1Title, sort2Title] = definitionHeadings;
          expect(sort1Title.text()).toBe('arrow_upwardSort by: applications._id');
          expect(sort2Title.text()).toBe('arrow_upwardSort by: applications.roles.admin');

          // field options API response needs to be updated to exclude the applications.roles related data source to be deleted
          AutoApi.getReportFieldOptions = jest.fn().mockReturnValue(Promise.resolve({
            data: {
              ...fieldOptionsStub.data,
              ...fieldOptionsStubForApplicationOwnersRelatedEntities.data,
            },
          }));

          // deletes the "applications / roles" data source
          const dataSourceContainer = findByTestId(wrapper, 'entities-settings-container');
          const [,, applicationsRoles] = dataSourceContainer.findAll('.card');
          const deleteMenu = applicationsRoles.find('[role="menu"]');
          await findByText(deleteMenu, 'a', 'deleteDelete').trigger('click');
          await flushPromises();

          // Checks to make sure that only the sort definition that had the deleted data source is not present
          sortSettingContainer = findByTestId(wrapper, 'sort-settings-container');
          definitionHeadings = sortSettingContainer.findAll('.card-text');
          expect(definitionHeadings.length).toBe(1);
          expect(definitionHeadings[0].text()).toBe('arrow_upwardSort by: applications._id');
        });
      });
    });
  });
});
