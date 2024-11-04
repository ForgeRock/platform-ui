/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

export const blankValueIndicator = '--';

/**
 * Admin permissions in the reviewers modal for access reviews
 */
export const ADMIN_REVIEWER_PERMISSIONS = {
  certify: true,
  comment: true,
  exception: true,
  forward: true,
  reassign: true,
  reset: true,
  revoke: true,
  signoff: true,
};

/**
 * Permissions for access requests
 */
export const ACCESS_REQUEST_PERMISSIONS = {
  approve: true,
  comment: true,
  modify: true,
  reject: true,
  reassign: true,
};

/**
 * Permissions for fulfillment tasks
 */
export const FULFILLMENT_TASK_PERMISSIONS = {
  comment: true,
  deny: true,
  fulfill: true,
  modify: true,
  reassign: true,
};

/**
 * @typedef {string} REQUEST_MODAL_TYPE
 * */

/**
 * @enum {REQUEST_MODAL_TYPE}
 */
export const REQUEST_MODAL_TYPES = {
  APPROVE: 'APPROVE',
  CANCEL: 'CANCEL',
  COMMENT: 'COMMENT',
  DENY: 'DENY',
  DETAILS: 'DETAILS',
  FULFILL: 'FULFILL',
  REASSIGN: 'REASSIGN',
  REJECT: 'REJECT',
};
