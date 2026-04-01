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
import EntitlementFilter from './index';

describe('EntitlementFilter View', () => {
  let wrapper;
  const basicEntitlementFilter = {
    operand: {
      targetName: 'description',
      targetValue: 'test',
    },
    operator: 'EQUALS',
  };

  function mountComponent(filterData) {
    wrapper = mount(EntitlementFilter, {
      global: {
        mocks: {
          $t: (text) => (text),
        },
      },
      props: {
        filterData: {
          entitlementFilter: {},
          entitlementSelection: 'governance.editTemplate.allEntitlements',
          ...filterData,
        },
      },
    });
  }

  beforeEach(() => {
    mountComponent();
  });

  it('initializes entitlement-selection with values from value prop', () => {
    expect(findByTestId(wrapper, 'entitlement-selection').find('span').text()).toBe('All entitlements');
  });

  describe('getEntitlementsFilter', () => {
    it('should return all filter when entitlementSelection is allEntitlements', () => {
      const result = wrapper.vm.getEntitlementsFilter();
      expect(result).toEqual({
        ...wrapper.vm.getEntitlementsFilter(),
      });
    });
    it('should return governance filter when entitlementSelection is filterEntitlements', () => {
      mountComponent({ entitlementSelection: 'governance.editTemplate.filterEntitlements' });
      wrapper.vm.filterFields.entitlementFilter = basicEntitlementFilter;
      const result = wrapper.vm.getEntitlementsFilter();
      expect(result).toEqual(getGovernanceFilter(basicEntitlementFilter));
    });
  });
});
