<!-- Copyright (c) 2021-2022 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="fr-generated-schema-holder">
    <form
      v-if="schema && model && populatedUISchema.length"
      class="fr-generated-schema-body">
      <BRow
        v-for="(row, index) in populatedUISchema"
        :key="`row_${index}`">
        <BCol
          v-for="(column, rowIndex) in row"
          :key="`${column.model}_${rowIndex}`"
          :lg="column.columns">
          <Component
            v-if="!column.customSlot"
            @update:model="$emit('update:model', $event)"
            :is="getDisplayComponent(column)"
            :ui-schema="column"
            :path="column.model" />
          <slot
            v-else
            :column="column"
            :name="column.customSlot" />
        </BCol>
      </BRow>
    </form>
  </div>
</template>

<script>
import {
  assign,
  has,
  get,
  isArray,
  isEmpty,
  isString,
  isNumber,
  isBoolean,
  cloneDeep,
} from 'lodash';
import {
  BCol,
  BRow,
} from 'bootstrap-vue';
import FrArrayDisplay from './renderers/ArrayDisplay';
import FrBooleanDisplay from './renderers/BooleanDisplay';
import FrNumberDisplay from './renderers/NumberDisplay';
import FrPasswordDisplay from './renderers/PasswordDisplay';
import FrRadioDisplay from './renderers/RadioDisplay';
import FrStringDisplay from './renderers/StringDisplay';

export default {
  name: 'FormGenerator',
  components: {
    BCol,
    BRow,
    FrArrayDisplay,
    FrBooleanDisplay,
    FrNumberDisplay,
    FrPasswordDisplay,
    FrRadioDisplay,
    FrStringDisplay,
  },
  props: {
    /**
     * Contains objects with information for displaying the correct field, in order.
     */
    uiSchema: {
      type: Array,
      default: () => [],
    },
    /**
     * Model data.
     */
    model: {
      type: Object,
      default: () => {},
    },
    /**
     * Schema data.
     */
    schema: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    /**
     * Takes the currently defined uiSchema array, iterates through it and adds the current value from the save object for rendering
     */
    populatedUISchema() {
      if (isEmpty(this.schema) || isEmpty(this.model)) {
        return [];
      }

      return this.uiSchema.map((row) => row
        .map((formField) => {
          const clonedSchema = cloneDeep(this.schema);
          const clonedModel = cloneDeep(this.model);
          const modelIsArrayElement = formField.model.endsWith('[0]');
          const modelName = modelIsArrayElement ? formField.model.substring(0, formField.model.length - 3) : formField.model;
          const schemaObj = assign(get(clonedSchema, modelName), formField);
          const modelObj = get(clonedModel, modelName);
          const modelValue = isString(modelObj) ? modelObj : modelObj?.value;

          if (formField.validation === undefined) {
            formField.validation = {};
          }
          if (schemaObj.required) {
            formField.validation.required = true;
          }
          if (schemaObj.type === 'integer') {
            formField.validation.numeric = true;
          }

          // make sure all formField have render types
          if (!has(formField, 'type')) {
            formField.type = schemaObj.type || 'string';
          }

          // assign current values
          formField.value = formField.value ? formField.value : this.getFieldValue(modelValue, formField.type, modelIsArrayElement);

          // set options for array and radio fields
          if (formField.type === 'array') {
            formField.arrayType = schemaObj.arrayType;

            if (schemaObj.arrayType === 'addMany') {
              formField.options = modelValue;
            } else if (schemaObj.arrayType === 'selectOne' || schemaObj.arrayType === 'selectMany') {
              formField.options = schemaObj.options;
            }
          } else if (formField.type === 'radio') {
            formField.options = schemaObj.options;
          }
          return formField;
        })
        .filter((formField) => this.getDisplayComponent(formField) || formField.customSlot));
    },
  },
  methods: {
    /**
     * Performs a case insensitive check of values
     * @param model - Current field model
     */
    safeCompare(model) {
      const valueIsArray = isArray(model.value);
      const valueIsString = isString(model.value);
      const valueIsBool = isBoolean(model.value);
      const valueIsNumber = isNumber(model.value);

      switch (model.type) {
        case 'string':
          return valueIsString;
        case 'array':
          if (model.arrayType === 'selectOne') {
            return valueIsString;
          }
          return valueIsArray;
        case 'boolean':
          return valueIsBool;
        case 'integer':
          return valueIsNumber;
        case 'radio':
          return true;
        case 'password':
          return true;
        default:
          return false;
      }
    },
    /**
     * Tests to see if model object has "show" property which indicates visibility is tied to another model.
     * @param model - Current field model
     */
    showField(model) {
      if (has(model, 'show')) {
        return get(this.model, model.show).value || false;
      }
      return true;
    },
    getDisplayComponent(display) {
      if (this.safeCompare(display) && this.showField(display)) {
        const componentNames = {
          string: 'FrStringDisplay',
          array: 'FrArrayDisplay',
          boolean: 'FrBooleanDisplay',
          integer: 'FrNumberDisplay',
          radio: 'FrRadioDisplay',
          password: 'FrPasswordDisplay',
        };

        return componentNames[display.type] ? componentNames[display.type] : null;
      }
      return null;
    },
    /**
     * Obtains the initial value for a field
     * @param {String|Boolean|Number|Array} modelValue the raw value indicated by the model for the field
     * @param {String} fieldType the type of field
     * @param {Boolean} modelIsArrayElement if the model indicates that the field is an array element
     */
    getFieldValue(modelValue, fieldType, modelIsArrayElement) {
      if (fieldType === 'array' || fieldType === 'radio') {
        return modelValue;
      }
      if (fieldType === 'boolean') {
        return modelValue || false;
      }
      if (fieldType === 'integer') {
        return modelValue || 0;
      }
      if (modelIsArrayElement) {
        return modelValue && modelValue.length ? modelValue[0] : '';
      }
      return modelValue || '';
    },
  },
};
</script>
