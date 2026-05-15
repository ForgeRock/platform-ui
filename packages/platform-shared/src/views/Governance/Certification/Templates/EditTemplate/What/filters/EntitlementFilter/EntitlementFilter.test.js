/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
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
    expect(findByTestId(wrapper, 'entitlement-selection').find('input.multiselect__single').element.value).toBe('All entitlements');
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
