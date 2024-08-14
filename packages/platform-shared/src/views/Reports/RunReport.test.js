/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import { findByTestId, findByRole, findByText } from '@forgerock/platform-shared/src/utils/testHelpers';
import ValidationRules from '@forgerock/platform-shared/src/utils/validationRules';
import * as configApi from '@forgerock/platform-shared/src/api/ConfigApi';
import * as schemaApi from '@forgerock/platform-shared/src/api/SchemaApi';
import * as managedResourceApi from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import * as notification from '@forgerock/platform-shared/src/utils/notification';
import * as autoApi from '@forgerock/platform-shared/src/api/AutoApi';
import * as reportUtils from '@forgerock/platform-shared/src/utils/reportsUtils';
import * as CertificationApi from '@forgerock/platform-shared/src/api/governance/CertificationApi';
import i18n from '@/i18n';
import RunReport from './RunReport';
import {
  getSchemaStub,
  getConfigStub,
  getManagedResourceListStub,
} from './RunReportStubs';
import store from '../../store';

const rules = ValidationRules.getRules(i18n);
ValidationRules.extendRules(rules);

jest.mock('vue-router', () => ({
  useRoute: jest.fn(() => ({ params: { template: 'template-name', state: 'draft' } })),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

describe('Run Report component', () => {
  function setup(props) {
    return mount(RunReport, {
      global: {
        plugins: [i18n],
      },
      props: {
        ...props,
      },
    });
  }

  function fieldDataMocks() {
    CertificationApi.searchAllTemplateNames = jest.fn().mockReturnValue(Promise.resolve({}));
    configApi.getConfig = jest.fn().mockReturnValue(Promise.resolve(getConfigStub));
    schemaApi.getSchema = jest.fn().mockReturnValue(Promise.resolve(getSchemaStub));
    managedResourceApi.getManagedResourceList = jest.fn().mockReturnValue(Promise.resolve(getManagedResourceListStub));
  }

  let wrapper;

  describe('@renders', () => {
    it('displays the spinner on load', async () => {
      wrapper = setup();
      await flushPromises();

      const spinner = wrapper.find('.spinner-large');
      expect(spinner.exists()).toBe(true);
    });
  });

  describe('@mounts', () => {
    const allKnownFields = [
      ['only displays the applications field when "applications" parameter received', 'fr-field-applications', 'applications'],
      ['only displays the applications field when "oauth2_applications" parameter received', 'fr-field-oauth-applications', 'oauth2_applications'],
      ['only displays the events field field when "events" parameter received', 'fr-field-events', 'events'],
      ['only displays the journeys field when "journeyName" parameter received', 'fr-field-journeys', 'journeyName'],
      ['only displays the journeys field when "treeName" parameter received', 'fr-field-journeys', 'treeName'],
      ['only displays the organizations field when "org_names" parameter received', 'fr-field-organizations', 'org_names'],
      ['only displays the roles field when "roles" parameter received', 'fr-field-roles', 'roles'],
      ['only displays the status field when "accountStatus" parameter received', 'fr-field-status', 'accountStatus'],
      ['only displays the status field when "status" parameter received', 'fr-field-status', 'status'],
      ['only displays the outcome field when "treeResult" parameter received', 'fr-field-outcome', 'treeResult'],
      ['only displays the users field when "user_names" parameter received', 'fr-field-users', 'user_names'],
    ];
    const timeframeFields = [
      ['only displays the timeframe field when "startDate" parameter received', 'fr-field-timeframe', 'startDate'],
      ['only displays the timeframe field when "endDate" parameter received', 'fr-field-timeframe', 'endDate'],
    ];

    it.each(allKnownFields)('%s', async (_, fieldTestId, parameter) => {
      fieldDataMocks();
      wrapper = setup({ reportConfig: { parameters: { [parameter]: {} } } });
      await flushPromises();

      const fieldsContainer = findByTestId(wrapper, 'fr-run-report-container');
      const fieldRows = fieldsContainer.findAll('.row');
      expect(fieldRows.length).toBe(1);

      const field = findByTestId(wrapper, fieldTestId);
      expect(field.exists()).toBe(true);
      jest.clearAllMocks();
    });

    it.each(timeframeFields)('%s', async (_, fieldTestId, parameter) => {
      fieldDataMocks();
      wrapper = setup({ reportConfig: { parameters: { [parameter]: {} } } });
      await flushPromises();

      const fieldsContainer = findByTestId(wrapper, 'fr-run-report-container');
      const fieldRows = fieldsContainer.findAll('.row');
      expect(fieldRows.length).toBe(1);

      const field = findByRole(wrapper, 'combobox');
      expect(field.exists()).toBe(true);
      jest.clearAllMocks();
    });
  });

  describe('@components', () => {
    describe('Timeframe field', () => {
      beforeEach(async () => {
        fieldDataMocks();
        wrapper = setup({ reportConfig: { parameters: { startDate: {} } } });
        await flushPromises();
        jest.clearAllMocks();
      });

      it('reveals the datepicker components if the "custom" option is selected', async () => {
        const datePickerStart = findByTestId(wrapper, 'datepicker-start');
        const datePickerEnd = findByTestId(wrapper, 'datepicker-end');
        expect(datePickerStart.isVisible()).toBe(false);
        expect(datePickerEnd.isVisible()).toBe(false);

        const timeFrameField = findByRole(wrapper, 'combobox');
        await timeFrameField.trigger('click');

        const customTimeframeOption = timeFrameField.findAll('li')[4].find('span');
        expect(customTimeframeOption.text()).toBe('Custom');

        await customTimeframeOption.trigger('click');
        await nextTick();

        expect(datePickerStart.isVisible()).toBe(true);
        expect(datePickerEnd.isVisible()).toBe(true);
      });

      it('disables the submit button if there are no values for the datepicker fields', async () => {
        fieldDataMocks();
        wrapper = setup({ reportConfig: { parameters: { startDate: {} } } });
        await flushPromises();
        // Submit button should be enabled on-load since field has default value
        const submitButton = findByTestId(wrapper, 'run-report-button');
        expect(submitButton.attributes('disabled')).toBeFalsy();

        const timeFrameField = findByRole(wrapper, 'combobox');
        await timeFrameField.trigger('click');

        const customTimeframeOption = timeFrameField.findAll('li')[4].find('span');
        await customTimeframeOption.trigger('click');

        expect(submitButton.attributes().disabled).toBeDefined();

        // I couldn't find a way to get the DOM to display the datepicker calendar popup to
        // interact with, so I had to inject the values into the datepicker variable directly.
        wrapper.vm.startDateModel = '2023-10-10';
        expect(submitButton.attributes('disabled')).toBeDefined();

        wrapper.vm.endDateModel = '2023-10-11';
        await nextTick();

        expect(submitButton.attributes().disabled).toBeUndefined();
      });

      it('displays the expected submit button label and help text if a report contains no parameters', async () => {
        fieldDataMocks();
        wrapper = setup({ reportConfig: { parameters: {} } });
        await flushPromises();

        const runReportContainer = wrapper.find('.card');
        expect(runReportContainer.attributes('footer-border-variant')).toBe('white');
        expect(runReportContainer.attributes('no-body')).toBe('true');

        const submitButton = findByTestId(runReportContainer, 'run-report-button');
        expect(submitButton.attributes('disabled')).toBeUndefined();

        const footerDescription = findByText(runReportContainer, 'p', 'Run Report');
        expect(footerDescription.exists()).toBe(true);
      });
    });

    describe('Journeys field', () => {
      it('displays an empty combobox if it is detected that the application is running in enduser since enduse cannot retrieve journeys', async () => {
        fieldDataMocks();
        reportUtils.requestTrees = jest.fn().mockReturnValue(Promise.resolve([{ _id: 'Login' }, { _id: 'ResetPassword' }]));
        store.state.SharedStore.currentPackage = 'enduser';
        wrapper = setup({ reportConfig: { parameters: { journeyName: {} } } });
        await flushPromises();
        jest.clearAllMocks();
        const journeyInputField = findByTestId(wrapper, 'fr-field-journeys');
        const combobox = findByRole(journeyInputField, 'listbox');
        const listOptions = combobox.find('.multiselect__option');
        expect(listOptions.text()).toBe('No elements found. Consider changing the search query.');
      });
    });

    describe('oAuth2 Applications field', () => {
      it('only executes a debounced search if field has options and the searchable prop is true', async () => {
        fieldDataMocks();
        reportUtils.getOauth2Clients = jest.fn().mockReturnValue(Promise.resolve([{ _id: 'App1' }, { _id: 'App2' }]));
        store.state.SharedStore.currentPackage = 'admin';
        wrapper = setup({ reportConfig: { parameters: { oauth2_applications: { type: 'array' } } } });
        await flushPromises();
        jest.clearAllMocks();

        const oAuth2Field = wrapper.find('[type="multiselect"]');
        await oAuth2Field.trigger('click');

        const options = wrapper.findAll('[role="option"]');
        const searchField = wrapper.find('[type="text"]');
        await searchField.setValue('App1');
        expect(options.length).toBe(2);
      });
    });

    describe('Unexpected parameter field test cases', () => {
      beforeEach(async () => {
        fieldDataMocks();
        wrapper = setup({
          templateName: 'TEMPLATE-NAME',
          templateState: 'draft',
          reportConfig: {
            parameters: {
              my_unexpected_parameter: { type: 'string' },
              my_unexpected_integer_parameter: { type: 'integer' },
              my_unexpected_float_parameter: { type: 'float' },
              my_unexpected_boolean_parameter: { type: 'boolean' },
            },
          },
        });
        await flushPromises();
        jest.clearAllMocks();
      });

      it('ensures that unexpected parameter displays a generic text field if the parameter type is of string', () => {
        const unexpectedParameterLabel = findByTestId(wrapper, 'label-my_unexpected_parameter');
        const unexpectedParameterInput = findByTestId(wrapper, 'input-my_unexpected_parameter');

        expect(unexpectedParameterLabel.exists()).toBe(true);
        expect(unexpectedParameterLabel.text()).toBe('my_unexpected_parameter');
        expect(unexpectedParameterInput.exists()).toBe(true);
      });

      it('ensures that unexpected parameters displays a switch field if the parameter type is of boolean', async () => {
        fieldDataMocks();
        wrapper = setup({
          templateName: 'TEMPLATE-NAME',
          reportConfig: { parameters: { my_unexpected_parameter: { type: 'boolean' } } },
        });
        await flushPromises();
        jest.clearAllMocks();

        const unexpectedParameterField = findByTestId(wrapper, 'fr-field-my_unexpected_parameter').find('[testid="my_unexpected_parameter"]');
        expect(unexpectedParameterField.exists()).toBe(true);
        expect(unexpectedParameterField.attributes('type')).toBe('boolean');
      });

      it('ensures that unexpected parameters displays a number field if the parameter type is of integer', async () => {
        fieldDataMocks();
        wrapper = setup({
          templateName: 'TEMPLATE-NAME',
          reportConfig: { parameters: { my_unexpected_parameter: { type: 'integer' } } },
        });
        await flushPromises();
        jest.clearAllMocks();

        const unexpectedParameterField = findByTestId(wrapper, 'fr-field-my_unexpected_parameter').find('input');
        expect(unexpectedParameterField.exists()).toBe(true);
        expect(unexpectedParameterField.attributes('inputmode')).toBe('numeric');
      });

      it('ensures that unexpected parameters displays a number field if the parameter type is of float', async () => {
        fieldDataMocks();
        wrapper = setup({
          templateName: 'TEMPLATE-NAME',
          reportConfig: { parameters: { my_unexpected_parameter: { type: 'float' } } },
        });
        await flushPromises();
        jest.clearAllMocks();

        const unexpectedParameterField = findByTestId(wrapper, 'fr-field-my_unexpected_parameter').find('input');
        expect(unexpectedParameterField.exists()).toBe(true);
        expect(unexpectedParameterField.attributes('inputmode')).toBe('numeric');
      });

      it('ensures that unexpected parameters displays a multiselect field if the parameter type is of array', async () => {
        fieldDataMocks();
        wrapper = setup({
          templateName: 'TEMPLATE-NAME',
          reportConfig: { parameters: { my_unexpected_parameter: { type: 'array' } } },
        });
        await flushPromises();
        jest.clearAllMocks();

        const unexpectedParameterField = findByTestId(wrapper, 'my_unexpected_parameter');
        expect(unexpectedParameterField.exists()).toBe(true);
        expect(unexpectedParameterField.attributes('type')).toBe('multiselect');
      });

      it('ensures that the unexpected parameter displays the correct field type based on the parameter type property for a date field.', async () => {
        fieldDataMocks();
        wrapper = setup({
          templateName: 'TEMPLATE-NAME',
          reportConfig: { parameters: { my_unexpected_parameter: { type: 'date' } } },
        });
        await flushPromises();
        jest.clearAllMocks();

        const unexpectedParameterInput = findByTestId(wrapper, 'fr-field-my_unexpected_parameter').find('[testid="my_unexpected_parameter"]');
        expect(unexpectedParameterInput.exists()).toBe(true);
        expect(unexpectedParameterInput.attributes('type')).toBe('date');
      });

      it('ensures that unexpected parameter displays a single select dropdown with the provided enum list', async () => {
        const enums = [
          { name: 'enum1', value: 'enum1-val' },
          { name: 'enum2', value: 'enum2-val' },
        ];

        fieldDataMocks();
        wrapper = setup({
          templateName: 'TEMPLATE-NAME',
          reportConfig: { parameters: { single_select_enum: { type: 'string', enum: enums } } },
        });
        await flushPromises();
        jest.clearAllMocks();

        const enumSingleSelect = findByRole(wrapper, 'listbox');
        expect(enumSingleSelect.exists()).toBe(true);

        const options = enumSingleSelect.findAll('[role="option"]');
        expect(options.length).toBe(2);

        const [enum1, enum2] = options;
        expect(enum1.text()).toBe('enum1');
        expect(enum2.text()).toBe('enum2');

        await enumSingleSelect.trigger('click');
        await enum1.find('span').trigger('click');

        const singleSelectEnumInput = findByTestId(wrapper, 'fr-field-single_select_enum');
        expect(singleSelectEnumInput.attributes('value')).toEqual('enum1-val');

        await enumSingleSelect.trigger('click');
        await enum2.find('span').trigger('click');

        expect(singleSelectEnumInput.attributes('value')).toEqual('enum2-val');
      });

      it('ensures that unexpected parameter displays a multi-select dropdown with the provided enum list', async () => {
        const enums = [
          { name: 'enum1', value: 'enum1-val' },
          { name: 'enum2', value: 'enum2-val' },
        ];

        fieldDataMocks();
        wrapper = setup({
          templateName: 'TEMPLATE-NAME',
          reportConfig: { parameters: { multi_select_enum: { type: 'array', enum: enums } } },
        });
        await flushPromises();
        jest.clearAllMocks();

        const enumMultiSingleSelect = findByRole(wrapper, 'listbox');
        expect(enumMultiSingleSelect.exists()).toBe(true);

        const options = enumMultiSingleSelect.findAll('[role="option"]');
        expect(options.length).toBe(2);

        const [enum1, enum2] = options;
        expect(enum1.text()).toBe('enum1');
        expect(enum2.text()).toBe('enum2');

        await enumMultiSingleSelect.trigger('click');
        await enum1.find('span').trigger('click');

        const multiSelectEnumInput = findByTestId(wrapper, 'fr-field-multi_select_enum');
        expect(multiSelectEnumInput.attributes('value')).toEqual('enum1-val');

        await enumMultiSingleSelect.trigger('click');
        await enum2.find('span').trigger('click');

        expect(multiSelectEnumInput.attributes('value')).toEqual('enum1-val,enum2-val');
      });

      it('ensures that unexpected parameters disable the submit button if they do not have a value', () => {
        const submitButton = findByTestId(wrapper, 'run-report-button');
        expect(submitButton.attributes('disabled')).toBeDefined();
      });

      it('ensures that unexpected parameters enable the submit button if they have a value', async () => {
        const unexpectedParameterInput = findByTestId(wrapper, 'input-my_unexpected_parameter');
        const unexpectedIntegerParameter = findByTestId(wrapper, 'input-my_unexpected_integer_parameter');
        const unexpectedFloatParameter = findByTestId(wrapper, 'input-my_unexpected_float_parameter');

        await unexpectedParameterInput.setValue('My unexpected parameter input value');
        await unexpectedIntegerParameter.setValue(123);
        await unexpectedFloatParameter.setValue(123.456);

        const submitButton = findByTestId(wrapper, 'run-report-button');
        expect(submitButton.attributes('disabled')).toBeUndefined();
      });

      it('submits a run report for the my_unexpected_parameter field', async () => {
        const runReportSpy = jest.spyOn(autoApi, 'runAnalyticsTemplate').mockImplementation(() => Promise.resolve({}));
        const unexpectedParameterInput = findByTestId(wrapper, 'input-my_unexpected_parameter');
        const unexpectedIntegerParameter = findByTestId(wrapper, 'input-my_unexpected_integer_parameter');
        const unexpectedFloatParameter = findByTestId(wrapper, 'input-my_unexpected_float_parameter');

        await unexpectedParameterInput.setValue('My unexpected parameter input value');
        await unexpectedIntegerParameter.setValue(123);
        await unexpectedFloatParameter.setValue(123.456);
        const submitButton = findByTestId(wrapper, 'run-report-button');
        await submitButton.trigger('click');

        expect(runReportSpy).toHaveBeenCalledWith('TEMPLATE-NAME', 'draft', {
          my_unexpected_boolean_parameter: false,
          my_unexpected_integer_parameter: 123,
          my_unexpected_float_parameter: 123.456,
          my_unexpected_parameter: 'My unexpected parameter input value',
        });
      });
    });
  });

  describe('@submits', () => {
    const statusDefaultValues = ['active', 'inactive', 'blocked'];
    const fieldDefaultValues = [
      ['submits a run report for the timeframe field', 'endDate', '2023-12-26', false],
      ['submits a run report for the applications field', 'applications', ['All applications'], 'applicationsModel'],
      ['submits a run report for the campaign name field', 'campaign_name', 'my campaign', 'campaignNameModel'],
      ['submits a run report for the campaign status field', 'campaign_status', 'in-progress', 'campaignStatusFieldValue'],
      ['submits a run report for the timeframe field', 'startDate', '2023-12-25', false],
      ['submits a run report for the journeys field', 'journeyName', ['my-selected-journey'], 'journeysModel'],
      ['submits a run report for the journeys field', 'treeName', ['my-selected-tree'], 'journeysModel'],
      ['submits a run report for the organizations field', 'org_names', ['my-org-name'], 'organizationsModel'],
      ['submits a run report for the roles field', 'roles', ['my-role'], 'rolesModel'],
      ['submits a run report for the status field', 'accountStatus', statusDefaultValues, false],
      ['submits a run report for the status field', 'status', statusDefaultValues, false],
      ['submits a run report for the outcome field', 'treeResult', ['SUCCESSFUL', 'FAILED', 'CONTINUE'], false],
      ['submits a run report for the users field', 'user_names', ['my-user-name'], 'usersModel'],
    ];

    it.each(fieldDefaultValues)('%s', async (_, parameter, defaultValue, model) => {
      jest.clearAllMocks();
      wrapper = setup({
        templateName: 'TEMPLATE-NAME',
        templateState: 'draft',
        reportConfig: { parameters: { [parameter]: {} } },
      });
      await flushPromises();
      const runReportSpy = jest.spyOn(autoApi, 'runAnalyticsTemplate').mockImplementation(() => Promise.resolve({}));
      const successSpy = jest.spyOn(notification, 'displayNotification');
      const submitButton = findByTestId(wrapper, 'run-report-button');

      // Sets default values for required fields so submit button can be enabled
      if (model) {
        wrapper.vm[model] = defaultValue;
      }

      await nextTick();
      expect(submitButton.attributes().disabled).not.toBeDefined();
      await submitButton.trigger('click');

      if (parameter === 'startDate' || parameter === 'endDate') {
        // we must add this condition since testing for an explicit value with
        // dates is not feasable because milliseconds will never be exact.
        expect(runReportSpy).toHaveBeenCalled();
      } else {
        expect(runReportSpy).toHaveBeenCalledWith('TEMPLATE-NAME', 'draft', { [parameter]: defaultValue });
      }
      expect(wrapper.emitted('update-tab')).toEqual([['report-history']]);
      expect(successSpy).toHaveBeenCalled();
      expect(wrapper.vm.isSubmitting).toBe(false);
    });

    it('submits the Run Report with a rejected response', async () => {
      jest.clearAllMocks();
      // We do not need to loop through all fields to check the catch block since
      // it is the same logic for all fields so hard-coding applications here is fine.
      wrapper = setup({ reportConfig: { parameters: { accountStatus: {} } } });
      await flushPromises();

      const mockError = new Error();
      const runReportSpyReject = jest.spyOn(autoApi, 'runAnalyticsTemplate').mockRejectedValue(mockError);
      const errorSpy = jest.spyOn(notification, 'showErrorMessage');
      const submitButton = findByTestId(wrapper, 'run-report-button');

      expect(submitButton.attributes().disabled).not.toBeDefined();
      await submitButton.trigger('click');

      expect(runReportSpyReject).toHaveBeenCalled();
      expect(wrapper.emitted('tab-update')).not.toBeDefined();
      expect(errorSpy).toHaveBeenCalled();
      expect(wrapper.vm.isSubmitting).toBe(false);
    });

    it('Only shows out-of-the-box mapped fields if the report is pre-packaged', async () => {
      jest.clearAllMocks();
      wrapper = setup({ reportConfig: { parameters: { accountStatus: {} } } });
      await flushPromises();

      // ensures that out of the box reports show the expected mapped field for accountStatus
      let statusLabel = wrapper.find('label');
      expect(statusLabel.text()).toEqual('Status');
      let statusDropdownField = findByRole(wrapper, 'listbox');
      const [active, inactive, blocked] = statusDropdownField.findAll('[role="option"]');
      expect(active.text()).toBe('Active');
      expect(inactive.text()).toBe('Inactive');
      expect(blocked.text()).toBe('Blocked');

      // sets the report to NOT be out-of-the-box
      await wrapper.setProps({
        isPrePackagedReport: false,
        reportConfig: { parameters: { accountStatus: {} } },
      });

      // ensures that the label is now equal to the paremeter supplied name and
      // not the name that is mapped to the out-of-the-box report.
      statusLabel = wrapper.find('label');
      expect(statusLabel.text()).toEqual('accountStatus');

      // ensures that the original out-of-the-box label and dropdowns do not exist
      statusDropdownField = findByRole(wrapper, 'listbox');
      expect(statusDropdownField.exists()).toBe(false);

      // ensures that now an input text field shows
      const inputTextField = wrapper.find('input[type="text"]');
      expect(inputTextField.exists()).toBe(true);
    });

    it('ensures that the payload for pre-packaged reports runs through the mapped _REPORT_FIELDS_CONTROLLER payload only', async () => {
      jest.clearAllMocks();
      wrapper = setup({
        templateName: 'TEMPLATE-NAME',
        templateState: 'draft',
        reportConfig: { parameters: { accountStatus: {} } },
      });
      await flushPromises();

      // ensures that the pre-packaged report outputs the correct payload
      const runReportSpy = jest.spyOn(autoApi, 'runAnalyticsTemplate').mockImplementation(() => Promise.resolve({}));
      const runReportButton = findByText(wrapper, 'button', 'Run Report');
      await runReportButton.trigger('click');
      expect(runReportSpy).toHaveBeenCalledWith('TEMPLATE-NAME', 'draft', { accountStatus: ['active', 'inactive', 'blocked'] });

      // sets the report to a NON pre-packaged state
      await wrapper.setProps({
        isPrePackagedReport: false,
        reportConfig: { parameters: { accountStatus: {} } },
      });

      // sets the input text field value for the accountStatus parameter
      const customAccountStatusFieldValue = 'My custom account status field value';
      const inputTextField = wrapper.find('input[type="text"]');
      await inputTextField.setValue(customAccountStatusFieldValue);

      // submits report and ensures that the payload is now what the user has input and not the
      // expected payload that is mapped in the _REPORT_FIELDS_CONTROLLER for pre-packaged reports.
      await runReportButton.trigger('click');
      expect(runReportSpy).toHaveBeenCalledWith('TEMPLATE-NAME', 'draft', { accountStatus: customAccountStatusFieldValue });
    });
  });
});
