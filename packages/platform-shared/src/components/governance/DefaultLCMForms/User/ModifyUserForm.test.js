/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { flushPromises, mount } from '@vue/test-utils';
import ModifyUserForm from './ModifyUserForm';
import i18n from '@/i18n';

jest.mock('@forgerock/platform-shared/src/api/PrivilegeApi');

describe('ModifyUserForm', () => {
  let wrapper;
  function mountComponent() {
    return mount(ModifyUserForm, {
      props: {
        user: {
          userName: 'mikeTest',
          givenName: 'Mike',
          sn: 'Test',
          mail: 'test@test.com',
        },
        userSchema: {
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
        privilegeData: {
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
      },
      global: {
        plugins: [i18n],
      },
    });
  }

  it('contain a form with fields based on the schema', async () => {
    wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.find('[label="User Name"]').exists()).toBe(true);
    expect(wrapper.find('[label="First Name"]').exists()).toBe(true);
    expect(wrapper.find('[label="Last Name"]').exists()).toBe(true);
    expect(wrapper.find('[label="Email Address"]').exists()).toBe(true);
  });

  it('will populate the form fields with the data from the user prop', async () => {
    wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.find('[id="User Name"]').attributes('value')).toBe('mikeTest');
    expect(wrapper.find('[id="First Name"]').attributes('value')).toBe('Mike');
    expect(wrapper.find('[id="Last Name"]').attributes('value')).toBe('Test');
    expect(wrapper.find('[id="Email Address"]').attributes('value')).toBe('test@test.com');
  });

  it('changing a value in the form emits an event with new form values', async () => {
    wrapper = mountComponent();
    await flushPromises();

    wrapper.findComponent('[id="User Name"]').vm.$emit('input', 'newUserName');
    expect(wrapper.emitted('update:modelValue')[0][0]).toEqual({
      userName: 'newUserName',
      givenName: 'Mike',
      sn: 'Test',
      mail: 'test@test.com',
    });
  });
});
