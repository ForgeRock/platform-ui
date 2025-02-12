/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { findByText, findByRole } from '@forgerock/platform-shared/src/utils/testHelpers';
import ValidationRules from '@forgerock/platform-shared/src/utils/validationRules';
import i18n from '@/i18n';
import ReportSettingsDetailsForm from './ReportSettingsDetailsForm';
import { mockAxios, testData as mockedApiResponse } from '../__mocks__/mocks';

ValidationRules.extendRules({
  alpha_num_spaces: ValidationRules.getRules(i18n).alpha_num_spaces,
});

describe('Report Settings Details Form component', () => {
  function setup(props) {
    return mount(ReportSettingsDetailsForm, {
      global: {
        plugins: [i18n],
      },
      props: {
        isTesting: true,
        ...props,
      },
    });
  }

  let descriptionInput;
  let groupReportViewerCheckbox;
  let multiselect;
  let multiselectValues;
  let nameInput;
  let searchInput;
  let wrapper;

  const initialFormData = {
    'model-value': {
      name: 'Test template',
      description: 'Test template description',
      viewers: ['13c0ab62-a072-4e52-ba47-c0ee43d7b9fd'],
    },
  };

  const initialFormDataEmpty = {
    'model-value': {
      name: '',
      description: '',
      viewers: [],
    },
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('@component empty form', () => {
    beforeEach(async () => {
      mockAxios(jest.fn().mockResolvedValue(mockedApiResponse));

      // Set up wrappers
      wrapper = setup(initialFormDataEmpty);
      await flushPromises();

      groupReportViewerCheckbox = wrapper.find('input[name="reportViewer"]');
      descriptionInput = wrapper.find('textarea[name="description-field"]');
      multiselect = findByRole(wrapper, 'listbox');
      multiselectValues = wrapper.find('.multiselect__tags');
      nameInput = wrapper.find('input[name="name-field"]');
      searchInput = wrapper.find('input[name="data-allowed-viewers"]');
    });

    it('correctly loads users', async () => {
      // Make sure the options exist in the dropdown
      mockedApiResponse.data.result.forEach((result) => {
        const option = findByText(multiselect, 'div', result.userName);
        expect(option).toBeDefined();
      });
    });

    it('correctly emits the form data', async () => {
      const inputChange = wrapper.emitted()['update:modelValue'];
      const lastEmittedInputChange = () => inputChange[inputChange.length - 1];
      const nameInputValue = 'test template name';
      const descriptionInputValue = 'test description';

      // Set a value into the name input
      await nameInput.setValue(nameInputValue);
      await flushPromises();
      const emittedName = lastEmittedInputChange()[0].name;

      // Emitted name should match
      expect(emittedName).toBe(nameInputValue);

      // Set a value into the description input
      await descriptionInput.setValue(descriptionInputValue);
      await flushPromises();
      const emittedDescription = lastEmittedInputChange()[0].description;

      // Check the group checkboxes
      await groupReportViewerCheckbox.setChecked(true);
      await flushPromises();

      // All checkbox states should be true
      expect(groupReportViewerCheckbox.element.checked).toBe(true);

      // Emitted description should match
      expect(emittedDescription).toBe(descriptionInputValue);

      // Open the dropdown
      await multiselect.trigger('click');

      // Add a value to the search input to trigger api request
      searchInput.setValue('test');

      await flushPromises();

      // Select the 4th option
      const options = multiselect.findAll('.multiselect__option');
      const selectedOption = options[3];
      await selectedOption.trigger('click');

      await flushPromises();
      const emittedOption = lastEmittedInputChange()[0].viewers;

      // Emitted description should match
      expect(emittedOption[0]).toBe('report_viewer');
      expect(emittedOption[1]).toBe(mockedApiResponse.data.result[3]._id);
    });
  });

  describe('@component data-filled form', () => {
    beforeEach(async () => {
      mockAxios(jest.fn().mockResolvedValueOnce({
        data: {
          result: [
            {
              _id: '13c0ab62-a072-4e52-ba47-c0ee43d7b9fd',
              profileImage: null,
              givenName: 'Binni',
              sn: 'Crinkley',
              userName: 'Binni@IGATestQA.onmicrosoft.com',
            },
          ],
        },
      }).mockResolvedValueOnce({
        data: {
          _id: '13c0ab62-a072-4e52-ba47-c0ee43d7b9fd',
          profileImage: null,
          givenName: 'Binni',
          sn: 'Crinkley',
          userName: 'Binni@IGATestQA.onmicrosoft.com',
        },

      }));
      // Set up wrappers
      wrapper = setup(initialFormData);
      await flushPromises();

      groupReportViewerCheckbox = wrapper.find('input[name="reportViewer"]');
      descriptionInput = wrapper.find('textarea[name="description-field"]');
      multiselect = findByRole(wrapper, 'listbox');
      multiselectValues = wrapper.find('.multiselect__tags');
      nameInput = wrapper.find('input[name="name-field"]');
      searchInput = wrapper.find('input[name="data-allowed-viewers"]');
    });

    it('fills the correct values into the form', async () => {
      // Name
      expect(nameInput.element.value).toBe(initialFormData['model-value'].name);

      // Description
      expect(descriptionInput.element.value).toBe(initialFormData['model-value'].description);

      // Who Can Run Report Viewer Group checkbox
      expect(groupReportViewerCheckbox.element.checked).toBe(false);

      // Who Can Run Users multiselect
      const option = findByText(multiselectValues, 'div', 'Binni Crinkley');
      expect(option).toBeDefined();
    });
  });
});
