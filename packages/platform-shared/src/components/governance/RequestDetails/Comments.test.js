/**
 * Copyright (c) 2023-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { cloneDeep } from 'lodash';
import dayjs from 'dayjs';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import Comments from './Comments';
import i18n from '@/i18n';

describe('Comments', () => {
  const defaultPropsData = {
    item: {
      details: {
        date: '2023-06-22T19:23:26+00:00',
      },
      rawData: {
        decision: {
          comments: [{
            timeStamp: '2023-08-02T21:26:11+00:00',
            user: {
              mail: 'mariotest@test.com', givenName: 'Mario', id: 'managed/user/e2477644-00a4-438b-86ff-4308c56f80e1', sn: 'Test', userName: 'mariotest',
            },
            comment: 'AddThisTestComment',
            action: 'comment',
            phase: 'userApprove',
          }, {
            timeStamp: '2023-08-02T21:26:11+00:00',
            user: {
              id: 'SYSTEM',
            },
            comment: 'Test comment from system user',
            action: 'comment',
            phase: 'userApprove',
          }, {
            timeStamp: '2023-08-02T21:30:14+00:00',
            user: {
              mail: 'mariotest@test.com', givenName: 'Mario', id: 'managed/user/e2477644-00a4-438b-86ff-4308c56f80e1', sn: 'Test', userName: 'mariotest',
            },
            comment: 'Assigned task to Lew Celiz (Lew.Celiz@autoidzoran.onmicrosoft.com). Removed actor(s) Mario Test (mariotest).',
            action: 'reassign',
            phase: 'userApprove',
          }],
        },
      },
    },
  };

  const noCommentsPropsData = cloneDeep(defaultPropsData);
  noCommentsPropsData.item.rawData.decision.comments = [];

  const onlySystemCommentsPropsData = cloneDeep(defaultPropsData);
  onlySystemCommentsPropsData.item.rawData.decision.comments = [onlySystemCommentsPropsData.item.rawData.decision.comments[1]];

  const createWrapper = (props) => mount(Comments, {
    props,
    global: {
      plugins: [i18n],
    },
  });

  it('component should display all comments by default', () => {
    const wrapper = createWrapper(defaultPropsData);
    const listItems = wrapper.findAll('.list-feed-item');
    expect(listItems.length).toBe(3);
    const itemText = listItems[0].text();
    expect(itemText).toContain('mariotest');
    expect(itemText).toContain(dayjs(defaultPropsData.item.rawData.decision.comments[0].timeStamp).format('MMM D, YYYY h:mm A'));
    expect(itemText).toContain('AddThisTestComment');
  });

  it('component should display only comments where user id is not "system" after clicking "User Comments"', async () => {
    const wrapper = createWrapper(defaultPropsData);
    const buttons = wrapper.findAll('button');
    const dropdown = wrapper.findAll('.b-dropdown')[0];
    const dropdownItem = dropdown.findAll('.dropdown-item')[1];
    expect(buttons[1].text()).toMatch('All Comments');
    expect(dropdownItem.text()).toMatch('User Comments');
    await dropdownItem.trigger('click');
    expect(buttons[1].text()).toMatch('User Comments');

    const listItems = wrapper.findAll('.list-feed-item');
    expect(listItems.length).toBe(2);
    const itemText = listItems[1].text();
    expect(itemText).toContain('mariotest');
    expect(itemText).toContain(dayjs(defaultPropsData.item.rawData.decision.comments[2].timeStamp).format('MMM D, YYYY h:mm A'));
    expect(itemText).toContain('Assigned task');
  });

  it('component should display 10 comments and pagination should show 15 total', () => {
    const paginatedCommentsPropsData = cloneDeep(defaultPropsData);
    paginatedCommentsPropsData.item.rawData.decision.comments = new Array(15).fill(paginatedCommentsPropsData.item.rawData.decision.comments[0], 0, 15);
    const wrapper = createWrapper(paginatedCommentsPropsData);
    const listItems = wrapper.findAll('.list-feed-item');
    expect(listItems.length).toBe(10);
    const itemText = listItems[9].text();
    expect(itemText).toContain('mariotest');
    expect(itemText).toContain(dayjs(paginatedCommentsPropsData.item.rawData.decision.comments[9].timeStamp).format('MMM D, YYYY h:mm A'));
    expect(itemText).toContain('AddThisTestComment');

    const pagination = wrapper.find('.pagination-dropdown .toggle-dropdown-button');

    expect(pagination.text()).toContain('1-10 of 15');
  });

  it('has a button to add comments when there are no comments', () => {
    const wrapper = createWrapper(noCommentsPropsData);

    const addButton = findByTestId(wrapper, 'btn-add-comments');
    expect(addButton.exists()).toBeTruthy();
  });

  it('has a button to add comments when there are comments', () => {
    const wrapper = createWrapper({ ...defaultPropsData });

    const addButton = findByTestId(wrapper, 'btn-add-comments');
    expect(addButton.exists()).toBeTruthy();
  });

  it('has a button to add comments when there are comments but they are filtered out', async () => {
    const wrapper = createWrapper({ ...onlySystemCommentsPropsData });
    const dropdown = wrapper.findAll('.b-dropdown')[0];
    const dropdownItem = dropdown.findAll('.dropdown-item')[1];
    await dropdownItem.trigger('click');

    const addButton = findByTestId(wrapper, 'btn-add-comments');
    expect(addButton.exists()).toBeTruthy();
  });

  describe('hideActions', () => {
    it('hides add comment button when there are no comments', () => {
      const wrapper = createWrapper({ ...noCommentsPropsData, hideActions: true });

      const addButton = findByTestId(wrapper, 'btn-add-comments');
      expect(addButton.exists()).toBeFalsy();
    });

    it('hides add comment button when there are comments', () => {
      const wrapper = createWrapper({ ...defaultPropsData, hideActions: true });

      const addButton = findByTestId(wrapper, 'btn-add-comments');
      expect(addButton.exists()).toBeFalsy();
    });
  });
});
