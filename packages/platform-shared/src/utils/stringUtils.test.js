/**
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import startCase from './stringUtils';

describe('stringUtils', () => {
  it('should capitilize each word properly', () => {
    const testSuite = [
      'mater familias-spurius',
      'Mater Familias-spurius',
      'Mater Familias-Spurius',
      'MaTer famIlIas-spuRIUs',
      'Andrés Castillo',
      'pōmaika\'i',
    ];

    const results = testSuite.map((test) => startCase(test));

    expect(results).toEqual([
      'Mater Familias-Spurius',
      'Mater Familias-Spurius',
      'Mater Familias-Spurius',
      'Mater Familias-Spurius',
      'Andrés Castillo',
      'Pōmaika\'i',
    ]);
  });
});
