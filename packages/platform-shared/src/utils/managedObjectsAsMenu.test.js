/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { getConfig } from '@forgerock/platform-shared/src/api/ConfigApi';
import { showErrorMessage } from '@forgerock/platform-shared/src/utils/notification';
import isFraasFilter from '@forgerock/platform-shared/src/utils/fraasUtils';
import { fetchManagedObjectsAsMenuItems } from './managedObjectsAsMenu';

jest.mock('@forgerock/platform-shared/src/api/ConfigApi');
jest.mock('@forgerock/platform-shared/src/utils/notification');
jest.mock('@forgerock/platform-shared/src/utils/fraasUtils');
jest.mock('@/i18n', () => ({
  global: { t: jest.fn((key) => key) },
}));

describe('fetchManagedObjectsAsMenuItems', () => {
  const managedObjectsMock = {
    data: {
      objects: [
        {
          name: 'user',
          schema: { title: 'User', 'mat-icon': 'person' },
        },
        {
          name: 'assignment',
          schema: { title: 'Assignment' },
        },
        {
          name: 'application',
          schema: { title: 'Application' },
        },
      ],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    getConfig.mockResolvedValue(managedObjectsMock);
    isFraasFilter.mockImplementation((items) => items.filter((item) => item.id !== 'user'));
  });

  it('should fetch and format managed objects as menu items', async () => {
    const result = await fetchManagedObjectsAsMenuItems();
    expect(getConfig).toHaveBeenCalledWith('managed');
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'application',
          label: 'Application',
          icon: 'check_box_outline_blank',
          isManagedObject: true,
          routeTo: expect.objectContaining({ name: 'ListResource', params: { resourceType: 'managed', resourceName: 'application' } }),
        }),
        expect.objectContaining({
          id: 'assignment',
          label: 'Assignment',
          icon: 'check_box_outline_blank',
          isManagedObject: true,
          routeTo: expect.objectContaining({ name: 'ListResource', params: { resourceType: 'managed', resourceName: 'assignment' } }),
        }),
        expect.objectContaining({
          id: 'internal/role',
          label: 'sideMenu.authorizationRole',
          icon: 'people',
          isManagedObject: true,
          routeTo: expect.objectContaining({ name: 'ListResource', params: { resourceType: 'internal', resourceName: 'role' } }),
        }),
        expect.objectContaining({
          id: 'user',
          label: 'User',
          icon: 'person',
          isManagedObject: true,
          routeTo: expect.objectContaining({ name: 'ListResource', params: { resourceType: 'managed', resourceName: 'user' } }),
        }),
      ]),
    );
    // Sorted by label
    expect(result.map((i) => i.label)).toEqual([
      'Application',
      'Assignment',
      'sideMenu.authorizationRole',
      'User',
    ]);
  });

  it('should add internal/role menu item', async () => {
    const result = await fetchManagedObjectsAsMenuItems();
    expect(result.some((item) => item.id === 'internal/role')).toBe(true);
  });

  it('should filter managed objects using isFraasFilter if isFraas is true', async () => {
    const store = { state: { isFraas: true, realm: 'alpha' } };
    getConfig.mockResolvedValue({
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

  it('should show error message if getConfig throws', async () => {
    const error = new Error('Failed to fetch');
    getConfig.mockRejectedValueOnce(error);
    const result = await fetchManagedObjectsAsMenuItems();
    expect(showErrorMessage).toHaveBeenCalledWith(error, 'sideMenu.endUser.errorRetrievingManagedObjects');
    expect(result).toEqual([]);
  });

  it('should handle missing managed objects gracefully', async () => {
    getConfig.mockResolvedValueOnce({ data: {} });
    const result = await fetchManagedObjectsAsMenuItems();
    expect(result.some((item) => item.id === 'internal/role')).toBe(true);
    expect(result.length).toBe(1);
  });
});
