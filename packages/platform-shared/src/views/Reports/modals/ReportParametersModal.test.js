/**
 * Copyright (c) 2023-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import {
  findByText,
  findByRole,
  findByTestId,
  findAllByText,
} from '@forgerock/platform-shared/src/utils/testHelpers';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import ReportParametersModal from './ReportParametersModal';
import i18n from '@/i18n';

mockValidation(['whitespace', 'required', 'unique']);

describe('Report Parameters Modal component', () => {
  function setup(props) {
    return mount(ReportParametersModal, {
      global: {
        plugins: [i18n],
      },
      props: {
        isTesting: true,
        basicParameterTypes: [
          {
            text: 'String',
            value: {
              description: 'String',
              label: 'String',
              type: 'string',
            },
          },
          {
            text: 'Boolean',
            value: {
              description: 'Boolean',
              label: 'Boolean',
              type: 'boolean',
            },
          },
          {
            text: 'Integer',
            value: {
              description: 'Integer',
              label: 'Integer',
              type: 'integer',
            },
          },
        ],
        dataSourceParameterTypes: [
          {
            attributes: [{
              text: 'User Name',
              value: { name: 'userName', type: 'string', label: 'User Name' },
            }],
            label: 'User',
            source: 'datasource',
            type: 'user',
          },
        ],
        profileAttributes: ['_id', 'accountStatus', 'adminOfOrg'],
        ...props,
      },
    });
  }

  let wrapper;

  describe('@component', () => {
    beforeEach(() => {
      wrapper = setup();
    });

    it('ensures that the save button is disabled until the "Name", "Input label", "Input type" and enumerated values that are showing have values', async () => {
      let saveButton = findByText(wrapper, 'button', 'Save');
      expect(saveButton.attributes().disabled).toBeDefined();

      // sets name field
      await wrapper.find('input[name="parameter-name"]').setValue('MyParameter');
      saveButton = findByText(wrapper, 'button', 'Save');
      expect(saveButton.attributes().disabled).toBeDefined();

      // sets Input label field
      await wrapper.find('input[name="parameter-label"]').setValue('My parameter label');
      saveButton = findByText(wrapper, 'button', 'Save');
      expect(saveButton.attributes().disabled).toBeDefined();

      // sets Input type select field
      const inputTypeSelect = findByRole(wrapper, 'listbox');
      await inputTypeSelect.trigger('click');
      const inputTypeStringOption = inputTypeSelect.findAll('li')[0].find('span');
      await inputTypeStringOption.trigger('click');
      await flushPromises();

      // ensures that save button is enabled
      saveButton = findByText(wrapper, 'button', 'Save');
      expect(saveButton.attributes().disabled).toBeUndefined();

      // checks enumeraged values
      const enumeratedCheckbox = wrapper.find('input[name="enumerated-values"]');
      await enumeratedCheckbox.setValue(true);
      await flushPromises();

      // ensures that the save button is disabled once again since there are empty enumerated values
      saveButton = findByText(wrapper, 'button', 'Save');
      expect(saveButton.attributes().disabled).toBeDefined();

      // fills out the enumerated name field
      const enumeratedNameField = wrapper.find('input[name="enumerated-name-0"]');
      await enumeratedNameField.setValue('enum name');
      await flushPromises();

      // ensures that the save button is still disabled
      saveButton = findByText(wrapper, 'button', 'Save');
      expect(saveButton.attributes().disabled).toBeDefined();

      // fills out the enumerated value field
      const enumeratedValueField = wrapper.find('input[name="enumerated-value-0"]');
      await enumeratedValueField.setValue('enum value');
      await flushPromises();

      // ensures that save button is enabled once again
      saveButton = findByText(wrapper, 'button', 'Save');
      expect(saveButton.attributes().disabled).toBeUndefined();
    });

    it('ensures that the parameter name field does not allow spaces and disables the save button if it does', async () => {
      let saveButton = findByText(wrapper, 'button', 'Save');
      expect(saveButton.attributes().disabled).toBeDefined();

      // Name field
      await wrapper.find('input[name="parameter-name"]').setValue('MyParameter');
      saveButton = findByText(wrapper, 'button', 'Save');
      expect(saveButton.attributes().disabled).toBeDefined();
      await flushPromises();

      // Input label field
      await wrapper.find('input[name="parameter-label"]').setValue('My parameter label');
      saveButton = findByText(wrapper, 'button', 'Save');
      expect(saveButton.attributes().disabled).toBeDefined();

      // Input type select field
      const inputTypeSelect = findByRole(wrapper, 'listbox');
      await inputTypeSelect.trigger('click');
      const inputTypeStringOption = inputTypeSelect.findAll('li')[0].find('span');
      await inputTypeStringOption.trigger('click');
      await flushPromises();

      // Should enable the save button
      saveButton = findByText(wrapper, 'button', 'Save');
      expect(saveButton.attributes().disabled).toBeUndefined();

      // Sets the parameter name field to a value that has spaces
      await wrapper.find('input[name="parameter-name"]').setValue('My Updated Parameter Name With Spaces');
      await flushPromises();

      // Should now disable the save button
      saveButton = findByText(wrapper, 'button', 'Save');
      expect(saveButton.attributes().disabled).toBeDefined();

      // Sets the parameter name field back to a value without spaces
      await wrapper.find('input[name="parameter-name"]').setValue('My_Updated_Parameter_Name_With_Non_Spaces');
      await flushPromises();

      // Should now enable the save button
      saveButton = findByText(wrapper, 'button', 'Save');
      expect(saveButton.attributes().disabled).toBeUndefined();
    });

    it('ensures that the "Multivalued" checkbox shows only when the "Input Type" dropdown has a selection of "String"', async () => {
      let multivaluedCheckbox = wrapper.find('input[name="multivalued"]');
      expect(multivaluedCheckbox.exists()).toBe(false);

      // Input type select field
      const inputTypeSelect = findByRole(wrapper, 'listbox');
      await inputTypeSelect.trigger('click');

      const inputTypeStringOption = inputTypeSelect.findAll('li')[0].find('span');
      expect(inputTypeStringOption.text()).toBe('String');

      await inputTypeStringOption.trigger('click');
      multivaluedCheckbox = wrapper.find('input[name="multivalued"');
      expect(multivaluedCheckbox.exists()).toBe(true);
    });

    it('ensures that the "Enumerated Values" checkbox only shows when the "Input Type" select has "String" selected as an option', async () => {
      let enumeratedCheckbox = wrapper.find('input[name="enumerated-values"]');
      expect(enumeratedCheckbox.exists()).toBe(false);

      let enumeratedValuesCard = findByText(wrapper, 'h3', 'Enumerated Values');
      expect(enumeratedValuesCard).toBeUndefined();

      // Input type select field
      const inputTypeSelect = findByRole(wrapper, 'listbox');
      await inputTypeSelect.trigger('click');

      const inputTypeStringOption = inputTypeSelect.findAll('li')[0].find('span');
      expect(inputTypeStringOption.text()).toBe('String');

      await inputTypeStringOption.trigger('click');
      enumeratedCheckbox = wrapper.find('input[name="enumerated-values"]');
      expect(enumeratedCheckbox.exists()).toBe(true);

      enumeratedValuesCard = findByText(wrapper, 'h3', 'Enumerated Values');
      expect(enumeratedValuesCard.exists()).toBe(true);

      const enumeratedValuesCollapseElement = wrapper.find('.collapse');
      expect(enumeratedValuesCollapseElement.attributes().style).toBe('display: none;');
    });

    it('ensures that the "Enumerated Values" card only shows when the "Enumerated Values" checkbox is selected', async () => {
      let enumeratedValuesCard = findByText(wrapper, 'h3', 'Enumerated Values');
      expect(enumeratedValuesCard).toBeUndefined();

      // Input type select field
      const inputTypeSelect = findByRole(wrapper, 'listbox');
      await inputTypeSelect.trigger('click');
      const inputTypeStringOption = inputTypeSelect.findAll('li')[0].find('span');
      await inputTypeStringOption.trigger('click');

      enumeratedValuesCard = findByText(wrapper, 'h3', 'Enumerated Values');
      expect(enumeratedValuesCard.exists()).toBe(true);

      let enumeratedValuesCollapseElement = wrapper.find('.collapse');
      expect(enumeratedValuesCollapseElement.attributes().style).toBe('display: none;');

      const enumeratedCheckbox = wrapper.find('input[name="enumerated-values"]');
      await enumeratedCheckbox.setValue(true);

      enumeratedValuesCollapseElement = wrapper.find('.collapse');
      expect(enumeratedValuesCollapseElement.attributes().style).toBe('');
    });

    it('ensures that the enumerated "Name" and "Value" fielsets get added and deleted when the plus and minus buttons are clicked', async () => {
      // Input type select field selecting the "String" option and checking the
      // Enumerated Values so the "Name" and "Value" fieldsets card appears.
      const inputTypeSelect = findByRole(wrapper, 'listbox');
      await inputTypeSelect.trigger('click');
      await inputTypeSelect.findAll('li')[0].find('span').trigger('click');
      await wrapper.find('input[name="enumerated-values"]').setValue(true);

      // There should only be one fieldset on load
      const enumeratedValuesCard = wrapper.find('.card-body');
      let allFieldsets = enumeratedValuesCard.findAll('fieldset');
      expect(allFieldsets.length).toBe(1);

      // Within the first fieldset there should only be one Name and one Value field
      const allNameFieldsWithinFirstFieldset = findAllByText(allFieldsets[0], 'label', 'Name');
      const allValueFieldsWithinFirstFieldset = findAllByText(allFieldsets[0], 'label', 'Value');
      expect(allNameFieldsWithinFirstFieldset.length).toBe(1);
      expect(allValueFieldsWithinFirstFieldset.length).toBe(1);

      // When there is only one fieldset, there should only be a plus (add) button and not a minus (remove) button
      let addButtonOne = findByText(allFieldsets[0], 'button', 'add');
      expect(addButtonOne.exists()).toBe(true);
      let removeButtonOne = findByText(allFieldsets[0], 'button', 'remove');
      expect(removeButtonOne).toBeUndefined();

      // Clicking on the 'add' button should add a second fieldset
      await addButtonOne.trigger('click');
      allFieldsets = enumeratedValuesCard.findAll('fieldset');
      expect(allFieldsets.length).toBe(2);

      // When there are more than one fieldsets, the 'remove' button should now appear on the first fieldset
      removeButtonOne = findByText(allFieldsets[0], 'button', 'remove');
      expect(removeButtonOne.exists()).toBe(true);

      // Ensures that the second fieldset includes a name field, a value field
      const allNameFieldsWithinSecondFieldset = findAllByText(allFieldsets[1], 'label', 'Name');
      const allValueFieldsWithinSecondFieldset = findAllByText(allFieldsets[1], 'label', 'Value');
      expect(allNameFieldsWithinSecondFieldset.length).toBe(1);
      expect(allValueFieldsWithinSecondFieldset.length).toBe(1);

      // Ensures that the second fieldset includes an add and remove button
      const addButtonTwo = findByText(allFieldsets[1], 'button', 'add');
      expect(addButtonTwo.exists()).toBe(true);
      const removeButtonTwo = findByText(allFieldsets[1], 'button', 'remove');
      expect(removeButtonTwo.exists()).toBe(true);

      // Removes second fieldset if the remove button is clicked on the second fieldset
      await removeButtonTwo.trigger('click');
      allFieldsets = enumeratedValuesCard.findAll('fieldset');
      expect(allFieldsets.length).toBe(1);

      // Assures once again that there is only an add button on the first fieldset
      addButtonOne = findByText(allFieldsets[0], 'button', 'add');
      expect(addButtonOne.exists()).toBe(true);
      removeButtonOne = findByText(allFieldsets[0], 'button', 'remove');
      expect(removeButtonOne).toBeUndefined();
    });

    it('ensures that the expected payload is emitted when the save button is clicked with the "User Provided" type selected', async () => {
      const UserProvidedPayload = {
        settingsId: 'parameters',
        definition: {
          parameterName: 'MyParameterName',
          inputLabel: 'My parameter label',
          inputType: 'string',
          helpText: 'my parameter description',
          multivalued: true,
          enumeratedValues: [{ name: 'enum name', value: 'enum value' }],
          source: 'basic',
        },
      };

      await wrapper.find('input[name="parameter-name"]').setValue(UserProvidedPayload.definition.parameterName);
      await wrapper.find('input[name="parameter-label"]').setValue(UserProvidedPayload.definition.inputLabel);

      const inputTypeSelect = findByRole(wrapper, 'listbox');
      await inputTypeSelect.trigger('click');
      await inputTypeSelect.findAll('li')[0].find('span').trigger('click');

      await wrapper.find('input[name="help-text"]').setValue(UserProvidedPayload.definition.helpText);
      await wrapper.find('input[name="multivalued"]').setValue(UserProvidedPayload.definition.multivalued);
      await wrapper.find('input[name="enumerated-values"]').setValue(true);

      // Fills out Name and Value for enumerated values
      const nameField = wrapper.find('input[name="enumerated-name-0"]');
      const valueField = wrapper.find('input[name="enumerated-value-0"]');
      await nameField.setValue(UserProvidedPayload.definition.enumeratedValues[0].name);
      await valueField.setValue(UserProvidedPayload.definition.enumeratedValues[0].value);
      await flushPromises();

      // Saves form
      await findByText(wrapper, 'button', 'Save').trigger('click');
      expect(wrapper.emitted('update-parameter')).toEqual([[-1, UserProvidedPayload.definition]]);
    });

    it('ensures that the Data Source field shows when the Data Source radio button is clicked, then after datasource select, the property (attribute) field appears', async () => {
      const UserDatasourceDropdown = findByTestId(wrapper, 'fr-field-data-source');
      expect(UserDatasourceDropdown.exists()).toBe(false);

      let attributeField = findByTestId(wrapper, 'fr-field-data-source-property');
      expect(attributeField.exists()).toBe(false);

      const [, datasourceRadio] = wrapper.findAll('input[type="radio"]');
      await datasourceRadio.setChecked();

      const inputTypeSelect = findByRole(wrapper, 'listbox');
      await inputTypeSelect.trigger('click');

      const UserDatasourceOption = inputTypeSelect.findAll('li')[0].find('span');
      expect(UserDatasourceOption.text()).toBe('User');
      await UserDatasourceOption.trigger('click');

      attributeField = findByTestId(wrapper, 'fr-field-data-source-property');
      expect(attributeField).toBeDefined();

      const userNameOption = attributeField.find('[role="option"]');
      expect(userNameOption.text()).toBe('User Name');
    });
  });
});
