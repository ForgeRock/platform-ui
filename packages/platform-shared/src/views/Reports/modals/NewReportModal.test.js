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
import NewReportModal from './NewReportModal';
import { mockAxios, testData } from '../__mocks__/mocks';

ValidationRules.extendRules({
  alpha_num_spaces: ValidationRules.getRules(i18n).alpha_num_spaces,
});

describe('New Report Modal component', () => {
  function setup(props) {
    return mount(NewReportModal, {
      global: {
        plugins: [i18n],
      },
      props: {
        isTesting: true,
        ...props,
      },
    });
  }

  let dropdown;
  let descriptionInput;
  let footer;
  let nameInput;
  let usersInput;
  let saveButton;
  let wrapper;

  beforeEach(async () => {
    wrapper = setup();
    footer = wrapper.find('.modal-footer');
    nameInput = wrapper.find('input[name="name-field"]');
    descriptionInput = wrapper.find('textarea[name="description-field"]');
    usersInput = wrapper.find('input[name="data-allowed-viewers"]');
    saveButton = findByText(footer, 'button', 'Next');
    dropdown = findByRole(wrapper, 'listbox');

    mockAxios(jest.fn().mockResolvedValue(testData));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('@component', () => {
    it('next button should be disabled if form is not valid', async () => {
      // Name input is required so it should have no value
      expect(nameInput.element.value).toBe('');

      // Save button is disabled since the form is invalid
      expect(saveButton.attributes('disabled')).toBeDefined();
    });

    it('next button should be enabled when name input gets a value', async () => {
      // Set a value into the name input
      await nameInput.setValue('test');

      await flushPromises();

      // Check the input value
      expect(nameInput.element.value).toBe('test');

      // Check the disabled attribute
      expect(saveButton.attributes('disabled')).toBeUndefined();
    });

    it('correctly loads users', async () => {
      // Get the dropdown and click on it to open
      await dropdown.trigger('click');

      // Add a value to the search input to trigger api request
      usersInput.setValue('test');

      await flushPromises();

      // Make sure the options exist in the dropdown
      testData.data.result.forEach((result) => {
        const option = findByText(dropdown, 'div', result.userName);
        expect(option).toBeDefined();
      });
    });

    it('correctly emits the form data', async () => {
      const nameInputValue = 'test template name';
      const descriptionInputValue = 'test description';

      // Set a value into the name and description input
      await nameInput.setValue(nameInputValue);
      await descriptionInput.setValue(descriptionInputValue);

      // Open the dropdown
      await dropdown.trigger('click');

      // Add a value to the search input to trigger api request
      usersInput.setValue('test');

      await flushPromises();

      // Select the 4th option
      const options = dropdown.findAll('.multiselect__option');
      const selectedOption = options[3];
      await selectedOption.trigger('click');

      await flushPromises();

      // Click the save button
      await saveButton.trigger('click');

      await flushPromises();

      // Check the emitted value
      const [[{ description, name, viewers }]] = wrapper.emitted()['new-report-save'];
      expect(name).toBe(nameInputValue);
      expect(description).toBe(descriptionInputValue);
      expect(viewers).toStrictEqual([testData.data.result[3].userName]);
    });
  });
});
