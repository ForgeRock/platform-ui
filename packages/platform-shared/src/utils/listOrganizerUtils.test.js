/**
 * Copyright (c) 2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import getManagedObjectColumnList from './listOrganizerUtils';

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
        class: 'text-truncate w-max-300',
        sortable: true,
        enabled: true,
        sortDirection: 'desc',
      },
      {
        key: 'col2',
        label: 'translated:Title2',
        class: 'text-truncate w-max-300',
        sortable: true,
        enabled: true,
        sortDirection: 'desc',
      },
      {
        key: 'col3',
        label: 'translated:Title3',
        class: 'text-truncate w-max-300',
        sortable: true,
        enabled: true,
        sortDirection: 'desc',
      },
      {
        key: 'col5',
        label: 'translated:Title5',
        class: 'text-truncate w-max-300',
        sortable: true,
        enabled: true,
        sortDirection: 'desc',
      },
      {
        key: 'col7',
        label: 'translated:Title7',
        class: 'text-truncate w-max-300',
        sortable: true,
        enabled: false, // Only the first 4 columns are enabled by default, This is to maintain consistency with the table display data
        sortDirection: 'desc',
      },
    ]);
  });
});
