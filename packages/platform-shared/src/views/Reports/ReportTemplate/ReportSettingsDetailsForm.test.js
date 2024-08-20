/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
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
    value: {
      name: 'Test template',
      description: 'Test template description',
      report_viewer: false,
      viewers: ['13c0ab62-a072-4e52-ba47-c0ee43d7b9fd'],
    },
  };

  const initialFormDataEmpty = {
    value: {
      name: '',
      description: '',
      report_viewer: false,
      viewers: [],
    },
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('@component empty form', () => {
    beforeEach(async () => {
      // Set up wrappers
      wrapper = setup(initialFormDataEmpty);
      groupReportViewerCheckbox = wrapper.find('input[name="report_viewer"]');
      descriptionInput = wrapper.find('textarea[name="description-field"]');
      multiselect = findByRole(wrapper, 'listbox');
      multiselectValues = wrapper.find('.multiselect__tags');
      nameInput = wrapper.find('input[name="name-field"]');
      searchInput = wrapper.find('input[name="data-allowed-viewers"]');

      mockAxios(jest.fn().mockResolvedValue(mockedApiResponse));
    });

    it('form validity should be false after mount and true after name input filled in', async () => {
      // Get the emitter
      const validChange = wrapper.emitted()['valid-change'];

      // False before input added
      const [isValidStart] = validChange[validChange.length - 1];
      expect(isValidStart).toBe(false);

      // Set a value into the name input
      await nameInput.setValue('test');

      await flushPromises();

      // Check the input value
      expect(nameInput.element.value).toBe('test');

      // True after name input has data
      const [isValidEnd] = validChange[validChange.length - 1];
      expect(isValidEnd).toBe(true);
    });

    it('correctly loads users', async () => {
      // Get the dropdown and click on it to open
      await multiselect.trigger('click');

      // Add a value to the search input to trigger api request
      searchInput.setValue('test');

      await flushPromises();

      // Make sure the options exist in the dropdown
      mockedApiResponse.data.result.forEach((result) => {
        const option = findByText(multiselect, 'div', result.userName);
        expect(option).toBeDefined();
      });
    });

    it('correctly emits the form data', async () => {
      const inputChange = wrapper.emitted().input;
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
      groupReportViewerCheckbox.setChecked();
      await flushPromises();

      // All checkbox states shouldbe true
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
      expect(emittedOption[0]).toBe(mockedApiResponse.data.result[3]._id);
    });
  });

  describe('@component data-filled form', () => {
    beforeEach(async () => {
      mockAxios(jest.fn().mockResolvedValue({
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
      }));
      // Set up wrappers
      wrapper = setup(initialFormData);
      groupReportViewerCheckbox = wrapper.find('input[name="report_viewer"]');
      descriptionInput = wrapper.find('textarea[name="description-field"]');
      multiselect = findByRole(wrapper, 'listbox');
      multiselectValues = wrapper.find('.multiselect__tags');
      nameInput = wrapper.find('input[name="name-field"]');
      searchInput = wrapper.find('input[name="data-allowed-viewers"]');
    });

    it('fills the correct values into the form', async () => {
      // Name
      expect(nameInput.element.value).toBe(initialFormData.value.name);

      // Description
      expect(descriptionInput.element.value).toBe(initialFormData.value.description);

      // Who Can Run Report Viewer Group checkbox
      expect(groupReportViewerCheckbox.element.checked).toBe(initialFormData.value.report_viewer);

      // Who Can Run Users multiselect
      const option = findByText(multiselectValues, 'div', 'Binni@IGATestQA.onmicrosoft.com');
      expect(option).toBeDefined();
    });
  });
});
