/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import flushPromises from 'flush-promises';
import * as CommonsApi from '@forgerock/platform-shared/src/api/governance/CommonsApi';
import GovResourceSelect from './index';

const mountComponent = () => mount(GovResourceSelect, {
  mocks: {
    $t: (text) => (text),
    $store: {
      state: {
        SharedStore: {
          uiConfig: {},
        },
      },
    },
  },
  propsData: {
    resourcePath: 'managed/user',
    label: 'testInput',
    initialData: {
      givenName: 'test1',
      sn: 'user',
      id: 'userId1',
    },
  },
});

describe('GovResourceSelect Component', () => {
  let wrapper;

  it('does not duplicate the selected option', async () => {
    CommonsApi.getResource = jest.fn().mockReturnValue(Promise.resolve({
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

    wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.vm.selectOptions).toEqual([
      {
        label: 'test1 user',
        userInfo: {
          givenName: 'test1',
          sn: 'user',
          id: 'userId1',
        },
        value: 'userId1',
      },
      {
        label: 'test2 user',
        userInfo: {
          givenName: 'test2',
          sn: 'user',
          id: 'userId2',
        },
        value: 'userId2',
      },
    ]);
  });
});
