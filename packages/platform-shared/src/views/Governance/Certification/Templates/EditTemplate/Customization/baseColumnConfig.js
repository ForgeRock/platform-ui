/**
 * Copyright (c) 2025-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

export const baseColumnConfig = {
  accounts: [
    'user.user',
    'application.application',
    'review.flags',
    'review.comments',
  ],
  entitlements: [
    'user.user',
    'application.application',
    'entitlement.entitlement',
    'account.account',
    'review.flags',
    'review.comments',
    'review.prediction',
  ],
  entitlementComposition: [
    'application.application',
    'entitlement.entitlement',
    'review.flags',
    'review.comments',
  ],
  roles: [
    'role.role',
    'user.user',
    'review.flags',
    'review.comments',
  ],
  identityProfile: [
    'user.user',
    'review.flags',
    'review.comments',
  ],
  roleComposition: [
    'role.role',
    'review.flags',
    'review.comments',
  ],
  agentProfile: [
    'agent.agent',
    'agent.platform',
    'review.flags',
    'review.comments',
  ],
  // agentAccess items only consistently carry the agent's user identity — the
  // single agent reference column, not the account-derived platform/model/owner
  agentAccess: [
    'agent.agent',
    'review.flags',
    'review.comments',
  ],
};

// Out-of-the-box certification column declarations. An entry may carry
// `hideSortable: true` to hide that column's Sortable toggle in the column
// picker — for columns the certification table cannot server-sort (no
// getSortByField mapping). Flag is intentionally not set on existing entries;
// add it to fields that lack backend sort support as they are declared here.
export const OOTBColumns = {
  'user.user': {
    label: 'User',
  },
  'application.application': {
    label: 'Application',
  },
  'entitlement.entitlement': {
    label: 'Entitlement',
  },
  'account.account': {
    label: 'Account',
  },
  'role.role': {
    label: 'Role',
  },
  'agent.agent': {
    label: 'Agent',
  },
  'agent.platform': {
    label: 'Platform',
    hideSortable: true,
  },
  'agent.model': {
    label: 'Model',
    hideSortable: true,
  },
  'review.flags': {
    label: 'Flags',
  },
  'review.comments': {
    label: 'Comments',
  },
  'review.prediction': {
    label: 'Recommendation',
  },
};
