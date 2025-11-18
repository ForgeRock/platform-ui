/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { querySchema } from '@forgerock/platform-shared/src/api/SchemaApi';
import { mockNotification } from '@forgerock/platform-shared/src/testing/utils/mockNotification';
import isFraasFilter from '@forgerock/platform-shared/src/utils/fraasUtils';
import { fetchManagedObjectsAsMenuItems } from './managedObjectsAsMenu';

const { showErrorMessage } = mockNotification();
jest.mock('@forgerock/platform-shared/src/api/SchemaApi');
jest.mock('@forgerock/platform-shared/src/utils/fraasUtils');
jest.mock('@/i18n', () => ({
  global: { t: jest.fn((key) => key) },
}));

describe('fetchManagedObjectsAsMenuItems', () => {
  const managedObjectsMock = {
    data: {
      result: [
        {
          _id: 'managed/user',
          title: 'User',
          'mat-icon': 'person',
        },
        {
          _id: 'managed/assignment',
          title: 'Assignment',
          'mat-icon': 'check_box_outline_blank',
        },
        {
          _id: 'managed/application',
          title: 'Application',
          'mat-icon': 'check_box_outline_blank',
        },
      ],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    querySchema.mockResolvedValue(managedObjectsMock);
    isFraasFilter.mockImplementation((items) => items.filter((item) => item.id !== 'user'));
  });

  it('should fetch and format managed objects as menu items', async () => {
    const result = await fetchManagedObjectsAsMenuItems();
    expect(querySchema).toHaveBeenCalledWith({ _queryFilter: '_id sw "managed"', _fields: ['_id', 'title', 'mat-icon'] });
    expect(result).toEqual(
      [
        {
          id: 'application',
          label: { en: 'Application' },
          icon: 'check_box_outline_blank',
          isManagedObject: true,
          routeTo: { name: 'ListResource', params: { resourceType: 'managed', resourceName: 'application' } },
        },
        {
          id: 'assignment',
          label: { en: 'Assignment' },
          icon: 'check_box_outline_blank',
          isManagedObject: true,
          routeTo: { name: 'ListResource', params: { resourceType: 'managed', resourceName: 'assignment' } },
        },
        {
          id: 'internal/role',
          label: { en: 'sideMenu.authorizationRole' },
          icon: 'people',
          isManagedObject: true,
          routeTo: { name: 'ListResource', params: { resourceType: 'internal', resourceName: 'role' } },
        },
        {
          id: 'user',
          label: { en: 'User' },
          icon: 'person',
          isManagedObject: true,
          routeTo: { name: 'ListResource', params: { resourceType: 'managed', resourceName: 'user' } },
        },
      ],
    );
    // Sorted by id
    expect(result.map((i) => i.id)).toEqual([
      'application',
      'assignment',
      'internal/role',
      'user',
    ]);
  });

  it('should add internal/role menu item', async () => {
    const result = await fetchManagedObjectsAsMenuItems();
    expect(result.some((item) => item.id === 'internal/role')).toBe(true);
  });

  it('should filter managed objects using isFraasFilter if isFraas is true', async () => {
    const store = { state: { isFraas: true, realm: 'alpha' } };
    querySchema.mockResolvedValue({
      data: {
        objects: [
          { name: 'user', schema: { title: 'User', 'mat-icon': 'person' } },
          { name: 'role', schema: { title: 'Role', 'mat-icon': 'security' } },
        ],
      },
    });
    const result = await fetchManagedObjectsAsMenuItems(store);
    expect(isFraasFilter).toHaveBeenCalled();
    expect(result.find((item) => item.id === 'user')).toBeUndefined();
  });

  it('should filter out assignments if governanceEnabled is true', async () => {
    const store = { state: { SharedStore: { governanceEnabled: true } } };
    const result = await fetchManagedObjectsAsMenuItems(store);
    expect(result.some((item) => item.id.endsWith('assignment'))).toBe(false);
  });

  it('should filter out applications if workforceEnabled is true', async () => {
    const store = { state: { SharedStore: { workforceEnabled: true } } };
    const result = await fetchManagedObjectsAsMenuItems(store);
    expect(result.some((item) => item.id.endsWith('application'))).toBe(false);
  });

  it('should filter out both assignments and applications if both flags are true', async () => {
    const store = { state: { SharedStore: { governanceEnabled: true, workforceEnabled: true } } };
    const result = await fetchManagedObjectsAsMenuItems(store);
    expect(result.some((item) => item.id.endsWith('assignment'))).toBe(false);
    expect(result.some((item) => item.id.endsWith('application'))).toBe(false);
  });

  it('should show error message if querySchema throws', async () => {
    const error = new Error('Failed to fetch');
    querySchema.mockRejectedValueOnce(error);
    const result = await fetchManagedObjectsAsMenuItems();
    expect(showErrorMessage).toHaveBeenCalledWith(error, 'sideMenu.endUser.errorRetrievingManagedObjects');
    expect(result).toEqual([]);
  });

  it('should handle missing managed objects gracefully', async () => {
    querySchema.mockResolvedValueOnce({ data: {} });
    const result = await fetchManagedObjectsAsMenuItems();
    expect(result.some((item) => item.id === 'internal/role')).toBe(true);
    expect(result.length).toBe(1);
  });
});
