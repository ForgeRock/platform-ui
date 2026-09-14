/**
 * Copyright (c) 2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import { mockValidation } from '@forgerock/platform-shared/src/testing/utils/mockValidation';
import { getManagedResourceList } from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import AccountOwnerFields from './AccountOwnerFields';
import i18n from '@/i18n';

mockValidation(['required']);

jest.mock('@forgerock/platform-shared/src/api/ManagedResourceApi');

jest.mock('@/store', () => ({
  state: {
    realm: 'alpha',
  },
}));

const usersMock = [
  {
    _id: 'user1', givenName: 'Ada', sn: 'Lovelace', userName: 'alovelace',
  },
  {
    _id: 'user2', givenName: 'Grace', sn: 'Hopper', userName: 'ghopper',
  },
];

function setup(props = {}) {
  return mount(AccountOwnerFields, {
    global: {
      plugins: [i18n],
    },
    props,
  });
}

describe('AccountOwnerFields', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getManagedResourceList.mockResolvedValue({ data: { result: usersMock } });
  });

  it('emits the selected user as userId', async () => {
    const wrapper = setup();
    await flushPromises();

    const userSelect = wrapper.findComponent({ name: 'FrField' });
    userSelect.vm.$emit('input', 'user1');
    await flushPromises();

    expect(wrapper.emitted('update:modelValue')[0][0]).toEqual({ userId: 'user1' });
  });

  it('emits the account type value, keeping a previously selected user', async () => {
    const wrapper = setup();
    await flushPromises();

    const [userSelect, accountTypeField] = wrapper.findAllComponents({ name: 'FrField' });
    userSelect.vm.$emit('input', 'user1');
    await flushPromises();
    accountTypeField.vm.$emit('input', 'default');
    await flushPromises();

    const emissions = wrapper.emitted('update:modelValue');
    expect(emissions[0][0]).toEqual({ userId: 'user1' });
    expect(emissions[emissions.length - 1][0]).toEqual({ userId: 'user1', accountType: 'default' });
  });

  it('pre-fetches an initial page of users on mount so the dropdown is not empty', async () => {
    const wrapper = setup();
    await flushPromises();

    expect(getManagedResourceList).toHaveBeenCalledWith('alpha_user', {
      pageSize: 10,
      fields: 'givenName,sn,userName',
      queryFilter: true,
    });
    expect(wrapper.vm.userOptions).toEqual([
      { value: 'user1', text: 'Ada Lovelace (alovelace)' },
      { value: 'user2', text: 'Grace Hopper (ghopper)' },
    ]);
  });

  it('queries users from the managed resource when searching', async () => {
    jest.useFakeTimers();
    const wrapper = setup();
    await flushPromises();

    const userSelect = wrapper.findComponent({ name: 'FrField' });
    await userSelect.vm.$emit('search-change', 'ada');
    jest.runAllTimers();
    await flushPromises();

    expect(getManagedResourceList).toHaveBeenCalledWith('alpha_user', {
      pageSize: 10,
      fields: 'givenName,sn,userName',
      queryFilter: 'givenName sw "ada" or sn sw "ada" or userName sw "ada"',
    });
    expect(wrapper.vm.userOptions).toEqual([
      { value: 'user1', text: 'Ada Lovelace (alovelace)' },
      { value: 'user2', text: 'Grace Hopper (ghopper)' },
    ]);
    jest.useRealTimers();
  });

  it('cancels a pending debounced search when unmounted', async () => {
    jest.useFakeTimers();
    const wrapper = setup();
    await flushPromises();
    getManagedResourceList.mockClear();

    const userSelect = wrapper.findComponent({ name: 'FrField' });
    await userSelect.vm.$emit('search-change', 'ada');
    wrapper.unmount();
    jest.runAllTimers();
    await flushPromises();

    expect(getManagedResourceList).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('derives the user resource from the realm when no prop is passed', async () => {
    setup();
    await flushPromises();

    expect(getManagedResourceList).toHaveBeenCalledWith('alpha_user', expect.anything());
  });

  it('prefers an explicit userResourceName prop over the realm-derived resource', async () => {
    setup({ userResourceName: 'custom_user' });
    await flushPromises();

    expect(getManagedResourceList).toHaveBeenCalledWith('custom_user', expect.anything());
  });
});
