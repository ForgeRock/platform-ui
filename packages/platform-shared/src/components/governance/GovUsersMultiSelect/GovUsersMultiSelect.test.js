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
import GovUsersMultiSelect from './index';

const mountComponent = () => mount(GovUsersMultiSelect, {
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
});

const usersOptions = jest.fn().mockReturnValue(Promise.resolve({
  data: {
    result: [
      {
        givenName: 'test1',
        id: 'userId1',
        profileImage: 'urlTest1',
        sn: 'user',
        userName: 'userName1',
      },
      {
        givenName: 'test2',
        id: 'userId2',
        profileImage: 'urlTest2',
        sn: 'user',
        userName: 'userName2',
      },
      {
        givenName: 'test3',
        id: 'userId3',
        profileImage: 'urlTest3',
        sn: 'user',
        userName: 'userName3',
      },
    ],
  },
}));

describe('GovUsersMultiSelect', () => {
  CommonsApi.getResource = usersOptions;

  it('shows all users on initial component loading', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.vm.options).toEqual([
      {
        value: {
          name: 'test1 user',
          id: 'userId1',
          profileImage: 'urlTest1',
          userName: 'userName1',
        },
      },
      {
        value: {
          name: 'test2 user',
          id: 'userId2',
          profileImage: 'urlTest2',
          userName: 'userName2',
        },
      },
      {
        value: {
          name: 'test3 user',
          id: 'userId3',
          profileImage: 'urlTest3',
          userName: 'userName3',
        },
      },
    ]);
  });

  it('does not duplicate the selected option', async () => {
    const wrapper = mountComponent();
    await flushPromises();
    wrapper.vm.selectValue = [
      {
        name: 'test1 user',
        id: 'userId1',
        profileImage: 'urlTest1',
        userName: 'userName1',
      },
      {
        name: 'test2 user',
        id: 'userId2',
        profileImage: 'urlTest2',
        userName: 'userName2',
      },
    ];
    await flushPromises();
    wrapper.vm.filterOptions(wrapper.vm.options);

    expect(wrapper.vm.options).toEqual([
      {
        value: {
          name: 'test3 user',
          id: 'userId3',
          profileImage: 'urlTest3',
          userName: 'userName3',
        },
      },
    ]);
  });
});
