/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { get, set } from 'lodash';

let _tempFormValues = {};
let _tempFormSchema = [];
let _allFields = [];

export function _setTempFormValues(values) {
  _tempFormValues = values;
}
export function _setTempFormSchema(schema) {
  _tempFormSchema = schema;
  // flatten the schema and extract all fields, including those in sections
  // to ensure all fields are accessible for manipulation
  const flatSchema = _tempFormSchema.flat();
  const sectionFields = flatSchema.filter((f) => f.type === 'section');
  _allFields = [...flatSchema, ...sectionFields.flatMap((s) => s.fields || [])].flat();
}

/**
 * Retrieves a field object from the form schema by its model key.
 *
 * @param {string} key - The model key to search for in the form schema.
 * @returns {Object|null} The field object if found, otherwise null.
 */
export function _getFieldByKey(key) {
  return _allFields.find((f) => f.model === key) || null;
}

/**
 * Functions passed to the script to manipulate form fields and values.
 */

/**
 * Disables a form field by its key.
 *
 * @param {string} key - The unique identifier of the field to disable.
 */
function disableField(key) {
  const field = _getFieldByKey(key);
  if (field) field.disabled = true;
}

/**
 * Enables a form field by its key.
 *
 * @param {string} key - The unique identifier for the form field to enable.
 */
function enableField(key) {
  const field = _getFieldByKey(key);
  if (field) field.disabled = false;
}

/**
 * Retrieves the label of a form field by its key.
 *
 * @param {string} key - The unique identifier for the form field.
 * @returns {(string|null)} The label of the field if found, otherwise null.
 */
function getLabel(key) {
  const field = _getFieldByKey(key);
  return field?.label;
}

/**
 * Retrieves the enumerated options array for a select/mulitselect field by its key.
 *
 * @param {string} key - The unique identifier for the field.
 * @returns {Array|undefined} The options array for the field, or undefined if not found.
 */
function getSelectOptions(key) {
  const field = _getFieldByKey(key);
  return field?.options;
}

/**
 * Retrieves the value associated with the specified key from the _tempFormValues object.
 *
 * @param {string} key - The key whose value should be retrieved.
 * @returns {*} The value associated with the given key, or undefined if the key does not exist.
 */
function getValue(key) {
  return get(_tempFormValues, key, undefined);
}

/**
 * Hides a form field by its key.
 *
 * @param {string} key - The unique identifier of the field to hide.
 */
function hideField(key) {
  const field = _getFieldByKey(key);
  if (field) field.showAlways = false;
}

/**
 * Show a form field by its key.
 *
 * @param {string} key - The unique identifier for the form field to show.
 */
function showField(key) {
  const field = _getFieldByKey(key);
  if (field) field.showAlways = true;
}

/**
 * Sets the label of a form field identified by the given key.
 *
 * @param {string} key - The unique identifier of the form field.
 * @param {string} label - The new label to assign to the form field.
 */
function setLabel(key, label) {
  const field = _getFieldByKey(key);
  if (field) field.label = label;
}

/**
 * Sets the enumerated options for a select field identified by the given key.
 *
 * @param {string} key - The unique identifier for the field whose options are to be set.
 * @param {Array} options - The array of options to assign to the select field.
 */
function setSelectOptions(key, options) {
  const field = _getFieldByKey(key);
  if (field) field.options = options;
}

/**
 * Sets the query filter for the options of a form field identified by the given key.
 * This only applies if the field is an object select/multiselect field
 *
 * @param {string} key - The unique identifier for the form field.
 * @param {*} filter - The filter to apply to the field's options.
 */
function setQueryFilter(key, filter) {
  const field = _getFieldByKey(key);
  if (field?.options) field.options.queryFilter = filter;
}

/**
 * Sets the value for a given key in the _tempFormValues object.
 *
 * @param {string} key - The key for which the value should be set.
 * @param {*} value - The value to assign to the specified key.
 */
function setValue(key, value) {
  set(_tempFormValues, key, value);
}

export const form = {
  disableField,
  enableField,
  getLabel,
  getValue,
  getSelectOptions,
  hideField,
  showField,
  setLabel,
  setQueryFilter,
  setSelectOptions,
  setValue,
  currentFieldValue: null,
  urlParams: null,
};

/**
 * Executes a given script in a Web Worker, providing form values and schema as variables.
 * Attempt to execute the script and return the potentially modified form values and schema.
 * Return an error if the script execution fails for any reason.
 */

// eslint-disable-next-line import/prefer-default-export
export function onmessage(e) {
  try {
    const { script, scriptVariables } = e.data;
    _setTempFormSchema(scriptVariables.formSchema);
    _setTempFormValues(scriptVariables.formValues);
    form.currentFieldValue = scriptVariables.newFieldValue;
    form.urlParams = new URLSearchParams(scriptVariables.windowSearch);

    // eslint-disable-next-line no-new-func
    const func = new Function('form', script);
    func(form);

    postMessage({ formValues: _tempFormValues, formSchema: _tempFormSchema });
  } catch (error) {
    postMessage({ error });
  }
}

global.onmessage = onmessage;
