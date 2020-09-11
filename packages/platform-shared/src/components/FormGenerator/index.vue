<template>
  <div class="fr-generated-schema-holder">
    <form
      v-if="schema && model && populatedUISchema.length"
      class="fr-generated-schema-body">
      <template v-for="(display, index) in populatedUISchema">
        <StringDisplay
          :key="`${display.model}_${index}`"
          :ui-schema="display"
          :save-model="display.model"
          v-if="display.type === 'string' && safeCompare(display) && showField(display)"
          @update:model="updateSaveModel" />

        <ArrayDisplay
          :key="`${display.model}_${index}`"
          :ui-schema="display"
          :save-model="display.model"
          v-else-if="display.type === 'array' && safeCompare(display) && showField(display)"
          @update:model="updateSaveModel" />

        <BooleanDisplay
          :key="`${display.model}_${index}`"
          :ui-schema="display"
          :save-model="display.model"
          :is-html="display.renderHTML"
          v-else-if="display.type === 'boolean' && safeCompare(display) && showField(display)"
          @update:model="updateSaveModel" />

        <NumberDisplay
          :key="`${display.model}_${index}`"
          :ui-schema="display"
          :save-model="display.model"
          v-else-if="display.type === 'integer' && safeCompare(display) && showField(display)"
          @update:model="updateSaveModel" />

        <RadioDisplay
          :key="`${display.model}_${index}`"
          :ui-schema="display"
          :save-model="display.model"
          v-else-if="display.type === 'radio' && safeCompare(display) && showField(display)"
          @update:model="updateSaveModel" />

        <PasswordDisplay
          :key="`${display.model}_${index}`"
          :ui-schema="display"
          :save-model="display.model"
          v-else-if="display.type === 'password' && safeCompare(display) && showField(display)"
          @update:model="updateSaveModel" />
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
  isObject,
  isString,
  isNumber,
  isBoolean,
  cloneDeep,
} from 'lodash';

import ArrayDisplay from './renderers/ArrayDisplay';
import BooleanDisplay from './renderers/BooleanDisplay';
import NumberDisplay from './renderers/NumberDisplay';
import RadioDisplay from './renderers/RadioDisplay';
import StringDisplay from './renderers/StringDisplay';
import PasswordDisplay from './renderers/PasswordDisplay';

export default {
  name: 'FormGenerator',
  components: {
    ArrayDisplay,
    BooleanDisplay,
    NumberDisplay,
    RadioDisplay,
    StringDisplay,
    PasswordDisplay,
  },
  props: {
    schemaType: {
      type: String,
      default: '',
    },
    uiSchema: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  computed: {
    schema() {
      return this.$store.state.ApplicationStore.jsonSchemas[this.schemaType];
    },
    model() {
      return this.$store.state.ApplicationStore.jsonSchemaData[this.schemaType];
    },
    /**
     * Takes the currently defined uiSchema array, iterates through it and adds the current value from the save object for rendering
     */
    populatedUISchema() {
      if (!this.schema || !this.model) {
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
            } else if (schemaObj.arrayType === 'selectOne') {
              formField.enum = schemaObj.enum;
              formField.enumNames = schemaObj.enumNames;
              formField.value = modelObj.value;
            } else if (schemaObj.arrayType === 'selectMany') {
              formField.enum = schemaObj.enum;
              formField.enumNames = schemaObj.enumNames;
              formField.value = modelObj.value;
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
        return get(this.$store.state.ApplicationStore.jsonSchemaData[this.schemaType], model.show).value || false;
      }
      return true;
    },
    updateSaveModel(payload) {
      this.$store.dispatch('ApplicationStore/setSchemaDataPropertyValue', {
        schemaType: this.schemaType,
        ...payload,
      });
    },
  },
};
</script>
