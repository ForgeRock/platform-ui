/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { findFieldNamesMatchingName, setFieldError } from './veeValidateUtils';

describe('veeValidateUtils tests', () => {
  describe('Setting errors', () => {
    it('calls the veeValidate setFieldErrors method when passed a fieldName matching one contained within the veeValidate values', () => {
      const veeValidateObject = {
        getValues: jest.fn().mockReturnValue({ 'testField-id-12345678': 'Hello there' }),
        setFieldError: jest.fn(),
      };

      setFieldError('testField', 'General Kenobi', veeValidateObject);

      expect(veeValidateObject.getValues).toHaveBeenCalledTimes(1);
      expect(veeValidateObject.setFieldError).toHaveBeenCalledTimes(1);
      expect(veeValidateObject.setFieldError).toHaveBeenCalledWith('testField-id-12345678', 'General Kenobi');
    });

    it('does not call the veeValidate setFieldErrors method when passed a fieldName that doesnt match any in the veeValidate values', () => {
      const veeValidateObject = {
        getValues: jest.fn().mockReturnValue({ 'testField-id-12345678': 'Wazz' }),
        setFieldError: jest.fn(),
      };

      setFieldError('otherField', 'Uppp', veeValidateObject);

      expect(veeValidateObject.getValues).toHaveBeenCalledTimes(1);
      expect(veeValidateObject.setFieldError).toHaveBeenCalledTimes(0);
    });
  });

  describe('Using the correct veeValidate property to find matching fields', () => {
    it('uses the veeValidate getValues method when available to find fields to match', () => {
      const veeValidateObject = {
        getValues: jest.fn().mockReturnValue({}),
        setFieldError: jest.fn(),
      };

      setFieldError('test', 'error', veeValidateObject);

      expect(veeValidateObject.getValues).toHaveBeenCalledTimes(1);
    });

    it('uses the veeValidate values property when available and the getValues method is not present to find fields to match', () => {
      const veeValidateObject = {
        values: { 'testField-id-0123': 'Hello there' },
        setFieldError: jest.fn(),
      };

      setFieldError('testField', 'General Kenobi', veeValidateObject);

      expect(veeValidateObject.setFieldError).toHaveBeenCalledTimes(1);
      expect(veeValidateObject.setFieldError).toHaveBeenCalledWith('testField-id-0123', 'General Kenobi');
    });
  });

  describe('Finding matching fields', () => {
    it('matches each field whos name starts with the passed fieldName or whos name exactly matches the passed field name', () => {
      const veeValidateValues = {
        'testField-id-0123': 'Hello there',
        'testField-id-abcd': 'General Kenobi',
        'otherField-id-1234': 'fighting ensues',
        testField: 'this is not the field you are looking for',
      };

      const foundNames = findFieldNamesMatchingName('testField', veeValidateValues);

      expect(foundNames).toStrictEqual([
        'testField-id-0123',
        'testField-id-abcd',
        'testField',
      ]);
    });
  });
});
