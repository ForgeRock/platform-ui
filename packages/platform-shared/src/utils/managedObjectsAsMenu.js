/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import { getConfig } from '@forgerock/platform-shared/src/api/ConfigApi';
import isFraasFilter from '@forgerock/platform-shared/src/utils/fraasUtils';
import i18n from '@/i18n';

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
    const managedObjects = await getConfig('managed');
    if (managedObjects.data?.objects) {
      managedObjectMenuItems = managedObjects.data.objects.map((object) => ({
        id: object.name,
        label: object.schema.title,
        icon: object.schema['mat-icon'] || 'check_box_outline_blank',
        isManagedObject: true,
        routeTo: {
          name: 'ListResource',
          params: { resourceType: 'managed', resourceName: object.name },
        },
      }));
    }

    // internal/role as menu item
    managedObjectMenuItems.push({
      id: 'internal/role',
      icon: 'people',
      label: i18n.global.t('sideMenu.authorizationRole'),
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

    // sort the menu items by labels in alphabetical order
    managedObjectMenuItems = managedObjectMenuItems.sort((a, b) => a.label.localeCompare(b.label));
  } catch (error) {
    showErrorMessage(error, i18n.global.t('sideMenu.endUser.errorRetrievingManagedObjects'));
  }
  return managedObjectMenuItems;
}
