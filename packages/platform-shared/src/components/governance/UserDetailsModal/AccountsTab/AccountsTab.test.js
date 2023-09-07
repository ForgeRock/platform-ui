/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import FrNoData from '@forgerock/platform-shared/src/components/NoData';
import AccountsTab from './index';

describe('AccountsTab', () => {
  function mountComponent(accounts) {
    return shallowMount(AccountsTab, {
      global: {
        mocks: {
          $t: (t) => t,
        },
      },
      props: {
        accounts,
      },
    });
  }

  describe('component loaded', () => {
    let wrapper;

    it('Shows FrNoData component when have no accounts', () => {
      wrapper = mountComponent({ result: [] });
      const accountsTable = findByTestId(wrapper, 'accounts-table');
      expect(accountsTable.exists()).toBeFalsy();
      expect(wrapper.findComponent(FrNoData).exists()).toBe(true);
      expect(wrapper.findComponent(FrNoData).props('subtitle')).toBe('governance.certificationTask.lineItemDetailsModal.accountsTab.noItems');
    });

    it('Shows accounts table and not FrNoData when component have accounts information', () => {
      wrapper = mountComponent({
        result: [
          {
            application: {
              id: '5ef1b662-db86-4e6d-8e5f-41db789bf43f',
              name: 'TargetAzureADApp',
              icon: 'https://openam-gov-v2-3.forgeblocks.com/platform/img/microsoft.8a785075.svg',
            },
            descriptor: {
              idx: {
                '/account': {
                  displayName: 'User Account 1',
                },
              },
            },
          },
        ],
      });

      expect(wrapper.findComponent(FrNoData).exists()).toBe(false);
      const accountsTable = findByTestId(wrapper, 'accounts-table');
      expect(accountsTable.exists()).toBeTruthy();
    });
  });
});
