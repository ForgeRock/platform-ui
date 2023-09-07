/**
 * Copyright (c) 2021-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import IsFraasFilterMixin from './index';

let wrapper;
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

describe('IsFraasFilterMixin', () => {
  beforeEach(() => {
    wrapper = shallowMount({}, {
      render() {},
      global: {
        mixins: [IsFraasFilterMixin],
        mocks: {
          $store: {
            state: { fraasAdminManagedObjectName: 'team', realm: 'alpha' },
          },
        },
      },
    });
  });

  it('Returns correct objects based on fraas values', () => {
    const data = wrapper.vm.isFraasFilter(id, 'id');
    expect(data).toStrictEqual(expectedIds);
  });
});
