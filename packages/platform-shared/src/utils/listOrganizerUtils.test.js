/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import * as localStorageUtils from './localStorageUtils';
import { getManagedObjectColumnList, getDefaultManagedObjectColumnList } from './listOrganizerUtils';

jest.mock('./localStorageUtils');

const resourceTabData = {
  order: ['col1', 'col2', 'col3', 'col4', 'col5', 'col6', 'col6', 'col7'],
  managedProperties: {
    col1: { type: 'string', searchable: true, title: 'Title1' },
    col2: { type: 'boolean', searchable: true, title: 'Title2' },
    col3: { type: 'number', searchable: true, title: 'Title3' },
    col4: { type: 'object', searchable: true, title: 'Title4' }, // not supported type, should be filtered out
    col5: { type: 'string', searchable: true, title: 'Title5' },
    col6: { type: 'string', searchable: false, title: 'Title6' }, // not searchable, should be filtered out
    col7: { type: 'string', searchable: true, title: 'Title7' },
  },
};

jest.mock('./translations', () => ({
  getTranslation: (title) => `translated:${title}`,
}));

describe('getManagedObjectColumnList', () => {
  it('returns empty array if localstorageKey is missing', () => {
    expect(getManagedObjectColumnList(null, resourceTabData.managedProperties, resourceTabData.order)).toEqual([]);
  });

  it('returns empty array if resourceTabData.order is missing', () => {
    expect(getManagedObjectColumnList('identities_test_1', resourceTabData.managedProperties)).toEqual([]);
  });

  it('filters and maps columns correctly', () => {
    const result = getManagedObjectColumnList('identities_test_1', resourceTabData.managedProperties, resourceTabData.order);
    // the result should include only supported type of columns ['string', 'boolean', 'number'] and with searchable: true
    expect(result).toEqual([
      {
        key: 'col1',
        label: 'translated:Title1',
        class: 'text-truncate',
        sortable: true,
        enabled: true,
        sortDirection: 'desc',
      },
      {
        key: 'col2',
        label: 'translated:Title2',
        class: 'text-truncate',
        sortable: true,
        enabled: true,
        sortDirection: 'desc',
      },
      {
        key: 'col3',
        label: 'translated:Title3',
        class: 'text-truncate',
        sortable: true,
        enabled: true,
        sortDirection: 'desc',
      },
      {
        key: 'col5',
        label: 'translated:Title5',
        class: 'text-truncate',
        sortable: true,
        enabled: true,
        sortDirection: 'desc',
      },
      {
        key: 'col7',
        label: 'translated:Title7',
        class: 'text-truncate',
        sortable: true,
        enabled: false, // Only the first 4 columns are enabled by default, This is to maintain consistency with the table display data
        sortDirection: 'desc',
      },
    ]);
  });

  it('treats invalid object-array storage format as absent and falls back to default enabled behavior', () => {
    const stored = [
      {
        key: 'col1', label: 'Title1', sortable: true, enabled: true, sortDirection: 'desc', class: 'text-truncate',
      },
      {
        key: 'col2', label: 'Title2', sortable: true, enabled: false, sortDirection: 'desc', class: 'text-truncate',
      },
    ];
    localStorageUtils.getValueFromLocalStorage.mockReturnValue(stored);

    const result = getManagedObjectColumnList('identities_test_1', resourceTabData.managedProperties, resourceTabData.order);

    // Invalid format is treated as absent — first 4 searchable columns should be enabled by default
    expect(result.filter((c) => c.enabled).map((c) => c.key)).toEqual(['col1', 'col2', 'col3', 'col5']);
    // All columns should still be returned (not just enabled ones)
    expect(result.map((c) => c.key)).toEqual(['col1', 'col2', 'col3', 'col5', 'col7']);
  });

  it('correctly handles string-based storage (minimized format)', () => {
    const stored = ['col1', 'col3', 'col7'];
    localStorageUtils.getValueFromLocalStorage.mockReturnValue(stored);

    const result = getManagedObjectColumnList('identities_test_1', resourceTabData.managedProperties, resourceTabData.order);

    // col1, col3, col7 should be enabled and appear first (reordered based on storage)
    expect(result[0].key).toBe('col1');
    expect(result[0].enabled).toBe(true);
    expect(result[1].key).toBe('col3');
    expect(result[1].enabled).toBe(true);
    expect(result[2].key).toBe('col7');
    expect(result[2].enabled).toBe(true);

    // col2 and col5 should be disabled (not in storage)
    expect(result.find((c) => c.key === 'col2').enabled).toBe(false);
    expect(result.find((c) => c.key === 'col5').enabled).toBe(false);
  });
});

describe('getDefaultManagedObjectColumnList', () => {
  it('returns empty array if orderList is missing', () => {
    expect(getDefaultManagedObjectColumnList(resourceTabData.managedProperties, null)).toEqual([]);
  });

  it('returns empty array if managedProperties is missing', () => {
    expect(getDefaultManagedObjectColumnList(null, resourceTabData.order)).toEqual([]);
  });

  it('returns correctly filtered and enabled default columns (first 4 valid ones)', () => {
    const result = getDefaultManagedObjectColumnList(resourceTabData.managedProperties, resourceTabData.order);

    // Should include col1, col2, col3, col5 (col4 is object, col6 is not searchable)
    expect(result).toEqual([
      {
        key: 'col1',
        label: 'translated:Title1',
        class: 'text-truncate',
        sortable: true,
        enabled: true,
        sortDirection: 'desc',
      },
      {
        key: 'col2',
        label: 'translated:Title2',
        class: 'text-truncate',
        sortable: true,
        enabled: true,
        sortDirection: 'desc',
      },
      {
        key: 'col3',
        label: 'translated:Title3',
        class: 'text-truncate',
        sortable: true,
        enabled: true,
        sortDirection: 'desc',
      },
      {
        key: 'col5',
        label: 'translated:Title5',
        class: 'text-truncate',
        sortable: true,
        enabled: true,
        sortDirection: 'desc',
      },
    ]);

    // col7 should NOT be in the result because we limit to 4
    expect(result.find((c) => c.key === 'col7')).toBeUndefined();
  });
});
