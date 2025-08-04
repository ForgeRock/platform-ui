/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

const END_USER_MENU_CONSTANTS = Object.freeze({
  CUSTOM: 'custom',
  DIVIDER: 'divider',
  INTERNAL_ROLE: 'internal/role',
  LCM_USERS: 'lcmUsers',
  LCM_ENTITLEMENTS: 'lcmEntitlements',
  MENU_ITEM_LABEL_LOCALE_PREFIX: 'sideMenu.endUser.',
});

export { END_USER_MENU_CONSTANTS };

export const CUSTOM_MENU_ITEM = {
  id: 'custom',
  icon: 'link',
};

export const DIVIDER_MENU_ITEM = {
  id: 'divider',
  icon: 'horizontal_rule',
  isDivider: true,
};

/** Enduser hosted default menu items, any new menu item should be added here.
 *
 * Each item should have an `id`, and optionally an `icon` and `routeTo`.
 * `icon` is optional only when its `id` is a valid icon name.
 * The `available` function can be used to conditionally display the item based on feature flags.
 * The `subItems` array can be used to define nested menu items.
 * The `showBadgeWithContentFromStore` property can be used to display a badge with content from the store.
 * If `available` is not defined, the item will always be displayed.
 */
export const DEFAULT_MENU_ITEMS = [
  {
    id: 'dashboard',
    routeTo: { name: 'Dashboard' },
  },
  {
    id: 'riskDashboard',
    routeTo: { name: 'RiskDashboard' },
    icon: 'show_chart',
    available: (flag) => flag.autoAccessEnabled && flag.riskDashboardEnabled,
  },
  {
    id: 'reports',
    icon: 'summarize',
    available: (flag) => flag.autoReportsEnabled,
    routeTo: { name: 'Reports' },
  },
  {
    id: 'inbox',
    showBadgeWithContentFromStore: 'inboxTotalCount',
    subItems: [
      {
        id: 'approvals',
        showBadgeWithContentFromStore: 'approvalsCount',
        routeTo: { name: 'Approvals' },
      },
      {
        id: 'tasks',
        showBadgeWithContentFromStore: 'fulfillmentTasksCount',
        routeTo: { name: 'Tasks' },
      },
      {
        id: 'accessReviews',
        showBadgeWithContentFromStore: 'certificationCount',
        routeTo: { name: 'AccessReviews' },
      },
      {
        id: 'violations',
        showBadgeWithContentFromStore: 'violationsCount',
        routeTo: { name: 'Violations' },
      },
    ],
    available: (flag) => flag.ifGovernance,
  },
  // Divider item existed as a separator between workforce and other menu items
  {
    id: 'divider',
    icon: 'horizontal_rule',
    isDivider: true,
    available: (flag) => flag.workforceEnabled,
  },
  {
    id: 'applications',
    icon: 'apps',
    available: (flag) => flag.workforceEnabled,
    routeTo: { name: 'Applications' },
  },
  {
    id: 'myAccess',
    icon: 'lock',
    subItems: [
      {
        id: 'myAccounts',
        routeTo: { name: 'Accounts' },
      },
      {
        id: 'myRoles',
        routeTo: { name: 'Roles' },
      },
      {
        id: 'myEntitlements',
        routeTo: { name: 'Entitlements' },
      },
    ],
    available: (flag) => flag.ifGovernance,
  },
  {
    id: 'directory',
    icon: 'folder',
    subItems: [
      {
        id: 'delegates',
        routeTo: { name: 'Delegates' },
      },
      {
        id: 'directReports',
        routeTo: { name: 'DirectReports' },
      },
    ],
    available: (flag) => flag.ifGovernance,
  },
  {
    id: 'riskAdministration',
    icon: 'settings',
    available: (flag) => flag.autoAccessEnabled && flag.riskAdminEnabled,
    subItems: [
      {
        id: 'dataSources',
        routeTo: { name: 'AutoAccessDataSources' },
      },
      {
        id: 'pipelines',
        routeTo: { name: 'AutoAccessPipelines' },
      },
      {
        id: 'riskConfig',
        routeTo: { name: 'AutoAccessRiskConfig' },
      },
    ],
  },
  {
    id: 'requests',
    icon: 'send',
    available: (flag) => flag.ifGovernance,
    routeTo: { name: 'MyRequests' },
  },
  {
    id: 'profile',
    icon: 'person',
    routeTo: { name: 'Profile' },
  },
  {
    id: 'lcm',
    icon: 'manage_accounts',
    available: (flag) => flag.ifGovernance,
    subItems: [
      {
        id: END_USER_MENU_CONSTANTS.LCM_USERS,
        routeTo: { name: 'AdministerUsers' },
      },
      {
        id: END_USER_MENU_CONSTANTS.LCM_ENTITLEMENTS,
        routeTo: { name: 'AdministerEntitlements' },
      },
    ],
  },
];

/** Map of LCM sub-items ID to their corresponding feature flags
 *  on which they depend for their visibility.
*/
export const LCM_SUBITEMS_ID_FLAG_MAP = {
  [END_USER_MENU_CONSTANTS.LCM_USERS]: 'govLcmUser',
  [END_USER_MENU_CONSTANTS.LCM_ENTITLEMENTS]: 'govLcmEntitlement',
};
