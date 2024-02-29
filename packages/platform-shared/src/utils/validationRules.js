/**
 * Copyright (c) 2021-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* eslint-disable camelcase */
import { defineRule } from 'vee-validate';
import * as rules from '@vee-validate/rules';
import * as customValidators from '@forgerock/platform-shared/src/utils/validators';
import dayjs from 'dayjs';

export function getRules(i18n) {
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

  // Allows alphanumeric, underscores and commas
  const alpha_num_under_comma = (value) => {
    const regex = /^([A-Z]|[0-9]|,|_)+$/ig;
    return regex.test(value) || i18n.global.t('common.policyValidationMessages.ALPHA_NUM_UNDER_COMMA');
  };

  // Date rule
  // added for workflow
  const date_format = (value) => value.match(/^\d{2}[.//]\d{2}[.//]\d{4}$/) || i18n.global.t('common.policyValidationMessages.dateFormat');

  // Email rule
  // Errors if not valid email. Checks for array of emails and array of objects with value: email
  const email = (value) => customValidators.validEmail(value) || i18n.global.t('common.policyValidationMessages.VALID_EMAIL_ADDRESS_FORMAT');

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

  const max = (value, params) => rules.max(value, params) || i18n.global.t('common.policyValidationMessages.maxLength');

  const max_value = (value, { max: maxValue, message }) => rules.max_value(value, { max: maxValue }) || message || i18n.global.t('common.policyValidationMessages.MAX_VALUE', { max: maxValue });

  const min_value = (value, { min, message }) => rules.min_value(value, { min }) || message || i18n.global.t('common.policyValidationMessages.MIN_VALUE', { min });

  // Minimum required rule
  // errors if input value's length is less than the input minimum number
  const minimumRequired = (value, params) => customValidators.minimumItems(value, params) || i18n.global.t('common.policyValidationMessages.MIN_ITEMS', { minItems: params.minItems });

  const numeric = (value) => rules.numeric(value) || i18n.global.t('common.policyValidationMessages.VALID_INT');

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
  const starts_with_case_insensitive = (value, { prefix }) => !value.toLowerCase().startsWith(prefix.toLowerCase()) || i18n.global.t('common.policyValidationMessages.NOT_STARTS_WITH', { prefix });

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

  const text_without_fragment = (value) => (Array.isArray(value) ? !value.some((element) => element.includes('#')) : !value.includes('#')) || i18n.global.t('common.policyValidationMessages.url_with_fragment');

  // Rule to check whether url is valid
  const url = (value) => customValidators.url(value);

  // Rule to check whether url, relative path or esv is valid in bookmark applications
  const validBookmarkUrl = (value) => customValidators.validBookmarkUrl(value) || i18n.global.t('common.policyValidationMessages.urlPathEsv');

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
    return !regex.test(value) || i18n.global.t('common.policyValidationMessages.whitespace');
  };

  const validationRules = {
    alpha,
    alpha_dash,
    alpha_dash_spaces,
    alpha_num,
    alpha_num_lower,
    alpha_num_under_comma,
    date_format,
    email,
    email_from,
    errorIfMatch,
    excluded,
    google_cloud_platform_certificate_validation,
    is_after_date,
    integer,
    isList,
    isNumber,
    is_before_date,
    json,
    max,
    max_value,
    min_value,
    minimumRequired,
    numeric,
    oneOf,
    period_required,
    required,
    single_spaces,
    start_end_space,
    starts_with_case_insensitive,
    text_without_fragment,
    unique,
    unique_email_template_id,
    uniqueValue,
    url,
    url_with_path,
    url_without_path,
    validBookmarkUrl,
    lower_case_alpha_numeric_underscore_hyphen_only,
    whitespace,
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
