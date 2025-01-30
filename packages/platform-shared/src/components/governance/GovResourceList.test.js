/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import FrPagination from '@forgerock/platform-shared/src/components/Pagination';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import GovResourceMultiselect from './GovResourceList';
import i18n from '@/i18n';

describe('GovResourceList', () => {
  let wrapper;
  function mountComponent(props) {
    return mount(GovResourceMultiselect, {
      global: {
        plugins: [i18n],
      },
      props: {
        columns: [],
        ...props,
      },
    });
  }

  describe('entitlement', () => {
    let entitlementResourceFunction;
    beforeEach(() => {
      entitlementResourceFunction = jest.fn();
      wrapper = mountComponent({
        resource: 'entitlement',
        resourceFunction: entitlementResourceFunction,
      });
    });

    it('calls resource function with correct query params', async () => {
      expect(entitlementResourceFunction).toHaveBeenCalledWith(
        'entitlement',
        {
          fields: 'application,descriptor,entitlementOwner,item',
          pageSize: 10,
          pagedResultsOffset: 0,
          queryFilter: true,
        },
      );
    });

    it('changing page calls api with correct query params', async () => {
      const pagination = wrapper.findComponent(FrPagination);
      await pagination.vm.$emit('input', 2);

      expect(entitlementResourceFunction).toHaveBeenCalledWith(
        'entitlement',
        {
          fields: 'application,descriptor,entitlementOwner,item',
          pageSize: 10,
          pagedResultsOffset: 10,
          queryFilter: true,
        },
      );
    });

    it('changing page size calls api with correct query params', async () => {
      const pagination = wrapper.findComponent(FrPagination);
      await pagination.vm.$emit('on-page-size-change', 100);

      expect(entitlementResourceFunction).toHaveBeenCalledWith(
        'entitlement',
        {
          fields: 'application,descriptor,entitlementOwner,item',
          pageSize: 100,
          pagedResultsOffset: 0,
          queryFilter: true,
        },
      );
    });

    it('searching calls api with correct query params', async () => {
      const search = wrapper.findComponent(FrSearchInput);
      await search.vm.$emit('search', 'test');

      expect(entitlementResourceFunction).toHaveBeenCalledWith(
        'entitlement',
        {
          fields: 'application,descriptor,entitlementOwner,item',
          pageSize: 10,
          pagedResultsOffset: 0,
          queryFilter: 'application.name sw "test" or descriptor.idx./entitlement.displayName sw "test" or entitlementOwner.userName sw "test" or entitlementOwner.givenName sw "test" or entitlementOwner.sn sw "test"',
        },
      );
    });
  });
});
