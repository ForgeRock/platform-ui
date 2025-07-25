/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

export const CUSTOM_MENU_ITEM = {
  id: 'custom',
  icon: 'link',
};

export const DIVIDER_MENU_ITEM = {
  id: 'divider',
  icon: 'horizontal_rule',
  isDivider: true,
};

// enduser hosted default menu items, any new menu item should be added here.
export const DEFAULT_MENU_ITEMS = [
  {
    id: 'dashboard',
    routeTo: { name: 'Dashboard' },
  },
  {
    id: 'riskDashboard',
    routeTo: { name: 'RiskDashboard' },
    icon: 'show_chart',
    available: (flag) => flag.autoAccessEnabled,
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
    available: (flag) => flag.autoAccessEnabled,
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
    available: (flag) => (flag.ifGovernance && flag.govLcmEnabled),
    subItems: [
      {
        id: 'lcmUsers',
        available: (flag) => flag.govLcmUser,
        routeTo: { name: 'AdministerUsers' },
      },
      {
        id: 'lcmEntitlements',
        available: (flag) => flag.govLcmEntitlement,
        routeTo: { name: 'AdministerEntitlements' },
      },
    ],
  },
];
