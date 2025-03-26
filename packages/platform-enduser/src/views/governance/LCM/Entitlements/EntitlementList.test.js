/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import * as EntitlementApi from '@forgerock/platform-shared/src/api/governance/EntitlementApi';
import FrSearchInput from '@forgerock/platform-shared/src/components/SearchInput';
import EntitlementList from './EntitlementList';
import i18n from '@/i18n';

jest.mock('@forgerock/platform-shared/src/api/governance/CommonsApi');
jest.mock('@forgerock/platform-shared/src/api/governance/EntitlementApi');
jest.mock('@forgerock/platform-shared/src/utils/appSharedUtils', () => ({
  getApplicationLogo: jest.fn().mockReturnValue('app_logo.png'),
  getApplicationDisplayName: jest.fn().mockReturnValue('app display name'),
}));

describe('EntitlementList', () => {
  let wrapper;
  function mountComponent() {
    return mount(EntitlementList, {
      global: {
        plugins: [i18n],
      },
    });
  }

  EntitlementApi.getEntitlementList.mockImplementation(() => Promise.resolve({
    data: {
      result: [
        {
          application: {
            name: 'TargetApp',
            templateName: 'servicenow',
            templateVersion: '3.3',
          },
          descriptor: {
            idx: {
              '/entitlement': {
                displayName: 'template_read_global',
              },
            },
          },
          entitlementOwner: [
            {
              id: 'bfd816e1-b9fe-4ea9-90f5-45e2e906cdfc',
              userName: 'christian.marnell',
              givenName: 'Christian',
              sn: 'Marnell',
              mail: 'christian.marnell@example.com',
            },
          ],
        },
      ],
    },
  }));

  CommonsApi.getResource.mockImplementation(() => Promise.resolve({
    data: {
      result: [
        {
          id: 'appId',
          name: 'appName',
        },
      ],
    },
  }));

  it('has columns for entitlement, display name, owner', async () => {
    wrapper = mountComponent();
    await flushPromises();

    const entitlementRow = wrapper.find('thead tr');
    expect(entitlementRow.text()).toMatch('Entitlement');
    expect(entitlementRow.text()).toMatch('Display Name');
    expect(entitlementRow.text()).toMatch('Owner');
  });

  it('shows the entitlement app name and type', async () => {
    wrapper = mountComponent();
    await flushPromises();

    const entitlementRow = wrapper.find('tbody tr');
    expect(entitlementRow.text()).toMatch('TargetApp');
    expect(entitlementRow.text()).toMatch('app display name');
  });

  it('shows entitlement owner', async () => {
    wrapper = mountComponent();
    await flushPromises();

    const entitlementRow = wrapper.find('tbody tr');
    expect(entitlementRow.text()).toMatch('Christian Marnell');
    expect(entitlementRow.text()).toMatch('christian.marnell');
  });

  it('can filter by application', async () => {
    wrapper = mountComponent();
    await flushPromises();

    wrapper.findComponent('[label="Select application"]').vm.$emit('input', 'managed/resource/appId');
    await flushPromises();

    expect(EntitlementApi.getEntitlementList).toHaveBeenLastCalledWith(
      'entitlement',
      {
        fields: 'application,descriptor,entitlementOwner,item',
        pageSize: 10,
        pagedResultsOffset: 0,
        queryFilter: 'application.id eq "appId"',
        sortKeys: 'application.name',
      },
    );
  });

  it('can filter by entitlement owner', async () => {
    wrapper = mountComponent();
    await flushPromises();

    wrapper.findComponent('[label="Entitlement Owner"]').vm.$emit('input', 'userQuery');
    await flushPromises();

    expect(EntitlementApi.getEntitlementList).toHaveBeenLastCalledWith(
      'entitlement',
      {
        fields: 'application,descriptor,entitlementOwner,item',
        pageSize: 10,
        pagedResultsOffset: 0,
        queryFilter: '(entitlementOwner.userName co "userQuery" or entitlementOwner.givenName co "userQuery" or entitlementOwner.sn co "userQuery")',
        sortKeys: 'application.name',
      },
    );
  });

  it('can filter by entitlement owner, app, and entitlement name at the same time', async () => {
    wrapper = mountComponent();
    await flushPromises();

    const search = wrapper.findComponent(FrSearchInput);
    search.vm.$emit('input', 'test');
    await flushPromises();
    search.vm.$emit('search');
    wrapper.findComponent('[label="Select application"]').vm.$emit('input', 'managed/resource/appId');
    wrapper.findComponent('[label="Entitlement Owner"]').vm.$emit('input', 'userQuery');
    await flushPromises();

    expect(EntitlementApi.getEntitlementList).toHaveBeenLastCalledWith(
      'entitlement',
      {
        fields: 'application,descriptor,entitlementOwner,item',
        pageSize: 10,
        pagedResultsOffset: 0,
        queryFilter: '(descriptor.idx./entitlement.displayName co "test") and (application.id eq "appId" and (entitlementOwner.userName co "userQuery" or entitlementOwner.givenName co "userQuery" or entitlementOwner.sn co "userQuery"))',
        sortKeys: 'application.name',
      },
    );
  });
});
