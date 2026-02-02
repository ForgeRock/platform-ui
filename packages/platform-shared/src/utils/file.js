/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Formats file size in human readable format
 * @param {Number} bytes - File size in bytes
 * @returns {String} Formatted file size (e.g., "388 B", "1 KB", "2 MB")
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round(bytes / (k ** i))} ${sizes[i]}`;
}

/**
 * Checks if a filename has one of the allowed extensions
 * @param {String} filename - The filename to check
 * @param {String[]} allowedExtensions - Array of allowed extensions (e.g., ['.json', '.xml'])
 * @returns {Boolean} True if file has an allowed extension
 */
export function hasAllowedExtension(filename, allowedExtensions) {
  const lowerName = filename.toLowerCase();
  return allowedExtensions.some((ext) => lowerName.endsWith(ext.toLowerCase()));
}
