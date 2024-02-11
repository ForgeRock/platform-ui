/**
 * Copyright 2023-2024 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { mount } from '@vue/test-utils';
import { setupTestPinia } from '@forgerock/platform-shared/src/utils/testPiniaHelpers';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import i18n from '@/i18n';
import ReportTemplate from './ReportTemplate';

jest.mock('@forgerock/platform-shared/src/composables/bvModal');

describe('Component for creating custom analytics reports', () => {
  function setup(props, mocks) {
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
        ...props,
      },
    });
  }

  let wrapper;

  beforeEach(() => {
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

    it('ensures that the "Add Data" empty state does not show if a data source exists', () => {
      wrapper = setup({}, { payload: { dataSource: {} } });
      const allMainElementDirectDescendents = wrapper.findAll('main > div');
      const mainHeading = wrapper.find('main h2');

      expect(allMainElementDirectDescendents.length).toBe(2);
      expect(mainHeading.text()).toBe('Settings');
    });

    it('ensures that the report badge is set to "draft" as the initial state', () => {
      wrapper = setup();

      const badge = findByTestId(wrapper, 'report-badge');
      expect(badge.text()).toBe('Draft');
    });
  });
});
