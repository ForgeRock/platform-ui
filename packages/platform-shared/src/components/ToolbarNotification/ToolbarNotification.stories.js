/**
 * Copyright 2019-2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
/* eslint-disable import/first */
const template = `
<div class="margin-25">
  <div class="sg_masthead">
    <h1 class="display-4">Toolbar Notification</h1>
    <p class="mb-4 lead">Bell Button that shows number of notifications, complete with dropdown showing each one</p>
  </div>
  <FrToolbarNotification style="max-width: 330px; list-style: none;"/>
</div>`;

/* eslint import/no-extraneous-dependencies: 0 */
import { storiesOf } from '@storybook/vue';
import Vuex from 'vuex';
import ToolbarNotification from './index';

const stories = storiesOf('Components|ToolbarNotification', module).addParameters({ component: ToolbarNotification });

stories.add('ToolbarNotification', () => ({
  template,
  components: {
    FrToolbarNotification: ToolbarNotification,
  },
  data: () => {
    const retv = {
      notifications: [
        {
          createDate: '2019-10-30T17:53:22.956137Z',
          message: 'Your profile has been updated.',
          notificationType: 'info',
          _id: '83f40be7-2c60-4c5e-b54a-d941e61bbde0',
          _ref: 'internal/notification/83f40be7-2c60-4c5e-b54a-d941e61bbde0',
          _refProperties: {
            _id: '71c71fc3-b8d9-4d8f-afb1-4ed92bdfc745',
            _rev: '00000000317fa757',
          },
          _refResourceCollection: 'internal/notification',
          _refResourceId: '83f40be7-2c60-4c5e-b54a-d941e61bbde0',
          _rev: '000000001ee96108',
        },
      ],
    };
    return retv;
  },
  store: new Vuex.Store({
    state: {
      UserStore: {
        userId: '',
        internalUser: '',
        managedResource: '',
      },
    },
  }),
}));
