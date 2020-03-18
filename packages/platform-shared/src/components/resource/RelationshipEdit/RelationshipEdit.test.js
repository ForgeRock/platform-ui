/**
 * Copyright 2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { shallowMount } from '@vue/test-utils';
import RelationshipEdit from './index';

RelationshipEdit.mounted = jest.fn();

describe('RelationshipEdit', () => {
  it('RelationshipEdit successfully loaded', () => {
    const wrapper = shallowMount(RelationshipEdit, {
      mocks: {
        $t: () => {},
      },
      propsData: {
        relationshipProperty: {},
        parentResource: '',
        index: 0,
        setValue: () => {},
      },
      mounted: () => {},
    });

    expect(wrapper.name()).toEqual('RelationshipEdit');
  });
});
