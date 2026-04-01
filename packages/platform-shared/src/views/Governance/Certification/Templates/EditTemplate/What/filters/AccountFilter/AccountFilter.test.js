/**
 * Copyright 2023-2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { mount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { getGovernanceFilter } from '@forgerock/platform-shared/src/utils/governance/filters';
import { getAllFilter } from '@/views/Governance/utils/certification';
import AccountFilter from './index';

describe('Account filter', () => {
  let wrapper;

  const basicAccountFilter = {
    operand: {
      targetName: 'firstName',
      targetValue: 'test',
    },
    operator: 'EQUALS',
  };

  function mountComponent(filterData) {
    wrapper = mount(AccountFilter, {
      global: {
        mocks: { $t: (text) => (text) },
      },
      props: {
        filterData: {
          accountFilter: basicAccountFilter,
          accountSelection: 'governance.editTemplate.allAccounts',
          ...filterData,
        },
        properties: {
          account: [{
            key: 1,
            displayName: 'test',
            type: 'test',
            managedObjectType: 'test',
          }],
        },
      },
    });
  }

  beforeEach(() => {
    mountComponent();
  });

  it('initializes account-selection with values from value prop', () => {
    expect(findByTestId(wrapper, 'account-selection').find('span').text()).toBe('All accounts in selected applications');
  });

  describe('accountProperties', () => {
    it('should set accountProperties with the mock values', async () => {
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.accountProperties).toHaveLength(1);
      expect(wrapper.vm.accountProperties).toEqual([
        {
          label: 'test',
          path: 'test',
          type: 'test',
          value: 1,
        }]);
    });
  });
  describe('getAccountsFilter', () => {
    it('should return all filter when accountSelection is allAccounts', () => {
      const result = wrapper.vm.getAccountsFilter();
      expect(result).toEqual(getAllFilter());
    });
    it('should return governance filter when accountSelection is filterAccounts', () => {
      mountComponent({ accountSelection: 'governance.editTemplate.filterAccounts' });
      wrapper.vm.filterFields.accountFilter = basicAccountFilter;
      const result = wrapper.vm.getAccountsFilter();
      expect(result).toEqual(getGovernanceFilter(basicAccountFilter));
    });
  });
});
