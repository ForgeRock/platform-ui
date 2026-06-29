/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  isEmpty,
  isNumber,
  isBoolean,
} from 'lodash';
import {
  doesValueContainPlaceholder,
  getPlaceholderValueToDisplay,
} from '@forgerock/platform-shared/src/utils/esvUtils';

/**
 * Returns true if the given AM schema property represents a password field.
 * @param {Object} property - The AM schema property.
 * @returns {Boolean}
 */
export const isPasswordField = (property) => property.type === 'string' && property.format === 'password';

/**
 * Builds the options array for select and multiselect fields from the AM schema property.
 * Returns null for non-select field types.
 * @param {Object} property - The AM schema property.
 * @returns {Array|null}
 */
export const getSelectFieldOptions = (property) => {
  if (property.type === 'select' && property.enum) {
    return property.enum.map((value, index) => ({
      text: property.enumNames[index],
      value,
    }));
  }

  if (property.type === 'multiselect' && property.items && property.items.enum) {
    return property.items.enum.map((value, index) => ({
      text: property.items.enumNames[index],
      value,
    }));
  }

  return null;
};

/**
 * Maps an AM schema property to the corresponding FrField type string.
 * @param {Object} property - The AM schema property.
 * @returns {string} The FrField type (e.g. 'password', 'select', 'tag', 'checkbox', etc.).
 */
export const getFieldTypeForProperty = (property) => {
  // Password field
  if (isPasswordField(property)) {
    return 'password';
  }

  // Select field
  if (property.type === 'string' && property.enum) {
    return 'select';
  }

  // Multiselect field
  if (property.type === 'array' && property.items && property.items.enum) {
    return 'multiselect';
  }

  // Other
  const fieldTypes = {
    array: 'tag',
    boolean: 'checkbox',
    integer: 'number',
  };

  return fieldTypes[property.type] ? fieldTypes[property.type] : property.type;
};

/**
 * Builds a normalised valueOptions array for object-type properties whose value subschema
 * carries an `enum` (i.e. `patternProperties[".*"].enum`). Used for key-value map fields
 * like loaMapping and amrMappings where the value side is constrained to a fixed set.
 *
 * AM's SmsSchemaGenerator always emits the pattern key as the literal string ".*"
 * (SmsSchemaGenerator.java:433: `field(".*", fieldType.getObject())`). This function
 * intentionally reads only that key; other pattern keys are not supported.
 *
 * Label priority: enumNames[i] → options.enum_titles[i] → enum[i] (raw value as fallback).
 *
 * Returns null (not []) when the property does not match — callers can distinguish "no
 * options" from "empty options".
 *
 * @param {Object} property - The raw AM schema property.
 * @returns {Array<{text: string, value: string}>|null}
 */
export const getKeyValueOptions = (property) => {
  if (property.type !== 'object') return null;

  const valueSchema = property.patternProperties?.['.*'];
  if (!valueSchema || !Array.isArray(valueSchema.enum) || valueSchema.enum.length === 0) return null;

  return valueSchema.enum.map((value, index) => {
    const label = valueSchema.enumNames?.[index]
      ?? valueSchema.options?.enum_titles?.[index]
      ?? value;
    return { text: label, value };
  });
};

/**
 * Formats a raw AM schema property into a UI-ready field descriptor by resolving its
 * FrField type and pre-computing select options.
 * @param {Object} property - The AM schema property.
 * @returns {Object} The formatted property with resolved type and options.
 */
export const formatPropertyField = (property) => {
  const formattedProperty = { ...property };
  formattedProperty.type = getFieldTypeForProperty(property);

  if (formattedProperty.type === 'select' || formattedProperty.type === 'multiselect') {
    formattedProperty.options = getSelectFieldOptions(formattedProperty);
  }

  // This is a hack to prevent validation from triggering on checkbox
  // May need to be reworked with consideration for JSON schema versions
  // post version 4 where the required attributes are listed in a top level array
  if (formattedProperty.type === 'checkbox' && formattedProperty.required) {
    formattedProperty.required = false;
  }

  const keyValueOptions = getKeyValueOptions(property);
  if (keyValueOptions !== null) {
    formattedProperty.valueOptions = keyValueOptions;
  }

  return formattedProperty;
};

/**
 * Returns true if the given value is considered empty for the purposes of form filtering.
 * Numbers and booleans are never considered empty regardless of their value.
 * @param {*} value - The value to check.
 * @returns {Boolean}
 */
export const checkEmpty = (value) => {
  if (isNumber(value)) {
    return false;
  } if (isBoolean(value)) {
    return false;
  }

  return isEmpty(value);
};

/**
 * Returns the effective default for an AM schema property, mirroring JSONEditor's fallback order:
 * explicit default → first enum value → type-based default (string: '', array: [], integer/number: 0, boolean: false, object: {}).
 * @param {Object} property - The AM schema property.
 * @returns {Any}
 */
export const getPropertyDefault = (property) => {
  if (property.default !== undefined) return property.default;
  if (property.type === 'string' && property.enum) return property.enum[0];
  const typeDefaults = {
    string: '',
    array: [],
    integer: 0,
    number: 0,
    boolean: false,
    object: {},
  };
  return typeDefaults[property.type];
};

/**
 * Determines if a property is considered 'required' and lacks a default value.
 * @param {Object} property - The AM schema property.
 * @returns {Boolean}
 */
export const isPropertyRequired = (property) => property.required && checkEmpty(property.default);

/**
 * Sanitizes raw backend values into UI-compatible initial values, falling back to the
 * property default (or enum[0] for select fields) when the value is absent.
 * @param {Object} property - The AM schema property.
 * @param {Any} value - The raw value from the backend.
 * @returns {Any} The sanitized value.
 */
export const sanitizePropertyValue = (property, value) => {
  if (isPasswordField(property)) {
    return (value !== null && value !== undefined && doesValueContainPlaceholder(value)) ? value : undefined;
  }
  if (value === null || value === undefined) return getPropertyDefault(property);
  return value;
};

/**
 * Logic to determine if a property should be included based on form filters.
 * @param {Object} property - The AM schema property.
 * @param {Any} value - The sanitized initial value.
 * @param {Object} filters - The filter flags.
 * @returns {Boolean}
 */
const shouldIncludeProperty = (property, value, { showOnlyRequired, showOnlyRequiredAndEmpty }) => {
  const isReq = isPropertyRequired(property);
  if (showOnlyRequired) return isReq;
  if (showOnlyRequiredAndEmpty) return isReq && checkEmpty(value);
  return true;
};

/**
 * Removes password fields with a null or undefined value from a values object before a PUT.
 * Mirrors JSONValues#removeNullPasswords in the OpenAM UI — password fields are never returned
 * by AM in GET responses, so an absent value means "unchanged". Sending null/undefined would
 * clear the stored secret on AM, so such fields must be omitted entirely.
 * @param {Object} values - The flat values object to clean.
 * @param {Object} schemaProperties - The raw AM schema properties map.
 * @returns {Object} A new object with null/undefined password fields removed.
 */
export const removeNullPasswords = (values, schemaProperties) => Object.entries(values).reduce((acc, [key, value]) => {
  const prop = schemaProperties[key];
  if (prop && isPasswordField(prop) && (value === null || value === undefined)) {
    return acc;
  }
  acc[key] = value;
  return acc;
}, {});

/**
 * Restores placeholder fields to their original object form (e.g. { "$string": "&{...}" }) before a PUT.
 * Mirrors AM's revertPlaceholdersToOriginalValue — when createAmForm flattens a placeholder value to
 * its display string, it stashes the original object on the schema entry. This function restores it so
 * AM receives the correct typed placeholder object rather than a plain string.
 * @param {Object} values - The current form values.
 * @param {Array} formSchema - The processed schema array produced by createAmForm.
 * @returns {Object} A new values object with placeholder fields restored to their original objects.
 */
const restorePlaceholderValues = (values, formSchema) => {
  const restored = { ...values };
  formSchema.forEach(({ key, originalValue }) => {
    if (originalValue !== undefined) {
      restored[key] = originalValue;
    }
  });
  return restored;
};

/**
 * Prepares form values for a PUT request by restoring placeholder objects and removing null password fields.
 * Mirrors AM's save pipeline: revertPlaceholdersToOriginalValue → removeNullPasswords.
 * Always use this in place of calling restorePlaceholderValues and removeNullPasswords individually.
 * @param {Object} values - The current form values.
 * @param {Array} formSchema - The processed schema array produced by createAmForm.
 * @param {Object} schemaProperties - The raw AM schema properties map.
 * @returns {Object} Values ready to send to AM.
 */
export const prepareValuesForSave = (values, formSchema, schemaProperties) => removeNullPasswords(
  restorePlaceholderValues(values, formSchema),
  schemaProperties,
);

/**
 * Applies AM's convertPlaceholderSchemaToReadOnly + flattenPlaceholder logic to a single field:
 * overrides type/format to plain "string", flattens the placeholder object to its display string,
 * and stashes the original value for restoration before PUT.
 * @param {Object} formattedProp - The already-formatted property object (mutated in place).
 * @param {*} rawValue - The raw value from the backend.
 * @returns {string} The initial value to use for the field.
 */
const applyPlaceholderOverrides = (formattedProp, rawValue) => {
  formattedProp.type = 'string';
  formattedProp.format = 'string';
  formattedProp.originalValue = rawValue;
  return getPlaceholderValueToDisplay(rawValue);
};

/**
 * Transforms AM schema and values into a UI-ready form model in a single pass.
 *
 * @param {Object} params - The function parameters.
 * @param {Object} params.schema - The raw AM schema object.
 * @param {Object} params.values - The current values for the schema.
 * @param {Boolean} params.showOnlyRequired - Filter to show only required fields.
 * @param {Boolean} params.showOnlyRequiredAndEmpty - Filter to show only required fields that have no value.
 *
 * @returns {Object} An object containing the processed schema array and initial values map.
 */
export const createAmForm = ({
  schema,
  values,
  showOnlyRequired = false,
  showOnlyRequiredAndEmpty = false,
}) => {
  const { filteredSchema, initialValues } = Object.entries(schema.properties).reduce((acc, [key, prop]) => {
    const rawValue = values[key];
    const initialValue = sanitizePropertyValue(prop, rawValue);

    // Inclusion filtering uses the raw template value so that enum fields with no
    // template value are still treated as empty (matching AM's getEmptyValueKeys behaviour).
    if (shouldIncludeProperty(prop, rawValue, { showOnlyRequired, showOnlyRequiredAndEmpty })) {
      const formattedProp = { ...formatPropertyField(prop), key };
      const hasPlaceholder = rawValue !== undefined && rawValue !== null && doesValueContainPlaceholder(rawValue);
      acc.initialValues[key] = hasPlaceholder ? applyPlaceholderOverrides(formattedProp, rawValue) : initialValue;

      acc.filteredSchema.push(formattedProp);
    }

    return acc;
  }, { filteredSchema: [], initialValues: {} });
  // Sort by propertyOrder before returning
  return {
    schema: filteredSchema.sort((a, b) => (a.propertyOrder ?? Number.MAX_SAFE_INTEGER) - (b.propertyOrder ?? Number.MAX_SAFE_INTEGER)),
    values: initialValues,
  };
};
