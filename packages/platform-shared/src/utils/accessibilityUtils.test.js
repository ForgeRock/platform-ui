/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import {
  createErrorId,
  createAriaDescribedByList,
  hasInteractiveContent,
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

  describe('hasInteractiveContent', () => {
    describe('should return false', () => {
      const testCases = [
        ['given null', null],
        ['given undefined', undefined],
        ['given false', false],
        ['given a number', 42],
        ['given an empty string', ''],
        ['given plain text with no elements', 'Just some plain text'],
        ['given an anchor without href', '<a>not a link</a>'],
        ['given a disabled button', '<button disabled>Click</button>'],
        ['given a hidden input', '<input type="hidden" value="secret">'],
        ['given a disabled input', '<input type="text" disabled>'],
        ['given a disabled select', '<select disabled><option>opt</option></select>'],
        ['given a disabled textarea', '<textarea disabled></textarea>'],
        ['given tabindex="-1"', '<div tabindex="-1">not in tab order</div>'],
        ['given contenteditable="false"', '<div contenteditable="false">not editable</div>'],
        ['given audio without controls', '<audio src="test.mp3"></audio>'],
        ['given video without controls', '<video src="test.mp4"></video>'],
      ];
      it.each(testCases)('%s', (name, htmlString) => {
        expect(hasInteractiveContent(htmlString)).toBe(false);
      });
    });

    describe('should return true', () => {
      const testCases = [
        ['given an anchor with href', '<a href="/path">link</a>'],
        ['given an enabled button', '<button>Click</button>'],
        ['given an enabled text input', '<input type="text">'],
        ['given an enabled select', '<select><option>opt</option></select>'],
        ['given an enabled textarea', '<textarea></textarea>'],
        ['given a summary element', '<details><summary>Toggle</summary><p>Content</p></details>'],
        ['given an iframe', '<iframe src="about:blank"></iframe>'],
        ['given audio with controls', '<audio controls src="test.mp3"></audio>'],
        ['given video with controls', '<video controls src="test.mp4"></video>'],
        ['given contenteditable="true"', '<div contenteditable="true">editable</div>'],
        ['given contenteditable="" (empty value)', '<div contenteditable="">editable</div>'],
        ['given tabindex="0"', '<div tabindex="0">focusable</div>'],
        ['given tabindex="1"', '<div tabindex="1">focusable</div>'],
        ['given a link nested inside paragraph text', '<p>Read the <a href="/terms">terms</a> here.</p>'],
      ];
      it.each(testCases)('%s', (name, htmlString) => {
        expect(hasInteractiveContent(htmlString)).toBe(true);
      });
    });
  });
});
