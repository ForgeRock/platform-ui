/**
 * Copyright (c) 2025-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import * as EntitlementApi from '@forgerock/platform-shared/src/api/governance/EntitlementApi';
import FrGovResourceSelect from '@forgerock/platform-shared/src/components/governance/GovResourceSelect';
import AppAndObjectType from './AppAndObjectType';
import i18n from '@/i18n';

mockValidation(['required']);

jest.mock('@forgerock/platform-shared/src/api/governance/EntitlementApi');
jest.mock('@forgerock/platform-shared/src/utils/appSharedUtils', () => ({
  getApplicationLogo: jest.fn().mockReturnValue('app_logo.png'),
  getApplicationDisplayName: jest.fn().mockReturnValue('app display name'),
}));

describe('AppAndObjectType', () => {
  let wrapper;

  EntitlementApi.getApplicationList.mockImplementation(() => Promise.resolve({
    data: {
      result: [
        {
          application: {
            name: 'TestApp',
            id: 'TestId',
            objectTypes: [
              {
                name: 'TestObjectType',
                accountAttribute: 'accountAttribute1',
              },
              {
                name: 'TestObjectType2',
              },
            ],
          },
        },
      ],
    },
  }));

  function mountComponent() {
    return mount(AppAndObjectType, {
      global: {
        plugins: [i18n],
      },
    });
  }

  it('gets application list on load', async () => {
    wrapper = mountComponent();
    await flushPromises();

    expect(EntitlementApi.getApplicationList).toHaveBeenCalledWith(
      'application',
      {
        pageSize: 100,
        queryFilter: '!(application.authoritative eq "true") and application.objectTypes.accountAttribute co ""',
      },
      false,
    );
  });

  it('excludes disconnected apps when excludeDisconnected is true', async () => {
    wrapper = mount(AppAndObjectType, {
      global: { plugins: [i18n] },
      props: { excludeDisconnected: true },
    });
    await flushPromises();

    expect(EntitlementApi.getApplicationList).toHaveBeenCalledWith(
      'application',
      {
        pageSize: 100,
        queryFilter: '!(application.authoritative eq "true") and application.objectTypes.accountAttribute co "" and !(application.isDisconnected eq "true")',
      },
      false,
    );
  });

  it('omits the entitlement scope permission filter when overrideScopePermission is true', async () => {
    wrapper = mount(AppAndObjectType, {
      global: { plugins: [i18n] },
      props: { overrideScopePermission: true },
    });
    await flushPromises();

    expect(EntitlementApi.getApplicationList).toHaveBeenCalledWith(
      'application',
      {
        pageSize: 100,
        queryFilter: '!(application.authoritative eq "true") and application.objectTypes.accountAttribute co ""',
      },
      true,
    );
  });

  it('omits the account attribute filter when filterByAccountAttribute is false', async () => {
    wrapper = mount(AppAndObjectType, {
      global: { plugins: [i18n] },
      props: { filterByAccountAttribute: false },
    });
    await flushPromises();

    expect(EntitlementApi.getApplicationList).toHaveBeenCalledWith(
      'application',
      {
        pageSize: 100,
        queryFilter: '!(application.authoritative eq "true")',
      },
      false,
    );
  });

  it('still applies a user-entered search filter when filterByAccountAttribute is false', () => {
    wrapper = mount(AppAndObjectType, {
      global: { plugins: [i18n] },
      props: { filterByAccountAttribute: false },
    });

    expect(wrapper.vm.queryParamFunction('acme')).toEqual({
      pageSize: 100,
      queryFilter: 'application.name co "acme" and !(application.authoritative eq "true")',
    });
  });

  it('combines excludeDisconnected with a search filter when filterByAccountAttribute is false', () => {
    wrapper = mount(AppAndObjectType, {
      global: { plugins: [i18n] },
      props: { filterByAccountAttribute: false, excludeDisconnected: true },
    });

    expect(wrapper.vm.queryParamFunction('acme')).toEqual({
      pageSize: 100,
      queryFilter: 'application.name co "acme" and !(application.authoritative eq "true") and !(application.isDisconnected eq "true")',
    });
  });

  it('selecting application type sets object type options and emits event', async () => {
    wrapper = mountComponent();
    await flushPromises();

    const application = {
      application: {
        name: 'TestApp',
        id: 'TestId',
        objectTypes: [
          {
            name: 'TestObjectType',
            accountAttribute: 'accountAttribute1',
          },
          {
            name: 'TestObjectType2',
          },
        ],
      },
    };

    wrapper.findComponent(FrGovResourceSelect).vm.$emit('selected:option', application);
    await flushPromises();

    const objectTypeInput = wrapper.find('[label="Object Type"]');
    expect(objectTypeInput.exists()).toBe(true);
    const options = objectTypeInput.findAll('[role="option"]');
    expect(options.length).toBe(1);
    expect(options[0].text()).toBe('TestObjectType');

    expect(wrapper.emitted('selected:application')[0]).toEqual([application.application]);
    expect(wrapper.emitted('input')[0]).toEqual([null]);
  });

  it('application-only mode hides object type and emits application id', async () => {
    wrapper = mount(AppAndObjectType, {
      global: { plugins: [i18n] },
      props: { applicationOnly: true },
    });
    await flushPromises();

    const application = {
      application: {
        name: 'TestApp',
        id: 'TestId',
        objectTypes: [],
      },
    };

    wrapper.findComponent(FrGovResourceSelect).vm.$emit('input', 'TestId');
    wrapper.findComponent(FrGovResourceSelect).vm.$emit('selected:option', application);
    await flushPromises();

    expect(wrapper.find('[label="Object Type"]').exists()).toBe(false);
    expect(wrapper.emitted('input').at(-1)).toEqual([{ applicationId: 'TestId' }]);
  });

  it('selecting application and object type emits event', async () => {
    wrapper = mountComponent();
    await flushPromises();

    const application = {
      application: {
        name: 'TestApp',
        id: 'TestId',
        objectTypes: [
          {
            name: 'TestObjectType',
            accountAttribute: 'accountAttribute1',
          },
          {
            name: 'TestObjectType2',
          },
        ],
      },
    };

    wrapper.findComponent(FrGovResourceSelect).vm.$emit('input', 'TestId');
    wrapper.findComponent(FrGovResourceSelect).vm.$emit('selected:option', application);
    await flushPromises();
    wrapper.findComponent('[label="Object Type"]').vm.$emit('input', 'TestObjectType');
    await flushPromises();

    expect(wrapper.emitted('input')[1]).toEqual([{
      applicationId: 'TestId',
      objectType: 'TestObjectType',
    }]);
  });
});
