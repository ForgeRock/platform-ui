/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import { mockRouter } from '@forgerock/platform-shared/src/testing/utils/mockRouter';
import { runA11yTest } from '@forgerock/platform-shared/src/utils/testHelpers';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import ResourceList from './ResourceList';

jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi', () => ({
  getResourceList: jest.fn().mockResolvedValue({
    data: {
      result: [
        { id: 'res-1', resource: { id: 'res-1', displayName: 'Resource One', objectType: 'Account' } },
        { id: 'res-2', resource: { id: 'res-2', displayName: 'Resource Two', objectType: 'Group' } },
      ],
      totalCount: 2,
    },
  }),
}));

mockRouter({});

function mountComponent(props = {}) {
  return mount(ResourceList, {
    global: {
      mocks: { $t: (k) => k },
    },
    props,
  });
}

describe('ResourceList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches the resource list unfiltered when standalone', async () => {
    mountComponent();
    await flushPromises();

    expect(CommonsApi.getResourceList).toHaveBeenCalledWith(
      'resource',
      expect.objectContaining({
        fields: 'displayName,objectType',
        pageSize: 10,
        pagedResultsOffset: 0,
        queryFilter: true,
      }),
    );
  });

  it('flattens the nested resource rows and renders displayName and objectType', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    const rows = wrapper.findAll('tbody tr');
    expect(rows.length).toBe(2);
    // The API nests fields under a `resource` key — the table must show the lifted values
    const firstRowCells = rows[0].findAll('td').map((td) => td.text());
    expect(firstRowCells[0]).toContain('Resource One');
    expect(firstRowCells[1]).toBe('Account');
  });

  describe('embedded application scoping', () => {
    it('force-scopes queries to the embedding application', async () => {
      mountComponent({ isEmbedded: true, applicationIds: ['app-1'] });
      await flushPromises();

      expect(CommonsApi.getResourceList).toHaveBeenLastCalledWith(
        'resource',
        expect.objectContaining({
          queryFilter: "(application.id eq 'app-1')",
        }),
      );
    });

    it('combines the forced application filter with the user search', async () => {
      const wrapper = mountComponent({ isEmbedded: true, applicationIds: ['app-1'] });
      await flushPromises();

      const search = wrapper.find('input[type="search"]');
      await search.setValue('test');
      await search.trigger('keydown.enter');
      await flushPromises();

      expect(CommonsApi.getResourceList).toHaveBeenLastCalledWith(
        'resource',
        expect.objectContaining({
          queryFilter: '(resource.displayName co "test") and (application.id eq \'app-1\')',
        }),
      );
    });

    it('brands rows with the hosting application logo when provided', async () => {
      const wrapper = mountComponent({ isEmbedded: true, applicationIds: ['app-1'], logoSource: 'app-icon.png' });
      await flushPromises();

      const cellImages = wrapper.findAll('tbody img').filter((img) => img.attributes('src') === 'app-icon.png');
      expect(cellImages.length).toBe(2);
    });

    it('falls back to the generic resource icon when no logo source is given', async () => {
      const wrapper = mountComponent({ isEmbedded: true, applicationIds: ['app-1'] });
      await flushPromises();

      expect(wrapper.find('tbody').text()).toContain('inventory_2');
    });

    it('hides the page header and actions column when embedded', async () => {
      const wrapper = mountComponent({ isEmbedded: true, applicationIds: ['app-1'] });
      await flushPromises();

      expect(wrapper.findComponent({ name: 'FrHeader' }).exists()).toBe(false);
      // Add button is never offered on the resource list
      expect(wrapper.find('button.btn-primary').exists()).toBe(false);
      // No actions column in the embedded table
      const headers = wrapper.findAll('th').map((th) => th.text());
      expect(headers).not.toContain('common.actions');
      expect(headers).toHaveLength(2);
    });

    it('shows the actions column when standalone', async () => {
      const wrapper = mountComponent();
      await flushPromises();

      const headers = wrapper.findAll('th').map((th) => th.text());
      expect(headers).toContain('Actions');
    });
  });

  describe('@a11y', () => {
    it('has no accessibility violations', async () => {
      const wrapper = mountComponent();
      await flushPromises();
      await runA11yTest(wrapper);
    });
  });
});
