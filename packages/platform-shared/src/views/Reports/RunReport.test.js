/**
 * Copyright (c) 2023-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { nextTick } from 'vue';
import { mockRouter } from '@forgerock/platform-shared/src/testing/utils/mockRouter';
import { mount, flushPromises } from '@vue/test-utils';
import { findByTestId, findByRole, findByText } from '@forgerock/platform-shared/src/utils/testHelpers';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import * as TreeApi from '@forgerock/platform-shared/src/api/TreeApi';
import * as ConfigApi from '@forgerock/platform-shared/src/api/ConfigApi';
import * as schemaApi from '@forgerock/platform-shared/src/api/SchemaApi';
import * as managedResourceApi from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import * as notification from '@forgerock/platform-shared/src/utils/notification';
import * as autoApi from '@forgerock/platform-shared/src/api/AutoApi';
import * as CertificationApi from '@forgerock/platform-shared/src/api/governance/CertificationApi';
import i18n from '@/i18n';
import RunReport from './RunReport';
import {
  getSchemaStub,
  getConfigStub,
  getManagedResourceListStub,
} from './RunReportStubs';
import store from '@/store';

mockRouter({ params: { template: 'template-name', state: 'draft' } });
mockValidation();

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
    CertificationApi.getCertificationTemplates = jest.fn().mockReturnValue(Promise.resolve({}));
    ConfigApi.getConfig = jest.fn().mockReturnValue(Promise.resolve(getConfigStub));
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

  describe('@components', () => {
    describe('Journeys field', () => {
      it('displays an empty combobox if it is detected that the application is running in enduser since enduser cannot retrieve journeys', async () => {
        fieldDataMocks();
        TreeApi.actionGetAllTrees = jest.fn().mockReturnValue(Promise.resolve({ data: { result: [{ _id: 'Login' }, { _id: 'ResetPassword' }] } }));
        store.state.SharedStore.currentPackage = 'enduser';
        wrapper = setup({
          templateName: 'TEMPLATE-NAME',
          templateState: 'draft',
          reportConfig: {
            parameters: {
              journeys: {
                source: 'datasource',
                entity: 'trees',
                attribute: '_id',
                type: 'string',
              },
            },
          },
        });
        await flushPromises();
        jest.clearAllMocks();
        const journeyInputField = findByTestId(wrapper, 'fr-field-journeys');
        const combobox = findByRole(journeyInputField, 'listbox');
        const listOptions = combobox.find('.multiselect__option');
        expect(listOptions.text()).toBe('No elements found. Consider changing the search query.');
      });

      it('does not execute a debounced network search if a parameter config has "internalSearch" set to true', async () => {
        fieldDataMocks();
        const requestTreesSpy = jest
          .spyOn(TreeApi, 'actionGetAllTrees')
          .mockImplementation(() => Promise.resolve({ data: { result: [{ _id: 'Login' }, { _id: 'ResetPassword' }] } }));
        store.state.SharedStore.currentPackage = 'admin';
        jest.useFakeTimers();
        wrapper = setup({
          templateName: 'TEMPLATE-NAME',
          templateState: 'draft',
          reportConfig: {
            parameters: {
              journeys: {
                source: 'datasource',
                entity: 'trees',
                attribute: '_id',
                type: 'string',
              },
            },
          },
        });
        await flushPromises();
        jest.clearAllMocks();

        const journeyInputField = findByTestId(wrapper, 'fr-field-journeys');
        const combobox = findByRole(journeyInputField, 'combobox');
        const searchField = combobox.find('[type="text"]');

        expect(journeyInputField.attributes('internal-search')).toEqual('true');
        await searchField.setValue('Login');

        // Flush promises and run setTimeout to simulate the debounce interval
        await flushPromises();
        jest.runAllTimers();
        expect(requestTreesSpy).not.toHaveBeenCalled();
      });
    });

    describe('Timeframe field', () => {
      let parameters;

      beforeEach(async () => {
        jest.clearAllMocks();
        parameters = {
          startDate: {
            label: 'Timeframe',
            type: 'string',
          },
          endDate: {
            label: 'Timeframe',
            type: 'string',
          },
        };
        wrapper = setup({
          isPrePackagedReport: true,
          reportConfig: { parameters },
        });
        await flushPromises();
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

      it('Ensures that the only out-of-the-box parameter name that is mapped is the "startDate" parameter', async () => {
        // The custom timeframe component has the following test id and should only
        // render with a report that is OOTB and has a parameter name of "startDate".
        expect(findByTestId(wrapper, 'timeframe-datepicker-fields')).toBeDefined();

        // sets the report to NOT be out-of-the-box
        await wrapper.setProps({
          isPrePackagedReport: false,
          reportConfig: { parameters },
        });

        // Now that the report is not out-of-the-box, the custom timeframe component should not render.
        expect(findByTestId(wrapper, 'timeframe-datepicker-fields').exists()).toBe(false);
      });
    });

    it('renders out an integer datasource parameter field for amconfig -> abandonedTimeout with the expected injected value', async () => {
      jest.clearAllMocks();
      jest.spyOn(ConfigApi, 'getAMConfig').mockImplementation(() => Promise.resolve({
        data: {
          trees: {
            suspendedAuthenticationTimeout: 2,
            authenticationSessionsMaxDuration: 3,
          },
        },
      }));

      const parameters = {
        AMConfig: {
          attribute: 'abandonedTimeout',
          description: 'description',
          entity: 'amconfig',
          label: 'Abandoned Timeout',
          source: 'datasource',
          type: 'integer',
        },
      };

      wrapper = setup({
        templateName: 'TEMPLATE-NAME',
        templateState: 'draft',
        reportConfig: { parameters },
      });
      await flushPromises();

      const abandonedTimeoutField = findByTestId(wrapper, 'input-fr-field-AMConfig');
      expect(abandonedTimeoutField.element.value).toBe('2');
    });
  });

  describe('@submits', () => {
    describe('@Basic Parameters', () => {
      const valueStringInput = 'String value';
      const valueEnumInput = 'enum2-val';
      const source = 'basic';
      const stringProperty = { type: 'string', source };
      const multiStringProperty = { type: 'array', item: { type: 'string' }, source };
      const enums = [{ name: 'enum1', value: 'enum1-val' }, { name: 'enum2', value: 'enum2-val' }];
      const parametersConfig = [
        ['renders and submits a Basic Text field', 'BasicText', stringProperty, valueStringInput],
        ['renders and submits a Basic Multivalued Select field', 'BasicMulti', multiStringProperty, [valueStringInput]],
        ['renders and submits a Basic Enums Select field', 'BasicEnumsSelect', { enum: enums, ...stringProperty }, valueEnumInput],
        ['renders and submits a Basic Enums Multiselect field', 'BasicEnumsMulti', { enum: enums, ...multiStringProperty }, [valueEnumInput]],
        ['renders and submits a Basic Boolean field', 'BasicBoolean', { type: 'boolean', source }, true],
        ['renders and submits a Basic Integer field', 'BasicInteger', { type: 'integer', source }, 90210],
        ['renders and submits a Basic Date field', 'BasicDate', { type: 'date', source }, '2025-01-12T00:00:00.000Z'],
      ];

      it.each(parametersConfig)('%s', async (_, parameter, schema, payloadValue) => {
        jest.clearAllMocks();
        const parameters = { [parameter]: schema };

        wrapper = setup({
          templateName: 'TEMPLATE-NAME',
          templateState: 'draft',
          reportConfig: { parameters },
        });
        await flushPromises();

        const runReportSpy = jest.spyOn(autoApi, 'runAnalyticsTemplate').mockImplementation(() => Promise.resolve({}));
        const successSpy = jest.spyOn(notification, 'displayNotification');
        const parameterElement = findByTestId(wrapper, `fr-field-${parameter}`);
        // Sets field values
        if (schema.enum) {
          const [, option2] = parameterElement.findAll('li[role="option"]');
          await option2.find('span').trigger('click');
        } else if (schema.type === 'string') {
          await findByTestId(wrapper, `input-fr-field-${parameter}`).setValue(valueStringInput);
        } else if (schema.type === 'array') {
          const multivalueInput = parameterElement.find('input[type="text"]');
          await multivalueInput.setValue(valueStringInput);
          await parameterElement.find('.multiselect__element').find('span').trigger('click');
        } else if (schema.type === 'boolean') {
          await parameterElement.find('input[role="switch"]').setChecked();
        } else if (schema.type === 'integer') {
          await parameterElement.find('input[type="text"]').setValue(90210);
          await parameterElement.find('input[type="text"]').trigger('blur');
        } else if (schema.type === 'date') {
          await parameterElement.find('input[type="date"]').setValue('2025-01-12');
        }
        await flushPromises();
        const submitButton = findByText(wrapper, 'button', 'Run Report');
        await submitButton.trigger('click');

        expect(runReportSpy).toHaveBeenCalledWith('TEMPLATE-NAME', 'draft', { [parameter]: payloadValue });
        expect(wrapper.emitted('update-tab')).toEqual([['report-history']]);
        expect(successSpy).toHaveBeenCalled();
        expect(wrapper.vm.isSubmitting).toBe(false);
      });
    });

    it('submits the Run Report with a rejected response', async () => {
      jest.clearAllMocks();
      // We do not need to loop through all fields to check the catch block since
      // it is the same logic for all fields so hard-coding accountStatus here is fine.
      wrapper = setup({ reportConfig: { parameters: { accountStatus: { type: 'string', source: 'basic' } } } });
      await flushPromises();

      const mockError = new Error();
      const runReportSpyReject = jest.spyOn(autoApi, 'runAnalyticsTemplate').mockRejectedValue(mockError);
      const errorSpy = jest.spyOn(notification, 'showErrorMessage');
      await findByTestId(wrapper, 'input-fr-field-accountStatus').setValue('enabled');
      await flushPromises();
      const submitButton = findByTestId(wrapper, 'run-report-button');

      expect(submitButton.attributes().disabled).toBeUndefined();
      await submitButton.trigger('click');

      expect(runReportSpyReject).toHaveBeenCalled();
      expect(wrapper.emitted('tab-update')).toBeUndefined();
      expect(errorSpy).toHaveBeenCalled();
      expect(wrapper.vm.isSubmitting).toBe(false);
    });

    it('ensures that the payload runs through the DATA_CONTOLLER\'s payload method', async () => {
      jest.clearAllMocks();
      wrapper = setup({
        templateName: 'TEMPLATE-NAME',
        templateState: 'draft',
        reportConfig: {
          parameters: {
            ParameterID: {
              description: 'description',
              label: 'Text',
              source: 'basic',
              type: 'string',
            },
          },
        },
      });
      await flushPromises();

      // ensures that the report outputs the correct payload
      const runReportSpy = jest.spyOn(autoApi, 'runAnalyticsTemplate').mockImplementation(() => Promise.resolve({}));
      const runReportButton = findByText(wrapper, 'button', 'Run Report');
      await wrapper.find('input[type="text"]').setValue('Parameter Value');
      await flushPromises();
      await runReportButton.trigger('click');
      expect(runReportSpy).toHaveBeenCalledWith('TEMPLATE-NAME', 'draft', { ParameterID: 'Parameter Value' });
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
});
