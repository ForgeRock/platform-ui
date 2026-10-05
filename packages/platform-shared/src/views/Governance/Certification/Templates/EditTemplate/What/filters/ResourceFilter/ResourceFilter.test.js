/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import { getGovernanceFilter } from '@forgerock/platform-shared/src/utils/governance/filters';
import { getAllFilter } from '@/views/Governance/utils/certification';
import ResourceFilter from './index';

describe('ResourceFilter View', () => {
  let wrapper;

  const basicResourceFilter = {
    operand: {
      targetName: 'name',
      targetValue: 'My Resource',
    },
    operator: 'EQUALS',
  };

  function mountComponent(filterData) {
    wrapper = mount(ResourceFilter, {
      global: {
        mocks: {
          $t: (text) => (text),
        },
      },
      props: {
        filterData: {
          resourceFilter: { ...basicResourceFilter },
          resourceSelection: 'governance.editTemplate.allResources',
          ...filterData,
        },
      },
    });
  }

  beforeEach(() => {
    mountComponent();
  });

  it('initializes resource-selection with values from filterData prop', () => {
    expect(findByTestId(wrapper, 'resource-selection').find('input.multiselect__single').element.value).toBe('All resources');
  });

  it('emits update-filter with resource type on mount', async () => {
    await wrapper.vm.$nextTick();
    const emitted = wrapper.emitted('update-filter');
    expect(emitted).toBeTruthy();
    expect(emitted[0][0].type).toBe('resource');
  });

  describe('getResourcesFilter', () => {
    it('should return all filter when resourceSelection is allResources', () => {
      const result = wrapper.vm.getResourcesFilter();
      expect(result).toEqual(getAllFilter());
    });
    it('should return governance filter when resourceSelection is filterResources', () => {
      mountComponent({ resourceSelection: 'governance.editTemplate.filterResources' });
      const result = wrapper.vm.getResourcesFilter();
      expect(result).toEqual(getGovernanceFilter(basicResourceFilter));
    });
    it('should return null when resourceSelection is empty', () => {
      mountComponent({ resourceSelection: '' });
      const result = wrapper.vm.getResourcesFilter();
      expect(result).toBeNull();
    });
  });
});
