<!-- Copyright (c) 2021-2025 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div class="fr-generated-schema-holder">
    <form
      v-if="schema && populatedUISchema.length"
      class="fr-generated-schema-body">
      <BRow
        v-for="(row, index) in populatedUISchema"
        class="m-lg-0"
        :class="fieldGroupClasses(row)"
        :key="`row_${index}`">
        <BCol
          v-for="(property, columnIndex) in row"
          :class="[
            property.columnClass,
            conditionalColumnClasses(property, columnIndex, row.length),
          ]"
          :key="`${property.model}_${columnIndex}`"
          :lg="property.columns"
          :title="property.groupTitle">
          <Component
            :is="getVisibilityComponent(property.collapsible)"
            v-model="sectionExpanded[property[visibilityProp]]">
            <template v-if="property.type === 'managedObject'">
              <slot
                name="relationshipField"
                :index="index"
                :property="property" />
            </template>
            <template v-else-if="!property.customSlot">
              <Component
                v-if="getPropertyComponent(property)"
                @update:model="$emit('update:model', $event, property.saveFormat)"
                :class="{'mb-4': property.type === 'multiselect'}"
                :is="getPropertyComponent(property)"
                :label="property.label"
                :options="property.options"
                :type="property.type"
                :ui-schema="property"
                :path="property.model"
                :name-prop="fieldNameProp"
              />
            </template>
            <slot
              v-else
              :property="property"
              :name="property.customSlot"
              :visibility="showField(property)"
            />
          </Component>
        </BCol>
      </BRow>
    </form>
  </div>
</template>

<script>
import {
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
import { valueIsPurposePlaceholder } from '@forgerock/platform-shared/src/utils/esvUtils';
import FrField from '@forgerock/platform-shared/src/components/Field';
import FrArrayDisplay from './renderers/ArrayDisplay';
import FrBooleanDisplay from './renderers/BooleanDisplay';
import FrNumberDisplay from './renderers/NumberDisplay';
import FrPasswordDisplay from './renderers/PasswordDisplay';
import FrRadioDisplay from './renderers/RadioDisplay';
import FrStringDisplay from './renderers/StringDisplay';
import FrTextAreaDisplay from './renderers/TextAreaDisplay';
import FrDateDisplay from './renderers/DateDisplay';

/**
 * @description FormGenerator component is a dynamic form generator that takes a schema and model object and
 * renders the form based on the schema. The schema is an array of arrays, where each array contains objects
 * with information for displaying the correct field, in order.
 * This component is used in several places in the platform, including the FormEditor and Application forms.
 */

export default {
  name: 'FormGenerator',
  components: {
    BCol,
    BRow,
    FrArrayDisplay,
    FrBooleanDisplay,
    FrField,
    FrNumberDisplay,
    FrPasswordDisplay,
    FrRadioDisplay,
    FrStringDisplay,
    FrTextAreaDisplay,
    FrDateDisplay,
  },
  props: {
    /**
     * Determines the default value for an integer field.
     */
    defaultValueForInteger: {
      type: [Number, null],
      default: 0,
    },
    /**
     * Model data.
     */
    model: {
      type: Object,
      default: () => {},
    },
    /**
     * Contains objects with information for displaying the correct field, in order.
     */
    schema: {
      type: Array,
      default: () => [],
    },
    fieldNameProp: {
      type: String,
      default: undefined,
    },
    visibilityProp: {
      type: String,
      default: 'label',
    },
  },
  data() {
    return {
      /**
       * State object indexed in the component for the BCollapse component to show/hide html elements on the
       * page. The label field is mandatory for the collapsible functionality to work as intended.
       */
      sectionExpanded: {},
    };
  },
  mounted() {
    if (this.schema) {
      this.sectionExpanded = this.indexCollapsibleFields(this.schema);
    }
  },
  watch: {
    schema(newSchema) {
      if (newSchema) {
        this.sectionExpanded = this.indexCollapsibleFields(newSchema);
      }
    },
  },
  computed: {
    /**
     * Takes the currently defined uiSchema array, iterates through it and adds the current value from the save object for rendering
     */
    populatedUISchema() {
      if (isEmpty(this.schema) || !this.model) {
        return [];
      }

      return cloneDeep(this.schema).map((row) => row
        .map((formField) => {
          const clonedModel = cloneDeep(this.model);
          const modelObj = get(clonedModel, formField.model, formField.defaultValue);
          const modelValue = isString(modelObj) || isNumber(modelObj) || isArray(modelObj) || isBoolean(modelObj) || valueIsPurposePlaceholder(modelObj) ? modelObj : modelObj?.value;

          if (formField.validation === undefined) {
            formField.validation = {};
          }
          if (formField.required) {
            formField.validation.required = true;
          }
          if (formField.type === 'integer') {
            formField.validation.integer = true;
          }

          // make sure all formField have render types
          if (!has(formField, 'type')) {
            formField.type = 'string';
          }

          // assign current values
          const isEmptyArray = Array.isArray(formField.value) && formField.value.length === 0;
          if (isEmptyArray) {
            formField.value = modelValue !== undefined
              ? this.getFieldValue(modelValue, formField.type)
              : [];
          } else {
            formField.value = formField.value ?? this.getFieldValue(modelValue, formField.type);
          }

          // set options for array and radio fields
          if (formField.type === 'array' && formField.arrayType === 'addMany') {
            formField.options = modelValue;
          }
          if (!formField.label) {
            formField.label = formField.title;
          }
          return formField;
        }));
    },
  },
  methods: {
    /**
     * Performs a case insensitive check of values
     * @param property - Current field object
     */
    safeCompare(property) {
      const valueIsArray = isArray(property.value);
      const valueIsString = isString(property.value);
      const valueIsBool = isBoolean(property.value);
      const valueIsNumber = isNumber(property.value);
      const valueIsPurpose = valueIsPurposePlaceholder(property.value);
      const valueIsNull = property.value === null;

      switch (property.type) {
        case 'select':
          if (property.saveFormat === 'boolean') {
            return valueIsBool;
          }
          return valueIsString || valueIsNumber;
        case 'string':
          return valueIsString || valueIsPurpose;
        case 'textarea':
          return valueIsString;
        case 'multiselect':
          return valueIsArray;
        case 'array':
          if (property.arrayType === 'selectOne') {
            return valueIsString;
          }
          return valueIsArray;
        case 'boolean':
          return valueIsBool;
        case 'integer':
          return valueIsNumber || valueIsNull;
        case 'radio':
          return true;
        case 'password':
          return true;
        case 'date':
          return true;
        default:
          return false;
      }
    },
    /**
     * Tests to see if property object has "show" property which indicates visibility is tied to another model.
     * @param property - Current field property
     */
    showField(property) {
      if (property?.showAlways !== undefined) {
        this.sectionExpanded[property[this.visibilityProp]] = property.showAlways;
        return property.showAlways;
      }

      if (property?.show) {
        const modelProp = get(this.model, property.show);
        let currentVal;
        if (modelProp !== undefined) {
          currentVal = Object.prototype.hasOwnProperty.call(modelProp, 'value') ? modelProp.value : modelProp;
        }
        /**
        * When showFieldForValue is present on a field, check if it matches the value of the show field. If it does,
        * toggle visibility using the sectionExpanded object.
        */
        if (property?.showFieldForValue !== undefined) {
          currentVal = Array.isArray(currentVal) ? currentVal[0] : currentVal;
          if (currentVal === property.showFieldForValue) {
            this.sectionExpanded[property[this.visibilityProp]] = true;
            return true;
          }
          this.sectionExpanded[property[this.visibilityProp]] = false;
          return false;
        }
        return currentVal || false;
      }
      return true;
    },
    getVisibilityComponent(collapsible) {
      return collapsible ? 'BCollapse' : 'span';
    },
    getPropertyComponent(property) {
      if (this.safeCompare(property) && this.showField(property)) {
        const componentNames = {
          string: 'FrStringDisplay',
          textarea: 'FrTextAreaDisplay',
          array: 'FrArrayDisplay',
          multiselect: 'FrArrayDisplay',
          select: 'FrArrayDisplay',
          boolean: 'FrBooleanDisplay',
          integer: 'FrNumberDisplay',
          radio: 'FrRadioDisplay',
          password: 'FrPasswordDisplay',
          date: 'FrDateDisplay',
        };

        return componentNames[property.type] ? componentNames[property.type] : null;
      }
      return null;
    },
    /**
     * Obtains the initial value for a field
     * @param {String|Boolean|Number|Array} propertyValue the raw value indicated by the model for the field
     * @param {String} fieldType the type of field
     */
    getFieldValue(propertyValue, fieldType) {
      if (fieldType === 'array' || fieldType === 'radio' || fieldType === 'multiselect') {
        return propertyValue;
      }
      if (fieldType === 'boolean') {
        return propertyValue || false;
      }
      if (fieldType === 'integer') {
        return propertyValue || this.defaultValueForInteger;
      }
      if (isArray(propertyValue)) {
        return propertyValue[0] || '';
      }
      return isBoolean(propertyValue) ? propertyValue : propertyValue || '';
    },
    /**
     * Collects the set of 'collapsible' fields from a passed static json template and returns an object keyed by
     * the field label.
     */
    indexCollapsibleFields(schema) {
      return schema.filter((field) => field[0]?.collapsible)
        .reduce((currentCollapsibleFieldState, nextField) => ({
          ...currentCollapsibleFieldState,
          [nextField[0].label]: false,
        }), {});
    },
    /**
     * Returns class names for a group of fields.
     * @param {Array} row - The row used for injecting group css classes.
     * @returns {String} - The class names for the field group.
     */
    fieldGroupClasses(row) {
      const hasColumnClass = (_row, className) => _row.some((property) => property.columnClass?.includes(className));
      const isGroupStart = hasColumnClass(row, 'group-start');
      const isGroupEnd = hasColumnClass(row, 'group-end');
      const isNested = hasColumnClass(row, 'nested');
      const rowShowing = this.model[row[0]?.show];
      const classes = [];

      if (rowShowing) {
        classes.push('px-2 px-lg-4 bg-light');
        if (isGroupStart && !isNested) classes.push('rounded-top pt-4');
        if (isGroupEnd && !isNested) classes.push('mb-4 mb-lg-4 rounded-bottom');
        if (isNested) classes.push('pl-3 pl-lg-5');
      }
      return classes.join(' ');
    },
    /**
     * Returns conditional class names for a column of fields.
     * @param {Object} property - The property object used for injecting column css classes.
     * @param {Number} columnIndex - The index of the column in the row.
     * @param {Number} rowLength - The amount of rows.
     * @returns {String} - The class names for the column.
     */
    conditionalColumnClasses(property, columnIndex, rowLength) {
      const isGroupStart = property.columnClass?.includes('group-start');
      const classes = [];

      if (columnIndex === 0) {
        classes.push('pl-lg-0');
      }
      if (columnIndex === rowLength - 1) {
        classes.push('pr-lg-0');
      }
      if (isGroupStart && property.groupTitle && this.model[property.show]) {
        classes.push('group-title');
      }
      return classes.join(' ');
    },
  },
};
</script>

<style lang="scss" scoped>
.group-start.group-title:before {
  content: attr(title);
  display: block;
  font-weight: $font-weight-bold;
  color: $headings-color;
  padding-bottom: 1.5rem;
}
</style>
