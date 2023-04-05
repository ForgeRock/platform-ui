/* eslint-disable import/prefer-default-export */
/**
 * Copyright 2023 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
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
