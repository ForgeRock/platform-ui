/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { mount } from '@vue/test-utils';
import { cloneDeep } from 'lodash';
import dayjs from 'dayjs';
import { findByTestId } from '@forgerock/platform-shared/src/utils/testHelpers';
import Comments from './Comments';

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

  const createWrapper = (props) => mount(Comments, {
    props,
    global: {
      mocks: {
        $t: (t, e) => {
          switch (t) {
            case 'pagination.dropdown.text':
              return JSON.stringify(e);
            default:
              return t;
          }
        },
      },
    },
  });

  it('component should display only comment labeled as "action: \'comment\'"', () => {
    const wrapper = createWrapper(defaultPropsData);
    const listItems = wrapper.findAll('.list-feed-item');
    expect(listItems.length).toBe(1);
    const itemText = listItems[0].text();
    expect(itemText).toContain('mariotest');
    expect(itemText).toContain(dayjs(defaultPropsData.item.rawData.decision.comments[0].timeStamp).format('MMM D, YYYY h:mm A'));
    expect(itemText).toContain('AddThisTestComment');
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

    expect(pagination.text()).toContain('{"pageMin":1,"pageMax":10,"totalRows":15}');
  });

  it('has a button to add comments when there are no comments', () => {
    const wrapper = createWrapper(noCommentsPropsData);

    const addButton = findByTestId(wrapper, 'btn-add-comments-no-data');
    expect(addButton.exists()).toBeTruthy();
  });

  it('has a button to add comments when there are comments', () => {
    const wrapper = createWrapper({ ...defaultPropsData });

    const addButton = findByTestId(wrapper, 'btn-add-comments');
    expect(addButton.exists()).toBeTruthy();
  });

  describe('hideActions', () => {
    it('hides add comment button when there are no comments', () => {
      const wrapper = createWrapper({ ...noCommentsPropsData, hideActions: true });

      const addButton = findByTestId(wrapper, 'btn-add-comments-no-data');
      expect(addButton.exists()).toBeFalsy();
    });

    it('hides add comment button when there are comments', () => {
      const wrapper = createWrapper({ ...defaultPropsData, hideActions: true });

      const addButton = findByTestId(wrapper, 'btn-add-comments');
      expect(addButton.exists()).toBeFalsy();
    });
  });
});
