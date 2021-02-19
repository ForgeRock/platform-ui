/**
 * Copyright 2020-2021 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { shallowMount } from '@vue/test-utils';
import RelationshipArray from './index';

RelationshipArray.mounted = jest.fn();

describe('RelationshipArray', () => {
  it('RelationshipArray successfully loaded', () => {
    const wrapper = shallowMount(RelationshipArray, {
      mocks: {
        $t: () => {},
        $store: {
          state: {
            userId: 'foo',
            UserStore: {
              adminUser: false,
            },
          },
        },
      },
      propsData: {
        parentId: 'bjensen',
        parentResource: 'user',
        relationshipArrayProperty: {
          propName: 'manager',
        },
      },
      mounted: () => {},
    });

    expect(wrapper.name()).toEqual('RelationshipArray');
    expect(wrapper.vm.buildGridUrl(0)).toEqual('user/bjensen/manager?_pageSize=10&_totalPagedResultsPolicy=ESTIMATE&_fields=&_queryFilter=true');
    expect(wrapper.vm.buildGridUrl(1)).toEqual('user/bjensen/manager?_pageSize=10&_totalPagedResultsPolicy=ESTIMATE&_fields=&_queryFilter=true&_pagedResultsOffset=10');
  });
});
