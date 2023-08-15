/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import flushPromises from 'flush-promises';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import i18n from '@/i18n';
import GovResourceSelect from './index';

const mountComponent = (propsData = {}) => mount(GovResourceSelect, {
  i18n,
  mocks: {
    $store: {
      state: {
        SharedStore: {
          uiConfig: {},
        },
      },
    },
  },
  propsData: {
    resourcePath: '/openidm/managed/alpha_user',
    text: 'testInput',
    initialData: {
      givenName: 'test1',
      sn: 'user',
      id: 'userId1',
    },
    ...propsData,
  },
});

const userContext = jest.fn().mockReturnValue(Promise.resolve({
  data: {
    result: [
      {
        givenName: 'test1',
        sn: 'user',
        id: 'userId1',
      },
      {
        givenName: 'test2',
        sn: 'user',
        id: 'userId2',
      },
    ],
  },
}));
const roleContext = jest.fn().mockReturnValue(Promise.resolve({
  data: {
    result: [
      {
        name: 'role 1',
        id: 'roleId1',
      },
      {
        name: 'role 2',
        id: 'roleId2',
      },
    ],
  },
}));

describe('GovResourceSelect Component', () => {
  CommonsApi.getResource = userContext;

  it('does not duplicate the selected option', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.vm.selectOptions).toEqual([
      {
        text: 'test1 user',
        userInfo: {
          givenName: 'test1',
          sn: 'user',
          id: 'userId1',
        },
        value: 'userId1',
      },
      {
        text: 'test2 user',
        userInfo: {
          givenName: 'test2',
          sn: 'user',
          id: 'userId2',
        },
        value: 'userId2',
      },
    ]);
  });

  it('includes an all option if selectAllText is provided', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    await wrapper.setProps({
      firstOption: {
        text: 'test option',
        value: 'all',
      },
    });

    expect(wrapper.vm.selectOptions).toEqual([
      {
        text: 'test option',
        value: 'all',
      },
      {
        text: 'test1 user',
        userInfo: {
          givenName: 'test1',
          sn: 'user',
          id: 'userId1',
        },
        value: 'userId1',
      },
      {
        text: 'test2 user',
        userInfo: {
          givenName: 'test2',
          sn: 'user',
          id: 'userId2',
        },
        value: 'userId2',
      },
    ]);
  });

  it('handles input', async () => {
    CommonsApi.getResource = roleContext;

    const wrapper = mountComponent({
      initialData: {
        name: 'role 2',
        id: 'roleId2',
      },
      resourcePath: '/openidm/managed/alpha_role',
    });
    await flushPromises();
    expect(wrapper.emitted('get-role-info')[0][0]).toEqual({ id: 'roleId2', name: 'role 2' });
    expect(wrapper.emitted('input')[0][0]).toEqual('managed/alpha_role/roleId2');
  });
});
