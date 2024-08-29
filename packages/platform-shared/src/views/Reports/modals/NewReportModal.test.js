/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { findByText, findByRole } from '@forgerock/platform-shared/src/utils/testHelpers';
import ValidationRules from '@forgerock/platform-shared/src/utils/validationRules';
import NewReportModal from './NewReportModal';
import { mockAxios, testData as mockedApiReponse } from '../__mocks__/mocks';
import i18n from '@/i18n';

ValidationRules.extendRules({
  alpha_num_spaces: ValidationRules.getRules(i18n).alpha_num_spaces,
  unique: ValidationRules.getRules(i18n).unique,
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

    it('correctly emits the form data for a new report', async () => {
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
      expect(viewers).toStrictEqual([mockedApiReponse.data.result[3]._id]);
    });

    it('correctly emits the form data for a duplicate report', async () => {
      await wrapper.setProps({ reportDataForDuplication: { id: 'MY-REPORT' } });

      const descriptionInputValue = 'test description';

      // Set a value into the description input
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
      const [[{ description, name, viewers }]] = wrapper.emitted()['duplicate-report'];
      expect(name).toBe('Copy of My Report');
      expect(description).toBe(descriptionInputValue);
      expect(viewers).toStrictEqual([mockedApiReponse.data.result[3]._id]);
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
      // Only way to trigger the @hidden <BModal> event hook
      wrapper.vm.handleModalHide();
      await flushPromises();

      // Name & description are cleared
      expect(nameInput.element.value).toBe('');
      expect(descriptionInput.element.value).toBe('');

      // Multiselect is cleared
      const option = findByText(multiselect, 'div', mockedApiReponse.data.result[3].userName);
      expect(option).toBeDefined();
    });

    it('ensures that the expected title and submit button text are displayed for a new report request', () => {
      const title = findByText(wrapper, 'h2', 'New Report');
      expect(title).toBeDefined();

      const submitButton = findByText(wrapper, 'button', 'Next');
      expect(submitButton).toBeDefined();
    });

    it('ensures that the expected title and submit button text are displayed for a duplicate report request', () => {
      wrapper = setup({ reportDataForDuplication: { id: 'MY-REPORT' } });

      const title = findByText(wrapper, 'h2', 'Duplicate Report');
      expect(title).toBeDefined();

      const submitButton = findByText(wrapper, 'button', 'Duplicate');
      expect(submitButton).toBeDefined();
    });

    it('ensures that the report name field throws a validation error if a non-unique report name is input', async () => {
      // Must setProps in order to trigger validation rules
      await wrapper.setProps({ reportNames: ['MY-REPORT', 'ANOTHER-REPORT'] });

      // Ensures that the validation error does not exist on load
      let validationError = findByText(wrapper, 'p', 'Must be unique');
      expect(validationError).toBeUndefined();

      const nameInputValue = 'another report';
      await nameInput.setValue(nameInputValue);
      await flushPromises();

      // Check the validation error
      validationError = findByText(wrapper, 'p', 'Must be unique');
      expect(validationError).toBeDefined();

      // Ensures that the Next button is disabled
      expect(saveButton.attributes('disabled')).toBeDefined();

      // Changes the report name value to a unique name
      await nameInput.setValue('unique report');
      await flushPromises();

      // Ensures that the validation error does not exist
      validationError = findByText(wrapper, 'p', 'Must be unique');
      expect(validationError).toBeUndefined();

      // Ensures that the Next button enabled
      expect(saveButton.attributes('disabled')).toBeUndefined();
    });

    it('ensures that the report name field is automatically populated with the report name, with a prepended "Copy of", when duplicating a report', async () => {
      let nameInputValue = nameInput.element.value;
      expect(nameInputValue).toBe('');

      await wrapper.setProps({ reportDataForDuplication: { id: 'MY-REPORT', state: 'published' } });

      nameInputValue = nameInput.element.value;
      expect(nameInputValue).toBe('Copy of My Report');
    });
  });
});
