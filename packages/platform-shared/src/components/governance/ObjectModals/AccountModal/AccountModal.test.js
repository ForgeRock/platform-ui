/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount, flushPromises } from '@vue/test-utils';
import * as ApplicationsApi from '@forgerock/platform-shared/src/api/governance/ApplicationsApi';
import AccountModal from './index';

jest.mock('@forgerock/platform-shared/src/api/governance/ApplicationsApi');

describe('AccountModal', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallowMount(AccountModal, {
      global: {
        mocks: {
          $t: (t) => t,
        },
      },
      props: {
        grant: {
          id: 'test',
        },
      },
    });
  });

  it('component should load correclty', () => {
    expect(wrapper.vm.grant).toStrictEqual({ id: 'test' });
  });

  it('does not fetch schema when grant has no applicationId or objectType', async () => {
    await flushPromises();
    expect(ApplicationsApi.getObjectTypeSchema).not.toHaveBeenCalled();
    expect(wrapper.vm.objectTypeSchema).toBeNull();
    expect(wrapper.vm.isLoadingSchema).toBe(false);
  });

  it('fetches and sets schema when grant has applicationId and objectType', async () => {
    ApplicationsApi.getObjectTypeSchema.mockResolvedValue({
      data: { properties: { __NAME__: { displayName: 'Username' } } },
    });

    await wrapper.setProps({
      grant: {
        keys: { accountId: 'system/App/__ACCOUNT__/123' },
        application: { id: 'app1', isDisconnected: false },
      },
    });
    await flushPromises();

    expect(ApplicationsApi.getObjectTypeSchema).toHaveBeenCalledWith('app1', '__ACCOUNT__');
    expect(wrapper.vm.objectTypeSchema).toEqual({ __NAME__: 'Username' });
    expect(wrapper.vm.isLoadingSchema).toBe(false);
  });

  it('leaves schema null and clears loading on API failure', async () => {
    ApplicationsApi.getObjectTypeSchema.mockRejectedValue(new Error('fail'));

    await wrapper.setProps({
      grant: {
        keys: { accountId: 'system/App/__ACCOUNT__/123' },
        application: { id: 'app1', isDisconnected: false },
      },
    });
    await flushPromises();

    expect(wrapper.vm.objectTypeSchema).toBeNull();
    expect(wrapper.vm.isLoadingSchema).toBe(false);
  });
});
