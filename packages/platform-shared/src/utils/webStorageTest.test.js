/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import isWebStorageAvailable from './webStorageTest';

describe('webStorageTest', () => {
  // By default web storage is available in jest
  it('Returns true if web storage is available', () => {
    const result = isWebStorageAvailable();
    expect(result).toBeTruthy();
  });

  it('Returns false if web storage setItem fails', () => {
    // Mock webStorage.setItem and force it to error
    Storage.prototype.setItem = jest.fn(() => { throw new Error(); });
    const result = isWebStorageAvailable();
    expect(result).toBeFalsy();
  });

  it('Returns false if web storage removeItem fails', () => {
    // Mock webStorage.removeItem and force it to error
    Storage.prototype.removeItem = jest.fn(() => { throw new Error(); });
    const result = isWebStorageAvailable();
    expect(result).toBeFalsy();
  });
});
