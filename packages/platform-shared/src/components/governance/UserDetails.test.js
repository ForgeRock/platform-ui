/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import UserDetails from './UserDetails';

describe('UserDetails.vue', () => {
  function mountComponent(propsData) {
    const wrapper = mount(UserDetails, {
      global: {
        mocks: {
          $t: (string, obj) => {
            switch (string) {
              case 'common.userFullName':
                return `${obj.givenName} ${obj.sn}`;
              default:
                return string;
            }
          },
        },
      },
      props: {
        userObject: {
          id: '123',
          userName: 'jDoe',
          givenName: 'John',
          sn: 'Doe',
        },
        ...propsData,
      },
    });
    return wrapper;
  }

  it('renders user full name component', () => {
    const wrapper = mountComponent();
    expect(wrapper.find('.text-dark').text()).toBe('John Doe');
  });

  it('renders userName correctly', () => {
    const wrapper = mountComponent();
    expect(wrapper.find('small').text()).toBe('jDoe');
  });

  it('renders system user correctly', () => {
    const wrapper = mountComponent({
      userObject: {
        id: 'SYSTEM',
      },
    });
    expect(wrapper.find('.text-dark').text()).toBe('common.system');
    expect(wrapper.find('small').exists()).toBe(false);
  });
});
