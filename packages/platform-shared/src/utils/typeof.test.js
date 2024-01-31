/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { type } from './typeof';

describe('testing typeof utility', () => {
  // Check primitive and non-primitive types
  it('returns the correct types', async () => {
    const booleanType = type(true);
    const numberType = type(3);
    const stringType = type('test123');
    const regexType = type(new RegExp('ab+c', 'i'));
    const dateType = type(new Date());
    const errorType = type(new Error());

    // Primitive
    expect(booleanType).toBe('boolean');
    expect(numberType).toBe('number');
    expect(stringType).toBe('string');

    // Non primitive
    expect(regexType).toBe('RegExp');
    expect(dateType).toBe('Date');
    expect(errorType).toBe('Error');
  });
});
