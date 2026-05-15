/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { findByText } from '@forgerock/platform-shared/src/utils/testHelpers';
import ReportAggregatesModal from './ReportAggregatesModal';
import i18n from '@/i18n';

describe('Report Aggregates Modal component', () => {
  function setup(props) {
    return mount(ReportAggregatesModal, {
      global: {
        plugins: [i18n],
      },
      props: {
        isTesting: true,
        aggregateTypes: [
          {
            displayName: 'Count of specific rows',
            name: 'count',
            schema: [],
          },
          {
            displayName: 'Sum of specific rows',
            name: 'sum',
            schema: [],
          },
          {
            displayName: 'Distinct Count of specific rows',
            name: 'count_distinct',
            schema: [],
          },
        ],
        aggregateValueList: {
          count: ['applications.name', 'applications._id', 'My input label'],
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

    it('ensures that on load, the save button is disabled until the "Name", "Type" and "Value" fields are filled out', async () => {
      let saveButton = findByText(wrapper, 'button', 'Save');
      expect(saveButton.attributes().disabled).toBeDefined();

      const nameField = wrapper.find('input[name="aggregate-name"]');
      const [typeSelectField, valueSelectField] = wrapper.findAll('[role="listbox"]');
      const countTypeSelectOption = typeSelectField.findAll('li')[0].find('span');
      const valueNameSelectOption = valueSelectField.findAll('li')[0].find('span');

      await nameField.setValue('My aggregate name field');
      saveButton = findByText(wrapper, 'button', 'Save');
      expect(saveButton.attributes().disabled).toBeDefined();

      await typeSelectField.trigger('click');
      await countTypeSelectOption.trigger('click');
      saveButton = findByText(wrapper, 'button', 'Save');
      expect(saveButton.attributes().disabled).toBeDefined();

      await valueSelectField.trigger('click');
      await valueNameSelectOption.trigger('click');
      saveButton = findByText(wrapper, 'button', 'Save');
      expect(saveButton.attributes().disabled).toBeUndefined();
    });

    it('ensures that the "Value" field is disabled until the "Type" field has a selection', async () => {
      // In MultiselectBase with searchable=true, [role="combobox"] is on the input element.
      // Use [role="listbox"] to interact with the option lists and find inputs directly.
      const [typeSelectField] = wrapper.findAll('[role="listbox"]');
      const countTypeSelectOption = typeSelectField.findAll('li')[0].find('span');

      // The value input is the combobox input inside the aggregate-value FrField
      let valueInputField = wrapper.find('#aggregate-value input[role="combobox"]');
      expect(valueInputField.attributes().disabled).toBeDefined();

      await typeSelectField.trigger('click');
      await countTypeSelectOption.trigger('click');

      valueInputField = wrapper.find('#aggregate-value input[role="combobox"]');
      expect(valueInputField.attributes().disabled).toBeUndefined();
    });

    it('emits "get-field-options", which queries the fieldoptions endpoint, when the "Type" field is selected and ensures that it populates the "Value" field with the response', async () => {
      const [typeSelectField, valueSelectField] = wrapper.findAll('[role="listbox"]');
      const [loading] = valueSelectField.findAll('li');
      const sumTypeSelectOption = typeSelectField.findAll('li')[1].find('span');
      const sumAggregateValueList = ['sumVal1', 'sumVal2', 'sumVal3'];

      // With MultiselectBase, only the actual 'Loading...' option li is rendered initially
      // (noResult and noOptions slots are conditional and not shown with options present)
      expect(valueSelectField.findAll('li').length).toBe(1);
      expect(loading.text()).toBe('Loading...');

      await typeSelectField.trigger('click');
      await sumTypeSelectOption.trigger('click');

      expect(wrapper.emitted('get-field-options')).toEqual([['sum']]);

      await wrapper.setProps({
        aggregateValueList: {
          sum: sumAggregateValueList,
        },
      });

      const [val1, val2, val3] = valueSelectField.findAll('li');
      expect(val1.text()).toBe(sumAggregateValueList[0]);
      expect(val2.text()).toBe(sumAggregateValueList[1]);
      expect(val3.text()).toBe(sumAggregateValueList[2]);
    });

    it('ensures that the expected payload is emitted when the save button is clicked', async () => {
      const nameField = wrapper.find('input[name="aggregate-name"]');
      const [typeSelectField, valueSelectField] = wrapper.findAll('[role="listbox"]');
      const countTypeSelectOption = typeSelectField.findAll('li')[0].find('span');
      const valueNameSelectOption = valueSelectField.findAll('li')[0].find('span');

      // Sets required field values
      await nameField.setValue('My aggregate name field');
      await typeSelectField.trigger('click');
      await countTypeSelectOption.trigger('click');
      await valueSelectField.trigger('click');
      await valueNameSelectOption.trigger('click');

      // Saves form and emits payload
      await findByText(wrapper, 'button', 'Save').trigger('click');
      expect(wrapper.emitted('update-aggregate')).toEqual([['aggregate', -1, {
        label: 'My aggregate name field',
        type: 'count',
        value: 'applications.name',
      }]]);
    });

    it('ensures that it loads the correct data in the correct fields for an existing aggregate', async () => {
      await wrapper.setProps({
        existingAggregate: {
          index: 0,
          definition: {
            label: 'My aggregate label',
            type: 'count',
            value: 'applications.name',
          },
        },
      });

      const [typeField, valueField] = wrapper.findAll('.multiselect__option--selected');
      const nameField = wrapper.find('input[name="aggregate-name"]');
      expect(nameField.element.value).toEqual('My aggregate label');
      expect(typeField.text()).toEqual('Count of specific rows');
      expect(valueField.text()).toEqual('applications.name');
    });
  });
});
