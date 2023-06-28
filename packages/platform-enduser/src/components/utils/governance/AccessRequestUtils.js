/**
 * Copyright (c) 2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Gets image source for the priority icons based on priority level
 * @param {String} priority access request priority: high, medium, low
 * @returns {String} image src for the given priority
 */
export default function getPriorityImageSrc(priority) {
  const images = require.context('@forgerock/platform-shared/src/assets/images/priorities/', false, /\.svg$/);
  let imageName = '';
  if (priority === 'high') imageName = 'priority-high.svg';
  if (priority === 'medium') imageName = 'priority-med.svg';
  if (priority === 'low') imageName = 'priority-low.svg';
  return images(`./${imageName}`);
}

export const requestTypes = {
  ACCOUNT_GRANT: {
    label: 'governance.accessRequest.requestTypes.accountGrant',
    value: 'accountGrant',
  },
  ACCOUNT_REVOKE: {
    label: 'governance.accessRequest.requestTypes.accountRevoke',
    value: 'accountRevoke',
  },
  ENTITLEMENT_GRANT: {
    label: 'governance.accessRequest.requestTypes.entitlementGrant',
    value: 'entitlementGrant',
  },
  ENTITLEMENT_REVOKE: {
    label: 'governance.accessRequest.requestTypes.entitlementRevoke',
    value: 'entitlementRevoke',
  },
  ROLE_GRANT: {
    label: 'governance.accessRequest.requestTypes.roleGrant',
    value: 'roleGrant',
  },
  ROLE_REVOKE: {
    label: 'governance.accessRequest.requestTypes.roleRevoke',
    value: 'roleRevoke',
  },
};
