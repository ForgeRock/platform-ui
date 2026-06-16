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
};

// maps from ui type to iga type
export const uiTypeMap = {
  IDENTITY: 'identity',
  ENTITLEMENT: 'entitlement',
  ROLEMEMBERSHIP: 'roleMembership',
  ENTITLEMENTCOMPOSITION: 'entitlementComposition',
  IDENTITYPROFILE: 'identityProfile',
};

// types of filters
export const filterTypes = {
  ORGANIZATION: 'ORGANIZATION',
  USERS: 'USERS',
  APPLICATIONS: 'APPLICATIONS',
  ACCOUNTS: 'ACCOUNTS',
  ENTITLEMENTS: 'ENTITLEMENTS',
  ROLES: 'ROLES',
};

// maps from ui filter type to iga filter keys
export const filterTypeMap = {
  ORGANIZATION: 'ORGANIZATION',
  USERS: 'user',
  APPLICATIONS: 'application',
  ACCOUNTS: 'account',
  ENTITLEMENTS: 'entitlement',
  ROLES: 'role',
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

// All certification types
export const typeSpecificFields = {
  IDENTITY,
  ENTITLEMENT,
  EVENTBASED,
  ROLEMEMBERSHIP,
  ENTITLEMENTCOMPOSITION,
  IDENTITYPROFILE,
};
