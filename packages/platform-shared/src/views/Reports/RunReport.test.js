/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as configApi from '@forgerock/platform-shared/src/api/ConfigApi';
import * as schemaApi from '@forgerock/platform-shared/src/api/SchemaApi';
import * as managedResourceApi from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import dateRanges from '@forgerock/platform-shared/src/utils/date';
import * as notification from '@forgerock/platform-shared/src/utils/notification';
import * as autoApi from '@forgerock/platform-shared/src/api/AutoApi';
import * as reportUtils from '@forgerock/platform-shared/src/utils/reportsUtils';
import flushPromises from 'flush-promises';
import i18n from '@/i18n';
import RunReport from './RunReport';
import {
  getSchemaStub,
  getConfigStub,
  getManagedResourceListStub,
} from './RunReportStubs';
import store from '../../store';

describe('Run Report component', () => {
  function setup(props) {
    return mount(RunReport, {
      i18n,
      propsData: {
        ...props,
      },
    });
  }

  function fieldDataMocks() {
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
      ['only displays the timeframe field when "startDate" parameter received', 'fr-field-timeframe', 'startDate'],
      ['only displays the timeframe field when "endDate" parameter received', 'fr-field-timeframe', 'endDate'],
      ['only displays the applications field when "applications" parameter received', 'fr-field-applications', 'applications'],
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
  });

  describe('@components', () => {
    describe('Timeframe field', () => {
      beforeEach(async () => {
        fieldDataMocks();
        wrapper = setup({ reportConfig: { parameters: { startDate: {} } } });
        await flushPromises();
        jest.clearAllMocks();
      });

      it('ensures that the "Last 7 days" datepicker values are the default values', () => {
        const dateFormat = 'YYYY-MM-DD';
        const [last7DaysStart, last7DaysEnd] = dateRanges(dateFormat, dateFormat)['Last 7 Days'];
        expect(wrapper.vm._setupProxy.startDateModel).toEqual(last7DaysStart);
        expect(wrapper.vm._setupProxy.endDateModel).toEqual(last7DaysEnd);
      });

      it('reveals the datepicker components if the "custom" option is selected', async () => {
        const datepickerField = findByTestId(wrapper, 'datepicker');
        expect(datepickerField.isVisible()).toBe(false);

        const timeFrameField = findByTestId(wrapper, 'fr-field-timeframe');
        await timeFrameField.trigger('click');

        const customTimeframeOption = timeFrameField.findAll('li').at(4).find('span');
        expect(customTimeframeOption.text()).toBe('Custom');

        await customTimeframeOption.trigger('click');
        await nextTick();

        expect(datepickerField.isVisible()).toBe(true);
      });

      it('disables the submit button if there are no values for the datepicker fields', async () => {
        fieldDataMocks();
        wrapper = setup({ reportConfig: { parameters: { startDate: {} } } });
        await flushPromises();
        // Submit button should be enabled on-load since field has default value
        const submitButton = findByTestId(wrapper, 'run-report-button');
        expect(submitButton.attributes('disabled')).toBeFalsy();

        const timeFrameField = findByTestId(wrapper, 'fr-field-timeframe');
        await timeFrameField.trigger('click');

        const customTimeframeOption = timeFrameField.findAll('li').at(4).find('span');
        await customTimeframeOption.trigger('click');

        expect(submitButton.attributes('disabled')).toBe('disabled');

        // I couldnt find a way to get the DOM to display the datepicker calendar popup to
        // interact with it, so I had to inject the values into the datepicker variable directly.
        wrapper.vm._setupProxy.startDateModel = '2023-10-10';
        expect(submitButton.attributes('disabled')).toBe('disabled');

        wrapper.vm._setupProxy.endDateModel = '2023-10-11';
        await nextTick();

        expect(submitButton.attributes('disabled')).toBeFalsy();
      });

      it('disables the submit button if there are no valid report parameters', async () => {
        fieldDataMocks();
        wrapper = setup({ reportConfig: { parameters: {} } });
        await flushPromises();

        const submitButton = findByTestId(wrapper, 'run-report-button');
        expect(submitButton.attributes('disabled')).toBe('disabled');

        const fieldsContainer = findByTestId(wrapper, 'fr-run-report-container');
        expect(fieldsContainer.text()).toBe('Report does not contain any valid parameters');
      });
    });

    describe('Applications field', () => {
      beforeEach(async () => {
        fieldDataMocks();
        wrapper = setup({ reportConfig: { parameters: { applications: {} } } });
        await flushPromises();
        jest.clearAllMocks();
      });

      it('ensures that the default value for the applications field is set to "All applications"', () => {
        expect(wrapper.vm._setupProxy.applicationsModel).toEqual([i18n.t('reports.tabs.runReport.applications.allApplications')]);
      });

      it('reveals the all applications field if the "Specific Applications" option is selected', async () => {
        const specificApplicationsField = findByTestId(wrapper, 'fr-field-Applications');
        expect(specificApplicationsField.isVisible()).toBe(false);

        const applicationsField = findByTestId(wrapper, 'fr-field-applications');
        await applicationsField.trigger('click');

        const collapseWrapper = findByTestId(wrapper, 'all-applications-field');
        expect(collapseWrapper.classes()).not.toContain('show');
        const specificApplicationsOption = applicationsField.findAll('li').at(3).find('span');
        expect(specificApplicationsOption.text()).toBe('Specific applications');

        await specificApplicationsOption.trigger('click');

        expect(specificApplicationsField.isVisible()).toBe(true);
      });

      it('disables the submit button if there is no value for the "Specific applications" field', async () => {
        // Submit button should be enabled on-load since field has default value
        const submitButton = findByTestId(wrapper, 'run-report-button');
        expect(submitButton.attributes('disabled')).toBeFalsy();

        const applicationsField = findByTestId(wrapper, 'fr-field-applications');
        await applicationsField.trigger('click');

        const specificApplicationsOption = applicationsField.findAll('li').at(3).find('span');
        await specificApplicationsOption.trigger('click');

        expect(submitButton.attributes('disabled')).toBe('disabled');

        wrapper.vm._setupProxy.applicationsModel = ['my-specific-app'];
        await nextTick();

        expect(submitButton.attributes('disabled')).toBeFalsy();
      });
    });

    describe('Journeys field', () => {
      it('displays a text field if it is detected that the application is running in enduser', async () => {
        fieldDataMocks();
        reportUtils.requestTrees = jest.fn().mockReturnValue(Promise.resolve([{ _id: 'Login' }, { _id: 'ResetPassword' }]));
        store.state.SharedStore.currentPackage = 'enduser';
        wrapper = setup({ reportConfig: { parameters: { journeyName: {} } } });
        await flushPromises();
        jest.clearAllMocks();

        const journeyInputField = findByTestId(wrapper, 'input-default-run-report-field');
        expect(journeyInputField.attributes('type')).toBe('text');
      });

      it('displays a multiselect field if it is detected that the application is running in platform admin', async () => {
        fieldDataMocks();
        reportUtils.requestTrees = jest.fn().mockReturnValue(Promise.resolve([{ _id: 'Login' }, { _id: 'ResetPassword' }]));
        store.state.SharedStore.currentPackage = 'admin';
        wrapper = setup({ reportConfig: { parameters: { journeyName: {} } } });
        await flushPromises();
        jest.clearAllMocks();

        const journeyInputField = findByTestId(wrapper, 'default-run-report-field');
        expect(journeyInputField.attributes('role')).toBe('combobox');
      });
    });

    describe('Unexpected parameter field test cases', () => {
      beforeEach(async () => {
        fieldDataMocks();
        wrapper = setup({
          templateName: 'TEMPLATE-NAME',
          reportConfig: { parameters: { my_unexpected_parameter: { type: 'string' } } },
        });
        await flushPromises();
        jest.clearAllMocks();
      });

      it('ensures that unexpected parameters display a generic text field in the report submission form', () => {
        const unexpectedParameterLabel = findByTestId(wrapper, 'label-my_unexpected_parameter');
        const unexpectedParameterInput = findByTestId(wrapper, 'input-my_unexpected_parameter');

        expect(unexpectedParameterLabel.exists()).toBe(true);
        expect(unexpectedParameterLabel.text()).toBe('my_unexpected_parameter');
        expect(unexpectedParameterInput.exists()).toBe(true);
      });

      it('ensures that unexpected parameters disable the submit button if they do not have a value', () => {
        const submitButton = findByTestId(wrapper, 'run-report-button');
        expect(submitButton.attributes('disabled')).toBe('disabled');
      });

      it('ensures that unexpected parameters enable the submit button if they have a value', async () => {
        const unexpectedParameterInput = findByTestId(wrapper, 'input-my_unexpected_parameter');

        await unexpectedParameterInput.setValue('My unexpected parameter input value');

        const submitButton = findByTestId(wrapper, 'run-report-button');
        expect(submitButton.attributes('disabled')).toBeFalsy();
      });

      it('submits a run report for the my_unexpected_parameter field', async () => {
        const runReportSpy = jest.spyOn(autoApi, 'runAnalyticsTemplate').mockImplementation(() => Promise.resolve({}));
        const unexpectedParameterInput = findByTestId(wrapper, 'input-my_unexpected_parameter');

        await unexpectedParameterInput.setValue('My unexpected parameter input value');
        const submitButton = findByTestId(wrapper, 'run-report-button');
        await submitButton.trigger('click');

        expect(runReportSpy).toHaveBeenCalledWith('TEMPLATE-NAME', { my_unexpected_parameter: 'My unexpected parameter input value' });
      });
    });
  });

  describe('@submits', () => {
    const [sevenDaysAgoStartDate, sevenDaysAgoEndDate] = dateRanges('YYYY-MM-DD', 'YYYY-MM-DD')['Last 7 Days'];
    const eventTypesDefaultValues = ['Token grant', 'Token refresh', 'Authorize', 'SSO'];
    const statusDefaultValues = ['active', 'inactive', 'blocked'];
    const userNamesDefaultValue = 'my-user-name';
    const fieldDefaultValues = [
      ['submits a run report for the timeframe field', 'endDate', sevenDaysAgoEndDate, false],
      ['submits a run report for the applications field', 'applications', ['All applications'], false],
      ['submits a run report for the events field field', 'events', eventTypesDefaultValues, false],
      ['submits a run report for the timeframe field', 'startDate', sevenDaysAgoStartDate, false],
      ['submits a run report for the journeys field', 'journeyName', ['my-selected-journey'], 'journeysModel'],
      ['submits a run report for the journeys field', 'treeName', ['my-selected-tree'], 'journeysModel'],
      ['submits a run report for the organizations field', 'org_names', ['my-org-name'], 'organizationsModel'],
      ['submits a run report for the roles field', 'roles', ['my-role'], 'rolesModel'],
      ['submits a run report for the status field', 'accountStatus', statusDefaultValues, false],
      ['submits a run report for the status field', 'status', statusDefaultValues, false],
      ['submits a run report for the outcome field', 'treeResult', ['SUCCESSFUL', 'FAILED', 'CONTINUE'], false],
      ['submits a run report for the users field', 'user_names', [userNamesDefaultValue], false],
    ];

    it.each(fieldDefaultValues)('%s', async (_, parameter, defaultValue, model) => {
      jest.clearAllMocks();
      wrapper = setup({
        templateName: 'TEMPLATE-NAME',
        reportConfig: { parameters: { [parameter]: {} } },
      });
      await flushPromises();

      const runReportSpy = jest.spyOn(autoApi, 'runAnalyticsTemplate').mockImplementation(() => Promise.resolve({}));
      const successSpy = jest.spyOn(notification, 'displayNotification');
      const submitButton = findByTestId(wrapper, 'run-report-button');

      // Sets default values for required fields so submit button can be enabled
      if (model) {
        wrapper.vm._setupProxy[model] = defaultValue;
      }

      // Value and model property must be different for the user_names payload
      // so this specific condition exception needs to exist for this field.
      if (parameter === 'user_names') {
        wrapper.vm._setupProxy.usersValue = [{ userName: userNamesDefaultValue }];
      }

      await nextTick();
      expect(submitButton.attributes('disabled')).toBeFalsy();
      await submitButton.trigger('click');

      expect(runReportSpy).toHaveBeenCalledWith('TEMPLATE-NAME', { [parameter]: defaultValue });
      expect(wrapper.emitted('update-tab')).toEqual([['report-history']]);
      expect(successSpy).toHaveBeenCalled();
      expect(wrapper.vm._setupProxy.isSubmitting).toBe(false);
    });

    it('submits the Run Report with a rejected response', async () => {
      jest.clearAllMocks();
      // We do not need to loop through all fields to check the catch block since
      // it is the same logic for all fields so hard-coding applications here is fine.
      wrapper = setup({ reportConfig: { parameters: { applications: {} } } });
      await flushPromises();

      const mockError = new Error();
      const runReportSpyReject = jest.spyOn(autoApi, 'runAnalyticsTemplate').mockRejectedValue(mockError);
      const errorSpy = jest.spyOn(notification, 'showErrorMessage');
      const submitButton = findByTestId(wrapper, 'run-report-button');

      expect(submitButton.attributes('disabled')).toBeFalsy();
      await submitButton.trigger('click');

      expect(runReportSpyReject).toHaveBeenCalled();
      expect(wrapper.emitted()).toEqual({});
      expect(errorSpy).toHaveBeenCalled();
      expect(wrapper.vm._setupProxy.isSubmitting).toBe(false);
    });
  });
});
