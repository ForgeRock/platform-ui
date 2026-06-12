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
 * Returns true if a schema property is a nested-object section containing sub-properties.
 * These are AM "collection" properties (e.g. the "dynamic" section on the Session service)
 * whose sub-properties are the actual configurable fields. Mirrors the
 * `value.type === "object" && _.has(value, "properties")` predicate used by
 * JSONSchema#ungroupCollectionProperties and JSONSchema#isCollection in the OpenAM admin UI.
 * @param {Object} prop - The AM schema property.
 * @returns {Boolean}
 */
const isDynamicSection = (prop) => prop && prop.type === 'object' && prop.properties
  && Object.keys(prop.properties).length > 0;

/**
 * Hoists any nested-object sections in an AM schema up to the top level so the form can be
 * rendered as a single flat list of fields.
 *
 * Uses the same predicate as AM's JSONSchema#ungroupCollectionProperties
 * (`type === "object" && has(properties)`), but applies it to all top-level properties rather
 * than only to sub-properties of the named `defaults` key as AM does. This is intentional:
 * AM's JSONSchema class is designed for the realm-settings page which always has a known
 * `defaults`/`dynamic` structure; this utility is for individual service schemas where the
 * dynamic section appears directly at the top level.
 *
 * Only named `properties` trigger flattening; `patternProperties` objects (e.g. uiConfig on
 * social providers, loaMapping/amrMappings on OAuth2 sections) are left in place — isDynamicSection
 * returns false for those, so existing callers are unaffected.
 *
 * Assumes sub-property keys are unique across sections. If two sections share a sub-property key
 * the last one wins — AM's own ungroupCollectionProperties has the same behaviour and schemas
 * are authored to avoid this.
 * @param {Object} schema - The raw AM schema.
 * @returns {Object} A new schema object with dynamic sections flattened.
 */
const flattenDynamicSections = (schema) => {
  const flatProperties = {};

  Object.entries(schema.properties).forEach(([key, prop]) => {
    if (isDynamicSection(prop)) {
      Object.entries(prop.properties).forEach(([subKey, subProp]) => {
        const sectionDefault = prop.default ? prop.default[subKey] : undefined;
        flatProperties[subKey] = subProp.default === undefined && sectionDefault !== undefined
          ? { ...subProp, default: sectionDefault }
          : subProp;
      });
    } else {
      flatProperties[key] = prop;
    }
  });

  return { ...schema, properties: flatProperties };
};

/**
 * Flattens AM values shaped like { dynamic: { foo: 1, bar: 2 } } into { foo: 1, bar: 2 } so they
 * line up with a schema that has been put through flattenDynamicSections.
 * @param {Object} values - The raw values from AM.
 * @param {Object} schema - The original (unflattened) AM schema.
 * @returns {Object} A new flat values object.
 */
const flattenDynamicValues = (values, schema) => {
  if (!values || !schema || !schema.properties) return values;
  const result = { ...values };

  Object.entries(schema.properties).forEach(([key, prop]) => {
    if (isDynamicSection(prop) && result[key] && typeof result[key] === 'object') {
      Object.assign(result, result[key]);
      delete result[key];
    }
  });

  return result;
};

/**
 * Re-nests flat form values back into the dynamic-section shape AM expects on PUT.
 * Inverse of flattenDynamicValues. Mirrors the way EditSchemaComponent.updateValues merges tab
 * data back under its section key before serialising in JSONValues#toJSON.
 * @param {Object} values - The flat form values.
 * @param {Object} schema - The original (unflattened) AM schema.
 * @returns {Object} A new values object with dynamic-section fields re-nested.
 */
const nestDynamicValues = (values, schema) => {
  if (!schema || !schema.properties) return values;
  const result = { ...values };

  Object.entries(schema.properties).forEach(([sectionKey, prop]) => {
    if (isDynamicSection(prop)) {
      const sectionValues = {};
      Object.keys(prop.properties).forEach((fieldKey) => {
        if (fieldKey in result) {
          sectionValues[fieldKey] = result[fieldKey];
          delete result[fieldKey];
        }
      });
      if (Object.keys(sectionValues).length > 0) {
        result[sectionKey] = sectionValues;
      }
    }
  });

  return result;
};

/**
 * Removes password fields with a null or undefined value from a values object before a PUT.
 * Mirrors JSONValues#removeNullPasswords in the OpenAM UI — password fields are never returned
 * by AM in GET responses, so an absent value means "unchanged". Sending null/undefined would
 * clear the stored secret on AM, so such fields must be omitted entirely.
 *
 * Recurses into nested-object sections (e.g. AM's "dynamic" block) so password fields nested
 * under a collection section are handled the same way as top-level password fields — matching
 * the recursive `isCollection`/`omitNullPasswords` branch in JSONValues#removeNullPasswords.
 *
 * @param {Object} values - The values object to clean.
 * @param {Object} schemaProperties - The raw AM schema properties map.
 * @returns {Object} A new object with null/undefined password fields removed.
 */
export const removeNullPasswords = (values, schemaProperties) => Object.entries(values).reduce((acc, [key, value]) => {
  const prop = schemaProperties[key];
  if (prop && isPasswordField(prop) && (value === null || value === undefined)) {
    return acc;
  }
  if (prop && isDynamicSection(prop) && value && typeof value === 'object') {
    acc[key] = removeNullPasswords(value, prop.properties);
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
 * Prepares form values for a PUT request by restoring placeholder objects, re-nesting any
 * dynamic-section fields under their section key, and removing null password fields.
 * Mirrors AM's save pipeline:
 *   revertPlaceholdersToOriginalValue → updateValues (re-nest tab data) → removeNullPasswords.
 * Always use this in place of calling restorePlaceholderValues and removeNullPasswords individually.
 * @param {Object} values - The current (flat) form values.
 * @param {Array} formSchema - The processed schema array produced by createAmForm.
 * @param {Object} schemaProperties - The raw AM schema properties map (with sections intact).
 * @returns {Object} Values ready to send to AM.
 */
export const prepareValuesForSave = (values, formSchema, schemaProperties) => {
  const restored = restorePlaceholderValues(values, formSchema);
  const nested = nestDynamicValues(restored, { properties: schemaProperties });
  return removeNullPasswords(nested, schemaProperties);
};

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
 * Nested-object sections such as AM's "dynamic" block are flattened so their sub-properties
 * appear as top-level fields, matching the behaviour of OpenAM's EditSchemaComponent when it
 * renders a collection section via FlatJSONSchemaView. The original schema shape is preserved
 * outside this function — pass the same raw schema to prepareValuesForSave to re-nest values
 * before sending them back to AM.
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
  overrides = {},
}) => {
  const flatSchema = flattenDynamicSections(schema);
  const flatValues = flattenDynamicValues(values, schema);

  const { filteredSchema, initialValues } = Object.entries(flatSchema.properties).reduce((acc, [key, prop]) => {
    const rawValue = flatValues[key];
    const initialValue = sanitizePropertyValue(prop, rawValue);

    // Inclusion filtering uses the raw template value so that enum fields with no
    // template value are still treated as empty (matching AM's getEmptyValueKeys behaviour).
    if (shouldIncludeProperty(prop, rawValue, { showOnlyRequired, showOnlyRequiredAndEmpty })) {
      const formattedProp = { ...formatPropertyField(prop), key };
      if (overrides[key]?.description !== undefined) formattedProp.description = overrides[key].description;
      if (overrides[key]?.title !== undefined) formattedProp.title = overrides[key].title;
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
