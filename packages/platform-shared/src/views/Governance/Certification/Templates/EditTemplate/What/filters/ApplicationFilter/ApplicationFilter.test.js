/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { getGovernanceFilter } from '@forgerock/platform-shared/src/utils/governance/filters';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import * as ApplicationsApi from '@forgerock/platform-shared/src/api/governance/ApplicationsApi';
import { getAllNonAuthoritativeApplications } from '@/views/Governance/utils/certification';
import ApplicationFilter from './index';

jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi');
jest.mock('@forgerock/platform-shared/src/api/governance/ApplicationsApi');

describe('ApplicationFilter View', () => {
  let wrapper;

  CommonsApi.getResource.mockResolvedValue({ data: { result: [] } });
  ApplicationsApi.getApplications.mockResolvedValue({ data: { result: [] } });

  const basicAppFilter = {
    operand: {
      targetName: 'authoritative',
      targetValue: false,
    },
    operator: 'EQUALS',
  };

  function mountComponent(filterData, extraProps = {}) {
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
        ...extraProps,
      },
    });
  }

  beforeEach(() => {
    mountComponent();
  });

  it('initializes app-selection with values from value prop', () => {
    expect(findByTestId(wrapper, 'app-selection').find('input.multiselect__single').element.value).toBe('All applications');
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

  describe('non-NHI application filtering', () => {
    it('does not override the resource function by default', () => {
      expect(wrapper.vm.resourceFunction).toBeUndefined();
      expect(wrapper.vm.queryParamFunction({}, 'application', false)).toBeUndefined();
    });

    it('queries disconnected applications with at least one non-NHI object type', () => {
      mountComponent({}, { filterNonNhiApplications: true });
      expect(wrapper.vm.queryParamFunction('', 'application', false)).toEqual({
        disconnected: true,
        pageSize: 10,
        queryFilter: 'objectTypes.isNHI eq "false"',
      });
      expect(wrapper.vm.queryParamFunction('web', 'application', false)).toEqual({
        disconnected: true,
        pageSize: 10,
        queryFilter: 'name co "web" and objectTypes.isNHI eq "false"',
      });
      expect(wrapper.vm.queryParamFunction('app-1', 'application', true)).toEqual({
        disconnected: true,
        queryFilter: 'id eq "app-1" and objectTypes.isNHI eq "false"',
      });
    });

    it('maps disconnected application records to options', () => {
      mountComponent({}, { filterNonNhiApplications: true });
      expect(wrapper.vm.optionFunction({ id: 'a1', name: 'App One' })).toEqual({ text: 'App One', value: 'a1' });
      expect(wrapper.vm.optionFunction({ id: 'a2', application: { name: 'App Two', id: 'a2' } })).toEqual({ text: 'App Two', value: 'a2' });
    });
  });
});
