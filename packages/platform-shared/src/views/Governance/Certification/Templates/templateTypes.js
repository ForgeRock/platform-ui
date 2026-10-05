/**
 * Copyright (c) 2023-2026 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

// types of certification templates
export const types = {
  IDENTITY: 'IDENTITY',
  ENTITLEMENT: 'ENTITLEMENT',
  ROLEMEMBERSHIP: 'ROLEMEMBERSHIP',
  EVENTBASED: 'EVENTBASED',
  ENTITLEMENTCOMPOSITION: 'ENTITLEMENTCOMPOSITION',
  IDENTITYPROFILE: 'IDENTITYPROFILE',
  ROLECOMPOSITION: 'ROLECOMPOSITION',
  AGENTPROFILE: 'AGENTPROFILE',
  AGENTACCESS: 'AGENTACCESS',
  RESOURCE: 'RESOURCE',
};

// maps from ui type to iga type
export const uiTypeMap = {
  IDENTITY: 'identity',
  ENTITLEMENT: 'entitlement',
  ROLEMEMBERSHIP: 'roleMembership',
  ENTITLEMENTCOMPOSITION: 'entitlementComposition',
  IDENTITYPROFILE: 'identityProfile',
  ROLECOMPOSITION: 'roleComposition',
  AGENTPROFILE: 'agentProfile',
  AGENTACCESS: 'agentAccess',
  RESOURCE: 'resource',
};

// enum values sent to the backend for the optional `platform` campaign filter
// types of filters
export const filterTypes = {
  ORGANIZATION: 'ORGANIZATION',
  USERS: 'USERS',
  APPLICATIONS: 'APPLICATIONS',
  ACCOUNTS: 'ACCOUNTS',
  ENTITLEMENTS: 'ENTITLEMENTS',
  ROLES: 'ROLES',
  RESOURCES: 'RESOURCES',
};

// maps from ui filter type to iga filter keys
export const filterTypeMap = {
  ORGANIZATION: 'ORGANIZATION',
  USERS: 'user',
  APPLICATIONS: 'application',
  ACCOUNTS: 'account',
  ENTITLEMENTS: 'entitlement',
  ROLES: 'role',
  RESOURCES: 'resource',
};

// Identity certification
export const IDENTITY = {
  filters: [filterTypes.ORGANIZATION, filterTypes.USERS, filterTypes.APPLICATIONS, filterTypes.ACCOUNTS, filterTypes.ENTITLEMENTS, filterTypes.ROLES],
  certifierOptions: ['user', 'role', 'manager', 'organizationAdmin', 'custom'],
};

// Entitlement Assignment certification
export const ENTITLEMENT = {
  filters: [filterTypes.ENTITLEMENTS, filterTypes.APPLICATIONS, filterTypes.USERS],
  certifierOptions: ['user', 'role', 'entitlementOwner'],
};

// Entitlement Composition certification
export const ENTITLEMENTCOMPOSITION = {
  filters: [filterTypes.ENTITLEMENTS, filterTypes.APPLICATIONS],
  certifierOptions: ['user', 'role', 'entitlementOwner', 'custom'],
};

// Role Membership certification
export const ROLEMEMBERSHIP = {
  filters: [filterTypes.ROLES, filterTypes.USERS],
  certifierOptions: ['user', 'role', 'roleOwner'],
};

// Event based
export const EVENTBASED = {
  filters: [filterTypes.APPLICATIONS, filterTypes.ACCOUNTS, filterTypes.ENTITLEMENTS, filterTypes.ROLES],
  certifierOptions: ['user', 'role', 'manager'],
};

// Identity Profile certification
export const IDENTITYPROFILE = {
  filters: [filterTypes.ORGANIZATION, filterTypes.USERS],
  certifierOptions: ['user', 'role', 'manager', 'organizationAdmin', 'custom'],
};

// Role Composition certification
export const ROLECOMPOSITION = {
  filters: [filterTypes.ROLES],
  certifierOptions: ['user', 'role', 'roleOwner'],
};

// AI Agent Profile certification — custodian saves as custom with the glossary
// actors path (see buildSavePayload), keeping the CUSTODIAN certifier machinery unused
export const AGENTPROFILE = {
  filters: [],
  certifierOptions: ['user', 'role', 'custodian', 'custom'],
};

// AI Agent Access certification — same grant/filter machinery as IDENTITY (backend confirmed), minus USERS/ORGANIZATION since agents are the subjects.
export const AGENTACCESS = {
  filters: [filterTypes.APPLICATIONS, filterTypes.ACCOUNTS, filterTypes.ENTITLEMENTS, filterTypes.ROLES],
  certifierOptions: ['user', 'role', 'custodian', 'custom'],
};

// Resource certification
export const RESOURCE = {
  filters: [filterTypes.APPLICATIONS, filterTypes.RESOURCES],
  certifierOptions: ['user', 'role', 'applicationOwner'],
};

// All certification types
export const typeSpecificFields = {
  IDENTITY,
  ENTITLEMENT,
  EVENTBASED,
  ROLEMEMBERSHIP,
  ENTITLEMENTCOMPOSITION,
  IDENTITYPROFILE,
  ROLECOMPOSITION,
  AGENTPROFILE,
  AGENTACCESS,
  RESOURCE,
};

// ponytail: agent cert types share behavior; centralize the check so callers don't drift.
// Accepts either the UI type (AGENTPROFILE) or the iga certificationType (agentProfile).
export const isAgentType = (type) => type === types.AGENTPROFILE || type === types.AGENTACCESS
  || type === uiTypeMap.AGENTPROFILE || type === uiTypeMap.AGENTACCESS;
