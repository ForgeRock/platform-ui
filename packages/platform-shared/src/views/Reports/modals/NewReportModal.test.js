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
import { mockAxios, testData as mockedApiReponse } from '../__mocks__/mocks';

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
        static: true,
        visible: true,
        ...props,
      },
    });
  }

  let cancelButton;
  let descriptionInput;
  let nameInput;
  let footer;
  let multiselect;
  let saveButton;
  let searchInput;
  let wrapper;

  beforeEach(async () => {
    wrapper = setup();

    descriptionInput = wrapper.find('textarea[name="description-field"]');
    multiselect = findByRole(wrapper, 'listbox');
    nameInput = wrapper.find('input[name="name-field"]');
    footer = wrapper.find('.modal-footer');
    cancelButton = findByText(footer, 'button', 'Cancel');
    saveButton = findByText(footer, 'button', 'Next');
    searchInput = wrapper.find('input[name="data-allowed-viewers"]');

    mockAxios(jest.fn().mockResolvedValue(mockedApiReponse));
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

    it('correctly emits the form data', async () => {
      const nameInputValue = 'test template name';
      const descriptionInputValue = 'test description';

      // Set a value into the name and description input
      await nameInput.setValue(nameInputValue);
      await descriptionInput.setValue(descriptionInputValue);

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

      // Click the save button
      await saveButton.trigger('click');

      await flushPromises();

      // Check the emitted value
      const [[{ description, name, viewers }]] = wrapper.emitted()['new-report-save'];
      expect(name).toBe(nameInputValue);
      expect(description).toBe(descriptionInputValue);
      expect(viewers).toStrictEqual([mockedApiReponse.data.result[3].userName]);
    });

    it('correctly resets the form data', async () => {
      const nameInputValue = 'test template name';
      const descriptionInputValue = 'test description';

      // Set a value into the name and description input
      await nameInput.setValue(nameInputValue);
      await descriptionInput.setValue(descriptionInputValue);

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

      await cancelButton.trigger('click');
      await flushPromises();

      // Name & description are cleared
      expect(nameInput.element.value).toBe('');
      expect(descriptionInput.element.value).toBe('');

      // Multiselect is cleared
      const option = findByText(multiselect, 'div', mockedApiReponse.data.result[3].userName);
      expect(option).toBeDefined();
    });
  });
});
