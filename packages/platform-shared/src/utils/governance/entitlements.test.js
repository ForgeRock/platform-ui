/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { getAccountAttribute } from './entitlements';

describe('getAccountAttribute', () => {
  it('should return the accountAttribute from item.item if it exists', () => {
    const input = {
      item: {
        accountAttribute: 'testAccountAttribute',
      },
    };
    const result = getAccountAttribute(input);
    expect(result).toBe('testAccountAttribute');
  });

  it('should return the accountAttribute from application.objectTypes if item.item.accountAttribute does not exist', () => {
    const input = {
      item: {
        objectType: 'testObjectType',
      },
      application: {
        objectTypes: [
          { name: 'testObjectType', accountAttribute: 'testAccountAttributeFromObjectTypes' },
        ],
      },
    };
    const result = getAccountAttribute(input);
    expect(result).toBe('testAccountAttributeFromObjectTypes');
  });

  it('should return undefined if neither item.item.accountAttribute nor application.objectTypes match', () => {
    const input = {
      item: {
        objectType: 'nonMatchingObjectType',
      },
      application: {
        objectTypes: [
          { name: 'testObjectType', accountAttribute: 'testAccountAttributeFromObjectTypes' },
        ],
      },
    };
    const result = getAccountAttribute(input);
    expect(result).toBeUndefined();
  });

  it('should return undefined if item is undefined', () => {
    const result = getAccountAttribute(undefined);
    expect(result).toBeUndefined();
  });

  it('should return undefined if item.item and application.objectTypes are both undefined', () => {
    const input = {};
    const result = getAccountAttribute(input);
    expect(result).toBeUndefined();
  });
});
