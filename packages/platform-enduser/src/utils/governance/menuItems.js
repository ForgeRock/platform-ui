/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

const inboxMenuItem = {
  displayName: 'sideMenu.inbox',
  icon: 'inbox',
  showBadgeWithContentFromStore: 'inboxTotalCount',
  subItems: [
    {
      showBadgeWithContentFromStore: 'approvalsCount',
      displayName: 'sideMenu.approvals',
      routeTo: {
        name: 'Approvals',
      },
    },
    {
      showBadgeWithContentFromStore: 'fulfillmentTasksCount',
      displayName: 'sideMenu.tasks',
      routeTo: {
        name: 'Tasks',
      },
    },
    {
      showBadgeWithContentFromStore: 'certificationCount',
      displayName: 'sideMenu.accessReviews',
      routeTo: {
        name: 'AccessReviews',
      },
    },
    {
      showBadgeWithContentFromStore: 'violationsCount',
      displayName: 'sideMenu.violations',
      routeTo: {
        name: 'Violations',
      },
    },
  ],
};

const myAccessMenuItem = {
  displayName: 'sideMenu.myAccess',
  icon: 'badge',
  subItems: [
    {
      displayName: 'sideMenu.accounts',
      routeTo: { name: 'Accounts' },
    },
    {
      displayName: 'sideMenu.roles',
      routeTo: { name: 'Roles' },
    },
    {
      displayName: 'sideMenu.entitlements',
      routeTo: { name: 'Entitlements' },
    },
  ],
};

const directoryMenuItem = {
  displayName: 'sideMenu.directory',
  icon: 'people',
  subItems: [
    {
      displayName: 'sideMenu.delegates',
      routeTo: { name: 'Delegates' },
    },
    {
      displayName: 'sideMenu.directReports',
      routeTo: { name: 'DirectReports' },
    },
  ],
};

const myRequestsMenuItem = {
  routeTo: { name: 'MyRequests' },
  displayName: 'sideMenu.requests',
  icon: 'person_add',
};

/**
 * Generates the LCM (Lifecycle Management) menu item configuration based on the store's state.
 *
 * @param {Object} store - The Vuex store object containing the application state.
 * @returns {Object} The LCM menu item configuration. Returns an empty object if LCM governance is not enabled.
 */
export function getLCMMenuItem(store) {
  if (store.state.govLcmEnabled !== true) {
    return {};
  }
  const governanceLcm = {
    displayName: 'sideMenu.administer',
    icon: 'manage_accounts',
    subItems: [],
  };
  if (store.state.govLcmUser === true) {
    governanceLcm.subItems.push({
      displayName: 'sideMenu.administerUsers',
      routeTo: { name: 'AdministerUsers' },
    });
  }
  if (store.state.govLcmEntitlement === true) {
    governanceLcm.subItems.push({
      displayName: 'sideMenu.administerEntitlements',
      routeTo: { name: 'AdministerEntitlements' },
    });
  }
  return governanceLcm;
}

// eslint-disable-next-line import/prefer-default-export
export function getGovMenuItems(store) {
  return {
    directoryMenuItem,
    inboxMenuItem,
    lcmMenuItem: getLCMMenuItem(store),
    myAccessMenuItem,
    myRequestsMenuItem,
  };
}
