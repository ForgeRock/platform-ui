/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import UserBasicInfo from './UserBasicInfo';

let wrapper;

const ITEM = {
  givenName: 'manuel',
  name: 'test-name',
  sn: 'test',
  userName: 'testing.manuel',
};

function setup(props) {
  wrapper = mount(UserBasicInfo, {
    global: {
      mocks: {
        $t: (t) => t,
      },
    },
    props: {
      user: ITEM,
      ...props,
    },
  });
}

describe('UserBasicInfo', () => {
  it('Should renders user information correctly for regular user', () => {
    setup();

    expect(wrapper.find('p').text()).toBe(`${ITEM.givenName} ${ITEM.sn}`);
    expect(wrapper.find('small').text()).toBe(ITEM.userName);

    const profilePicture = wrapper.find('[data-testid="profile-picture"]');
    const roleIcon = wrapper.find('[data-testid="role-icon"]');
    expect(profilePicture.exists()).toBe(true);
    expect(roleIcon.exists()).toBe(false);
  });

  it('Should renders user information correctly for role', () => {
    setup({ isRole: true });

    expect(wrapper.find('p').text()).toBe(ITEM.name);
    expect(wrapper.find('small').text()).toBe('Role');

    const profilePicture = wrapper.find('[data-testid="profile-picture"]');
    const roleIcon = wrapper.find('[data-testid="role-icon"]');
    expect(profilePicture.exists()).toBe(false);
    expect(roleIcon.exists()).toBe(true);
  });
});
