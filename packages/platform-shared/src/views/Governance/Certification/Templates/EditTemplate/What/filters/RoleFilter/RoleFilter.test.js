/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { getGovernanceFilter } from '@forgerock/platform-shared/src/utils/governance/filters';
import { getAllFilter } from '@/views/Governance/utils/certification';
import RoleFilter from './index';

jest.mock('@/api/governance/TemplateApi');
describe('RoleFilter View', () => {
  let wrapper;
  const basicRoleFilter = {
    operand: {
      targetName: 'description',
      targetValue: 'test',
    },
    operator: 'EQUALS',
  };

  function mountComponent(filterData) {
    wrapper = mount(RoleFilter, {
      global: {
        mocks: {
          $t: (text) => (text),
        },
      },
      props: {
        filterData: {
          roleSelection: 'governance.editTemplate.allRoles',
          roleFilter: basicRoleFilter,
          ...filterData,
        },
      },
    });
  }

  beforeEach(() => {
    mountComponent();
  });

  it('initializes role-selection with values from value prop', () => {
    expect(findByTestId(wrapper, 'role-selection').find('input.multiselect__single').element.value).toBe('All roles');
  });

  describe('getRoleFilter', () => {
    it('should return all filter when roleSelection is allRoles', () => {
      const result = wrapper.vm.getRoleFilter();
      expect(result).toEqual(getAllFilter());
    });
    it('should return governance filter when roleSelection is filterRoles', () => {
      mountComponent({ roleSelection: 'governance.editTemplate.filterRoles' });
      wrapper.vm.filterFields.roleFilter = basicRoleFilter;
      const result = wrapper.vm.getRoleFilter();
      expect(result).toEqual(getGovernanceFilter(basicRoleFilter));
    });
  });
});
