/**
 * Copyright (c) 2024-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount, flushPromises } from '@vue/test-utils';
import UserGroupList from './UserGroupList';
import { runA11yTest } from '../../utils/testHelpers';

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
  describe('@a11y', () => {
    it('Should be accessible', async () => {
      const usersList = [
        { id: 'user1', name: 'John Doe' },
        { id: 'user2', name: 'Jane Smith' },
        { id: 'role1', name: 'Admin' },
      ];
      setup({
        usersList,
        usersToDisplay: 3,
        hideShowMore: true,
      });
      await runA11yTest(wrapper);
    });
  });

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

  it('Should render each owner correctly when owners have no id (e.g. multi-value owner API responses)', () => {
    const usersList = [
      { userName: 'owner1', givenName: 'First', sn: 'Owner' },
      { userName: 'owner2', givenName: 'Second', sn: 'Owner' },
      { userName: 'owner3', givenName: 'Third', sn: 'Owner' },
    ];
    setup({
      usersList,
      usersToDisplay: 3,
    });
    const userInfos = wrapper.findAll('[data-testid="user-info"');
    expect(userInfos).toHaveLength(3);
    expect(userInfos[0].text()).toContain('owner1');
    expect(userInfos[1].text()).toContain('owner2');
    expect(userInfos[2].text()).toContain('owner3');
  });

  it('Should reveal remaining users and toggle button text when "show more" is clicked', async () => {
    const usersList = [
      { id: 'user1', name: 'John Doe' },
      { id: 'user2', name: 'Jane Smith' },
      { id: 'user3', name: 'Alice' },
      { id: 'user4', name: 'Bob' },
    ];
    setup({
      usersList,
      usersToDisplay: 3,
    });

    expect(wrapper.findAll('[data-testid="user-info"]')).toHaveLength(3);

    const showMoreButton = wrapper.find('[data-testid="show-more-button"]');
    expect(showMoreButton.text()).toContain('common.showMore');
    expect(wrapper.find('.collapse').classes()).not.toContain('show');

    await showMoreButton.trigger('click');
    await flushPromises();

    expect(wrapper.find('.collapse').classes()).toContain('show');
    expect(wrapper.find('[data-testid="show-more-button"]').text()).toContain('common.hideMore');
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
