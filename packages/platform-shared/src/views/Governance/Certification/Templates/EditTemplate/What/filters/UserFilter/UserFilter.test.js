/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import { getGovernanceFilter } from '@forgerock/platform-shared/src/utils/governance/filters';
import { getAllFilter } from '@/views/Governance/utils/certification';
import UserFilter from './index';

mockValidation();

jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi');

describe('UserFilter View', () => {
  CommonsApi.getResource.mockReturnValue(Promise.resolve({ data: {} }));
  let wrapper;
  const basicAppFilter = {
    operand: {
      targetName: 'authoritative',
      targetValue: false,
    },
    operator: 'EQUALS',
  };

  function mountComponent(filterData) {
    wrapper = mount(UserFilter, {
      global: {
        mocks: {
          $t: (text) => (text),
        },
      },
      props: {
        filterData: {
          filterData: '',
          singleUserInfo: {},
          userFilter: {},
          userSelection: 'governance.editTemplate.allUsers',
          ...filterData,
        },
      },
    });
  }

  beforeEach(() => {
    mountComponent();
  });

  it('initializes user-selection with values from value prop', () => {
    expect(findByTestId(wrapper, 'user-selection').find('input.multiselect__single').element.value).toBe('All users');
  });

  describe('getUserFilter', () => {
    it('should return all filter when userSelection is allUsers', () => {
      const result = wrapper.vm.getUsersFilter({ userSelection: 'governance.editTemplate.allUsers' });
      expect(result).toEqual(getAllFilter());
    });
    it('should return governance filter when userSelection is filterUser', () => {
      mountComponent({ userSelection: 'governance.editTemplate.filterUsers' });
      const filterFields = {
        userSelection: 'governance.editTemplate.filterUsers',
        userFilter: basicAppFilter,
      };
      const result = wrapper.vm.getUsersFilter(filterFields);
      expect(result).toEqual({
        ...getGovernanceFilter(basicAppFilter),
      });
    });
  });
});
