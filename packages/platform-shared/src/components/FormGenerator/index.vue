<!-- Copyright (c) 2021 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="fr-generated-schema-holder">
    <form
      v-if="schema && model && populatedUISchema.length"
      class="fr-generated-schema-body">
      <template v-for="(display, index) in populatedUISchema">
        <Component
          v-if="getDisplayComponent(display)"
          @update:model="$emit('update:model', $event)"
          :is="getDisplayComponent(display)"
          :key="`${display.model}_${index}`"
          :ui-schema="display"
          :path="display.model" />
      </template>
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
  isObject,
  isString,
  isNumber,
  isBoolean,
  cloneDeep,
} from 'lodash';

import FrArrayDisplay from './renderers/ArrayDisplay';
import FrBooleanDisplay from './renderers/BooleanDisplay';
import FrNumberDisplay from './renderers/NumberDisplay';
import FrPasswordDisplay from './renderers/PasswordDisplay';
import FrRadioDisplay from './renderers/RadioDisplay';
import FrStringDisplay from './renderers/StringDisplay';

export default {
  name: 'FormGenerator',
  components: {
    FrArrayDisplay,
    FrBooleanDisplay,
    FrNumberDisplay,
    FrPasswordDisplay,
    FrRadioDisplay,
    FrStringDisplay,
  },
  props: {
    uiSchema: {
      type: Array,
      default: () => [],
    },
    model: {
      type: Object,
      default: () => {},
    },
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

      return this.uiSchema.map((formField) => {
        const clonedSchema = cloneDeep(this.schema);
        const clonedModel = cloneDeep(this.model);
        const modelIsArrayElement = formField.model.endsWith('[0]');
        const modelName = modelIsArrayElement ? formField.model.substring(0, formField.model.length - 3) : formField.model;
        const schemaObj = assign(get(clonedSchema, modelName), formField);
        const modelObj = isObject(get(clonedModel, modelName)) ? assign(get(clonedModel, modelName), formField) : get(clonedModel, modelName);

        if (schemaObj.required) {
          formField.required = schemaObj.required;
        }

        if (modelObj) {
          // make sure all formField have render types
          if (!has(formField, 'type')) {
            formField.type = schemaObj.type || 'string';
          }

          // assign current values
          if (formField.type === 'array') {
            formField.arrayType = schemaObj.arrayType;

            if (schemaObj.arrayType === 'addMany') {
              formField.value = modelObj.value;
              formField.options = modelObj.value;
            } else if (schemaObj.arrayType === 'selectOne' || schemaObj.arrayType === 'selectMany') {
              formField.value = modelObj.value;
              formField.options = schemaObj.options;
            }
          } else if (formField.type === 'boolean') {
            formField.value = modelObj.value || false;
          } else if (formField.type === 'integer') {
            formField.value = modelObj.value || 0;
          } else if (formField.type === 'radio') {
            formField.options = schemaObj.options;
            formField.value = modelObj.value;
          } else if (modelIsArrayElement) {
            formField.value = modelObj.value && modelObj.value.length ? modelObj.value[0] : '';
          } else if (isString(modelObj)) {
            formField.value = modelObj;
          } else {
            formField.value = modelObj.value || '';
          }
        }
        return formField;
      });
    },
  },
  methods: {
    /**
     * @param model - Current field model
     *
     * Preforms a case insensitive check of values
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
     * @param model - Current field model
     *
     * Tests to see if model object has "show" property which indicates visibility is tied to another model.
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
  },
};
</script>
