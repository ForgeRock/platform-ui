/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { querySchema } from '@forgerock/platform-shared/src/api/SchemaApi';
import isFraasFilter from '@forgerock/platform-shared/src/utils/fraasUtils';
import { getMenuItemIcon } from '@forgerock/platform-shared/src/enduser/utils/enduserPrivileges';
import i18n from '@/i18n';
import { getValidManagedObjectMenuId } from './menuItemUtils';

/* eslint-disable import/prefer-default-export */
/**
 * Fetches managed objects and formats, filters and sort them as menu items for the end user menu.
 *
 * @async
 * @function fetchManagedObjectsAsMenuItems
 * @param {Object} [store={}] - The Vuex store object, used to determine environment and feature flags.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of menu item objects.
 */
export async function fetchManagedObjectsAsMenuItems(store = {}) {
  let managedObjectMenuItems = [];
  try {
    const managedObjects = await querySchema({ _queryFilter: '_id sw "managed"', _fields: ['_id', 'title', 'mat-icon'] });
    if (managedObjects.data?.result) {
      managedObjectMenuItems = managedObjects.data.result.map((object) => ({
        id: getValidManagedObjectMenuId(object._id.replace('managed/', '')),
        label: { en: object.title },
        icon: getMenuItemIcon(object),
        isManagedObject: true,
        routeTo: {
          name: 'ListResource',
          params: { resourceType: 'managed', resourceName: object._id.replace('managed/', '') },
        },
      }));
    }

    // internal/role as menu item
    managedObjectMenuItems.push({
      id: 'internal/role',
      icon: 'people',
      label: { en: i18n.global.t('sideMenu.authorizationRole') },
      isManagedObject: true,
      routeTo: {
        name: 'ListResource',
        params: { resourceType: 'internal', resourceName: 'role' },
      },
    });

    // filters out managed objects based on FraaS environment
    if (store.state?.isFraas) {
      managedObjectMenuItems = isFraasFilter(managedObjectMenuItems, 'id');
    }

    // filters out governance-specific managed objects, dynamically excludes assignments
    if (store.state?.SharedStore.governanceEnabled) {
      managedObjectMenuItems = managedObjectMenuItems.filter((item) => !item.id.endsWith('assignment'));
    }

    // filters out workforce-specific managed objects, dynamically excludes applications
    if (store.state?.SharedStore.workforceEnabled) {
      managedObjectMenuItems = managedObjectMenuItems.filter((item) => !item.id.endsWith('application'));
    }

    // always filter out usermeta and svcacct
    managedObjectMenuItems = managedObjectMenuItems.filter((item) => !item.id.endsWith('usermeta') && !item.id.endsWith('svcacct'));

    // sort the menu items by labels in alphabetical order
    managedObjectMenuItems = managedObjectMenuItems.sort((a, b) => a.id.localeCompare(b.id));
  } catch (error) {
    showErrorMessage(error, i18n.global.t('sideMenu.endUser.errorRetrievingManagedObjects'));
  }

  return managedObjectMenuItems;
}
