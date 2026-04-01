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
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import { getAllNonAuthoritativeApplications } from '@/views/Governance/utils/certification';
import ApplicationFilter from './index';

jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi');

describe('ApplicationFilter View', () => {
  let wrapper;

  CommonsApi.getResource.mockResolvedValue({ data: { result: [] } });

  const basicAppFilter = {
    operand: {
      targetName: 'authoritative',
      targetValue: false,
    },
    operator: 'EQUALS',
  };

  function mountComponent(filterData) {
    wrapper = mount(ApplicationFilter, {
      global: {
        mocks: {
          $t: (text) => (text),
        },
      },
      props: {
        filterData: {
          appFilter: { ...basicAppFilter },
          appSelection: 'governance.editTemplate.allApplications',
          singleApp: [],
          ...filterData,
        },
      },
    });
  }

  beforeEach(() => {
    mountComponent();
  });

  it('initializes app-selection with values from value prop', () => {
    expect(findByTestId(wrapper, 'app-selection').find('span').text()).toBe('All applications');
  });

  describe('getApplicationFilter', () => {
    it('should return all filter when applicationsSelection is allApplications', () => {
      const result = wrapper.vm.getApplicationFilters();
      expect(result).toEqual(getAllNonAuthoritativeApplications());
    });
    it('should return governance filter when appSelection is filterApplications', () => {
      mountComponent({ appSelection: 'governance.editTemplate.filterApplications' });
      wrapper.vm.filterFields.appFilter = basicAppFilter;
      const result = wrapper.vm.getApplicationFilters();
      expect(result).toEqual(getGovernanceFilter(basicAppFilter));
    });
  });
});
