/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { getRealmFullPath } from './realm';

describe('getRealmFullPath', () => {
  it('returns "/" for the root realm', () => {
    expect(getRealmFullPath('root', [])).toBe('/');
  });

  it('returns "/alpha" for a top-level realm', () => {
    expect(getRealmFullPath('alpha', [{ name: 'alpha', parentPath: '/' }])).toBe('/alpha');
  });

  it('returns the full path for a two-level deep realm', () => {
    expect(getRealmFullPath('level2', [{ name: 'level2', parentPath: '/level1' }])).toBe('/level1/level2');
  });

  it('returns the full path for a three-level deep realm', () => {
    expect(getRealmFullPath('level3', [{ name: 'level3', parentPath: '/level1/level2' }])).toBe('/level1/level2/level3');
  });

  it('returns "/realm" when the realm is not found in the list', () => {
    expect(getRealmFullPath('unknown', [{ name: 'alpha', parentPath: '/' }])).toBe('/unknown');
  });

  it('returns "/realm" when the realms list is empty', () => {
    expect(getRealmFullPath('alpha', [])).toBe('/alpha');
  });

  it('handles undefined realms gracefully', () => {
    expect(getRealmFullPath('alpha', undefined)).toBe('/alpha');
  });
});
