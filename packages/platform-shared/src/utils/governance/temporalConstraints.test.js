/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import formatConstraintDate from './temporalConstraints';

describe('formatConstraintDate', () => {
  it('should return undefined when there is not a temporal constraint', () => {
    const temporalConstraints = [];
    const parsedDate = formatConstraintDate(temporalConstraints);

    expect(parsedDate).toBeUndefined();
  });

  it('should return parsed date when there is a temporal constraint', () => {
    const temporalConstraints = [
      {
        duration: '2023-06-22/2023-07-01',
      },
    ];
    const translatedDate = 'Jun 22, 2023 12:00 AM to Jul 1, 2023 12:00 AM';

    const parsedDate = formatConstraintDate(temporalConstraints);
    expect(parsedDate).toBe(translatedDate);
  });
});
