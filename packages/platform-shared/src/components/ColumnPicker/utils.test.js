/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { getColumnId } from './utils';

describe('getColumnId', () => {
  it('returns value when present', () => {
    expect(getColumnId({ value: 'user.name', key: 'name' })).toBe('user.name');
  });

  it('falls back to key when value is absent', () => {
    expect(getColumnId({ key: 'name' })).toBe('name');
  });

  it('falls back to key when value is null', () => {
    expect(getColumnId({ value: null, key: 'name' })).toBe('name');
  });

  it('falls back to key when value is undefined', () => {
    expect(getColumnId({ value: undefined, key: 'name' })).toBe('name');
  });

  it('returns empty string when both value and key are absent', () => {
    expect(getColumnId({})).toBe('');
  });

  it('returns empty string for null input', () => {
    expect(getColumnId(null)).toBe('');
  });

  it('returns empty string for undefined input', () => {
    expect(getColumnId(undefined)).toBe('');
  });

  it('does not fall through to key for an empty string value', () => {
    // value is '' (empty string), which is falsy with ||, but ?? treats it as defined.
    // We preserve '' as the id so a column with value='' keeps its identity.
    expect(getColumnId({ value: '', key: 'name' })).toBe('');
  });

  it('handles a column with only a value field', () => {
    expect(getColumnId({ value: 'application.description' })).toBe('application.description');
  });

  it('handles the canonical category.key format', () => {
    expect(getColumnId({ value: 'review.comments', key: 'comments' })).toBe('review.comments');
  });
});
