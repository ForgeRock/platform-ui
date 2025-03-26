/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { findChanges } from './object';

describe('findChanges', () => {
  it('should detect changes in an array of objects', () => {
    const newObj = [
      { value: 'a' },
      { value: 'b' },
      { value: 'c' },
    ];
    const oldObj = [
      { value: 'a' },
      { value: 'x' },
      { value: 'c' },
    ];

    const result = findChanges(newObj, oldObj);

    expect(result).toEqual([{ value: 'b', name: undefined }]);
  });

  it('should detect changes in nested arrays', () => {
    const newObj = [
      { value: ['a', 'b'] },
      { value: ['c', 'd'] },
    ];
    const oldObj = [
      { value: ['a', 'b'] },
      { value: ['x', 'y'] },
    ];

    const result = findChanges(newObj, oldObj);

    expect(result).toEqual([{ value: ['c', 'd'], name: undefined }]);
  });

  it('should detect changes in an object', () => {
    const newObj = {
      key1: 'value1',
      key2: 'value2',
      key3: 'value3',
    };
    const oldObj = {
      key1: 'value1',
      key2: 'valueX',
      key3: 'value3',
    };

    const result = findChanges(newObj, oldObj);

    expect(result).toEqual([{ value: 'value2', name: 'key2' }]);
  });

  it('should return an empty array if there are no changes', () => {
    const newObj = {
      key1: 'value1',
      key2: 'value2',
    };
    const oldObj = {
      key1: 'value1',
      key2: 'value2',
    };

    const result = findChanges(newObj, oldObj);

    expect(result).toEqual([]);
  });

  it('should handle empty objects and arrays', () => {
    const newObj = {};
    const oldObj = {};

    const result1 = findChanges(newObj, oldObj);
    expect(result1).toEqual([]);

    const newArr = [];
    const oldArr = [];

    const result2 = findChanges(newArr, oldArr);
    expect(result2).toEqual([]);
  });

  it('should detect changes when new keys are added to an object', () => {
    const newObj = {
      key1: 'value1',
      key2: 'value2',
      key3: 'value3',
    };
    const oldObj = {
      key1: 'value1',
      key2: 'value2',
    };

    const result = findChanges(newObj, oldObj);

    expect(result).toEqual([{ value: 'value3', name: 'key3' }]);
  });
});
