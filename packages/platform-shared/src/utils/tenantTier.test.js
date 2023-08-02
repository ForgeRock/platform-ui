/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { getTierColor } from './tenantTier';

describe('getTierColor function', () => {
  it('returns "blue" for a fixed tier display name: "development"', () => {
    const result = getTierColor('development');
    expect(result).toEqual('blue');
  });

  it('returns "blue" for a fixed tier abbreviated display name: "dev"', () => {
    const result = getTierColor('dev');
    expect(result).toEqual('blue');
  });

  it('returns the same value for upper-cased display name', () => {
    let result = getTierColor('UAT');
    expect(result).toEqual('cyan');

    result = getTierColor('uat');
    expect(result).toEqual('cyan');
  });

  it('returns a color from the extra tier display colors name: "test"', () => {
    const result = getTierColor('test');
    expect(result).toEqual('orange');
  });
});
