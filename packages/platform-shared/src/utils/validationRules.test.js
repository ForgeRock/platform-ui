/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* eslint-disable camelcase */

import { getRules } from './validationRules';
import i18n from '../i18n';

describe('validation Rules', () => {
  it('should validate numeric single value', () => {
    const { numeric } = getRules(i18n);
    expect(numeric('123')).toBe(true);
    expect(numeric(123)).toBe(true);
    expect(numeric('a')).toBe('Value must be of type integer.');
  });

  it('should validate numeric multi value', () => {
    const { numeric } = getRules(i18n);
    expect(numeric(['1', '2', '3'])).toBe(true);
    expect(numeric([1, 2, 3])).toBe(true);
    expect(numeric([1, '2', 3])).toBe(true);
    expect(numeric([123, 'a'])).toBe('Value must be of type integer.');
  });

  it('should validate required single value', () => {
    const { required } = getRules(i18n);
    expect(required('test')).toBe(true);
    expect(required('')).toBe('Please provide a value');
  });

  it('should validate email', () => {
    const { email } = getRules(i18n);
    expect(email('test@example.com')).toBe(true);
    expect(email('invalid-email')).toBe('Invalid email format (example@example.com)');
  });

  it('should validate alpha', () => {
    const { alpha } = getRules(i18n);
    expect(alpha('abc')).toBe(true);
    expect(alpha('123')).toBe('Can only contain alphabetic characters');
  });

  it('should validate alpha_num', () => {
    const { alpha_num } = getRules(i18n);
    expect(alpha_num('abc123')).toBe(true);
    expect(alpha_num('abc!123')).toBe('Can only contain alphanumeric characters');
  });

  it('should validate max value', () => {
    const { max_value } = getRules(i18n);
    expect(max_value(5, { max: 10 })).toBe(true);
    expect(max_value(15, { max: 10 })).toBe('Must not be greater than 10');
  });

  it('should validate min value', () => {
    const { min_value } = getRules(i18n);
    expect(min_value(5, { min: 1 })).toBe(true);
    expect(min_value(0, { min: 1 })).toBe('Must not be less than 1');
  });

  it('should validate URL', () => {
    const { url } = getRules(i18n);
    expect(url('https://example.com')).toBe(true);
    expect(url('invalid-url')).toBe('Please provide a valid URL');
  });

  it('should validate alpha_dash', () => {
    const { alpha_dash } = getRules(i18n);
    expect(alpha_dash('abc-123')).toBe(true);
    expect(alpha_dash('abc_123')).toBe(true);
    expect(alpha_dash('abc!123')).toBe('Can only contain alphanumeric characters, dashes or underscores');
  });

  it('should validate alpha_dash_spaces', () => {
    const { alpha_dash_spaces } = getRules(i18n);
    expect(alpha_dash_spaces('abc-123')).toBe(true);
    expect(alpha_dash_spaces('abc 123')).toBe(true);
    expect(alpha_dash_spaces('abc!123')).toBe('Must only contain letters, numbers, spaces, hyphens and underscores');
  });

  it('should validate alpha_num_lower', () => {
    const { alpha_num_lower } = getRules(i18n);
    expect(alpha_num_lower('abc123')).toBe(true);
    expect(alpha_num_lower('ABC123')).toBe('Can only contain lower case alphanumeric characters');
  });

  it('should validate alpha_num_spaces', () => {
    const { alpha_num_spaces } = getRules(i18n);
    expect(alpha_num_spaces('abc 123')).toBe(true);
    expect(alpha_num_spaces('abc!123')).toBe('Must only contain letters, numbers, or spaces');
  });

  it('should validate alpha_num_under_comma', () => {
    const { alpha_num_under_comma } = getRules(i18n);
    expect(alpha_num_under_comma('abc_123,')).toBe(true);
    expect(alpha_num_under_comma('abc!123')).toBe('Must only contain letters, numbers, commas and underscores');
  });

  it('should validate date_format', () => {
    const { date_format } = getRules(i18n);
    expect(date_format('12/31/2020')[0]).toBe('12/31/2020');
    expect(date_format('31/12/2020')[0]).toBe('31/12/2020');
  });

  it('should validate json', () => {
    const { json } = getRules(i18n);
    expect(json('{"key": "value"}')).toBe(true);
    expect(json('invalid-json')).toBe('Invalid JSON');
  });

  it('should validate unique', () => {
    const { unique } = getRules(i18n);
    expect(unique('value', ['value1', 'value2'])).toBe(true);
    expect(unique('value1', ['value1', 'value2'])).toBe('Must be unique');
  });

  it('should validate regex', () => {
    const { regex } = getRules(i18n);
    expect(regex('abc123', { pattern: '^[a-z0-9]+$', message: 'Invalid format' })).toBe(true);
    expect(regex('abc!123', { pattern: '^[a-z0-9]+$', message: 'Invalid format' })).toBe('Invalid format');
  });

  it('should validate required single value', () => {
    const { required } = getRules(i18n);
    expect(required('test')).toBe(true);
    expect(required('')).toBe('Please provide a value');
  });

  it('should validate email', () => {
    const { email } = getRules(i18n);
    expect(email('test@example.com')).toBe(true);
    expect(email('invalid-email')).toBe('Invalid email format (example@example.com)');
  });

  it('should validate alpha', () => {
    const { alpha } = getRules(i18n);
    expect(alpha('abc')).toBe(true);
    expect(alpha('123')).toBe('Can only contain alphabetic characters');
  });

  it('should validate alpha_num', () => {
    const { alpha_num } = getRules(i18n);
    expect(alpha_num('abc123')).toBe(true);
    expect(alpha_num('abc!123')).toBe('Can only contain alphanumeric characters');
  });

  it('should validate max value', () => {
    const { max_value } = getRules(i18n);
    expect(max_value(5, { max: 10 })).toBe(true);
    expect(max_value(15, { max: 10 })).toBe('Must not be greater than 10');
  });

  it('should validate min value', () => {
    const { min_value } = getRules(i18n);
    expect(min_value(5, { min: 1 })).toBe(true);
    expect(min_value(0, { min: 1 })).toBe('Must not be less than 1');
  });

  it('should validate URL', () => {
    const { url } = getRules(i18n);
    expect(url('https://example.com')).toBe(true);
    expect(url('invalid-url')).toBe('Please provide a valid URL');
  });
});
