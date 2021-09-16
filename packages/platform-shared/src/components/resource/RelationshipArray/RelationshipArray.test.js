/**
 * Copyright (c) 2020-2021 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount } from '@vue/test-utils';
import RelationshipArray from './index';
import * as SchemaApi from '@/api/SchemaApi';

RelationshipArray.mounted = jest.fn();

const sampleRelationshipsData = [
  {
    _id: '410d063c-50ed-48ee-bcf2-50b1657c3bad',
    _refResourceCollection: 'managed/user',
    userName: 'mitzie.gould',
    givenName: 'Mitzie',
    sn: 'Gould',
    _ref: 'managed/user/0000bce5-ee51-4fef-a9df-e31244d4a56e',
  },
  {
    _id: '21faabb4-ed24-4308-b106-dfa813138f1e',
    _refResourceCollection: 'managed/user',
    userName: 'mitsuko.nicholson',
    givenName: 'Mitsuko',
    sn: 'Nicholson',
    _ref: 'managed/user/000126ed-6262-4db2-b5cd-889945aebbd7',
  },
  {
    _id: 'dd06d9fb-7b2d-4ff4-b62f-b74ca5d83c8b',
    _refResourceCollection: 'managed/user',
    userName: 'yuriko.wilkins',
    givenName: 'Yuriko',
    sn: 'Wilkins',
    _ref: 'managed/user/000383ac-1258-41ee-9f3f-2d6e5a6025e6',
  },
  {
    _id: 'ca539d43-0f80-47bd-93d3-62038ed30a33',
    _refResourceCollection: 'managed/user',
    userName: 'coletta.murray',
    givenName: 'Coletta',
    sn: 'Murray',
    _ref: 'managed/user/000393e8-7cfc-4d6c-813a-a839f388a43a',
  },
];
const sampleUserSchema = {
  title: 'User',
  order: [
    'userName',
    'givenName',
    'sn',
  ],
  properties: {
    userName: {
      title: 'Username',
      description: 'Username',
      viewable: true,
      type: 'string',
      searchable: true,
    },
    sn: {
      title: 'Last Name',
      description: 'Last Name',
      viewable: true,
      type: 'string',
      searchable: true,
    },
    givenName: {
      title: 'First Name',
      description: 'First Name',
      viewable: true,
      type: 'string',
      searchable: true,
    },
  },
  required: [
    'userName',
    'givenName',
    'sn',
  ],
};

describe('RelationshipArray', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(RelationshipArray, {
      mocks: {
        $t: (key) => key,
        $store: {
          state: {
            userId: 'foo',
            UserStore: {
              adminUser: false,
            },
            SharedStore: {
              uiConfig: {
                configuration: {
                  platformSettings: {
                    managedObjectsSettings: {
                      user: {
                        disableRelationshipSortAndSearch: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      propsData: {
        parentId: 'bjensen',
        parentResource: 'user',
        relationshipArrayProperty: {
          propName: 'reports',
          title: 'Reports',
          items: {
            resourceCollection: [
              {
                path: 'managed/user',
                conditionalAssociation: true,
                notify: true,
                label: 'User',
                query: {
                  queryFilter: 'true',
                  fields: [
                    'userName',
                    'givenName',
                    'sn',
                  ],
                },
              },
            ],
          },
        },
      },
      mounted: () => {},
    });
    jest.spyOn(wrapper.vm, 'getRequestService').mockImplementation(() => (
      {
        get: () => Promise.resolve({
          data: {
            pagedResultsCookie: true,
          },
        }),
        patch: () => Promise.resolve({}),
      }
    ));

    jest.spyOn(SchemaApi, 'getSchema').mockImplementation(() => Promise.resolve({
      data: {
        resourceCollection: 'managed/user',
        _id: 'testId',
        order: [
          'test',
          'test2',
        ],
        title: 'testTitle',
        properties: {
          test: {
            value: 'test',
            viewable: true,
            type: 'object',
            title: 'testTitle',
            propName: 'testPropName',
            order: [
              'innerTest',
            ],
            properties: {
              innerTest: {},
            },
            isTemporalConstraint: true,
          },
          test2: {
            value: 'test2',
            type: 'string',
            title: 'test2Title',
            propName: 'test2PropName',
            viewable: true,
            isTemporalConstraint: false,
            isConditional: true,
          },
        },
      },
    }));
    wrapper.vm.createModalId = 'testId';
    wrapper.vm.removeModalId = 'testId';
    wrapper.vm.$refs = {
      testId: {
        show: () => {},
        hide: () => {},
      },
      relationshipArrayGrid: {
        clearSelected: () => {
          wrapper.vm.allRowsSelected = false;
        },
        selectAllRows: () => {
          wrapper.vm.allRowsSelected = true;
        },
      },
    };
  });

  it('RelationshipArray successfully loaded', () => {
    expect(wrapper.name()).toEqual('RelationshipArray');
  });

  it('Correctly builds grid url', () => {
    expect(wrapper.vm.buildGridUrl(0)).toEqual('user/bjensen/reports?_pageSize=10&_totalPagedResultsPolicy=ESTIMATE&_queryFilter=true');
    expect(wrapper.vm.buildGridUrl(1)).toEqual('user/bjensen/reports?_pageSize=10&_totalPagedResultsPolicy=ESTIMATE&_queryFilter=true&_pagedResultsOffset=10');
    wrapper.vm.sortBy = 'userName';
    expect(wrapper.vm.buildGridUrl(0)).toEqual('user/bjensen/reports?_pageSize=10&_totalPagedResultsPolicy=ESTIMATE&_queryFilter=true&_sortKeys=-userName');
    wrapper.vm.sortDesc = true;
    expect(wrapper.vm.buildGridUrl(0)).toEqual('user/bjensen/reports?_pageSize=10&_totalPagedResultsPolicy=ESTIMATE&_queryFilter=true&_sortKeys=userName');
  });

  it('Correctly sets columns', () => {
    wrapper.vm.setColumns();
    expect(wrapper.vm.columns.length).toEqual(2);
    expect(wrapper.vm.columns[0].key).toEqual('selected');
    expect(wrapper.vm.columns[1].key).toEqual('_relationshipDetails');

    wrapper.vm.relationshipArrayProperty.relationshipGrantTemporalConstraintsEnforced = true;
    wrapper.vm.columns = [];
    wrapper.vm.setColumns();
    expect(wrapper.vm.columns.length).toEqual(3);
    expect(wrapper.vm.columns[2].key).toEqual('_refProperties.temporalConstraints[0].duration');
    expect(wrapper.vm.columns[2].formatter(false)).toEqual(false);
    // this next assertion is really weird looking because of timezone difference between local dev and pipeline server location
    // normally there would be no indexOf it would just be .toEqual('June 10, 2021 12:05 PM to June 10, 2021 7:05 PM')
    expect(wrapper.vm.columns[2].formatter('2021-06-10T19:05:00.000Z/2021-06-11T02:05:00.000Z').indexOf('June')).toEqual(0);

    wrapper.vm.relationshipArrayProperty.relationshipGrantTemporalConstraintsEnforced = false;
    wrapper.vm.columns = [];
    wrapper.vm.setColumns(sampleUserSchema);
    expect(wrapper.vm.columns.length).toEqual(4);
    expect(wrapper.vm.columns[1].key).toEqual('userName');
  });

  it('Correctly sets gridData', () => {
    wrapper.vm.setColumns(sampleUserSchema);
    wrapper.vm.setGridData(sampleRelationshipsData, wrapper.vm.relationshipArrayProperty);
    expect(wrapper.vm.gridData.length).toEqual(4);
    expect(wrapper.vm.gridData[0].givenName).toEqual('Mitzie');
    wrapper.vm.disableSortAndSearch = true;
    wrapper.vm.setGridData(sampleRelationshipsData, wrapper.vm.relationshipArrayProperty);
  });

  it('Correctly handles sorting change and clearing', () => {
    wrapper.vm.sortingChanged({ sortBy: 'sn', sortDesc: true });
    expect(wrapper.vm.currentPage).toEqual(1);
    expect(wrapper.vm.sortBy).toEqual('sn');
    expect(wrapper.vm.sortDesc).toEqual(true);

    wrapper.vm.clear();
    expect(wrapper.vm.filter).toEqual('');
    expect(wrapper.vm.sortBy).toEqual(null);
    expect(wrapper.vm.sortDesc).toEqual(false);
  });

  it('Correctly handles search', () => {
    wrapper.vm.sortBy = 'userName';
    wrapper.vm.search();
    expect(wrapper.vm.sortBy).toEqual(null);
    wrapper.vm.filter = 'Mitzie';
    wrapper.vm.sortDesc = true;
    wrapper.vm.search();
    expect(wrapper.vm.sortDesc).toEqual(false);
  });

  it('Correctly sets newRelationships', () => {
    wrapper.vm.addNewRelationship(sampleRelationshipsData);
    expect(wrapper.vm.newRelationships).toEqual(sampleRelationshipsData);
  });

  it('Correctly sets selected and allRowsSelected', () => {
    wrapper.vm.gridData = [1, 2, 3, 4];
    wrapper.vm.onRowSelected([1, 2, 3, 4]);
    expect(wrapper.vm.selected[0]).toEqual(1);
    expect(wrapper.vm.allRowsSelected).toEqual(true);
    wrapper.vm.toggleSelectAll();
    expect(wrapper.vm.allRowsSelected).toEqual(false);
    wrapper.vm.toggleSelectAll();
    expect(wrapper.vm.allRowsSelected).toEqual(true);
  });

  it('Correctly sets disableSortAndSearch', () => {
    wrapper.vm.setDisableSortAndSearch(wrapper.vm.relationshipArrayProperty.items.resourceCollection[0]);
    expect(wrapper.vm.disableSortAndSearch).toEqual(true);
    wrapper.vm.$store.state.SharedStore.uiConfig.configuration.platformSettings.managedObjectsSettings.user.disableRelationshipSortAndSearch = false;
    wrapper.vm.setDisableSortAndSearch(wrapper.vm.relationshipArrayProperty.items.resourceCollection[0]);
    expect(wrapper.vm.disableSortAndSearch).toEqual(false);
    wrapper.vm.$store.state.SharedStore.uiConfig.configuration.platformSettings.managedObjectsSettings.internalrole = { disableRelationshipSortAndSearch: true };
    wrapper.vm.relationshipArrayProperty.items.resourceCollection[0].path = 'internal/role';
    wrapper.vm.setDisableSortAndSearch(wrapper.vm.relationshipArrayProperty.items.resourceCollection[0]);
    expect(wrapper.vm.disableSortAndSearch).toEqual(true);
  });

  it('loads grid', async () => {
    await wrapper.vm.loadGrid(0);
    expect(wrapper.vm.gridData).toStrictEqual([]);
    expect(wrapper.vm.lastPage).toBe(false);

    jest.spyOn(wrapper.vm, 'getRequestService').mockImplementation(() => (
      {
        get: () => Promise.resolve({
          data: {
            pagedResultsCookie: false,
          },
        }),
      }
    ));
    await wrapper.vm.loadGrid(0);
    expect(wrapper.vm.lastPage).toBe(false);
  });

  it('opens create modal', () => {
    wrapper.vm.newRelationships = ['relationship'];
    const showTestIdSpy = jest.spyOn(wrapper.vm.$refs.testId, 'show');
    expect(wrapper.vm.newRelationships).toStrictEqual(['relationship']);
    wrapper.vm.openCreateModal();
    expect(showTestIdSpy).toHaveBeenCalled();
    expect(wrapper.vm.newRelationships).toStrictEqual([]);
  });

  it('removes relationships', async () => {
    const notificationSpy = jest.spyOn(wrapper.vm, 'displayNotification');
    const hideTestIdSpy = jest.spyOn(wrapper.vm.$refs.testId, 'hide');
    wrapper.vm.gridData = [1, 2, 3, 4];
    wrapper.vm.onRowSelected([1, 2, 3, 4]);
    expect(wrapper.vm.selected[0]).toEqual(1);
    await wrapper.vm.removeRelationships();
    expect(notificationSpy).toHaveBeenCalledWith('IDMMessages', 'success', 'pages.access.successRemoved');

    const error400 = { response: { status: 400 } };
    jest.spyOn(wrapper.vm, 'getRequestService').mockImplementation(() => (
      {
        get: () => Promise.resolve({
          data: {
            pagedResultsCookie: true,
          },
        }),
        patch: () => Promise.reject(error400),
      }
    ));
    await wrapper.vm.removeRelationships();
    expect(hideTestIdSpy).toHaveBeenCalled();
  });
});
