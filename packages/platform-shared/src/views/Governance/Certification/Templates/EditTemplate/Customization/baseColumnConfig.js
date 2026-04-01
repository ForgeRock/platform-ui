/**
 * Copyright 2025 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
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
