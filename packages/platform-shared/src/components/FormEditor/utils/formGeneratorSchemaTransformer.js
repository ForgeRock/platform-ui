/**
 * Copyright (c) 2024-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { set } from 'lodash';
import i18n from '@/i18n';

/**
 * return the type of the field for the form generator based on the type of the field in the form builder
 * @param {string} formBuilderType - the type of the field in the form builder
 * @returns {string} the type of the field for the form generator
 */
function getFormGeneratorType(formBuilderType) {
  const formBuilderToFormGeneratorTypes = {
    text: 'string',
    checkbox: 'boolean',
  };

  return formBuilderToFormGeneratorTypes[formBuilderType] || formBuilderType;
}

/**
 * return the column classes for the field based on the layout information
 * @param {Object} layout - the layout information of the field
 * @param {number} layout.columns - the number of columns the field occupies
 * @param {number} layout.offset - the number of columns the field is offset by
 * @returns {string} the column classes for the field
 */
function getColumnClasses(layout) {
  return `col-md-${layout.columns} offset-md-${layout.offset}`;
}

/**
 * Retrieves the label for an optional property.
 * @param {object} propSchema - The schema of the property.
 * @returns {string} - The label for the property.
 */
function getOptionalPropLabel(propSchema) {
  if (!propSchema.label) return '';
  // checkboxes cannot be required/optional
  if (propSchema.type === 'checkbox' || propSchema.validation?.required === true) return propSchema.label;
  return i18n.global.t('common.optionalFieldTitle', { fieldTitle: propSchema.label });
}

/**
 * Sets the default value for a field in the schema.
 *
 * @param {Object} field - The field object.
 * @param {Object} schemaField - The schema field object.
 */
function setDefaultSchemaFieldValue(field, schemaField) {
  switch (field.type) {
    case 'multiselect':
      if (schemaField.options.object) field.defaultValue = [];
      else {
        field.defaultValue = schemaField.options
          ?.filter((option) => (option.selectedByDefault))
          ?.map((option) => option.value) || [];
      }
      break;
    case 'select':
      if (schemaField.options.object) field.defaultValue = '';
      else {
        field.defaultValue = schemaField.options
          ?.find((option) => (option.selectedByDefault))?.value || '';
      }
      break;
    default:
      break;
  }
}

/**
 * Transforms a schema generated by the {@link FormEditor} component into a schema that can be used by the {@link FormGenerator} component.
 * @param {Array} schema - The schema generated by the FormEditor component. Each element in the schema represents a field with specific properties and layout information.
 * @param {boolean} readOnly - A boolean value that indicates whether the form is read-only.
 * @param {boolean} includeDefaults - Whether to include default values for fields.
 * @returns {Array} A transformed schema that is organized into rows for the FormGenerator component. Each row contains an array of field objects with their respective properties and layout information.
 *
 * @see FormEditor
 * @see FormGenerator
 */
// eslint-disable-next-line import/prefer-default-export
export function transformSchemaToFormGenerator(schema, readOnly = false, includeDefaults = false) {
  return schema.map((row) => row.fields.map((schemaField) => {
    // create field object with the properties required by the form generator component
    const field = {
      ...schemaField,
      disabled: schemaField.readOnly || readOnly,
      type: getFormGeneratorType(schemaField.type),
      customSlot: schemaField.customSlot,
      columnClass: getColumnClasses(schemaField.layout),
      label: getOptionalPropLabel(schemaField),
    };

    // the form generator component expects the options to be an array of objects with value and text properties
    if (schemaField.type === 'multiselect' || schemaField.type === 'select') {
      if (schemaField.options?.object) {
        field.customSlot = schemaField.type === 'multiselect'
          ? 'objectMultiselect'
          : 'objectSelect';
        field.options = {
          object: schemaField.options.object,
          customObject: schemaField.options.customObject,
          queryProperties: schemaField.options.queryProperties,
          displayProperty: schemaField.options.displayProperty,
          queryFilter: schemaField.options.queryFilter,
        };
      } else {
        field.options = schemaField.options?.map((option) => ({
          value: option.value,
          text: option.label,
        })) || [];
      }
    }

    if (includeDefaults) setDefaultSchemaFieldValue(field, schemaField);
    else if (field.type === 'multiselect') field.defaultValue = [];
    else delete field.defaultValue;

    return field;
  }));
}

/**
 * Generates the initial model for a form based on the given schema.
 * This returns an object with keys that correspond to the model paths of the fields in the schema.
 * Adds default values for fields if the includeDefaults parameter is set to true.
 * @param {Array} schema - The schema defining the form fields.
 * @param {boolean} [includeDefaults=false] - Whether to include default values for fields.
 * @returns {Object} - The initial model object for the form.
 */
export function getInitialModel(schema, includeDefaults = false) {
  const updatedModel = {};
  schema.forEach((row) => row.fields.forEach((field) => {
    let value;
    const model = field.model || '';
    switch (field.type) {
      case 'string':
      case 'textarea':
        value = includeDefaults
          ? field.defaultValue || ''
          : '';
        set(updatedModel, model, value);
        break;
      case 'select':
        if (field.options.object) value = '';
        else {
          value = includeDefaults
            ? field.options?.find((option) => (option.selectedByDefault))?.value || ''
            : '';
        }
        set(updatedModel, model, value);
        break;
      case 'multiselect':
        if (field.options.object) value = [];
        else {
          value = includeDefaults
            ? field.options?.filter((option) => (option.selectedByDefault))?.map((option) => (option.value))
            : [];
        }
        set(updatedModel, model, value);
        break;
      case 'checkbox':
        value = includeDefaults
          ? field.defaultValue || false
          : false;
        set(updatedModel, model, value);
        break;
      default:
        break;
    }
  }));
  return updatedModel;
}
