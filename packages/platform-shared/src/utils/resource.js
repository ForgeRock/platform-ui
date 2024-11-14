/**
 * Copyright (c) 2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { getResource } from '../api/governance/CommonsApi';
import i18n from '../i18n';

/**
 * Retrieves the display name for a specific resource.
 * If the resource is a user, it will return the full name.
 *
 * @param {string} resourceType - The type of the resource. application, role, user, org
 * @param {string} id - The ID of the resource.
 * @returns {Promise} - A promise that resolves to the display data of the resource.
 */
async function getResourceDisplayName(resourceType, id) {
  try {
    const { data } = await getResource(resourceType, { queryString: id });
    if (data.result.length === 0) {
      return null;
    }
    if (resourceType === 'user') {
      const user = data.result[0];
      return i18n.global.t('common.userFullName', {
        givenName: user.givenName,
        sn: user.sn,
      });
    }
    return data.result[0].name;
  } catch {
    return null;
  }
}

/**
 * Retrieves the display data for a specific resource.
 * If the value is an array, it will return a comma-separated string.
 *
 * @param {string} objectType - The type of the resource. application, role, user, org
 * @param {string | string[]} value - The ID|s of the resource|s.
 * @returns {Promise} - A promise that resolves to the display data of the resource.
 */
// eslint-disable-next-line import/prefer-default-export
export async function getResourceDisplayData(objectType, value) {
  const resourceType = objectType.split('/').pop();
  const ids = Array.isArray(value) ? value : [value];
  const dataArray = await Promise.all(ids.map(async (id) => {
    const internalId = id.split('/').pop();
    const data = await getResourceDisplayName(resourceType, internalId);
    return data || id;
  }));
  return dataArray.join(', ');
}
