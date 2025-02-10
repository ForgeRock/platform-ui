/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import isFraasFilter from './fraasUtils';
import store from '@/store';

const id = [
  { id: 'alpha_user' },
  { id: 'bravo_user' },
  { id: 'team' },
  { id: 'bravo_role' },
  { id: '/managed/alpha_org' },
  { id: 'role' },
];
const expectedIds = [
  { id: 'alpha_user' },
  { id: '/managed/alpha_org' },
  { id: 'role' },
];

describe('fraasUtils', () => {
  it('Returns correct objects based on fraas values', () => {
    jest.spyOn(store, 'state', 'get').mockReturnValue({ fraasAdminManagedObjectName: 'team', realm: 'alpha' });
    const data = isFraasFilter(id, 'id');
    expect(data).toStrictEqual(expectedIds);
  });
});
