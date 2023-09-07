/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import RolesTab from './index';

describe('RolesTab', () => {
  function mountComponent(roles) {
    return shallowMount(RolesTab, {
      global: {
        mocks: {
          $t: (t) => t,
        },
      },
      props: {
        roles,
      },
    });
  }

  describe('component loaded', () => {
    let wrapper;

    it('Shows FrNoData component when have no roles', () => {
      wrapper = mountComponent({ result: [] });
      const rolesTable = findByTestId(wrapper, 'roles-table');
      expect(rolesTable.exists()).toBeFalsy();
      expect(wrapper.findComponent(FrNoData).exists()).toBe(true);
      expect(wrapper.findComponent(FrNoData).props('subtitle')).toBe('governance.certificationTask.lineItemDetailsModal.rolesTab.noItems');
    });

    it('Shows roles table and not FrNoData when component have roles information', () => {
      wrapper = mountComponent({
        result: [
          {
            campaignId: 'test',
            id: 'test-id',
            item: { type: 'roleMembership' },
            role: { id: 'test-id-role', name: 'test' },
            user: { id: 'test' },
          },
        ],
      });

      expect(wrapper.findComponent(FrNoData).exists()).toBe(false);
      const rolesTable = findByTestId(wrapper, 'roles-table');
      expect(rolesTable.exists()).toBeTruthy();
    });
  });
});
