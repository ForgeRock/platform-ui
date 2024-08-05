/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* eslint-disable import/prefer-default-export */

/**
 * Obtains the field names relating to the passed name from the passed vee-validate values object
 * @param {String} name the base name to find matching field names for
 * @param {Object} veeValidateValues the vee-validate values object, whos keys are the names of fields in the current form
 * @returns {Array} an array of field names matching the passed name
 */
export const findFieldNamesMatchingName = (name, veeValidateValues) => {
  const relevantFields = Object.keys(veeValidateValues).reduce((fieldNames, fieldName) => {
    if (fieldName.startsWith(`${name}-id-`) || (fieldName === name && fieldName !== '')) {
      fieldNames.push(fieldName);
    }
    return fieldNames;
  }, []);
  return relevantFields;
};

/**
 * Replacement for using the vee-validate setFieldError method that will set errors for forms where we have appended uids to field names.
 * This works by checking the name specified by the top level component against the names vee-validate is aware of (which will have uids appended to them)
 * and applying the errors to be set to all fields that match (in practice this should always be just one field).
 * @param {String} fieldName the name the parent component passed to the Field component
 * @param {String} errorToSet the error that should be shown for the field
 * @param {Object} veeValidateObject the vee-validate instance for the form containing the relevant fields
 */
export const setFieldError = (fieldName, errorToSet, veeValidateObject) => {
  let formValues = {};
  if (veeValidateObject) {
    if (Object.prototype.hasOwnProperty.call(veeValidateObject, 'getValues')) {
      // The vee-validate form component exposes values through a method call
      formValues = veeValidateObject.getValues();
    } else if (Object.prototype.hasOwnProperty.call(veeValidateObject, 'values')) {
      // The vee-validate form composable exposes values through a reactive values property
      formValues = veeValidateObject.values;
    }
  }
  const fieldsToSetErrorFor = findFieldNamesMatchingName(fieldName, formValues);
  fieldsToSetErrorFor.forEach((field) => {
    veeValidateObject.setFieldError(field, errorToSet);
  });
};
