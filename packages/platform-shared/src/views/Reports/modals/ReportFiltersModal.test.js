/**
 * Copyright (c) 2023-2025 ForgeRock. All rights reserved.
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
import ValidationRules from '@forgerock/platform-shared/src/utils/validationRules';
import i18n from '@/i18n';
import ReportFiltersModal from './ReportFiltersModal';

const {
  required,
} = ValidationRules.getRules(i18n);
ValidationRules.extendRules({
  required,
});

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
            columnLabel: 'App Name',
            type: 'string',
            path: 'applications.name',
          },
          {
            format: 'json',
            label: '_id',
            columnLabel: 'App ID',
            type: 'string',
            path: 'applications._id',
          },
          {
            format: 'json',
            label: 'JSON',
            columnLabel: 'App json stub',
            type: 'json',
            path: 'applications.json',
          },
          {
            format: 'json',
            label: 'Array',
            columnLabel: 'App array stub',
            type: 'array',
            path: 'applications.array',
          }],
        conditionOptions: {
          contains: {
            label: 'contains',
            type: [],
            value: 'contains',
          },
          not_contains: {
            label: 'does not contain',
            type: [],
            value: 'not_contains',
          },
          equals: {
            label: 'equals to',
            type: [],
            value: 'equals',
          },
          is_null: {
            label: 'is null',
            type: [],
            value: 'is_null',
          },
          is_not_null: {
            label: 'is not null',
            type: [],
            value: 'is_not_null',
          },
        },
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

      // Sets the right literal text input field
      const rightValueContainer = findByTestId(wrapper, 'fr-field-inputValue__1');
      const rightValueInput = rightValueContainer.find('input');
      await rightValueInput.setValue('My literal input item');

      // saves the form
      saveButton = findByText(wrapper, 'button', 'Save');
      expect(saveButton.attributes().disabled).toBeUndefined();
    });

    it('ensures that "json" and "array" data type options are not available for selection in the left value field', async () => {
      const [, valueSelect] = wrapper.findAll('[role="listbox"]');

      // should filter out the "json" and "array" data type options from the dataSourceColumns prop
      const leftValueOptions = valueSelect.findAll('li[role="option"]');
      expect(leftValueOptions.length).toBe(2);

      const [nameOption, idOption] = leftValueOptions;
      expect(nameOption.text()).toBe('applications.name');
      expect(idOption.text()).toBe('applications._id');
    });

    it('ensures that a new rule is added when the plus button is clicked and removed when the minus button is clicked', async () => {
      let rightFormValues = findAllByTestId(wrapper, 'filter-builder-values');
      expect(rightFormValues.length).toBe(1);

      const filterBuilderButtons = wrapper.find('.filter-builder-row-buttons');
      const addButton = findByText(filterBuilderButtons, 'button', 'add');
      const [addRule] = filterBuilderButtons.findAll('[role="menuitem"]');

      await addButton.trigger('click');
      await addRule.trigger('click');
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

    it('ensures that the expected payload is emitted with nested groups and rules when the form is saved', async () => {
      const filterBuilderButtons = wrapper.find('.filter-builder-row-buttons');
      const addButton = findByText(filterBuilderButtons, 'button', 'add');
      const [, addGroup] = filterBuilderButtons.findAll('[role="menuitem"]');
      let saveButton = findByText(wrapper, 'button', 'Save');

      // adds a new group
      await addButton.trigger('click');
      await addGroup.trigger('click');
      await flushPromises();

      async function fillOutFilterRule(container, index) {
        const [valueSelect, operatorSelect] = container.findAll('[role="listbox"]');
        expect(saveButton.attributes().disabled).toBeDefined();

        // Value field selection
        const valueOption = findByText(valueSelect, 'li', '_id').find('span').find('span');
        await valueSelect.trigger('click');
        await valueOption.trigger('click');
        saveButton = findByText(wrapper, 'button', 'Save');
        expect(saveButton.attributes().disabled).toBeDefined();

        // Operator selection
        const operatorOption = findByText(container, 'li', 'contains').find('span').find('span');
        await operatorSelect.trigger('click');
        await operatorOption.trigger('click');
        saveButton = findByText(wrapper, 'button', 'Save');
        expect(saveButton.attributes().disabled).toBeDefined();

        // Sets the right literal text input field
        const rightValueContainer = findByTestId(container, `fr-field-inputValue__${index}`);
        const rightValueInput = rightValueContainer.find('input');
        await rightValueInput.setValue('My literal input item');
      }

      const [firstGroup, secondGroup] = wrapper.findAll('.filter-builder-row');

      await fillOutFilterRule(firstGroup, 1);
      await fillOutFilterRule(secondGroup, 3);

      saveButton = findByText(wrapper, 'button', 'Save');
      expect(saveButton.attributes().disabled).toBeUndefined();

      // Saves form and emits payload
      await findByText(wrapper, 'button', 'Save').trigger('click');
      expect(wrapper.emitted('update-filter')).toEqual([['filter', 0, {
        operator: 'or',
        subfilters: [
          {
            field: 'applications._id',
            fieldType: 'string',
            operator: 'contains',
            selectedRightValueType: 'literal',
            uniqueIndex: 1,
            value: 'My literal input item',
          },
          {
            operator: 'or',
            subfilters: [{
              field: 'applications._id',
              fieldType: 'string',
              operator: 'contains',
              selectedRightValueType: 'literal',
              uniqueIndex: 3,
              value: 'My literal input item',
            }],
            uniqueIndex: 4,
          },
        ],
        uniqueIndex: 2,
      }]]);
    });

    it('ensures that it loads the correct data in the correct fields for a nested existing filter', async () => {
      wrapper = setup({
        existingFilter: {
          index: 0,
          definition: {
            operator: 'or',
            subfilters: [
              {
                field: 'applications.name',
                operator: 'contains',
                selectedRightValueType: 'literal',
                uniqueIndex: 0,
                value: 'my right value',
              },
              {
                operator: 'or',
                subfilters: [{
                  field: 'applications._id',
                  operator: 'contains',
                  selectedRightValueType: 'literal',
                  uniqueIndex: 3,
                  value: 'My literal input',
                }],
                uniqueIndex: 4,
              },
            ],
            uniqueIndex: 0,
          },
        },
      });

      // Must use this to simulate the @show BModal method since it is not triggering it natively
      await wrapper.vm.populateForm();

      const [firstGroup, secondGroup] = wrapper.findAll('.filter-builder-row');

      // first group values
      const [leftValueSelect, operatorSelect] = firstGroup.findAll('[role="listbox"]');
      const leftValueSelectedOption = leftValueSelect.find('.multiselect__option--selected');
      expect(leftValueSelectedOption.text()).toBe('applications.name');

      const operatorSelectedOption = operatorSelect.find('.multiselect__option--selected');
      expect(operatorSelectedOption.text()).toBe('contains');

      const [, rightValueInput] = firstGroup.findAll('input[type="text"]');
      expect(rightValueInput.element.value).toBe('my right value');

      // second group values
      const [secondLeftValueSelect, secondOperatorSelect] = secondGroup.findAll('[role="listbox"]');
      const secondLeftValueSelectedOption = secondLeftValueSelect.find('.multiselect__option--selected');
      expect(secondLeftValueSelectedOption.text()).toBe('applications._id');

      const secondOperatorSelectedOption = secondOperatorSelect.find('.multiselect__option--selected');
      expect(secondOperatorSelectedOption.text()).toBe('contains');

      const [, secondRightValueInput] = secondGroup.findAll('input[type="text"]');
      expect(secondRightValueInput.element.value).toBe('My literal input');
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
      let rightValueField = findByTestId(wrapper, 'fr-field-inputValue__1');
      expect(rightValueField.exists()).toBe(true);

      // Operator "is null" selection
      const operatorIsNullOption = findByText(wrapper, 'li', 'is null').find('span').find('span');
      await operatorSelect.trigger('click');
      await operatorIsNullOption.trigger('click');

      // expects the right value field to be hidden
      rightValueField = findByTestId(wrapper, 'right-value-multiselect-inputValue__1');
      expect(rightValueField.exists()).toBe(false);

      // Operator "is not null" selection
      const operatorIsNotNullOption = findByText(wrapper, 'li', 'is not null').find('span').find('span');
      await operatorSelect.trigger('click');
      await operatorIsNotNullOption.trigger('click');

      // expects the right value field to still be hidden
      rightValueField = findByTestId(wrapper, 'right-value-multiselect-inputValue__1');
      expect(rightValueField.exists()).toBe(false);

      // Selects "contains" operator once more
      operatorContainsOption = findByText(wrapper, 'li', 'contains').find('span').find('span');
      await operatorSelect.trigger('click');
      await operatorContainsOption.trigger('click');

      // expects the right value field to show once more
      rightValueField = findByTestId(wrapper, 'fr-field-inputValue__1');
      expect(rightValueField.exists()).toBe(true);
    });

    it('ensures that the right literal value field is a multi-select field when the operator has a selection of "contains" or "does not contain"', async () => {
      const [, valueSelect, operatorSelect] = wrapper.findAll('[role="listbox"]');

      // Value field selection
      const valueOption = findByText(valueSelect, 'li', '_id').find('span').find('span');
      await valueSelect.trigger('click');
      await valueOption.trigger('click');

      // Operator "contains" selection
      const operatorContainsOption = findByText(wrapper, 'li', 'contains').find('span').find('span');
      await operatorSelect.trigger('click');
      await operatorContainsOption.trigger('click');

      // expects the right value field to be a text input field
      let rightValueField = findByTestId(wrapper, 'input-right-value-string-inputValue__1');
      expect(rightValueField.attributes('type')).toEqual('text');

      // Operator "does not contain" selection
      const operatorDoesNotContainOption = findByText(wrapper, 'li', 'does not contain').find('span').find('span');
      await operatorSelect.trigger('click');
      await operatorDoesNotContainOption.trigger('click');

      // expects the right value field to be a text input field
      rightValueField = findByTestId(wrapper, 'input-right-value-string-inputValue__1');
      expect(rightValueField.attributes('type')).toEqual('text');

      // Operator "equals to" selection
      const operatorEqualsOption = findByText(wrapper, 'li', 'equals to').find('span').find('span');
      await operatorSelect.trigger('click');
      await operatorEqualsOption.trigger('click');

      // expects the right value field to be a text input field
      rightValueField = findByTestId(wrapper, 'input-right-value-string-inputValue__1');
      expect(rightValueField.attributes('type')).toEqual('text');
    });
  });
});
