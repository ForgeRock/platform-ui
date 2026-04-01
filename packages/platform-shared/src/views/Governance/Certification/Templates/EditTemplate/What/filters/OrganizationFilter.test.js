/**
 * Copyright 2023-2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

import { mount } from '@vue/test-utils';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import OrganizationFilter from './OrganizationFilter';

let wrapper;

function setup(propsData) {
  return mount(OrganizationFilter, {
    global: {
      mocks: {
        $t: (t) => t,
      },
    },
    props: {
      organizationOptions: ['allOrganizations', 'organization-1', 'organization-2'],
      filterData: {
        organizationSelection: propsData.organizationSelection,
        orgFilter: propsData.orgFilter,
        includeChildOrganizations: propsData.includeChildOrganizations,
        ...propsData,
      },
    },
  });
}

jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi');

describe('OrganizationFilter', () => {
  CommonsApi.getResource.mockResolvedValue({ data: { result: [] } });

  it('should emits update-filter event when filterFields changes', async () => {
    const filterData = {
      orgFilter: 'specificOrgs',
      organizationSelection: ['organization-1'],
      includeChildOrganizations: false,
    };
    wrapper = setup(filterData);
    await wrapper.vm.$nextTick();

    wrapper.vm.filterFields = filterData;
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('update-filter')).toBeTruthy();
    expect(wrapper.emitted('update-filter')[0]).toEqual([
      {
        type: 'organization',
        filterFields: {
          orgFilter: 'specificOrgs',
          organizationSelection: filterData.organizationSelection,
          includeChildOrganizations: filterData.includeChildOrganizations,
        },
      },
    ]);
  });
  it('should emits update-filter event on mount for editing templates', async () => {
    const filterData = {
      orgFilter: 'specificOrgs',
      organizationSelection: ['organization-1'],
      includeChildOrganizations: false,
    };
    wrapper = setup(filterData);
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('update-filter')).toBeTruthy();
    expect(wrapper.emitted('update-filter')[0]).toEqual([
      {
        type: 'organization',
        filterFields: {
          orgFilter: 'specificOrgs',
          organizationSelection: filterData.organizationSelection,
          includeChildOrganizations: filterData.includeChildOrganizations,
        },
      },
    ]);
  });
});
