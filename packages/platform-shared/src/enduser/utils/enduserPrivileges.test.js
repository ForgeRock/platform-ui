/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { getDelegatedAdminMenuItems } from './enduserPrivileges';

describe('enduserPrivileges', () => {
  it('should return empty array if no privileges', () => {
    const result = getDelegatedAdminMenuItems([]);
    expect(result).toEqual([]);
  });

  it('should return menu items from privileges correctly', () => {
    const result = getDelegatedAdminMenuItems([
      {
        privilegePath: 'managed/user',
        'mat-icon': 'people',
        icon: 'fa-user',
        title: 'User',
      },
      {
        privilegePath: 'internal/role',
        'mat-icon': 'assignment_ind',
        icon: 'fa-check-square',
        title: 'Internal Role',
      },
    ]);
    expect(result).toEqual([
      {
        displayName: 'Internal Role',
        icon: 'assignment_ind',
        routeTo: {
          name: 'ListResource',
          params: {
            resourceName: 'role',
            resourceType: 'internal',
          },
        },
      },
      {
        displayName: 'User',
        icon: 'people',
        routeTo: {
          name: 'ListResource',
          params: {
            resourceName: 'user',
            resourceType: 'managed',
          },
        },
      },
    ]);
  });

  it('should remove alpha user menu item if hideAlphaUsersMenuItem is true', () => {
    const result = getDelegatedAdminMenuItems([
      {
        privilegePath: 'managed/user',
        'mat-icon': 'people',
        icon: 'fa-user',
        title: 'User',
      },
      {
        privilegePath: 'managed/alpha_user',
        'mat-icon': 'people',
        icon: 'fa-user',
        title: 'Alpha User',
      },
    ], true);

    expect(result).toEqual([
      {
        displayName: 'User',
        icon: 'people',
        routeTo: {
          name: 'ListResource',
          params: {
            resourceName: 'user',
            resourceType: 'managed',
          },
        },
      },
    ]);
  });

  it('should apply translation function to display name', () => {
    const result = getDelegatedAdminMenuItems([
      {
        privilegePath: 'managed/user',
        'mat-icon': 'people',
        icon: 'fa-user',
        title: 'User',
      },
    ], false, true);

    expect(result).toEqual([
      {
        displayName: 'User',
        icon: 'people',
        routeTo: {
          name: 'ListResource',
          params: {
            resourceName: 'user',
            resourceType: 'managed',
          },
        },
      },
    ]);
  });
});
