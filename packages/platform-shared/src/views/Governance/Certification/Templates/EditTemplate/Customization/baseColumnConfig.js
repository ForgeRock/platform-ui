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
};

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
