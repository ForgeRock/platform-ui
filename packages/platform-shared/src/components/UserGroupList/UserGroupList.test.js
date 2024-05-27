/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import UserGroupList from './UserGroupList';

let wrapper;

function setup(props) {
  wrapper = mount(UserGroupList, {
    global: {
      mocks: {
        $t: (t) => t,
      },
    },
    props: {
      ...props,
    },
  });
}

describe('UserGroupList', () => {
  it('Should renders user information correctly', () => {
    const usersList = [
      { id: 'user1', name: 'John Doe' },
      { id: 'user2', name: 'Jane Smith' },
      { id: 'role1', name: 'Admin' },
    ];
    setup({
      usersList,
      usersToDisplay: 3,
    });
    const userInfos = wrapper.findAll('[data-testid="user-info"');
    expect(userInfos.length).toBe(3);
    const showMoreButton = wrapper.find('[data-testid="show-more-button"');
    expect(showMoreButton.exists()).toBe(false);
  });

  it('Should renders "show more" button when users exceed limit', () => {
    const usersList = [
      { id: 'user1', name: 'John Doe' },
      { id: 'user2', name: 'Jane Smith' },
      { id: 'user3', name: 'Alice' },
      { id: 'user4', name: 'Bob' },
      { id: 'user5', name: 'Eve' },
    ];
    setup({
      usersList,
      usersToDisplay: 2,
    });
    const userInfos = wrapper.findAll('[data-testid="user-info"');
    expect(userInfos.length).toBe(2);
    const showMoreButton = wrapper.find('[data-testid="show-more-button"');
    expect(showMoreButton.exists()).toBe(true);
  });

  it('Should not renders "show more" button when users exceed limit and hideShowMore is true', () => {
    const usersList = [
      { id: 'user1', name: 'John Doe' },
      { id: 'user2', name: 'Jane Smith' },
      { id: 'user3', name: 'Alice' },
      { id: 'user4', name: 'Bob' },
      { id: 'user5', name: 'Eve' },
    ];
    setup({
      hideShowMore: true,
      usersList,
      usersToDisplay: 2,
    });
    const userInfos = wrapper.findAll('[data-testid="user-info"');
    expect(userInfos.length).toBe(5);
    const showMoreButton = wrapper.find('[data-testid="show-more-button"');
    expect(showMoreButton.exists()).toBe(false);
  });
});
