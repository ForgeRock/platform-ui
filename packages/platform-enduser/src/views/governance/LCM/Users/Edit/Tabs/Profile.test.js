/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import * as SchemaApi from '@forgerock/platform-shared/src/api/SchemaApi';
import * as PrivilegeApi from '@forgerock/platform-shared/src/api/PrivilegeApi';
import * as AccessRequestApi from '@forgerock/platform-shared/src/api/governance/AccessRequestApi';
import Profile from './Profile';
import i18n from '@/i18n';

jest.mock('@forgerock/platform-shared/src/api/PrivilegeApi');
jest.mock('@forgerock/platform-shared/src/api/SchemaApi');
jest.mock('@forgerock/platform-shared/src/api/governance/AccessRequestApi');

SchemaApi.getSchema.mockImplementation(() => Promise.resolve({
  data: {
    order: [
      'userName',
      'givenName',
      'sn',
      'mail',
    ],
    properties: {
      userName: {
        title: 'User Name',
        type: 'string',
        viewable: true,
      },
      givenName: {
        title: 'First Name',
        type: 'string',
        viewable: true,
      },
      sn: {
        title: 'Last Name',
        type: 'string',
        viewable: true,
      },
      mail: {
        title: 'Email Address',
        type: 'string',
        viewable: true,
      },
    },
  },
}));

PrivilegeApi.getResourceTypePrivilege.mockImplementation(() => Promise.resolve({
  data: {
    VIEW: {
      allowed: true,
      properties: [
        'userName',
        'givenName',
        'sn',
        'mail',
      ],
    },
  },
}));

describe('Profile', () => {
  let wrapper;
  function mountComponent() {
    return mount(Profile, {
      props: {
        user: {
          _id: '12345',
          userName: 'mikeTest',
          givenName: 'Mike',
          sn: 'Test',
          mail: 'test@test.com',
        },
      },
      global: {
        plugins: [i18n],
      },
    });
  }

  it('submits a request with an empty user object if no values have been changed', async () => {
    wrapper = mountComponent();
    await flushPromises();

    wrapper.find('[type="button"]').trigger('click');
    await flushPromises();
    expect(AccessRequestApi.submitCustomRequest).toHaveBeenCalledWith(
      'modifyUser',
      {
        common: {},
        custom: {},
        user: {
          userId: '12345',
          user: {},
        },
      },
    );
  });

  it('submits a request with only the changed values', async () => {
    wrapper = mountComponent();
    await flushPromises();

    await wrapper.findComponent('[id="User Name"]').vm.$emit('input', 'newUserName');
    await wrapper.find('[type="button"]').trigger('click');
    await flushPromises();
    expect(AccessRequestApi.submitCustomRequest).toHaveBeenCalledWith(
      'modifyUser',
      {
        common: {},
        custom: {},
        user: {
          userId: '12345',
          user: {
            userName: 'newUserName',
          },
        },
      },
    );
  });
});
