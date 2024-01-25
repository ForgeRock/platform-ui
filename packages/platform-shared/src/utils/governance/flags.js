/**
 * Copyright (c) 2023-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

export const flags = {
  RECON: 'RECON',
  REQUEST: 'REQUEST',
  ROLEBASED: 'ROLEBASED',
  NEW_ACCESS: 'NEW_ACCESS',
  TEMPORAL: 'TEMPORAL',
};

export const icons = {
  RECON: 'sync',
  REQUEST: 'person_add',
  ROLEBASED: 'assignment_ind',
  NEW_ACCESS: 'add_circle_outline',
  TEMPORAL: 'date_range',
};

export function isRoleBased(item) {
  const grantTypes = item.relationship?.properties?.grantTypes;
  if (!grantTypes) return false;
  return grantTypes.findIndex((grant) => (grant.grantType === 'role')) !== -1;
}

export function isRuleBased(item) {
  if (!item.relationship) return false;
  return !!item.relationship?.conditional;
}

export function isAcknowledgeType(item) {
  return isRoleBased(item) || isRuleBased(item);
}

export function isReconBased(item) {
  const grantTypes = item.relationship?.properties?.grantTypes;
  if (!grantTypes) return false;
  return grantTypes.findIndex((grant) => (grant.grantType === 'recon')) !== -1;
}

export function isRequestBased(item) {
  const grantTypes = item.relationship?.properties?.grantTypes;
  if (!grantTypes) return false;
  return grantTypes.findIndex((grant) => (grant.grantType === 'request')) !== -1;
}

export function getGrantFlags(item) {
  const itemFlags = [];
  if (!item) return itemFlags;

  // Recon
  if (isReconBased(item)) itemFlags.push(flags.RECON);

  // Role Based
  if (isRoleBased(item)) itemFlags.push(flags.ROLEBASED);

  // Request Based
  if (isRequestBased(item)) itemFlags.push(flags.REQUEST);

  // New Access
  if (!item.item?.decision?.certification) itemFlags.push(flags.NEW_ACCESS);

  // Temporal
  if (item.relationship?.temporalConstraints) itemFlags.push(flags.TEMPORAL);

  return itemFlags;
}
