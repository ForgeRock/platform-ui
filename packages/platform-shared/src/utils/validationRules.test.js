/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import i18n from '@/i18n';
import { getRules } from './validationRules';
import * as esvApi from '../../../platform-admin/src/api/EsvApi';

let rules;
beforeEach(() => {
  rules = getRules(i18n);
});

describe('numeric validators', () => {
  it('should validate rules.numeric single value', () => {
    expect(rules.numeric('123')).toBe(true);
    expect(rules.numeric(123)).toBe(true);
    expect(rules.numeric('a')).toBe('Value must be of type integer.');
  });

  it('should validate rules.numeric multi value', () => {
    expect(rules.numeric(['1', '2', '3'])).toBe(true);
    expect(rules.numeric([1, 2, 3])).toBe(true);
    expect(rules.numeric([1, '2', 3])).toBe(true);
    expect(rules.numeric([123, 'a'])).toBe('Value must be of type integer.');
  });
});

describe('allowedRules validators', () => {
  it('should return true when correct value is passed', async () => {
    const result = await rules.allowedRules('abcd', ['alpha', 'numeric', 'under', 'period', 'hypen']);
    expect(result).toBe(true);
  });

  it('should return corresponding error message when value passed does not qualify the allowed rules', async () => {
    const result = await rules.allowedRules('*** %', ['alpha_upper', 'period', 'hypen']);
    expect(result).toBe('Can only contain upper case alphabetic characters, periods, and hypens.');
  });
});

describe('email_or_esv validators', () => {
  it('should return true when valid esv variable is passed as params', async () => {
    const getVariableSpy = jest.spyOn(esvApi, 'getVariable').mockResolvedValue({ data: true, status: 200 });
    const result = await rules.email_or_esv('&{esv.test.success}');
    expect(getVariableSpy).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('should return corresponding error message when value passed does not match the regex pattern for ESV', async () => {
    const result = await rules.email_or_esv('test123');
    expect(result).toBe('Invalid email format (example@example.com)');
  });

  it('should validate email', () => {
    expect(rules.email('test@example.com')).toBe(true);
    expect(rules.email('invalid-email')).toBe('Invalid email format (example@example.com)');
  });

  it('should return true when value passed does not match the regex pattern for ESV and is a valid input', async () => {
    const result = await rules.email_or_esv('test@gmail.com');
    expect(result).toBe(true);
  });
});

describe('email_from validators', () => {
  it('should return true when correct value is passed as params', async () => {
    const result = await rules.email_from('test');
    expect(result).toBe(true);
  });

  it('should return corresponding error message when invalid value is passed as params', async () => {
    const result = await rules.email_from('@@#test');
    expect(result).toBe('Must only contain letters, numbers, spaces, hyphens, underscores, quotes, periods');
  });
});

describe('google_cloud_platform_certificate_validation validators', () => {
  it('should return corresponding error message when the value passed is not in the required format', () => {
    const result = rules.google_cloud_platform_certificate_validation('test');
    expect(result).toBe('Must be lowercase alphanumeric and contain at least one period in format domain.com');
  });

  it('should return corresponding error message when the value passed does not meet the required format', () => {
    const result = rules.google_cloud_platform_certificate_validation('www.domain.');
    expect(result).toBe('Must be lowercase alphanumeric and contain at least one period in format domain.com');
  });
});

describe('period_required validators', () => {
  it('should true when the value passed contains at least one period', () => {
    const result = rules.period_required('test.com');
    expect(result).toBe(true);
  });

  it('should return corresponding error message when the value passed is in the required format', () => {
    const result = rules.period_required('test123');
    expect(result).toBe('Must contain at least one period character');
  });
});

describe('is_valid_esv_variable validators', () => {
  it('should return true when correct value is not passed', async () => {
    const result = await rules.is_valid_esv_variable('abcd');
    expect(result).toBe(true);
  });

  it('should return true when valid esv variable is passed as params', async () => {
    const getVariableSpy = jest.spyOn(esvApi, 'getVariable').mockResolvedValue({ data: true, status: 200 });
    const result = await rules.is_valid_esv_variable('&{esv.test.success}');
    expect(getVariableSpy).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('should return error message when invalid esv variable is passed as params', async () => {
    const getVariableSpy = jest.spyOn(esvApi, 'getVariable').mockResolvedValue({ data: false, status: 401 });
    const result = await rules.is_valid_esv_variable('&{esv.test.failure}');
    expect(getVariableSpy).toHaveBeenCalled();
    expect(result).toBe('Please provide a valid ESV variable');
  });
});

describe('valid_js_variable_name validators', () => {
  it('should return true when the value matches the correct regex pattern', () => {
    const result = rules.valid_js_variable_name('test123');
    expect(result).toBe(true);
  });

  it('should return proper error message when the value does not pass the regex pattern', () => {
    const result = rules.valid_js_variable_name('  %');
    expect(result).toBe('Must be a valid variable name');
  });
});

describe('json validators', () => {
  const jsonObj = {
    name: 'test',
    active: true,
  };

  it('should return true when the value is a proper json', () => {
    const result = rules.json(JSON.stringify(jsonObj));
    expect(result).toBe(true);
  });

  it('should return proper error message when the value is not in the proper json format', () => {
    const result = rules.json('test');
    expect(result).toBe('Invalid JSON');
  });
  it('should validate json', () => {
    expect(rules.json('{"key": "value"}')).toBe(true);
    expect(rules.json('invalid-json')).toBe('Invalid JSON');
  });
});

describe('regex patterns validators', () => {
  it('should return custom error message when the validation fails', () => {
    const regexPattern = {
      pattern: '/^([a-z0-9_-])+$/g',
      message: 'Custom Error Message',
    };
    const result = rules.regex('Test string', regexPattern);
    expect(result).toBe(regexPattern.message);
  });

  it('should validate regex', () => {
    expect(rules.regex('abc123', { pattern: '^[a-z0-9]+$', message: 'Invalid format' })).toBe(true);
    expect(rules.regex('abc!123', { pattern: '^[a-z0-9]+$', message: 'Invalid format' })).toBe('Invalid format');
  });
});

describe('alpha_dash_spaces validators', () => {
  it('should return true when the validation fails', () => {
    const result = rules.alpha_dash_spaces('Test string');
    expect(result).toBe(true);
  });

  it('should return custom error message when the validation fails', () => {
    const result = rules.alpha_dash_spaces('&12 Test string');
    expect(result).toBe('Must only contain letters, numbers, spaces, hyphens and underscores');
  });
});

describe('alpha_num_lower validators', () => {
  it('should return custom error message when value contains any uppercase letter', () => {
    const result = rules.alpha_num_lower('Test string');
    expect(result).toBe('Can only contain lower case alphanumeric characters');
  });

  it('should return custom error message when the value contains any special characters', () => {
    const result = rules.alpha_num_lower('&12 Test string');
    expect(result).toBe('Can only contain lower case alphanumeric characters');
  });

  it('should return true when the value contains only lowercase characters', () => {
    const result = rules.alpha_num_lower('string');
    expect(result).toBe(true);
  });
});

describe('alpha_num_under_comma validators', () => {
  it('should return corresponding error message when the value contains non-allowed characters', () => {
    const result = rules.alpha_num_under_comma('test string');
    expect(result).toBe('Must only contain letters, numbers, commas and underscores');
  });
  it('should return true when the value contains all the allowed characters', () => {
    const result = rules.alpha_num_under_comma('test123');
    expect(result).toBe(true);
  });
});

describe('single_spaces validators', () => {
  it('should return true when the value contains only single space', () => {
    const result = rules.single_spaces('Test string');
    expect(result).toBe(true);
  });

  it('should return proper error message when the value contains more than one single spaces', () => {
    const result = rules.single_spaces('Test   string');
    expect(result).toBe('Multiple spaces prohibited');
  });
});

describe('whitespace validators', () => {
  it('should return true when the value is an array of string without spaces', () => {
    const result = rules.whitespace(['string1', 'tring2', 'string3']);
    expect(result).toBe(true);
  });

  it('should return true when the value is an array of object with value attribute', () => {
    const result = rules.whitespace([{
      value: 'string1',
    }, {
      value: 'string2',
    }]);
    expect(result).toBe(true);
  });

  it('should return proper error message when the value is an array of object with value attribute having space characters', () => {
    const result = rules.whitespace([{
      value: 'test string1',
    }, {
      value: 'test string2',
    }]);
    expect(result).toBe('Space characters prohibited');
  });

  it('should return proper error message when the value is an array of string containing spaces', () => {
    const result = rules.whitespace(['Test string1', 'Test string2', 'Test string3']);
    expect(result).toBe('Space characters prohibited');
  });

  it('should return proper error message when the value is an object with value attribute having value with space characters', () => {
    const result = rules.whitespace({
      value: 'Test string1',
    });
    expect(result).toBe('Space characters prohibited');
  });

  it('should return true when the value is an object with value attribute having value with no space characters', () => {
    const result = rules.whitespace({
      name: 'test',
      value: 'string1',
    });
    expect(result).toBe(true);
  });

  it('should return proper error message when the value contains a string with space characters', () => {
    const result = rules.whitespace('Test string1');
    expect(result).toBe('Space characters prohibited');
  });

  it('should return true when the value contains a string with space characters', () => {
    const result = rules.whitespace('string1');
    expect(result).toBe(true);
  });
});

describe('not_starts_with_number validators', () => {
  it('should return true when the value does not starts with a number', () => {
    const result = rules.not_starts_with_number('string1');
    expect(result).toBe(true);
  });

  it('should return corresponding error message when the value starts with a number', () => {
    const result = rules.not_starts_with_number('123string1');
    expect(result).toBe('Cannot start with a number');
  });
});

describe('start_end_space validators', () => {
  it('should return corresponding error message when the value starts with a space', () => {
    const result = rules.start_end_space('  123string1');
    expect(result).toBe('Cannot start or end with the space character');
  });

  it('should return corresponding error message when the value ends with a space', () => {
    const result = rules.start_end_space('123test   ');
    expect(result).toBe('Cannot start or end with the space character');
  });

  it('should return true when the value does not starts or ends with a space', () => {
    const result = rules.start_end_space('123 test');
    expect(result).toBe(true);
  });
});

describe('validBookmarkUrl validators', () => {
  it('should return corresponding error message when passed as params contains an empty value', async () => {
    const result = await rules.validBookmarkUrl(null);
    expect(result).toBe('Must be an absolute url, relative url beginning with /, or a valid ESV in the format &{esv.url}');
  });

  it('should return true when valid esv variable is passed as params', async () => {
    const getVariableSpy = jest.spyOn(esvApi, 'getVariable').mockResolvedValue({ data: true, status: 200 });
    const result = await rules.validBookmarkUrl('&{esv.test.success}');
    expect(getVariableSpy).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('should not trigger getSecret even when value is not present in the ESV variable list', async () => {
    const getVariableSpy = jest.spyOn(esvApi, 'getVariable').mockResolvedValue({ data: false, status: 401 });
    const getSecretSpy = jest.spyOn(esvApi, 'getSecret').mockResolvedValue({ data: true, status: 200 });
    const result = await rules.validBookmarkUrl('&{esv.test.secret}');
    expect(getVariableSpy).toHaveBeenCalled();
    expect(getSecretSpy).not.toHaveBeenCalled();
    expect(result).toBe('Please provide a valid ESV variable');
  });

  it('should return error message when the passed in value is not in correct format', async () => {
    const result = await rules.validBookmarkUrl('abcd');
    expect(result).toBe('Must be an absolute url, relative url beginning with /, or a valid ESV in the format &{esv.url}');
  });
});

describe('uniqueValue validators', () => {
  it('should return true when value is not present', () => {
    const result = rules.uniqueValue();
    expect(result).toBe(true);
  });
  it('should return true when value object does not have value attribute', () => {
    const result = rules.uniqueValue({
      name: 'test',
    });
    expect(result).toBe(true);
  });
  it('should return corresponding error message when valid params object are passed', () => {
    const result = rules.uniqueValue({
      value: 'test',
    }, 'test');
    expect(result).toBe('Must be unique');
  });
});

describe('lower_case_alpha_numeric_underscore_hyphen_only validators', () => {
  it('should return true when value is not present', () => {
    const result = rules.lower_case_alpha_numeric_underscore_hyphen_only();
    expect(result).toBe(true);
  });

  it('should return corresponding error message when value is not in the correct format', () => {
    const result = rules.lower_case_alpha_numeric_underscore_hyphen_only('%$ **');
    expect(result).toBe('Can only contain lowercase a-z, 0-9, underscores and hyphens');
  });

  it('should return true when a valid value is passed as params', () => {
    const result = rules.lower_case_alpha_numeric_underscore_hyphen_only('test123');
    expect(result).toBe(true);
  });
});

describe('is_after_date validator', () => {
  it('should return true when date validation passes', () => {
    const result = rules.is_after_date('2033-01-01', {
      date: '2025-03-27',
      message: 'Date is after the current date',
    });
    expect(result).toBe(true);
  });

  it('should return corresponding error message if date validation fails', () => {
    const result = rules.is_after_date('2024-01-01', {
      date: '2025-03-27',
      message: 'Selected date is greater than the current date',
    });
    expect(result).toBe('Selected date is greater than the current date');
  });
});

describe('is_before_date validator', () => {
  it('should return true when date validation passes', () => {
    const result = rules.is_before_date('2033-01-01', {
      date: '2025-03-27',
      message: 'Date is after the current date',
    });
    expect(result).toBe(true);
  });

  it('should return corresponding error message if date validation fails', () => {
    const result = rules.is_before_date('2024-01-01', {
      date: '2025-03-27',
      message: 'Selected date is smaller than the current date',
    });
    expect(result).toBe('Selected date is smaller than the current date');
  });
});

describe('other validation Rules', () => {
  it('should validate required single value', () => {
    expect(rules.required('test')).toBe(true);
    expect(rules.required('')).toBe('Please provide a value');
  });

  it('should validate alpha', () => {
    expect(rules.alpha('abc')).toBe(true);
    expect(rules.alpha('123')).toBe('Can only contain alphabetic characters');
  });

  it('should validate alpha_num', () => {
    expect(rules.alpha_num('abc123')).toBe(true);
    expect(rules.alpha_num('abc!123')).toBe('Can only contain alphanumeric characters');
  });

  it('should validate max value', () => {
    expect(rules.max_value(5, { max: 10 })).toBe(true);
    expect(rules.max_value(15, { max: 10 })).toBe('Must not be greater than 10');
  });

  it('should validate min value', () => {
    expect(rules.min_value(5, { min: 1 })).toBe(true);
    expect(rules.min_value(0, { min: 1 })).toBe('Must not be less than 1');
  });

  it('should validate URL', () => {
    expect(rules.url('https://example.com')).toBe(true);
    expect(rules.url('invalid-url')).toBe('Please provide a valid URL');
  });

  it('should validate alpha_dash', () => {
    expect(rules.alpha_dash('abc-123')).toBe(true);
    expect(rules.alpha_dash('abc_123')).toBe(true);
    expect(rules.alpha_dash('abc!123')).toBe('Can only contain alphanumeric characters, dashes or underscores');
  });

  it('should validate alpha_dash_spaces', () => {
    expect(rules.alpha_dash_spaces('abc-123')).toBe(true);
    expect(rules.alpha_dash_spaces('abc 123')).toBe(true);
    expect(rules.alpha_dash_spaces('abc!123')).toBe('Must only contain letters, numbers, spaces, hyphens and underscores');
  });

  it('should validate alpha_num_lower', () => {
    expect(rules.alpha_num_lower('abc123')).toBe(true);
    expect(rules.alpha_num_lower('ABC123')).toBe('Can only contain lower case alphanumeric characters');
  });

  it('should validate alpha_num_spaces', () => {
    expect(rules.alpha_num_spaces('abc 123')).toBe(true);
    expect(rules.alpha_num_spaces('abc!123')).toBe('Must only contain letters, numbers, or spaces');
  });

  it('should validate alpha_num_under_comma', () => {
    expect(rules.alpha_num_under_comma('abc_123,')).toBe(true);
    expect(rules.alpha_num_under_comma('abc!123')).toBe('Must only contain letters, numbers, commas and underscores');
  });

  it('should validate date_format', () => {
    expect(rules.date_format('12/31/2020')[0]).toBe('12/31/2020');
    expect(rules.date_format('31/12/2020')[0]).toBe('31/12/2020');
  });

  it('should validate unique', () => {
    const { unique } = getRules(i18n);
    expect(unique('value', ['value1', 'value2'])).toBe(true);
    expect(unique('value1', ['value1', 'value2'])).toBe('Must be unique');
  });
});
