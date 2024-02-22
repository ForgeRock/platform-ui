/**
 * Copyright 2023-2024 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { nextTick } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import { findByRole, findByText } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as AutoApi from '@forgerock/platform-shared/src/api/AutoApi';
import useBvModal from '@forgerock/platform-shared/src/composables/bvModal';
import i18n from '@/i18n';
import ReportTemplate from './ReportTemplate';

jest.mock('@forgerock/platform-shared/src/composables/bvModal');

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
    jest.clearAllMocks();
  });

  describe('@renders', () => {
    it('ensures that the "Add Data" empty state loads on mount', () => {
      wrapper = setup();
      const allMainElementDirectDescendents = wrapper.findAll('main > div');
      const mainHeading = wrapper.find('h2');

      expect(allMainElementDirectDescendents.length).toBe(1);
      expect(mainHeading.text()).toBe('Add Data');
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
      AutoApi.getReportEntityFieldOptions = jest.fn().mockReturnValue(Promise.resolve({
        'applications._id': 'field',
        'applications.name': 'field',
      }));
      jest.useFakeTimers();
      wrapper = setup();
      await nextTick();

      const dataSourcesDropdown = findByRole(wrapper, 'listbox');
      const [applicationsOption] = dataSourcesDropdown.findAll('[role="option"]');
      await applicationsOption.find('span').trigger('click');

      const modalFooter = wrapper.find('footer');
      const saveButton = findByText(modalFooter, 'button', 'Save');

      await saveButton.trigger('click');
      await nextTick();
      jest.runAllTimers();
      await flushPromises();

      const allMainElementDirectDescendents = wrapper.findAll('main > div');
      expect(allMainElementDirectDescendents.length).toBe(2);

      const mainHeading = wrapper.find('main h2');
      expect(mainHeading.text()).toBe('Settings');
    });

    it('ensures that the report badge is set to "draft" as the initial state', () => {
      wrapper = setup();

      const headerNavElement = wrapper.find('header > nav');
      const badgeElement = findByText(headerNavElement, 'h1 + span', 'Draft');
      expect(badgeElement.exists()).toBe(true);
    });
  });
});
