/**
 * Copyright 2019 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
/* eslint import/no-extraneous-dependencies: 0 */
import { storiesOf } from '@storybook/vue';
import {
  withKnobs,
  boolean,
  text,
  object,
} from '@storybook/addon-knobs';
import SideMenu from './index';

const stories = storiesOf('Components|SideMenu', module).addParameters({ component: SideMenu });

stories.addDecorator(withKnobs);

const template = `
  <div>
    <div class="sg_masthead" style="margin-top: 25px;"align="center">
      <h5 class="display-4">SideMenu</h5>
    </div>

    <FrSideMenu 
      :dropdownItems="dropdownItems"
      :menuItems="menuItems"
      :openMenu="openMenu"
      :showEnduserLink="showEnduserLink"
      :enduserLink="enduserLink"
      :userDetails="userDetails">
    </FrSideMenu>
  </div>
`;

const menuItems = [
  {
    routeName: '/route1',
    resourceType: 'test',
    resourceName: 'test',
    displayName: 'Home',
    icon: 'home',
  },
  {
    menuGroup: true,
    displayName: 'Email',
    icon: 'email',
    menus: [
      {
        routeName: '/route2',
        displayName: 'Test 1',
        icon: 'fingerprint',
      },
      {
        routeName: '/route3',
        displayName: 'Test 2',
        icon: 'build',
      },
    ],
  },
  {
    menuGroup: true,
    displayName: 'Settings',
    icon: 'build',
    menus: [
      {
        routeName: '/route4',
        displayName: 'Test 4',
        icon: 'fingerprint',
      },
      {
        routeName: '/route5',
        displayName: 'Test 5',
        icon: 'build',
      },
    ],
  },
];

const dropItems = [
  {
    routeName: '/home',
    icon: 'build',
    displayName: 'build',
  },
];

stories.add('Default SideMenu', () => ({
  components: {
    FrSideMenu: SideMenu,
  },
  template,
  props: {
    dropdownItems: {
      type: Array,
      default: object('dropdownItems', dropItems),
    },
    menuItems: {
      type: Array,
      default: object('menuItems', menuItems),
    },
    openMenu: {
      type: Boolean,
      default: boolean('openMenu', false),
    },
    showEnduserLink: {
      type: Boolean,
      default: boolean('showEnduserLink', true),
    },
    enduserLink: {
      type: String,
      default: text('enduserLink', '/'),
    },
    userDetails: {
      type: Object,
      default: object('userDetails', {
        name: 'Fake Name',
        company: 'ForgeRock',
        email: 'email@fake.com',
        adminUser: false,
        adminURL: 'wwwfakecom',
      }),
    },
  },
}));
