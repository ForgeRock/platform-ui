/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { getApplicationDisplayName, getApplicationLogo, loadAppTemplates } from '@forgerock/platform-shared/src/utils/appSharedUtils';
import { blankValueIndicator } from '@forgerock/platform-shared/src/utils/governance/constants';
import { cloneDeep } from 'lodash';
import dayjs from 'dayjs';
import uuid from 'uuid/v4';
import accessConstants from './accessConstants';
import i18n from '@/i18n';

/**
 * Generates an access skeleton
 * @returns {Object} Baseline object used for tracking and maintaining an access node
 */
export function generateNodeSkeleton() {
  return {
    x: null,
    y: null,
    id: uuid(),
    name: '',
    displayType: '',
    connections: {},
  };
}

/**
 * Builds display name for grant given the grant object
 * @param {object} grant Access grant object
 */
export function getAccessDisplayName(grant) {
  const itemType = grant.item.type;
  switch (itemType) {
    case accessConstants.GRANT_TYPES.ACCOUNT:
      return grant.descriptor?.idx?.['/account']?.displayName || grant.account?.__NAME__;
    case accessConstants.GRANT_TYPES.ENTITLEMENT:
      return grant.descriptor?.idx?.['/entitlement']?.displayName || grant.entitlement?.__NAME__;
    case accessConstants.GRANT_TYPES.ROLE:
      return grant.role.name;
    default:
      return '';
  }
}

/**
 * Builds display name for node given the node's name
 * @param {String} grantType Type of grant (accountGrant, entitlementGrant, roleMembership)
 */
export function getAccessTypeDisplayName(grantType) {
  return i18n.global.t(`governance.access.displayName.${grantType}`);
}

/**
 * Gets the unique node identifier for a grant
 * @param {string} item type Access grant object type
 * @param {string} id Access grant object id
 * @returns node identifier for grant
 */
function getGrantNodeIdentifier(itemType, id) {
  return `${itemType}-${id}`;
}

/**
 * Gets the unique node identifier for a grant from the object itself
 * @param {object} grant Access grant object
 * @returns node identifier for grant
 */
export function getGrantNodeIdentifierFromGrant(grant) {
  const itemType = grant.item.type;
  const id = grant.keys[`${accessConstants.GRANT_KEYS[itemType]}`];
  return getGrantNodeIdentifier(itemType, id);
}

/**
 * Takes a list of access grants and creates connections and outcomes for each one
 * @param {Array}   grants List of access grants
 */
function createConnections(grants) {
  const connections = {};

  grants.forEach((grant) => {
    const itemType = grant.item.type;
    const grantId = getGrantNodeIdentifier(itemType, grant.keys[`${accessConstants.GRANT_KEYS[itemType]}`]);

    // Create a connection to the entitlement's account and add to account's outcomes
    if (itemType === accessConstants.GRANT_TYPES.ENTITLEMENT && grant.keys?.accountId) {
      const accountNodeId = getGrantNodeIdentifier(accessConstants.GRANT_TYPES.ACCOUNT, grant.keys.accountId);

      connections[accountNodeId] = connections[accountNodeId] || {};
      connections[accountNodeId][grantId] = grantId;
    }

    // Create a connection to any role based access and add to role's outcomes
    const grantTypes = grant.relationship?.properties?.grantTypes || [];
    grantTypes.forEach((grantType) => {
      if (grantType.roleId) {
        const roleNodeId = getGrantNodeIdentifier(accessConstants.GRANT_TYPES.ROLE, grantType.roleId);
        connections[roleNodeId] = connections[roleNodeId] || {};
        connections[roleNodeId][grantId] = grantId;
      }
    });
  });

  grants.forEach((grant) => {
    const itemType = grant.item.type;
    const grantId = getGrantNodeIdentifier(itemType, grant.keys[`${accessConstants.GRANT_KEYS[itemType]}`]);

    const grantConnections = connections[grantId] || {};
    grant.connections = grantConnections;
  });
  return grants;
}

/**
 * Formats a role membership grant for display
 * @param {object} grant Role membership grant
 * @returns Formatted grant
 */
function formatRoleMembership(grant) {
  const formattedRoleGrant = {
    id: getGrantNodeIdentifierFromGrant(grant),
    type: accessConstants.GRANT_TYPES.ROLE,
    displayName: getAccessDisplayName(grant),
    icon: 'assignment_ind',
    connections: grant.connections,
  };
  return formattedRoleGrant;
}

/**
 * Formats an account grant for display
 * @param {object} grant Account grant
 * @returns Formatted grant
 */
function formatAccountGrant(grant) {
  const formattedAccountGrant = {
    id: getGrantNodeIdentifierFromGrant(grant),
    type: accessConstants.GRANT_TYPES.ACCOUNT,
    displayName: getAccessDisplayName(grant),
    appName: getApplicationDisplayName(grant.application),
    icon: getApplicationLogo(grant.application),
    connections: grant.connections,
  };
  return formattedAccountGrant;
}

/**
 * Formats an entitlement grant for display
 * @param {object} grant Entitlement grant
 * @returns Formatted grant
 */
function formatEntitlementGrant(grant) {
  const formattedEntitlementGrant = {
    id: getGrantNodeIdentifierFromGrant(grant),
    type: accessConstants.GRANT_TYPES.ENTITLEMENT,
    displayName: getAccessDisplayName(grant),
    appName: getApplicationDisplayName(grant.application),
    icon: getApplicationLogo(grant.application),
    connections: grant.connections,
  };
  return formattedEntitlementGrant;
}

/**
 * Returns date on proper format
 * @param {String} date formatted date
 */
export function parseDate(date) {
  if (!date) {
    return blankValueIndicator;
  }
  return dayjs(date).format('MMM D, YYYY');
}

function sortObjectsByConnections(objects) {
  const objectMap = Object.fromEntries(objects.map((o) => [o.id, o]));
  const added = new Set();
  const result = [];

  // Recursive helper to add an object and all its connected children
  const addWithChildren = (obj) => {
    if (!obj || added.has(obj.id)) return;

    result.push(obj);
    added.add(obj.id);

    // Add all connected objects recursively
    Object.keys(obj.connections || {}).forEach((connId) => {
      addWithChildren(objectMap[connId]);
    });
  };

  // Step 1: Roles first, sorted by number of connections
  const roles = objects
    .filter((o) => o.type === 'roleMembership')
    .sort((a, b) => Object.keys(b.connections || {}).length - Object.keys(a.connections || {}).length);

  roles.forEach((role) => addWithChildren(role));

  // Step 2: Any remaining accounts (or entitlements) not connected to a role
  objects.forEach((obj) => {
    if (!added.has(obj.id) && (obj.type === 'accountGrant' || obj.type === 'entitlementGrant')) {
      addWithChildren(obj);
    }
  });

  return result;
}

/**
 * Takes a list of user's access and formats it for a display node in access graph
 * @param {Array}   grants List of user's access
 * @returns Formatted access grants
 */
export async function formatAccessGrants(grants) {
  await loadAppTemplates();

  // Populate connections
  const connectedGrants = createConnections(cloneDeep(grants));

  return sortObjectsByConnections(connectedGrants.map((grant) => {
    if (grant.item.type === accessConstants.GRANT_TYPES.ROLE) {
      return formatRoleMembership(grant);
    }
    if (grant.item.type === accessConstants.GRANT_TYPES.ACCOUNT) {
      return formatAccountGrant(grant);
    }
    if (grant.item.type === accessConstants.GRANT_TYPES.ENTITLEMENT) {
      return formatEntitlementGrant(grant);
    }
    return {};
  }));
}
