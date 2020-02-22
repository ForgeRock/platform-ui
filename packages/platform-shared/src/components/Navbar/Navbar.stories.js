/**
 * Copyright 2019-2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
/* eslint import/no-extraneous-dependencies: 0 */
import { storiesOf } from '@storybook/vue';
import { withKnobs, boolean, text } from '@storybook/addon-knobs';
import Vuex from 'vuex';
import Navbar from './index';

const stories = storiesOf('Components|Navbar', module).addParameters({ component: Navbar });
stories.addDecorator(withKnobs);

const template = `
  <div class="margin-25">
    <div class="sg_masthead">
      <h5 class="display-4">Navbar</h5>
    </div>
    <FrNavbar
      :hideToggle="hideToggle"
      :showNotifications="showNotifications">
    </FrNavbar>
  </div>
`;

stories.add('Default Navbar', () => ({
  components: {
    FrNavbar: Navbar,
  },
  template,
  store: new Vuex.Store({
    state: {
      UserStore: {
        userId: '',
        internalUser: '',
        managedResource: '',
      },
    },
  }),
  props: {
    hideToggle: {
      type: Boolean,
      default: boolean('hideToggle', false),
    },
    showNotifications: {
      type: Boolean,
      default: boolean('showNotifications', false),
    },
    showHelpLink: {
      type: Boolean,
      default: boolean('showHelpLink', true),
    },
    helpURL: {
      type: String,
      default: text('helpURL', '/'),
    },
    showDocksLink: {
      type: Boolean,
      default: boolean('showDocksLink', true),
    },
    docsLink: {
      type: String,
      default: text('docsLink', '#'),
    },
  },
}));
