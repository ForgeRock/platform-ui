/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { formatFileSize, hasAllowedExtension } from './file';

describe('file utils', () => {
  describe('formatFileSize', () => {
    it('returns "0 B" for 0 bytes', () => {
      expect(formatFileSize(0)).toBe('0 B');
    });

    it('formats bytes correctly', () => {
      expect(formatFileSize(500)).toBe('500 B');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1536)).toBe('2 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });

    it('rounds to nearest integer', () => {
      expect(formatFileSize(1500)).toBe('1 KB');
      expect(formatFileSize(1600)).toBe('2 KB');
    });
  });

  describe('hasAllowedExtension', () => {
    it('returns true for allowed extensions', () => {
      expect(hasAllowedExtension('test.json', ['.json'])).toBe(true);
      expect(hasAllowedExtension('test.JSON', ['.json'])).toBe(true);
      expect(hasAllowedExtension('test.xml', ['.json', '.xml'])).toBe(true);
    });

    it('returns false for disallowed extensions', () => {
      expect(hasAllowedExtension('test.txt', ['.json'])).toBe(false);
      expect(hasAllowedExtension('test.yaml', ['.json'])).toBe(false);
    });

    it('handles files with multiple dots', () => {
      expect(hasAllowedExtension('my.file.json', ['.json'])).toBe(true);
      expect(hasAllowedExtension('my.json.txt', ['.json'])).toBe(false);
    });
  });
});
