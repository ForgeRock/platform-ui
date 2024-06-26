/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
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
import * as ReportsUtils from '@forgerock/platform-shared/src/utils/reportsUtils';
import * as managedResourceApi from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import ValidationRules from '@forgerock/platform-shared/src/utils/validationRules';
import i18n from '@/i18n';
import ReportTemplate from './ReportTemplate';

ValidationRules.extendRules({
  alpha_num_spaces: ValidationRules.getRules(i18n).alpha_num_spaces,
  whitespace: ValidationRules.getRules(i18n).whitespace,
  required: ValidationRules.getRules(i18n).required,
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
        type: 'string',
      },
      'applications.name': {
        class: 'json',
        label: 'Applications Name',
        type: 'string',
      },
      MyParameter: {
        class: 'parameter',
        type: 'string',
        label: 'My Parameter Name',
      },
    },
  };

  beforeEach(() => {
    AutoApi.getReportEntities = jest.fn().mockReturnValue(Promise.resolve({
      data: {
        result: [
          {
            name: 'applications',
            relatedEntities: ['roles', 'assignments'],
          },
          {
            name: 'Users',
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
          parameters: {
            myParamName: {
              source: 'user_provided',
              label: 'param label',
              description: 'param description',
              type: 'string',
            },
          },
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

    ReportsUtils.getManagedObject = jest.fn().mockReturnValue(Promise.resolve({
      schema: {
        properties: {
          _id: { description: 'User ID', type: 'string' },
        },
      },
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

    jest.clearAllMocks();
  });

  describe('@renders', () => {
    it('ensures that the "Add Data" empty state loads on mount', () => {
      wrapper = setup();
      const mainHeading = wrapper.find('h2');
      expect(mainHeading.text()).toBe('Add a Data Source');
    });

    it('populates the data sources dropdown on load for the "Add a Data Source" modal', async () => {
      wrapper = setup();
      await nextTick();

      const dataSourcesDropdown = findByRole(wrapper, 'listbox');
      const dataSourcesOptions = dataSourcesDropdown.findAll('[role="option"]');
      expect(dataSourcesOptions.length).toBe(2);

      const [UsersOption, applicationsOption] = dataSourcesOptions;
      expect(applicationsOption.text()).toBe('applications');
      expect(UsersOption.text()).toBe('Users');
    });

    it('ensures that the report badge does show the expected report state on load', async () => {
      wrapper = setup();
      const headerNavElement = wrapper.find('header > nav');
      const badgeElement = headerNavElement.find('h1 + span');
      expect(badgeElement.text()).toBe('Published');
    });
  });

  describe('@actions', () => {
    async function addDataSource(entitySelection = 'applications') {
      jest.useFakeTimers();
      wrapper = setup();
      await nextTick();

      const dataSourcesDropdown = findByRole(wrapper, 'listbox');
      const [usersOption, applicationsOption] = dataSourcesDropdown.findAll('[role="option"]');

      if (entitySelection === 'applications') {
        await applicationsOption.find('span').trigger('click');
      }

      if (entitySelection === 'users') {
        await usersOption.find('span').trigger('click');
      }

      const modalFooter = wrapper.find('footer');
      const nextButton = findByText(modalFooter, 'button', 'Next');

      await nextButton.trigger('click');
      await flushPromises();
      jest.runAllTimers();
      await nextTick();
    }

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
        entities: [{ entity: 'applications', name: 'applications' }],
        fields: [{ label: 'Applications Id', value: 'applications._id' }],
      }, ['reportadmin'], '');
    });

    it('duplicates a template', async () => {
      AutoApi.duplicateAnalyticsReport = jest.fn().mockReturnValue(Promise.resolve({}));
      await addDataSource();

      // duplicates the template
      const duplicateAnalyticsReportSpy = jest.spyOn(AutoApi, 'duplicateAnalyticsReport');
      const headerToolbar = findByRole(wrapper, 'toolbar');
      const duplicateButton = findByText(headerToolbar, 'a', 'control_point_duplicateDuplicate');
      await duplicateButton.trigger('click');
      expect(duplicateAnalyticsReportSpy).toHaveBeenCalledWith('TEMPLATE-NAME', 'published');
    });

    it('ensures that the "Add Data" empty state does not show if a data source has been selected', async () => {
      await addDataSource();

      const mainHeading = wrapper.find('main h2');
      expect(mainHeading.text()).toBe('Settings');

      // Data source columns
      const dataSourceColumnLabels = findByRole(wrapper.find('main'), 'group').findAll('label');
      const [_id, applications] = dataSourceColumnLabels;
      expect(_id.text()).toBe('Applications Id');
      expect(applications.text()).toBe('Applications Name');
    });

    it('ensures that the related data sources block for the corresponding entity shows up for the expected api response', async () => {
      await addDataSource();

      // Should show related entities for the applications entity since the getReportEntities
      // api call returns a value for the relatedEntities property.
      let entitiesSettingContainer = findByTestId(wrapper, 'entities-settings-container');
      let relatedDataSourcesLegend = findByText(entitiesSettingContainer, 'legend', 'Related data sources');
      expect(relatedDataSourcesLegend.exists()).toBe(true);

      // should detect roles and assignments as related entity options
      const [rolesRelatedEntity, assignmentsRelatedEntity] = findAllByTestId(entitiesSettingContainer, 'related-entity-list-item');
      expect(rolesRelatedEntity.find('p').text()).toBe('roles');
      expect(assignmentsRelatedEntity.find('p').text()).toBe('assignments');

      // We want to change the data source to Users since it does not have any
      // related entities and test that there are no related entity elements.

      // delete current entity
      await findByText(entitiesSettingContainer, 'a', 'deleteDelete').trigger('click');

      // add users entity
      await addDataSource('users');

      // ensure that there are no related entities because users does not have a relatedEntities property
      entitiesSettingContainer = findByTestId(wrapper, 'entities-settings-container');
      relatedDataSourcesLegend = findByText(entitiesSettingContainer, 'legend', 'Related data sources');
      expect(relatedDataSourcesLegend).toBeUndefined();

      const relatedEntities = findAllByTestId(entitiesSettingContainer, 'related-entity-list-item');
      expect(relatedEntities.length).toBe(0);
    });

    it('ensures that a selected data source column shows up in the left hand table and enables the save button', async () => {
      await addDataSource();

      // Left hand table empty state
      const emptyStateHeading = wrapper.find('h3');
      expect(emptyStateHeading.text()).toBe('No columns added');

      // Makes sure that the disabled button is actually disabled at first
      const toolbar = findByRole(wrapper, 'toolbar');
      let saveButton = findByText(toolbar, 'button', 'Save');
      expect(saveButton.attributes('disabled')).toBeDefined();

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
      expect(_idRow.text()).toBe('{_id}');

      // Makes sure that the disabled button is now enabled
      saveButton = findByText(toolbar, 'button', 'Save');
      expect(saveButton.attributes('disabled')).toBeUndefined();
    });

    it('saves the form with a selected data source column', async () => {
      await addDataSource();

      // Checks a data source checkbox
      const dataSourceDefinition = findByTestId(wrapper, 'definition-body');
      const [_idCheckbox] = dataSourceDefinition.findAll('input[type="checkbox"]');
      await _idCheckbox.setChecked();
      await flushPromises();

      // Saves the form with the fields property containing the selected _id column
      const saveAnalyticsReportSpy = jest.spyOn(AutoApi, 'saveAnalyticsReport');
      const headerToolbar = findByRole(wrapper, 'toolbar');
      const saveButton = findByText(headerToolbar, 'button', 'Save');
      await saveButton.trigger('click');
      expect(saveAnalyticsReportSpy).toHaveBeenCalledWith('TEMPLATE-NAME', {
        entities: [{ entity: 'applications', name: 'applications' }],
        fields: [{ label: 'Applications Id', value: 'applications._id' }],
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

        await nameField.setValue('MyParameter');
        await labelField.setValue('My Parameter Name');
        await typeSelect.trigger('click');
        await typeStringOption.trigger('click');
        await flushPromises();
        await saveButton.trigger('click');
      }

      describe('@parameters', () => {
        it('adds a parameter definition', async () => {
          await addDataSource();
          await addParameterDefinition();

          const parametersSettingContainer = findByTestId(wrapper, 'parameters-settings-container');
          const newParameterDefinitionHeading = findByText(parametersSettingContainer, 'h4', 'MyParameter user_provided');
          expect(newParameterDefinitionHeading.exists()).toBe(true);
        });

        it('deletes a parameter definition', async () => {
          await addDataSource();
          await addParameterDefinition();

          const parametersSettingContainer = findByTestId(wrapper, 'parameters-settings-container');
          const actionsMenu = findByRole(parametersSettingContainer, 'menu');
          const deleteOption = findByText(actionsMenu, 'a', 'deleteDelete');

          let newParameterDefinitionHeading = findByText(parametersSettingContainer, 'h4', 'MyParameter user_provided');
          expect(newParameterDefinitionHeading.exists()).toBe(true);

          await actionsMenu.trigger('click');
          await deleteOption.trigger('click');

          newParameterDefinitionHeading = findByText(parametersSettingContainer, 'h4', 'MyParameter user_provided');
          expect(newParameterDefinitionHeading).toBeUndefined();
        });

        it('modifies an existing parameter definition', async () => {
          await addDataSource();
          await addParameterDefinition();

          const parametersSettingContainer = findByTestId(wrapper, 'parameters-settings-container');
          const newParameterDefinitionHeading = findByText(parametersSettingContainer, 'h4', 'MyParameter user_provided');
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

          const updatedParameterDefinitionHeading = findByText(parametersSettingContainer, 'h4', 'My Updated Parameter user_provided');
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

          const rightValueSelect = findByTestId(filtersModal, 'right-value-select');
          const [MyParameterOption] = rightValueSelect.findAll('[role="option"]');

          // selects the right value select menu and chooses the "MyParameter" option
          await findByRole(rightValueSelect, 'listbox').trigger('click');
          await MyParameterOption.find('span').trigger('click');

          // adds another rule
          const addRuleButton = findByText(filtersModal, 'button', 'add');
          await addRuleButton.trigger('click');
          await flushPromises();

          const [, secondRule] = filtersModal.findAll('.queryfilter-row');
          const [secondLeftValueSelect, secondRuleOperatorSelect] = secondRule.findAll('[role="listbox"]');
          const [, _idLeftValOption] = secondLeftValueSelect.findAll('[role="option"]');
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
        }

        it('adds a filter definition', async () => {
          await addDataSource();
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
          const rightValueSelect = findByTestId(filtersModal, 'right-value-select');
          const selectedOption = rightValueSelect.find('.multiselect__option--selected');
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

          // saves parameter
          const saveButton = findByText(parametersModal, 'button', 'Save');
          await saveButton.trigger('click');
          await flushPromises();

          // ensures that the existing filter rule's parameter right value options is now the new parameter Name
          const updatedSelectOption = rightValueSelect.find('.multiselect__option--selected');
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
          let rightValueSelect = findByTestId(firstRule, 'right-value-select');
          const [,, MyParameterOption] = rightValueSelect.findAll('[role="option"]');
          expect(MyParameterOption.text()).toBe('applications.name');

          // ensures that both rules exist
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
          rightValueSelect = findByTestId(firstRule, 'right-value-select');

          // ensures that only one rule exists now
          expect(firstRule.exists()).toBe(true);
          expect(secondRule).toBeUndefined();
          expect(rightValueSelect.exists()).toBe(false);

          // ensures that the first rule is not the rule with the 'My Parameter Name' selected as the right value
          const [, rightLiteralInput] = firstRule.findAll('input');
          expect(rightLiteralInput.element.value).toBe('My second rule right literal value');
        });

        it('deletes the filter definition altogether when there is only one rule that has the right value selected to a parameter that is deleted', async () => {
          await addDataSource();
          await addParameterDefinition();
          await addFilterDefinition();

          const [,, filtersModal] = wrapper.findAll('[role="dialog"]');
          const [, secondRule] = filtersModal.findAll('.queryfilter-row');

          // deletes the second rule, which is not the rule that has the right value selected to the paremeter we are deleting.
          const deleteRuleButton = findByText(secondRule, 'button', 'remove');
          await deleteRuleButton.trigger('click');
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
      });

      describe('@aggregates', () => {
        async function addAggregate() {
          // ensures that there are no aggregate definitions
          const aggregateSettingContainer = findByTestId(wrapper, 'aggregate-settings-container');
          const aggregateHeading = aggregateSettingContainer.find('h4');
          expect(aggregateHeading.exists()).toBe(false);

          // sets the existing definition to edit
          const addDefinitionButton = findByText(aggregateSettingContainer, 'button', 'add');
          await addDefinitionButton.trigger('click');
          await flushPromises();

          const [,,, aggregatesModal] = wrapper.findAll('[role="dialog"]');

          // Sets the aggregate name
          const [aggregateNameField] = aggregatesModal.findAll('input');
          aggregateNameField.setValue('My aggregate');

          const [aggregateTypeSelect, aggregateValueSelect] = aggregatesModal.findAll('[role="listbox"]');

          // Sets the aggregate type
          const aggregateCountOption = findByRole(aggregateTypeSelect, 'option');
          await aggregateTypeSelect.trigger('click');
          await aggregateCountOption.find('span').trigger('click');

          // Sets the aggregate value
          const aggregateValueOptions = aggregateValueSelect.findAll('[role="option"]');
          const [_idOption] = aggregateValueOptions;
          expect(aggregateValueOptions.length).toBe(2);
          await _idOption.find('span').trigger('click');

          const saveButton = findByText(aggregatesModal, 'button', 'Save');
          await saveButton.trigger('click');
        }

        it('adds an aggregate', async () => {
          await addDataSource();
          await addAggregate();

          // ensures that the new aggregate definition exists
          const aggregateSettingContainer = findByTestId(wrapper, 'aggregate-settings-container');
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
      });

      describe('@sorting', () => {
        async function addSortDefinition() {
          const [,,,, sortModal] = wrapper.findAll('[role="dialog"]');

          // ensures that there are no sort definitions
          const sortSettingsContainer = findByTestId(wrapper, 'sort-settings-container');
          const definitionBody = findByTestId(sortSettingsContainer, 'definition-body');
          expect(definitionBody.exists()).toBe(false);

          const [sortBySelect, sortOrderSelect] = sortModal.findAll('[role="listbox"]');

          // selects the sort by dropdown
          const [sortByMyParameterOption] = sortBySelect.findAll('[role="option"]');
          await sortBySelect.trigger('click');
          await sortByMyParameterOption.find('span').trigger('click');

          // selects the sort order dropdown
          const [sortOrderAscendingOption] = sortOrderSelect.findAll('[role="option"]');
          await sortOrderSelect.trigger('click');
          await sortOrderAscendingOption.find('span').trigger('click');

          const saveButton = findByText(sortModal, 'button', 'Save');
          await saveButton.trigger('click');
        }

        it('adds a sort definition', async () => {
          await addDataSource();
          await addSortDefinition();

          // ensures that the new sort definition exists
          const sortSettingsContainer = findByTestId(wrapper, 'sort-settings-container');
          const definitionBody = findAllByTestId(sortSettingsContainer, 'definition-body');
          expect(definitionBody.length).toBe(1);

          const definitionHeading = definitionBody[0].find('.card-text');
          expect(definitionHeading.text()).toBe('arrow_upwardSort by: applications._id');
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

          // ensures that the sort definition has the updated heading
          sortSettingsContainer = findByTestId(wrapper, 'sort-settings-container');
          definitionBody = findAllByTestId(sortSettingsContainer, 'definition-body');
          definitionHeading = definitionBody[0].find('.card-text');
          expect(definitionHeading.text()).toBe('arrow_downwardSort by: applications.name');
        });
      });
    });
  });
});
