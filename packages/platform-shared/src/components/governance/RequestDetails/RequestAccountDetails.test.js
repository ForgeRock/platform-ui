/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import * as ApplicationsApi from '@forgerock/platform-shared/src/api/governance/ApplicationsApi';
import RequestAccountDetails from './RequestAccountDetails';
import i18n from '@/i18n';

jest.mock('@forgerock/platform-shared/src/api/governance/ApplicationsApi');

function setup(propsData = {}) {
  return mount(RequestAccountDetails, {
    global: {
      plugins: [i18n],
    },
    props: propsData,
  });
}

describe('RequestAccountDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ApplicationsApi.getObjectTypeSchema.mockResolvedValue({
      data: {
        properties: {
          userName: {
            displayName: 'Username',
            type: 'string',
            order: 1,
            flags: [],
          },
          immutableId: {
            displayName: 'Immutable Id',
            type: 'string',
            order: 2,
            flags: ['NOT_UPDATEABLE'],
          },
        },
      },
    });
  });

  it('shows account properties for a createAccount request', async () => {
    const wrapper = setup({
      requestType: 'createAccount',
      request: {
        account: {
          applicationId: 'app-1',
          objectType: 'User',
          object: { userName: 'new.user' },
        },
      },
    });
    await flushPromises();

    expect(ApplicationsApi.getObjectTypeSchema).toHaveBeenCalledWith('app-1', 'User');
    expect(wrapper.text()).toContain('Username');
    expect(wrapper.find('[id="Username"] input').element.value).toBe('new.user');
  });

  it('shows only the account id for a deleteAccount request and does not fetch a schema', async () => {
    const wrapper = setup({
      requestType: 'deleteAccount',
      request: {
        account: {
          accountId: 'account-1',
        },
      },
    });
    await flushPromises();

    expect(ApplicationsApi.getObjectTypeSchema).not.toHaveBeenCalled();
    expect(wrapper.find('button').exists()).toBe(false);
  });

  it('renders account properties as disabled fields and hides the save button when read-only', async () => {
    const wrapper = setup({
      requestType: 'modifyAccount',
      readOnly: true,
      request: {
        account: {
          accountId: 'account-1',
          applicationId: 'app-1',
          objectType: 'User',
          object: { userName: 'updated.user' },
        },
      },
    });
    await flushPromises();

    const userNameInput = wrapper.find('[id="Username"]');
    expect(userNameInput.exists()).toBe(true);
    expect(userNameInput.attributes().disabled).toBe('true');
    expect(wrapper.findComponent({ name: 'ButtonWithSpinner' }).exists()).toBe(false);
  });

  it('renders editable account properties and a save button when not read-only, disabling NOT_UPDATEABLE fields', async () => {
    const wrapper = setup({
      requestType: 'modifyAccount',
      readOnly: false,
      request: {
        account: {
          accountId: 'account-1',
          applicationId: 'app-1',
          objectType: 'User',
          object: { userName: 'updated.user', immutableId: 'do-not-change' },
        },
      },
    });
    await flushPromises();

    const userNameInput = wrapper.find('[id="Username"]');
    expect(userNameInput.attributes().disabled).toBeUndefined();
    expect(wrapper.find('[id="Username"] input').element.value).toBe('updated.user');
    const immutableIdInput = wrapper.find('[id="Immutable Id"]');
    expect(immutableIdInput.attributes().disabled).toBe('true');
    expect(wrapper.find('[id="Immutable Id"] input').element.value).toBe('do-not-change');
    expect(wrapper.findComponent({ name: 'ButtonWithSpinner' }).exists()).toBe(true);
  });

  it('emits save with the merged account payload', async () => {
    const wrapper = setup({
      requestType: 'modifyAccount',
      readOnly: false,
      request: {
        common: { justification: 'test' },
        account: {
          accountId: 'account-1',
          applicationId: 'app-1',
          objectType: 'User',
          object: { userName: 'updated.user' },
        },
      },
    });
    await flushPromises();

    wrapper.vm.accountValues = { ...wrapper.vm.accountValues, userName: 'changed.user' };
    await wrapper.vm.saveAccountRequest();

    expect(wrapper.emitted('save')[0][0]).toEqual({
      common: { justification: 'test' },
      account: {
        accountId: 'account-1',
        applicationId: 'app-1',
        objectType: 'User',
        object: { userName: 'changed.user' },
      },
    });
  });

  it('falls back to a read-only property list when the schema fetch fails', async () => {
    ApplicationsApi.getObjectTypeSchema.mockRejectedValue(new Error('not found'));
    const wrapper = setup({
      requestType: 'createAccount',
      request: {
        account: {
          applicationId: 'app-1',
          objectType: 'User',
          object: { userName: 'new.user' },
        },
      },
    });
    await flushPromises();

    expect(wrapper.text()).toContain('userName');
    expect(wrapper.text()).toContain('new.user');
    expect(wrapper.find('[id="Username"]').exists()).toBe(false);
  });

  it('does not render account properties when there are none beyond the meta fields', async () => {
    ApplicationsApi.getObjectTypeSchema.mockResolvedValue({ data: { properties: {} } });
    const wrapper = setup({
      requestType: 'createAccount',
      request: {
        account: {
          applicationId: 'app-1',
          objectType: 'User',
        },
      },
    });
    await flushPromises();

    expect(wrapper.text()).not.toContain('Account Properties');
  });

  it('handles a missing request payload gracefully', async () => {
    const wrapper = setup({
      requestType: 'deleteAccount',
      request: {},
    });
    await flushPromises();

    expect(wrapper.find('button').exists()).toBe(false);
    expect(ApplicationsApi.getObjectTypeSchema).not.toHaveBeenCalled();
  });
});
