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
jest.mock('vue-router', () => ({
  useRoute: jest.fn(() => ({ params: { id: 'template-name' } })),
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
          $bvModal: { show: jest.fn() },
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

    it('ensures that the "Add Data" empty state does not show if a data source has been selected', async () => {
      AutoApi.getReportEntityFieldOptions = jest.fn().mockReturnValue(Promise.resolve(fieldOptionsStub));
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

      const mainHeading = wrapper.find('main h2');
      expect(mainHeading.text()).toBe('Settings');

      // Data source columns
      const dataSourceColumnLabels = findByRole(wrapper.find('main'), 'group').findAll('label');
      const [_id, name] = dataSourceColumnLabels;
      expect(_id.text()).toBe('_id');
      expect(name.text()).toBe('name');
    });

    it('ensures that the report badge is set to "draft" as the initial state', () => {
      wrapper = setup();

      const headerNavElement = wrapper.find('header > nav');
      const badgeElement = findByText(headerNavElement, 'h1 + span', 'Draft');
      expect(badgeElement.exists()).toBe(true);
    });
  });

  describe('@actions', () => {
    async function addDataSource() {
      AutoApi.getReportEntityFieldOptions = jest.fn().mockReturnValue(Promise.resolve(fieldOptionsStub));
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
        entities: [{ entity: 'applications' }],
        fields: [{ label: '_id', value: 'applications._id' }],
        parameters: {
          myParamName: {
            description: 'param description', label: 'param label', source: 'user_provided', type: 'string',
          },
        },
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
      expect(duplicateAnalyticsReportSpy).toHaveBeenCalledWith('TEMPLATE-NAME', 'draft');
    });
  });
});
