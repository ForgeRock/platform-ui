/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { getTranslation } from './translations';

/**
 * Get the menu item icon
 * @param {Object} accessObject The access object
 * @returns {String} The icon
 */
function getMenuItemIcon(accessObject) {
  let matIcon = 'check_box_outline_blank';
  if (accessObject['mat-icon'] && accessObject['mat-icon'].length && accessObject['mat-icon'].substring(0, 3) !== 'fa-') {
    matIcon = accessObject['mat-icon'];
  }

  return matIcon;
}

/**
 * Get the menu items for the delegated admin.
 * This method is used by Platform UI and IDM Enduser apps to list dynamic roles routes.
 * @param {Array} privileges The privileges array
 * @param {Boolean} hideAlphaUsersMenuItem Hide the alpha users menu item
 * @param {boolean} useTranslation determine if translation should be used or not
 * @returns {Array} The menu items
 */
// eslint-disable-next-line import/prefer-default-export
export function getDelegatedAdminMenuItems(privileges, hideAlphaUsersMenuItem = false, useTranslation = false) {
  let formattedPrivileges = [...privileges];
  if (hideAlphaUsersMenuItem) {
    formattedPrivileges = formattedPrivileges.filter((obj) => obj.privilegePath !== 'managed/alpha_user');
  }
  return formattedPrivileges
    .sort((a, b) => a.title.localeCompare(b.title))
    .map((obj) => {
      const splitObj = obj.privilegePath.split('/');
      return {
        displayName: useTranslation ? getTranslation(obj.title) : obj.title,
        icon: getMenuItemIcon(obj),
        routeTo: {
          name: 'ListResource',
          params: { resourceName: splitObj[1], resourceType: splitObj[0] },
        },
      };
    });
}
