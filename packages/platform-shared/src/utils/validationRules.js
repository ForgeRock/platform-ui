/**
 * Copyright (c) 2021-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* eslint-disable camelcase */
import { defineRule } from 'vee-validate';
import * as rules from '@vee-validate/rules';
import * as customValidators from '@forgerock/platform-shared/src/utils/validators';
import dayjs from 'dayjs';
import { has } from 'lodash';
import { doesValueContainPlaceholder } from './esvUtils';

export function getRules(i18n) {
/**
 * Validates a value against custom rules and generates a descriptive message if the value is invalid.
 * @param {string} value - The value to be validated.
 * @param {string[]} customRules - An array of rule keys defining the allowed characters.
 * @returns {boolean|string} - Returns true if the value passes the validation, otherwise returns a descriptive message.
 */
  const allowedRules = (value, customRules) => {
    const ruleMapping = {
      alpha_lower: { regex: '[a-z]', name: i18n.global.t('common.policyValidationMessages.customValidation.alphaLower') },
      alpha_upper: { regex: '[A-Z]', name: i18n.global.t('common.policyValidationMessages.customValidation.alphaUpper') },
      alpha: { regex: '[a-zA-Z]', name: i18n.global.t('common.policyValidationMessages.customValidation.alphabetic') },
      hypen: { regex: '-', name: i18n.global.t('common.policyValidationMessages.customValidation.hypens') },
      numeric: { regex: '[0-9]', name: i18n.global.t('common.policyValidationMessages.customValidation.numeric') },
      period: { regex: '\\.', name: i18n.global.t('common.policyValidationMessages.customValidation.periods') },
      space: { regex: ' ', name: i18n.global.t('common.policyValidationMessages.customValidation.spaces') },
      under: { regex: '_', name: i18n.global.t('common.policyValidationMessages.customValidation.underscores') },
    };
    const regexParts = customRules.map((rule) => ruleMapping[rule].regex);
    const regex = new RegExp(`^(${regexParts.join('|')})+$`, 'g');
    const names = customRules.map((rule) => ruleMapping[rule].name);
    let ruleNames = names.join(', ');
    if (names.length > 1) {
      const lastName = names.pop();
      ruleNames = `${names.join(', ')}, and ${lastName}`;
    }
    return regex.test(value) || i18n.global.t('common.policyValidationMessages.customValidation.message', { ruleNames });
  };

  const alpha = (value) => rules.alpha(value) || i18n.global.t('common.policyValidationMessages.alphaOnly');

  const alpha_dash = (value) => rules.alpha_dash(value) || i18n.global.t('common.policyValidationMessages.alphaNumericDashOnly');

  // Alphanumeric Dash Spaces rule
  // errors if input value contains characters not of alpha, numeric, dashes, or spaces
  const alpha_dash_spaces = (value) => {
    const regex = /^([A-Z]|[0-9]| |_|-)+$/ig;
    return regex.test(value) || i18n.global.t('common.policyValidationMessages.ALPHA_DASH');
  };

  const alpha_num = (value) => rules.alpha_num(value) || i18n.global.t('common.policyValidationMessages.alphaNumericOnly');

  // Alphanumeric lowercase rule
  // errors if input value contains characters not of lowercase alpha or numeric
  const alpha_num_lower = (value) => {
    const regex = /^([a-z]|[0-9])+$/g;
    return regex.test(value) || i18n.global.t('common.policyValidationMessages.alphaNumericLowerCaseOnly');
  };

  // Allows alphanumeric, spaces
  const alpha_num_spaces = (value) => {
    const regex = /^([A-Z]|[0-9]| )+$/ig;
    return regex.test(value) || i18n.global.t('common.policyValidationMessages.ALPHA_NUM_SPACES');
  };

  // Allows alphanumeric, underscores and commas
  const alpha_num_under_comma = (value) => {
    const regex = /^([A-Z]|[0-9]|,|_)+$/ig;
    return regex.test(value) || i18n.global.t('common.policyValidationMessages.ALPHA_NUM_UNDER_COMMA');
  };

  // Bundle version rules for the applications connector, written a min_version
  // errors if input value contains characters not of
  // numeric and periods
  const connector_bundle_version = (value) => value.match(/^[1].[5](.(0|[1-9][0-9]?)){2}$/g) || i18n.global.t('common.policyValidationMessages.connectorBundleVersion');

  // Date rule
  // added for workflow
  const date_format = (value) => value.match(/^\d{2}[.//]\d{2}[.//]\d{4}$/) || i18n.global.t('common.policyValidationMessages.dateFormat');

  // Email rule
  // Errors if not valid email. Checks for array of emails and array of objects with value: email
  const email = (value) => customValidators.validEmail(value) || i18n.global.t('common.policyValidationMessages.VALID_EMAIL_ADDRESS_FORMAT');

  // Rule to check whether email address or esv is valid
  const email_or_esv = async (value) => {
    if (!doesValueContainPlaceholder(value)) {
      return customValidators.validEmail(value) || i18n.global.t('common.policyValidationMessages.VALID_EMAIL_ADDRESS_FORMAT');
    }
    const isValidESV = await customValidators.isValidESV(value);
    return isValidESV || i18n.global.t('common.policyValidationMessages.validEsv');
  };

  // Email from field rule
  // errors if input value contains characters not of
  // alpha, numeric, dashes, spaces, periods, single/double quotes
  const email_from = (value) => {
    const regex = /^([A-Z]|[0-9]| |_|-|'|"|\.)*$/ig;
    return regex.test(value) || i18n.global.t('common.policyValidationMessages.VALID_EMAIL_FROM_FORMAT');
  };

  // Excluded rule
  // errors if input value matches the array of excluded strings
  const excluded = (value, list) => rules.not_one_of(value, list) || i18n.global.t('common.policyValidationMessages.excluded');

  /**
   * GCP managed certificate API rule
   * errors if input value does not contain a period, does not have alphanumeric as first char,
   * contains an uppercase character, or does not have alphanumeric after any period
   */
  const google_cloud_platform_certificate_validation = (value) => {
    const regex = /^(([a-z0-9]+|[a-z0-9][-a-z0-9]*[a-z0-9])\.)+[a-z][-a-z0-9]*[a-z0-9]$/g;
    return regex.test(value) || i18n.global.t('common.policyValidationMessages.LOWERCASE_PERIOD_REQUIRED');
  };

  const isList = (value) => /^[-\w\S\D]+(?:,[-\w\S\D]*)*$/.test(value) || i18n.global.t('common.validation.list');

  const isNumber = (value) => /^[0-9-.]*$/.test(value) || i18n.global.t('common.validation.number');

  const max = (value, params) => rules.max(value, params) || i18n.global.t('common.policyValidationMessages.maxLength', { length: params[0] });

  const max_value = (value, { max: maxValue, message }) => rules.max_value(value, { max: maxValue }) || message || i18n.global.t('common.policyValidationMessages.MAX_VALUE', { max: maxValue });

  const min_value = (value, { min, message }) => rules.min_value(value, { min }) || message || i18n.global.t('common.policyValidationMessages.MIN_VALUE', { min });

  // Minimum required rule
  // errors if input value's length is less than the input minimum number
  const minimumRequired = (value, params) => customValidators.minimumItems(value, params) || i18n.global.t('common.policyValidationMessages.MIN_ITEMS', { minItems: params.minItems });

  const numeric = (value) => {
    let valid = true;
    if (Array.isArray(value)) {
      value.forEach((singleValue) => {
        // validates { value: 123 } or 123
        if (singleValue.value ? !rules.numeric(singleValue.value) : !rules.numeric(singleValue)) {
          valid = false;
        }
      });
    } else {
      valid = rules.numeric(value);
    }
    return valid || i18n.global.t('common.policyValidationMessages.VALID_INT');
  };

  const integer = (value) => rules.integer(value) || i18n.global.t('common.validation.int');

  const oneOf = (value, list) => rules.one_of(value, list) || i18n.global.t('common.policyValidationMessages.VALID_BOOLEAN');

  // Period required rule
  // errors if input value does not contain a period
  const period_required = (value) => {
    const regex = /.*\..*/g;
    return regex.test(value) || i18n.global.t('common.policyValidationMessages.PERIOD_REQUIRED');
  };

  const required = (value) => rules.required(value) || i18n.global.t('common.policyValidationMessages.REQUIRED');

  // Start end space rule
  // errors if input value starts or ends with a space character
  const start_end_space = (value) => {
    const regex = /^ | $/ig;
    return !regex.test(value) || i18n.global.t('common.policyValidationMessages.noSpace');
  };

  // Unique rule
  // errors if input value matches any of provided array of values
  const unique = (value, otherValues) => customValidators.testUniqueness(value, { otherValues }) || i18n.global.t('common.policyValidationMessages.UNIQUE');

  // Error Match rule
  // errors if input value matches any of provided array of values
  const errorIfMatch = (value, otherValues) => customValidators.testUniqueness(value, { otherValues }) || i18n.global.t('common.policyValidationMessages.NOT_ALLOWED_VALUE');

  // Starts with rule
  // errors if input starts with same provided prefix value
  const not_starts_with_case_insensitive = (value, { prefix }) => !value.toLowerCase().startsWith(prefix.toLowerCase()) || i18n.global.t('common.policyValidationMessages.NOT_STARTS_WITH', { prefix });

  // errors if the input does NOT start with the provided prefix
  const starts_with_case_insensitive = (value, { prefix }) => value.toLowerCase().startsWith(prefix.toLowerCase()) || i18n.global.t('common.policyValidationMessages.STARTS_WITH', { prefix });

  const not_starts_with_number = (value) => {
    const regex = /^[0-9].*$/;
    return !regex.test(value) || i18n.global.t('common.policyValidationMessages.notStartsWithNumber');
  };

  const uniqueValue = (value, otherValues) => {
    if (!value || !value.value) return true;
    return customValidators.testUniqueness(value.value, { otherValues }) || i18n.global.t('common.policyValidationMessages.UNIQUE');
  };

  // error if the id of the email template matches an existing one
  const unique_email_template_id = (value, { restricted, id }) => customValidators.testUniqueness(id, { otherValues: restricted }) || i18n.global.t('common.policyValidationMessages.UNIQUE');

  // URL with path rule
  // Errors if not valid url or url does not have path
  const url_with_path = (value) => customValidators.urlWithPath(value, i18n);

  // URL without path rule
  // Errors if not valid url or if url has a path
  const url_without_path = (value) => customValidators.urlWithoutPath(value, i18n);

  // URL domain only rule
  // Errors if is not a valid url or contains any element beyond the basic domain name
  const url_domain_only = (value) => customValidators.urlDomainOnly(value, i18n);

  const text_without_fragment = (value) => (Array.isArray(value) ? !value.some((element) => element.includes('#')) : !value.includes('#')) || i18n.global.t('common.policyValidationMessages.url_with_fragment');

  // Rule to check whether url is valid
  const url = (value) => (value ? customValidators.url(value, i18n) : i18n.global.t('common.policyValidationMessages.url'));

  // Rule to check whether url, relative path or esv is valid in bookmark applications
  const validBookmarkUrl = async (value) => {
    if (!value) {
      return i18n.global.t('common.policyValidationMessages.urlPathEsv');
    }
    if (!doesValueContainPlaceholder(value)) {
      return customValidators.validBookmarkUrl(value) || i18n.global.t('common.policyValidationMessages.urlPathEsv');
    }
    const isValidESV = await customValidators.isValidESV(value);
    return isValidESV || i18n.global.t('common.policyValidationMessages.validEsv');
  };

  // Rule to check for compatibility with ESV naming schema
  const lower_case_alpha_numeric_underscore_hyphen_only = (value) => {
    const regex = /^([a-z0-9_-])+$/g;
    return regex.test(value) || i18n.global.t('common.policyValidationMessages.lowerCaseAlphaNumericUnderscoreHyphenOnly');
  };

  // check if a date is set to the future
  const is_after_date = (value, { date, message }) => {
    const dateValue = dayjs(value);
    const actualDate = dayjs(date);
    if (dateValue.isValid()) {
      return dateValue.isAfter(actualDate) || i18n.global.t(message);
    }
    return true;
  };

  const is_before_date = (value, { date, message }) => {
    const startDate = dayjs(date);
    const endDate = dayjs(value);
    const result = startDate.isValid() && endDate.isValid() && startDate.isBefore(endDate);
    return result || message || i18n.global.t('common.policyValidationMessages.IS_BEFORE_DATE', { date });
  };

  // Rule to check if the value is valid JSON
  const json = (value) => {
    try {
      JSON.parse(value);
      return true;
    } catch (e) {
      return i18n.global.t('common.json.invalidJson');
    }
  };

  const single_spaces = (value) => {
    const regex = /[ ]{2,}/g;
    return !regex.test(value) || i18n.global.t('common.policyValidationMessages.singleSpaces');
  };

  const whitespace = (value) => {
    const regex = /(.*)(\s+)(.*)/g;
    if (Array.isArray(value)) {
      let valid = true;
      value.forEach((arrayValue) => {
        // Checks if value is a Vue Ref
        if (has(arrayValue, 'value')) {
          valid = valid && !regex.test(arrayValue.value);
        } else {
          valid = valid && !regex.test(arrayValue);
        }
      });
      return valid || i18n.global.t('common.policyValidationMessages.whitespace');
    }
    // Checks if value is a Vue Ref
    if (has(value, 'value')) {
      return !regex.test(value.value) || i18n.global.t('common.policyValidationMessages.whitespace');
    }
    return !regex.test(value) || i18n.global.t('common.policyValidationMessages.whitespace');
  };

  // Rule to check for a valid js variable name declaration
  const valid_js_variable_name = (value) => {
    // ^ = Match the beginning
    // [_$a-zA-Z] = Match either underscore, $ or a-z (ignoring case) at the beginning
    // \w$* = Match zero or more word or $ characters after the beginning
    // $ = till the end
    const regex = /^[_$a-zA-Z][\w$]*$/;
    return regex.test(value) || i18n.global.t('common.policyValidationMessages.validJSVariable');
  };

  const regex = (value, { pattern, message }) => {
    const customRegex = new RegExp(pattern);
    return customRegex.test(value) || message;
  };

  /**
   *
   * @param {*} computedVal - a numeric value to compare
   * @param {*} maxVal - a numeric value to compare
   * @param {*} message - custom message to display
   * @returns {boolean|string} - Returns true if the value passes the validation, otherwise returns a descriptive message.
   */
  const max_value_comparison = (_, { computedVal, maxVal, message }) => computedVal <= maxVal || message;

  // Secret label identifiers must only contain a-z, A-Z, 0-9 and ., they cannot
  // start or end with .
  const secret_label_identifier = (value) => /^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*$/.test(value) || i18n.global.t('common.policyValidationMessages.secretLabelIdentifier');

  const check_form_row_width = (fields) => fields.reduce((acc, field) => acc + field.columns + field.offset, 0) <= 12 || i18n.global.t('common.policyValidationMessages.formRowOversized');

  const validationRules = {
    allowedRules,
    alpha_dash_spaces,
    alpha_dash,
    alpha_num_lower,
    alpha_num_spaces,
    alpha_num_under_comma,
    alpha_num,
    alpha,
    check_form_row_width,
    connector_bundle_version,
    date_format,
    email,
    email_from,
    email_or_esv,
    errorIfMatch,
    excluded,
    google_cloud_platform_certificate_validation,
    integer,
    is_after_date,
    is_before_date,
    isList,
    isNumber,
    json,
    lower_case_alpha_numeric_underscore_hyphen_only,
    max_value,
    max,
    min_value,
    minimumRequired,
    not_starts_with_case_insensitive,
    not_starts_with_number,
    numeric,
    oneOf,
    period_required,
    regex,
    required,
    secret_label_identifier,
    single_spaces,
    start_end_space,
    starts_with_case_insensitive,
    text_without_fragment,
    unique_email_template_id,
    unique,
    uniqueValue,
    url_domain_only,
    url_with_path,
    url_without_path,
    url,
    valid_js_variable_name,
    validBookmarkUrl,
    whitespace,
    max_value_comparison,
  };
  return validationRules;
}

/**
 * Add all rules in validationRules
 * @param {Object} validationRules contains vee-validate validation rules
 */
export function extendRules(validationRules) {
  Object.keys(validationRules).forEach((key) => {
    defineRule(key, validationRules[key]);
  });
}

export default { getRules, extendRules };
