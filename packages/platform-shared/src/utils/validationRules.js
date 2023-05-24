/**
 * Copyright (c) 2021-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* eslint-disable camelcase */
import { extend } from 'vee-validate';
import * as rules from 'vee-validate/dist/rules';
import * as customValidators from '@forgerock/platform-shared/src/utils/validators';
import dayjs from 'dayjs';

export function getRules(i18n) {
  const alpha = {
    ...rules.alpha,
    message: i18n.t('common.policyValidationMessages.alphaOnly'),
  };

  const alpha_dash = {
    ...rules.alpha_dash,
    message: i18n.t('common.policyValidationMessages.alphaNumericDashOnly'),
  };

  // Alphanumeric Dash Spaces rule
  // errors if input value contains characters not of alpha, numeric, dashes, or spaces
  const alpha_dash_spaces = {
    validate(value) {
      const regex = /^([A-Z]|[0-9]| |_|-)+$/ig;
      return regex.test(value);
    },
    message: i18n.t('common.policyValidationMessages.ALPHA_DASH'),
  };

  const alpha_num = {
    ...rules.alpha_num,
    message: i18n.t('common.policyValidationMessages.alphaNumericOnly'),
  };

  // Alphanumeric lowercase rule
  // errors if input value contains characters not of lowercase alpha or numeric
  const alpha_num_lower = {
    validate(value) {
      const regex = /^([a-z]|[0-9])+$/g;
      return regex.test(value);
    },
    message: i18n.t('common.policyValidationMessages.alphaNumericLowerCaseOnly'),
  };

  // Checkbox rule
  // added for certification
  const atLeastOneSelected = {
    params: ['checkbox'],
    validate(value, { checkbox }) {
      return value || checkbox;
    },
    message: i18n.t('common.policyValidationMessages.AT_LEAST_ONE_CHECKBOX'),
  };

  // Date rule
  // added for workflow
  const date_format = {
    validate(value) {
      return value.match(/^\d{2}[.//]\d{2}[.//]\d{4}$/);
    },
    message: i18n.t('common.policyValidationMessages.dateFormat'),
  };

  // Email rule
  // Errors if not valid email. Checks for array of emails and array of objects with value: email
  const email = {
    validate(value) {
      return customValidators.validEmail(value);
    },
    message: i18n.t('common.policyValidationMessages.VALID_EMAIL_ADDRESS_FORMAT'),
  };

  // Email from field rule
  // errors if input value contains characters not of
  // alpha, numeric, dashes, spaces, periods, single/double quotes
  const email_from = {
    validate(value) {
      const regex = /^([A-Z]|[0-9]| |_|-|'|"|\.)+$/ig;
      return regex.test(value);
    },
    message: i18n.t('common.policyValidationMessages.VALID_EMAIL_FROM_FORMAT'),
  };

  // Excluded rule
  // errors if input value matches the array of excluded strings
  const excluded = {
    ...rules.excluded,
    message: i18n.t('common.policyValidationMessages.excluded'),
  };

  /**
   * GCP managed certificate API rule
   * errors if input value does not contain a period, does not have alphanumeric as first char,
   * contains an uppercase character, or does not have alphanumeric after any period
   */
  const google_cloud_platform_certificate_validation = {
    validate(value) {
      const regex = /^(([a-z0-9]+|[a-z0-9][-a-z0-9]*[a-z0-9])\.)+[a-z][-a-z0-9]*[a-z0-9]$/g;
      return regex.test(value);
    },
    message: i18n.t('common.policyValidationMessages.LOWERCASE_PERIOD_REQUIRED'),
  };

  const isInteger = {
    ...rules.regex,
    message: i18n.t('common.validation.int'),
    validate: (value) => /^[0-9-.]*$/.test(value),
  };

  const isList = {
    ...rules.regex,
    message: i18n.t('common.validation.list'),
    validate: (value) => /^[-\w\S\D]+(?:,[-\w\S\D]*)*$/.test(value),
  };

  const isNumber = {
    ...rules.regex,
    message: i18n.t('common.validation.number'),
    validate: (value) => /^[0-9-.]*$/.test(value),
  };

  const max = {
    ...rules.max,
    message: i18n.t('common.policyValidationMessages.maxLength'),
  };

  const max_value = {
    ...rules.max_value,
    params: ['max', 'message'],
    message(field, params) {
      if (params.message) return params.message;
      return i18n.t('common.policyValidationMessages.MAX_VALUE', { max: params.max });
    },
  };

  // Minimum required rule
  // errors if input value's length is less than the input minimum number
  const minimumRequired = {
    params: ['minItems'],
    validate(value, { minItems }) {
      return customValidators.minimumItems(value, { minItems });
    },
    message(message, { minItems }) {
      return i18n.t('common.policyValidationMessages.MIN_ITEMS', { minItems });
    },
  };

  const numeric = {
    ...rules.numeric,
    message: i18n.t('common.policyValidationMessages.VALID_INT'),
  };

  const integer = {
    ...rules.integer,
    message: i18n.t('common.policyValidationMessages.VALID_INT'),
  };

  const oneOf = {
    ...rules.oneOf,
    message: i18n.t('common.policyValidationMessages.VALID_BOOLEAN'),
  };

  // Period required rule
  // errors if input value does not contain a period
  const period_required = {
    validate(value) {
      const regex = /.*\..*/g;
      return regex.test(value);
    },
    message: i18n.t('common.policyValidationMessages.PERIOD_REQUIRED'),
  };

  const required = {
    ...rules.required,
    message: i18n.t('common.policyValidationMessages.REQUIRED'),
  };

  // Start end space rule
  // errors if input value starts or ends with a space character
  const start_end_space = {
    validate(value) {
      const regex = /^ | $/ig;
      return !regex.test(value);
    },
    message: i18n.t('common.policyValidationMessages.noSpace'),
  };

  // Unique rule
  // errors if input value matches any of provided array of values
  const unique = {
    params: ['otherValues'],
    validate(value, { otherValues }) {
      return customValidators.testUniqueness(value, { otherValues });
    },
    message: i18n.t('common.policyValidationMessages.UNIQUE'),
  };

  const uniqueValue = {
    params: ['otherValues'],
    validate(value, { otherValues }) {
      if (!value || !value.value) return true;
      return customValidators.testUniqueness(value.value, { otherValues });
    },
    message: i18n.t('common.policyValidationMessages.UNIQUE'),
  };

  // error if the id of the email template matches an existing one
  const unique_email_template_id = {
    params: ['restricted', 'id'],
    validate(value, { restricted, id }) {
      return customValidators.testUniqueness(id, { otherValues: restricted });
    },
    message: i18n.t('common.policyValidationMessages.UNIQUE'),
  };

  // URL with path rule
  // Errors if not valid url or url does not have path
  const url_with_path = {
    validate(value) {
      return customValidators.urlWithPath(value, i18n);
    },
  };

  // URL without path rule
  // Errors if not valid url or if url has a path
  const url_without_path = {
    validate(value) {
      return customValidators.urlWithoutPath(value, i18n);
    },
  };

  // Rule to check whether url is valid
  const url = {
    validate(value) {
      return customValidators.url(value);
    },
  };

  // Rule to check for compatibility with ESV naming schema
  const lower_case_alpha_numeric_underscore_hyphen_only = {
    validate(value) {
      const regex = /^([a-z0-9_-])+$/g;
      return regex.test(value);
    },
    message: i18n.t('common.policyValidationMessages.lowerCaseAlphaNumericUnderscoreHyphenOnly'),
  };

  // check if a date is set to the future
  const is_after_date = {
    validate(value, { date }) {
      const dateValue = dayjs(value);
      const actualDate = dayjs(date);
      if (dateValue.isValid()) {
        return dateValue.isAfter(actualDate);
      }

      return true;
    },
    message(_field, params) {
      return i18n.t(params.message);
    },
    params: ['date', 'message'],
  };

  const is_before_date = {
    validate: (value, { date }) => {
      const startDate = dayjs(date);
      const endDate = dayjs(value);
      if (startDate.isValid() && endDate.isValid()) {
        return startDate.isBefore(endDate);
      }
      return false;
    },
    message(field, params) {
      if (params.message) return params.message;
      return i18n.t('common.policyValidationMessages.IS_BEFORE_DATE', { date: params.date });
    },
    params: ['date', 'message'],
  };

  // Rule to check if the value is valid JSON
  const json = {
    validate(value) {
      try {
        JSON.parse(value);
        return true;
      } catch (e) {
        return false;
      }
    },
    message: i18n.t('common.json.invalidJson'),
  };

  const single_spaces = {
    validate(value) {
      const regex = /[ ]{2,}/g;
      return !regex.test(value);
    },
    message: i18n.t('common.policyValidationMessages.singleSpaces'),
  };

  const validationRules = {
    alpha,
    alpha_dash,
    alpha_dash_spaces,
    alpha_num,
    alpha_num_lower,
    atLeastOneSelected,
    date_format,
    email,
    email_from,
    excluded,
    google_cloud_platform_certificate_validation,
    is_after_date,
    integer,
    isInteger,
    isList,
    isNumber,
    is_before_date,
    json,
    max,
    max_value,
    minimumRequired,
    numeric,
    oneOf,
    period_required,
    required,
    single_spaces,
    start_end_space,
    unique,
    unique_email_template_id,
    uniqueValue,
    url,
    url_with_path,
    url_without_path,
    lower_case_alpha_numeric_underscore_hyphen_only,
  };
  return validationRules;
}

/**
 * Add all rules in validationRules
 * @param {Object} validationRules contains vee-validate validation rules
 */
export function extendRules(validationRules) {
  Object.keys(validationRules).forEach((key) => {
    extend(key, validationRules[key]);
  });
}

export default { getRules, extendRules };
