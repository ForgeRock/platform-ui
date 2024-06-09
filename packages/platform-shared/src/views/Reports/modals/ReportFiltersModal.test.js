/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import {
  findByText,
  findByTestId,
  findAllByText,
  findAllByTestId,
  findByRole,
} from '@forgerock/platform-shared/src/utils/testHelpers';
import i18n from '@/i18n';
import ReportFiltersModal from './ReportFiltersModal';

describe('Report Filter Modal component', () => {
  function setup(props) {
    return mount(ReportFiltersModal, {
      global: {
        plugins: [i18n],
      },
      props: {
        isTesting: true,
        dataSourceColumns: [
          {
            format: 'json',
            label: 'Name',
            type: 'string',
            value: 'applications.name',
          },
          {
            format: 'json',
            label: '_id',
            type: 'string',
            value: 'applications._id',
          }],
        conditionOptions: [
          {
            label: 'contains',
            type: [],
            value: 'contains',
          },
          {
            label: 'is null',
            type: [],
            value: 'is_null',
          },
          {
            label: 'is not null',
            type: [],
            value: 'is_not_null',
          },
        ],
        ...props,
      },
    });
  }

  let wrapper;

  describe('@component', () => {
    beforeEach(() => {
      wrapper = setup();
    });

    it('ensures that on load, the save button is disabled until the "Value", operator select and "Literal / Variable" fields have values', async () => {
      const [, valueSelect, operatorSelect] = wrapper.findAll('[role="listbox"]');
      let saveButton = findByText(wrapper, 'button', 'Save');
      expect(saveButton.attributes().disabled).toBeDefined();

      // Value field
      const valueOption = findByText(valueSelect, 'li', '_id').find('span').find('span');
      await valueSelect.trigger('click');
      await valueOption.trigger('click');
      saveButton = findByText(wrapper, 'button', 'Save');
      expect(saveButton.attributes().disabled).toBeDefined();

      // Operator select field
      const operatorOption = findByText(wrapper, 'li', 'contains').find('span').find('span');
      await operatorSelect.trigger('click');
      await operatorOption.trigger('click');
      saveButton = findByText(wrapper, 'button', 'Save');
      expect(saveButton.attributes().disabled).toBeDefined();

      // Literal text field
      const [, rightValue] = wrapper.findAll('input[type="text"]');
      await rightValue.setValue('My literal input');
      saveButton = findByText(wrapper, 'button', 'Save');
      expect(saveButton.attributes().disabled).toBeUndefined();
    });

    it('ensures that a new rule is added when the plus button is clicked and removed when the minus button is clicked', async () => {
      let rightFormValues = findAllByTestId(wrapper, 'filter-builder-values');
      expect(rightFormValues.length).toBe(1);

      const addButton = findByText(wrapper, 'button', 'add');
      await addButton.trigger('click');
      await flushPromises();
      rightFormValues = findAllByTestId(wrapper, 'filter-builder-values');
      expect(rightFormValues.length).toBe(2);

      const [firstRemoveButton] = findAllByText(wrapper, 'button', 'remove');
      await firstRemoveButton.trigger('click');
      await flushPromises();
      rightFormValues = findAllByTestId(wrapper, 'filter-builder-values');
      expect(rightFormValues.length).toBe(1);
    });

    it('emits the field options operator when the right value select field is selected to the "variable" option', async () => {
      const rightFormValues = findByTestId(wrapper, 'filter-builder-values');
      const rightFormValueTypeMenu = findByRole(rightFormValues, 'menu');
      await rightFormValueTypeMenu.trigger('click');
      const rightVariableSelectTypeOption = findByText(rightFormValueTypeMenu, 'a', 'Variable');
      await rightVariableSelectTypeOption.trigger('click');
      expect(wrapper.emitted('get-field-options')).toEqual([['contains']]);
    });

    it('ensures that the expected payload is emitted when the save button is clicked with the "User Provided" type selected', async () => {
      const [, valueSelect, operatorSelect] = wrapper.findAll('[role="listbox"]');
      let saveButton = findByText(wrapper, 'button', 'Save');
      expect(saveButton.attributes().disabled).toBeDefined();

      // Value field selection
      const valueOption = findByText(valueSelect, 'li', '_id').find('span').find('span');
      await valueSelect.trigger('click');
      await valueOption.trigger('click');
      saveButton = findByText(wrapper, 'button', 'Save');
      expect(saveButton.attributes().disabled).toBeDefined();

      // Operator selection
      const operatorOption = findByText(wrapper, 'li', 'contains').find('span').find('span');
      await operatorSelect.trigger('click');
      await operatorOption.trigger('click');
      saveButton = findByText(wrapper, 'button', 'Save');
      expect(saveButton.attributes().disabled).toBeDefined();

      // Literal field input
      const [, rightValue] = wrapper.findAll('input[type="text"]');
      await rightValue.setValue('My literal input');
      saveButton = findByText(wrapper, 'button', 'Save');
      expect(saveButton.attributes().disabled).toBeUndefined();

      // Saves form and emits payload
      await findByText(wrapper, 'button', 'Save').trigger('click');
      expect(wrapper.emitted('update-filter')).toEqual([['filter', 0, {
        operator: 'or',
        subfilters: [{
          field: 'applications._id',
          operator: 'contains',
          selectedRightValueType: 'literal',
          uniqueIndex: 1,
          value: 'My literal input',
        }],
        uniqueIndex: 2,
      }]]);
    });

    it('ensures that it loads the correct data in the correct fields for an existing filter', async () => {
      wrapper = setup({
        existingFilter: {
          index: 0,
          definition: {
            operator: 'or',
            subfilters: [{
              field: 'applications.name',
              operator: 'contains',
              selectedRightValueType: 'literal',
              uniqueIndex: 0,
              value: 'my right value',
            }],
            uniqueIndex: 0,
          },
        },
      });

      // Must use this to simulate the @show BModal method since it is not triggering it natively
      await wrapper.vm.populateForm();

      const [, leftValueSelect, operatorSelect] = wrapper.findAll('[role="listbox"]');

      const leftValueSelectedOption = leftValueSelect.find('.multiselect__option--selected');
      expect(leftValueSelectedOption.text()).toBe('Name');

      const operatorSelectedOption = operatorSelect.find('.multiselect__option--selected');
      expect(operatorSelectedOption.text()).toBe('contains');

      const [, rightValueInput] = wrapper.findAll('input');
      expect(rightValueInput.element.value).toBe('my right value');
    });

    it('ensures that the right value (literal / variable) field does not show when the operator is equal to "is null" or "is not null"', async () => {
      const [, valueSelect, operatorSelect] = wrapper.findAll('[role="listbox"]');

      // Value field selection
      const valueOption = findByText(valueSelect, 'li', '_id').find('span').find('span');
      await valueSelect.trigger('click');
      await valueOption.trigger('click');

      // Operator "contains" selection
      let operatorContainsOption = findByText(wrapper, 'li', 'contains').find('span').find('span');
      await operatorSelect.trigger('click');
      await operatorContainsOption.trigger('click');

      // expects the right value field to be showing at this point
      let rightValueField = findByTestId(wrapper, 'input-right-value-string');
      expect(rightValueField.exists()).toBe(true);

      // Operator "is null" selection
      const operatorIsNullOption = findByText(wrapper, 'li', 'is null').find('span').find('span');
      await operatorSelect.trigger('click');
      await operatorIsNullOption.trigger('click');

      // expects the right value field to be hidden
      rightValueField = findByTestId(wrapper, 'input-right-value-string');
      expect(rightValueField.exists()).toBe(false);

      // Operator "is not null" selection
      const operatorIsNotNullOption = findByText(wrapper, 'li', 'is not null').find('span').find('span');
      await operatorSelect.trigger('click');
      await operatorIsNotNullOption.trigger('click');

      // expects the right value field to still be hidden
      rightValueField = findByTestId(wrapper, 'input-right-value-string');
      expect(rightValueField.exists()).toBe(false);

      // Selects "contains" operator once more
      operatorContainsOption = findByText(wrapper, 'li', 'contains').find('span').find('span');
      await operatorSelect.trigger('click');
      await operatorContainsOption.trigger('click');

      // expects the right value field to show once more
      rightValueField = findByTestId(wrapper, 'input-right-value-string');
      expect(rightValueField.exists()).toBe(true);
    });
  });
});
