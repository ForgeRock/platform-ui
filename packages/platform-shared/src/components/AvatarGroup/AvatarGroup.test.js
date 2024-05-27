/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import AvatarGroup from './AvatarGroup';

let wrapper;

const USERS = [
  {
    id: 'user-id-1',
    givenName: 'John',
    sn: 'Doe',
    userName: 'john_doe',
    profileImage: 'path/to/image1.png',
  },
  {
    id: 'user-id-2',
    givenName: 'Jane',
    sn: 'Smith',
    userName: 'jane_smith',
    profileImage: 'path/to/image2.png',
  },
  {
    id: 'user-id-3',
    givenName: 'Alice',
    sn: 'Johnson',
    userName: 'alice_johnson',
    profileImage: 'path/to/image3.png',
  },
  {
    id: 'user-id-4',
    givenName: 'Brad',
    sn: 'Pitt',
    userName: 'brad_pitt',
    profileImage: 'path/to/image4.png',
  },
];

function setup(propsData) {
  wrapper = mount(AvatarGroup, {
    global: {
      mocks: {
        $t: (t) => t,
      },
    },
    props: {
      id: 'test-id',
      users: USERS,
      ...propsData,
    },
  });
}

describe('AvatarGroup', () => {
  it('renders user avatars correctly', () => {
    setup({ avatarLimit: 4 });
    // Check if the correct number of user avatars are rendered
    expect(wrapper.findAll('[data-testid="avatar-item"]')).toHaveLength(USERS.length);

    // Check if user avatars are rendered with correct images
    const avatarImages = wrapper.findAll('img');
    avatarImages.forEach((img, index) => {
      expect(img.attributes('src')).toBe(USERS[index].profileImage);
    });
  });

  it('renders remaining users badge correctly when there are more users than the avatar limit', () => {
    const avatarLimit = 3;
    setup({ avatarLimit });
    // Check if the remaining users badge is rendered correctly
    expect(wrapper.find('[data-testid="overflow-badge"]').exists()).toBe(true);
    expect(wrapper.text()).toContain(`+${USERS.length - avatarLimit}`);
  });

  it('does not render remaining users badge when there are fewer users than the avatar limit', () => {
    const avatarLimit = 5;
    setup({ avatarLimit });
    // Check if the remaining users badge is not rendered
    expect(wrapper.find('[data-testid="overflow-badge"]').exists()).toBe(false);
  });

  it('should renders the proper component when users prop only have 1 element', () => {
    const users = [USERS[0]];
    setup({ users });
    // check that the proper component is render
    expect(wrapper.find('[data-testid="avatar-item"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="single-user-item"]').exists()).toBe(true);

    // check that the proper info is on the component
    expect(wrapper.find('p').text()).toBe(`${USERS[0].givenName} ${USERS[0].sn}`);
    expect(wrapper.find('small').text()).toBe(USERS[0].userName);
  });
});
