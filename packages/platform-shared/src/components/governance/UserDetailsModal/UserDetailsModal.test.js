/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import GovernanceUserDetailsModal from './index';

describe('GovernanceUserDetailsModal', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(GovernanceUserDetailsModal, {
      global: {
        mocks: {
          $t: (t) => t,
        },
      },
      props: {
        user: {
          givenName: 'firstname',
          sn: 'sntest',
          username: 'test',
        },
        userDetails: {
          userAccounts: {},
          userEntitlements: {},
          userRoles: {},
        },
        userEntitlements: {
          result: [{
            application: {
              id: 'test-id',
              name: 'test-name',
              icon: 'test-url',
            },
          }],
        },
      },
    });
  });

  it('component should load correclty', () => {
    expect(wrapper.vm.userFullName).toBe('common.userFullName');
  });
});
