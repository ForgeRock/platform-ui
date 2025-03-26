/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
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

  describe('sorting', () => {
    const mockResourceFunction = jest.fn();
    const columns = [
      {
        key: 'name',
        label: i18n.global.t('common.name'),
        initialSort: true,
        sortable: true,
        sortKey: 'givenName',
      },
      {
        key: 'email',
        label: i18n.global.t('common.email'),
        sortable: true,
        sortKey: 'mail',
      },
    ];

    it('calls resource function with initial sort, if present', () => {
      wrapper = mountComponent({
        resource: 'user',
        columns,
        resourceFunction: mockResourceFunction,
      });

      expect(mockResourceFunction).toHaveBeenCalledWith(
        'alpha_user',
        {
          fields: 'userName,givenName,sn,mail',
          pageSize: 10,
          pagedResultsOffset: 0,
          queryFilter: true,
          sortKeys: 'givenName',
          totalPagedResultsPolicy: 'EXACT',
        },
      );
    });

    it('changing sort calls api with correct sortKeys param ascending', async () => {
      wrapper = mountComponent({
        resource: 'user',
        columns,
        resourceFunction: mockResourceFunction,
      });

      const table = wrapper.findComponent({ name: 'BTable' });
      await table.vm.$emit('sort-changed', { sortBy: 'mail', sortDesc: false });

      expect(mockResourceFunction).toHaveBeenCalledWith(
        'alpha_user',
        {
          fields: 'userName,givenName,sn,mail',
          pageSize: 10,
          pagedResultsOffset: 0,
          queryFilter: true,
          sortKeys: 'mail',
          totalPagedResultsPolicy: 'EXACT',
        },
      );
    });

    it('changing sort calls api with correct sortKeys param descending', async () => {
      wrapper = mountComponent({
        resource: 'user',
        columns,
        resourceFunction: mockResourceFunction,
      });

      const table = wrapper.findComponent({ name: 'BTable' });
      await table.vm.$emit('sort-changed', { sortBy: 'mail', sortDesc: true });

      expect(mockResourceFunction).toHaveBeenCalledWith(
        'alpha_user',
        {
          fields: 'userName,givenName,sn,mail',
          pageSize: 10,
          pagedResultsOffset: 0,
          queryFilter: true,
          sortKeys: '-mail',
          totalPagedResultsPolicy: 'EXACT',
        },
      );
    });
  });

  describe('user', () => {
    let userResourceFunction;
    beforeEach(() => {
      userResourceFunction = jest.fn();
      wrapper = mountComponent({
        resource: 'user',
        resourceFunction: userResourceFunction,
      });
    });

    it('calls resource function with correct query params', async () => {
      expect(userResourceFunction).toHaveBeenCalledWith(
        'alpha_user',
        {
          fields: 'userName,givenName,sn,mail',
          pageSize: 10,
          pagedResultsOffset: 0,
          queryFilter: true,
          totalPagedResultsPolicy: 'EXACT',
        },
      );
    });

    it('changing page calls api with correct query params', async () => {
      const pagination = wrapper.findComponent(FrPagination);
      await pagination.vm.$emit('input', 2);

      expect(userResourceFunction).toHaveBeenCalledWith(
        'alpha_user',
        {
          fields: 'userName,givenName,sn,mail',
          pageSize: 10,
          pagedResultsOffset: 10,
          queryFilter: true,
          totalPagedResultsPolicy: 'EXACT',
        },
      );
    });

    it('changing page size calls api with correct query params', async () => {
      const pagination = wrapper.findComponent(FrPagination);
      await pagination.vm.$emit('on-page-size-change', 100);

      expect(userResourceFunction).toHaveBeenCalledWith(
        'alpha_user',
        {
          fields: 'userName,givenName,sn,mail',
          pageSize: 100,
          pagedResultsOffset: 0,
          queryFilter: true,
          totalPagedResultsPolicy: 'EXACT',
        },
      );
    });

    it('searching calls api with correct query params', async () => {
      const search = wrapper.findComponent(FrSearchInput);
      await search.vm.$emit('input', 'test');
      await flushPromises();
      await search.vm.$emit('search');

      expect(userResourceFunction).toHaveBeenCalledWith(
        'alpha_user',
        {
          fields: 'userName,givenName,sn,mail',
          pageSize: 10,
          pagedResultsOffset: 0,
          queryFilter: '/userName co "test" or /givenName co "test" or /sn co "test" or /mail co "test"',
          totalPagedResultsPolicy: 'EXACT',
        },
      );
    });
  });

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
      await search.vm.$emit('input', 'test');
      await flushPromises();
      await search.vm.$emit('search');

      expect(entitlementResourceFunction).toHaveBeenCalledWith(
        'entitlement',
        {
          fields: 'application,descriptor,entitlementOwner,item',
          pageSize: 10,
          pagedResultsOffset: 0,
          queryFilter: 'descriptor.idx./entitlement.displayName co "test"',
        },
      );
    });
  });
});
