/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/* eslint-disable indent */
import {
  createErrorId,
  createAriaDescribedByList,
  removeNonRoleAriaAttributes,
} from './accessibilityUtils';

describe('accessibilityUtils', () => {
  describe('createErrorId', () => {
    describe('should return empty string', () => {
      const testCases = [
        ['given false', false],
        ['given null', null],
        ['given undefined', undefined],
        ['given zero', 0],
        ['given negative zero', -0],
        ['given bigint', 0n],
        ['given NaN', NaN],
        ['given empty string', ''],
        ['given empty object', {}],
        ['given empty array', []],
      ];
      it.each(testCases)('%s', (name, fieldName) => {
        expect(createErrorId(fieldName)).toBe('');
      });
    });

    describe('should return error id', () => {
      const testCases = [
        ['given stub-field-name', 'stub-field-name', 'stub-field-name-error'],
        ['given stub field name', 'stub field name', 'stub-field-name-error'],
      ];
      it.each(testCases)('%s', (name, fieldName, expectedErrorId) => {
        const errorId = createErrorId(fieldName);

        expect(errorId).toBe(expectedErrorId);
      });
    });
  });

  describe('createAriaDescribedByList', () => {
    describe('should return false', () => {
      const testCases = [
        ['given false', false],
        ['given null', null],
        ['given undefined', undefined],
        ['given zero', 0],
        ['given negative zero', -0],
        ['given bigint', 0n],
        ['given NaN', NaN],
        ['given empty string', ''],
        ['given empty object', {}],
        ['given empty array', []],
      ];
      it.each(testCases)('%s', (name, errors) => {
        const ariaDescribedBy = createAriaDescribedByList(errors);

        expect(ariaDescribedBy).toBe(false);
      });
    });

    describe('should create aria-describedby', () => {
      const testCases = [
        ['given array', ['stub-first', 'stub-second'], 'stub-fieldname0-error stub-fieldname1-error'],
      ];
      it.each(testCases)('%s', (name, errors, expectedAriaDescribedBy) => {
        const ariaDescribedBy = createAriaDescribedByList('stub-fieldname', errors);

        expect(ariaDescribedBy).toBe(expectedAriaDescribedBy);
      });
    });
  });

  describe('removeNonRoleAriaAttributes', () => {
    it('should remove aria-label if no role is defined', () => {
      const attrs = {
        'aria-label': 'Test Label',
      };
      const newAttrs = removeNonRoleAriaAttributes(attrs);
      expect(newAttrs).not.toHaveProperty('aria-label');
    });

    it('should keep aria-label if role is defined', () => {
      const attrs = {
        role: 'button',
        'aria-label': 'Test Button',
      };
      const newAttrs = removeNonRoleAriaAttributes(attrs);
      expect(newAttrs).toHaveProperty('aria-label', 'Test Button');
    });

    it('should not modify attributes that do not have aria-label', () => {
      const attrs = {
        role: 'button',
        'data-test': 'test',
      };
      const newAttrs = removeNonRoleAriaAttributes(attrs);
      expect(newAttrs).toEqual(attrs);
    });

    it('should return an empty object if no attributes are provided', () => {
      const newAttrs = removeNonRoleAriaAttributes();
      expect(newAttrs).toEqual({});
    });
  });
});
