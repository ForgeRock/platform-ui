/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { nextTick } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import { findByRole, findByText, findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as AutoApi from '@forgerock/platform-shared/src/api/AutoApi';
import * as ReportsUtils from '@forgerock/platform-shared/src/utils/reportsUtils';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import ValidationRules from '@forgerock/platform-shared/src/utils/validationRules';
import i18n from '@/i18n';
import ReportTemplate from './ReportTemplate';

ValidationRules.extendRules({
  alpha_num_spaces: ValidationRules.getRules(i18n).alpha_num_spaces,
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

  beforeEach(() => {
    const reportConfig = {
      version: 'v2',
      parameters: {
        myParamName: {
          source: 'user_provided',
          label: 'param label',
          description: 'param description',
          type: 'string',
        },
      },
    };
    const reportConfigString = JSON.stringify(reportConfig);

    AutoApi.getReportEntities = jest.fn().mockReturnValue(Promise.resolve({
      data: {
        result: [
          {
            name: 'applications',
            relatedDataSources: ['roles', 'assignments'],
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
        reportConfig: reportConfigString,
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

    jest.clearAllMocks();
  });

  const fieldOptionsStub = {
    data: {
      'applications._id': {
        class: 'json',
        type: 'string',
      },
      'applications.name': {
        class: 'json',
        type: 'string',
      },
      'My Parameter': {
        class: 'parameter',
        type: 'string',
        label: 'My Parameter Name',
      },
    },
  };

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

      const [applicationsOption, UsersOption] = dataSourcesOptions;
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
    async function addDataSource() {
      AutoApi.getReportFieldOptions = jest.fn().mockReturnValue(Promise.resolve(fieldOptionsStub));
      jest.useFakeTimers();
      wrapper = setup();
      await nextTick();

      const dataSourcesDropdown = findByRole(wrapper, 'listbox');
      const [applicationsOption] = dataSourcesDropdown.findAll('[role="option"]');
      await applicationsOption.find('span').trigger('click');

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
        fields: [{ label: '_id', value: 'applications._id' }],
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
      const [_id, name] = dataSourceColumnLabels;
      expect(_id.text()).toBe('_id');
      expect(name.text()).toBe('name');
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
      expect(_idInputValue).toBe('_id');

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
        fields: [{ label: '_id', value: 'applications._id' }],
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

        await nameField.setValue('My Parameter');
        await labelField.setValue('My Parameter Name');
        await typeSelect.trigger('click');
        await typeStringOption.trigger('click');
        await saveButton.trigger('click');
      }

      describe('@parameters', () => {
        it('adds a parameter definition', async () => {
          await addDataSource();
          await addParameterDefinition();

          const parametersSettingContainer = findByTestId(wrapper, 'parameters-settings-container');
          const newParameterDefinitionHeading = findByText(parametersSettingContainer, 'h4', 'My Parameter user_provided');
          expect(newParameterDefinitionHeading.exists()).toBe(true);
        });

        it('deletes a parameter definition', async () => {
          await addDataSource();
          await addParameterDefinition();

          const parametersSettingContainer = findByTestId(wrapper, 'parameters-settings-container');
          const actionsMenu = findByRole(parametersSettingContainer, 'menu');
          const deleteOption = findByText(actionsMenu, 'a', 'deleteDelete');

          let newParameterDefinitionHeading = findByText(parametersSettingContainer, 'h4', 'My Parameter user_provided');
          expect(newParameterDefinitionHeading.exists()).toBe(true);

          await actionsMenu.trigger('click');
          await deleteOption.trigger('click');

          newParameterDefinitionHeading = findByText(parametersSettingContainer, 'h4', 'My Parameter user_provided');
          expect(newParameterDefinitionHeading).toBeUndefined();
        });

        it('modifies an existing parameter definition', async () => {
          await addDataSource();
          await addParameterDefinition();

          const parametersSettingContainer = findByTestId(wrapper, 'parameters-settings-container');
          const newParameterDefinitionHeading = findByText(parametersSettingContainer, 'h4', 'My Parameter user_provided');
          expect(newParameterDefinitionHeading.exists()).toBe(true);

          const parameterActionsMenu = findByRole(parametersSettingContainer, 'menu');
          const parametersEditOption = findByText(parameterActionsMenu, 'a', 'editEdit Parameters');

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
          const [,, MyParameterOption] = rightValueSelect.findAll('[role="option"]');

          // selects the right value select menu and chooses the "My Parameter" option
          await findByRole(rightValueSelect, 'listbox').trigger('click');
          await MyParameterOption.find('span').trigger('click');

          // adds another rule
          const addRuleButton = findByText(filtersModal, 'button', 'add');
          await addRuleButton.trigger('click');
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

        it('updates any parameter names that are chosen as a right value variable if the original parameter definition label is updated', async () => {
          await addDataSource();
          await addParameterDefinition();
          await addFilterDefinition();

          // ensures that the existing filter's first rule parameter right value option name is the existing name
          const [, parametersModal, filtersModal] = wrapper.findAll('[role="dialog"]');
          const rightValueSelect = findByTestId(filtersModal, 'right-value-select');
          const selectedOption = rightValueSelect.find('.multiselect__option--selected');
          expect(selectedOption.text()).toBe('My Parameter Name');

          // field options API response needs to be updated to the changed parameter label to be edited
          fieldOptionsStub.data['My Parameter'].label = 'My Parameter Name Updated';
          AutoApi.getReportFieldOptions = jest.fn().mockReturnValue(Promise.resolve(fieldOptionsStub));

          const parametersSettingContainer = findByTestId(wrapper, 'parameters-settings-container');
          const parameterActionsMenu = findByRole(parametersSettingContainer, 'menu');
          const parametersEditOption = findByText(parameterActionsMenu, 'a', 'editEdit Parameters');

          await parameterActionsMenu.trigger('click');
          await parametersEditOption.trigger('click');

          // ensures that the original parameter label is set
          const labelField = parametersModal.find('[name="parameter-label"]');
          expect(labelField.element.value).toBe('My Parameter Name');

          // changes the parameter label to a new value
          await labelField.setValue('My Parameter Name Updated');

          // saves parameter
          const saveButton = findByText(parametersModal, 'button', 'Save');
          await saveButton.trigger('click');

          // ensures that the existing filter rule's parameter right value options is now the new parameter Name
          const updatedSelectOption = rightValueSelect.find('.multiselect__option--selected');
          expect(updatedSelectOption.text()).toBe('My Parameter Name Updated');

          // Puts the field options label back to it's original name so as to not effect future tests
          fieldOptionsStub.data['My Parameter'].label = 'My Parameter Name';
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
          expect(MyParameterOption.text()).toBe('My Parameter Name');

          // ensures that both rules exist
          expect(firstRule.exists()).toBe(true);
          expect(secondRule.exists()).toBe(true);

          // field options API response needs to be updated to exclude the parameter to be deleted
          delete fieldOptionsStub.data['My Parameter'];
          AutoApi.getReportFieldOptions = jest.fn().mockReturnValue(Promise.resolve(fieldOptionsStub));

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

          // Adds the fieldoptions "My Parameter" object back to prevent future tests from having unexpected inconsistencies
          fieldOptionsStub.data['My Parameter'] = {
            class: 'parameter',
            type: 'string',
            label: 'My Parameter Name',
          };
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
          delete fieldOptionsStub.data['My Parameter'];
          AutoApi.getReportFieldOptions = jest.fn().mockReturnValue(Promise.resolve(fieldOptionsStub));

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

          // Adds the fieldoptions "My Parameter" object back to prevent future tests from having unexpected inconsistencies
          fieldOptionsStub.data['My Parameter'] = {
            class: 'parameter',
            type: 'string',
            label: 'My Parameter Name',
          };
        });
      });

      describe('@aggregates', () => {
        async function addAggregate() {
          const [,,, aggregatesModal] = wrapper.findAll('[role="dialog"]');

          // ensures that there are no aggregate definitions
          const aggregateSettingContainer = findByTestId(wrapper, 'aggregate-settings-container');
          const aggregateHeading = aggregateSettingContainer.find('h4');
          expect(aggregateHeading.exists()).toBe(false);

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
          expect(aggregateValueOptions.length).toBe(3);
          await aggregateValueOptions[2].find('span').trigger('click');

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

        it('updates any parameter names that are chosen as a right value option if the original parameter definition label is updated', async () => {
          await addDataSource();
          await addParameterDefinition();
          await addAggregate();

          // ensures that the existing aggregate's right value options is selected to the parameter label to be updated
          const [, parametersModal,, aggregatesModal] = wrapper.findAll('[role="dialog"]');
          const [, aggregateValueSelect] = aggregatesModal.findAll('[role="listbox"]');
          const selectedOption = aggregateValueSelect.find('.multiselect__option--selected');
          expect(selectedOption.text()).toBe('My Parameter Name');

          // field options API response needs to be updated to the changed parameter label to be edited
          fieldOptionsStub.data['My Parameter'].label = 'My Parameter Name Updated';
          AutoApi.getReportFieldOptions = jest.fn().mockReturnValue(Promise.resolve(fieldOptionsStub));

          const parametersSettingContainer = findByTestId(wrapper, 'parameters-settings-container');
          const parameterActionsMenu = findByRole(parametersSettingContainer, 'menu');
          const parametersEditOption = findByText(parameterActionsMenu, 'a', 'editEdit Parameters');

          await parameterActionsMenu.trigger('click');
          await parametersEditOption.trigger('click');

          // ensures that the original parameter label is set
          const labelField = parametersModal.find('[name="parameter-label"]');
          expect(labelField.element.value).toBe('My Parameter Name');

          // changes the parameter label to a new value
          await labelField.setValue('My Parameter Name Updated');

          // saves parameter
          const saveButton = findByText(parametersModal, 'button', 'Save');
          await saveButton.trigger('click');

          const aggregateSettingContainer = findByTestId(wrapper, 'aggregate-settings-container');
          const actionsMenu = findByRole(aggregateSettingContainer, 'menu');
          const editOption = findByText(actionsMenu, 'a', 'editEdit Aggregate');
          await actionsMenu.trigger('click');
          await editOption.trigger('click');

          // ensures that the existing aggregate's right value option is now set to the new parameter label
          const updatedSelectedOption = aggregateValueSelect.find('.multiselect__option--selected');
          expect(updatedSelectedOption.text()).toBe('My Parameter Name Updated');

          // Puts the field options label back to it's original name so as to not effect future tests
          fieldOptionsStub.data['My Parameter'].label = 'My Parameter Name';
        });

        it('deletes an aggregate definition if the aggregates right value matches the parameter that is deleted', async () => {
          await addDataSource();
          await addParameterDefinition();
          await addAggregate();

          // field options API response needs to be updated to exclude the parameter to be deleted
          delete fieldOptionsStub.data['My Parameter'];
          AutoApi.getReportFieldOptions = jest.fn().mockReturnValue(Promise.resolve(fieldOptionsStub));

          const aggregateSettingContainer = findByTestId(wrapper, 'aggregate-settings-container');

          // ensures that the aggregate definition exists
          let newAggregateDefinitionHeading = findByText(aggregateSettingContainer, 'h4', 'My aggregate');
          expect(newAggregateDefinitionHeading.exists()).toBe(true);

          const parametersSettingContainer = findByTestId(wrapper, 'parameters-settings-container');
          const parameterActionsMenu = findByRole(parametersSettingContainer, 'menu');
          const parametersDeleteOption = findByText(parameterActionsMenu, 'a', 'deleteDelete');

          // Deletes the parameter
          await parameterActionsMenu.trigger('click');
          await parametersDeleteOption.trigger('click');

          // ensures that the aggregate definition does NOT exist anymore
          newAggregateDefinitionHeading = findByText(aggregateSettingContainer, 'h4', 'My aggregate');
          expect(newAggregateDefinitionHeading).toBeUndefined();

          // Adds the fieldoptions "My Parameter" object back to prevent future tests from having unexpected inconsistencies
          fieldOptionsStub.data['My Parameter'] = {
            class: 'parameter',
            type: 'string',
            label: 'My Parameter Name',
          };
        });
      });
    });
  });
});
