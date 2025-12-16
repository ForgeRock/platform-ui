/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

const GRANT_TYPES = {
  ROLE: 'roleMembership',
  ACCOUNT: 'accountGrant',
  ENTITLEMENT: 'entitlementGrant',
};

const GRANT_KEYS = {
  accountGrant: 'accountId',
  entitlementGrant: 'entitlementId',
  roleMembership: 'roleId',
};

const GRANT_NODES = [
  {
    type: 'accountGrant',
    icon: 'task_alt',
    color: 'green',
    popover: false,
  },
  {
    type: 'entitlementGrant',
    icon: 'how_to_reg',
    color: 'blue',
    popover: false,
  },
  {
    type: 'roleMembership',
    icon: 'signpost',
    color: 'blue',
    popover: false,
  },
];

const NODE_ICONS = {
  accountGrant: {
    icon: 'task_alt',
    color: 'orange',
  },
  entitlementGrant: {
    icon: 'signpost',
    color: 'purple',
  },
  roleMembership: {
    icon: 'rule',
    color: 'blue',
  },
};

export default {
  GRANT_TYPES,
  GRANT_KEYS,
  GRANT_NODES,
  NODE_ICONS,
};
