/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { normalizeMessageLineBreaks } from './stringUtils';

describe('stringUtils', () => {
  describe('normalizeMessageLineBreaks', () => {
    describe('should handle null/undefined/invalid inputs', () => {
      const testCases = [
        ['null', null, null],
        ['undefined', undefined, undefined],
        ['empty string', '', ''],
        ['number', 123, 123],
        ['boolean', false, false],
      ];

      it.each(testCases)('when input is %s', (name, input, expected) => {
        expect(normalizeMessageLineBreaks(input)).toBe(expected);
      });

      it('should return object as-is when input is object', () => {
        const obj = {};
        expect(normalizeMessageLineBreaks(obj)).toBe(obj);
      });
    });

    describe('should normalize <br> followed by newline', () => {
      const testCases = [
        ['<br>\\n', 'Line 1<br>\nLine 2', 'Line 1<br>Line 2'],
        ['<br/>\\n', 'Line 1<br/>\nLine 2', 'Line 1<br>Line 2'],
        ['<br />\\n', 'Line 1<br />\nLine 2', 'Line 1<br>Line 2'],
        ['<BR>\\n (case insensitive)', 'Line 1<BR>\nLine 2', 'Line 1<br>Line 2'],
        ['<Br>\\n (mixed case)', 'Line 1<Br>\nLine 2', 'Line 1<br>Line 2'],
        ['multiple <br>\\n', 'A<br>\nB<br>\nC<br>\nD', 'A<br>B<br>C<br>D'],
      ];

      it.each(testCases)('when message has %s', (name, input, expected) => {
        expect(normalizeMessageLineBreaks(input)).toBe(expected);
      });
    });

    describe('should handle whitespace after <br>', () => {
      const testCases = [
        ['spaces after <br>', 'Line 1<br>  \nLine 2', 'Line 1<br>Line 2'],
        ['tab after <br>', 'Line 1<br>\t\nLine 2', 'Line 1<br>Line 2'],
        ['mixed whitespace', 'Line 1<br> \t \nLine 2', 'Line 1<br>Line 2'],
      ];

      it.each(testCases)('when message has %s', (name, input, expected) => {
        expect(normalizeMessageLineBreaks(input)).toBe(expected);
      });
    });

    describe('should preserve intentional spacing', () => {
      const testCases = [
        ['double newlines', 'Para 1\n\nPara 2', 'Para 1\n\nPara 2'],
        ['multiple newlines', 'Line 1\n\n\n\nLine 2', 'Line 1\n\n\n\nLine 2'],
        ['<br> without newline', 'Line 1<br>Line 2', 'Line 1<br>Line 2'],
        ['standalone newlines', 'Line 1\nLine 2\nLine 3', 'Line 1\nLine 2\nLine 3'],
        ['multiple newlines after <br> (only first removed)', 'Line 1<br>\n\nLine 2', 'Line 1<br>\nLine 2'],
      ];

      it.each(testCases)('when message has %s', (name, input, expected) => {
        expect(normalizeMessageLineBreaks(input)).toBe(expected);
      });
    });

    describe('should handle newlines before and after <br>', () => {
      const testCases = [
        ['newline before <br>', 'Line 1\n<br>Line 2', 'Line 1<br>Line 2'],
        ['newline after <br>', 'Line 1<br>\nLine 2', 'Line 1<br>Line 2'],
        ['newlines both before and after <br>', 'Line 1\n<br>\nLine 2', 'Line 1<br>Line 2'],
        ['multiple patterns', 'A\n<br>B<br>\nC\n<br>\nD', 'A<br>B<br>C<br>D'],
      ];

      it.each(testCases)('when message has %s', (name, input, expected) => {
        expect(normalizeMessageLineBreaks(input)).toBe(expected);
      });
    });

    describe('should handle complex real-world scenarios', () => {
      it('should handle bug report example', () => {
        const input = 'Styling on Message Node test<br>\nFor more info<br>\nhttps://bugster.forgerock.org/jira/browse/IAM-5656<br>\n<br>\noutside page node';
        const expected = 'Styling on Message Node test<br>For more info<br>https://bugster.forgerock.org/jira/browse/IAM-5656<br><br>outside page node';
        expect(normalizeMessageLineBreaks(input)).toBe(expected);
      });

      it('should handle mixed <br> and natural newlines', () => {
        const input = 'Section title\n\nBullet list:<br>\n- Item 1<br>\n- Item 2\n\nEnd note';
        const expected = 'Section title\n\nBullet list:<br>- Item 1<br>- Item 2\n\nEnd note';
        expect(normalizeMessageLineBreaks(input)).toBe(expected);
      });

      it('should handle textarea input with excessive spacing', () => {
        const input = 'Line 1<br>\nLine 2\n\n\n\n\n\nLine 3';
        const expected = 'Line 1<br>Line 2\n\n\n\n\n\nLine 3';
        expect(normalizeMessageLineBreaks(input)).toBe(expected);
      });

      it('should handle multiple consecutive <br> tags', () => {
        const input = 'First<br>\n<br>\n<br>\nSecond';
        const expected = 'First<br><br><br>Second';
        expect(normalizeMessageLineBreaks(input)).toBe(expected);
      });

      it('should handle HTML content with <br> tags', () => {
        const input = 'Welcome<br>\n<strong>Important:</strong> Please proceed<br>\nThank you';
        const expected = 'Welcome<br><strong>Important:</strong> Please proceed<br>Thank you';
        expect(normalizeMessageLineBreaks(input)).toBe(expected);
      });
    });

    describe('should handle edge cases', () => {
      const testCases = [
        ['empty content with only <br>\\n', '<br>\n<br>\n<br>\n', '<br><br><br>'],
        ['leading <br>\\n', '<br>\nContent', '<br>Content'],
        ['trailing <br>\\n', 'Content<br>\n', 'Content<br>'],
        ['no matches', 'Plain text without br tags', 'Plain text without br tags'],
        ['<br> at end without newline', 'Content<br>', 'Content<br>'],
      ];

      it.each(testCases)('when message is %s', (name, input, expected) => {
        expect(normalizeMessageLineBreaks(input)).toBe(expected);
      });
    });
  });
});
