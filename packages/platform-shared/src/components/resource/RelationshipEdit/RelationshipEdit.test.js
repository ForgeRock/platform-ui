/**
 * Copyright 2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */
import { shallowMount } from '@vue/test-utils';
import RelationshipEdit from './index';
import * as schemaApi from '@/api/SchemaApi';

const resourceSchema = { data: 'test' };
const optionsQueryResult = {
  data: {
    result: [
      {
        _id: 'testy',
        userName: 'testy.testerton',
        givenName: 'testy',
        sn: 'testerton',
      },
    ],
  },
};

RelationshipEdit.mounted = jest.fn();

describe('RelationshipEdit', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(RelationshipEdit, {
      mocks: {
        $t: () => {},
        $store: {
          state: {
            SharedStore: {
              uiConfig: {
                configuration: {
                  platformSettings: {
                    managedObjectsSettings: {
                      user: {
                        minimumUIFilterLength: 2,
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
        value: {
          _id: 'testy',
          userName: 'testy.testerton',
          givenName: 'testy',
          sn: 'testerton',
          _ref: 'managed/user/testy',
          _refResourceCollection: 'managed/user',
          _refResourceId: 'testy',
          _refProperties: {
            _id: 'RELATIONSHIP_RECORD_ID',
          },
        },
        relationshipProperty: {
          resourceCollection: [
            {
              label: 'User',
              path: 'managed/user',
              query: {
                fields: [
                  'userName',
                  'givenName',
                  'sn',
                ],
                queryFilter: 'true',
              },
            },
          ],
          searchable: false,
          title: 'Manager',
          type: 'relationship',
          propName: 'manager',
          readOnly: false,
          key: 'manager',
          value: {
            _id: 'testy',
            userName: 'testy.testerton',
          },
          disabled: false,
        },
        parentResource: '',
        index: 0,
        setValue: () => {},
      },
    });
  });

  it('RelationshipEdit successfully loaded', () => {
    expect(wrapper.name()).toEqual('RelationshipEdit');
  });

  it('should setupEditor properly', () => {
    schemaApi.getSchema = jest.fn().mockReturnValue(Promise.resolve(resourceSchema));

    wrapper.vm.getRequestService = () => ({
      get: jest.fn().mockReturnValue(Promise.resolve(optionsQueryResult)),
    });

    const optionsSearchRequestSpy = jest.spyOn(wrapper.vm, 'getRequestService');

    wrapper.vm.setupEditor();
    expect(wrapper.vm.allResourceCollections.length).toEqual(1);
    expect(wrapper.vm.rescourceCollectionTypes.length).toEqual(1);
    expect(wrapper.vm.relationshipField.value).toEqual('');
    expect(wrapper.vm.resourceCollection).toEqual(wrapper.vm.relationshipField.resourceCollection[0]);
    wrapper.vm.setOptions('a');
    expect(optionsSearchRequestSpy).toHaveBeenCalledTimes(0);
    wrapper.vm.setOptions('ab');
    expect(optionsSearchRequestSpy).toHaveBeenCalledTimes(1);
  });

  it('should emitSelected properly without temporalConstraint', () => {
    wrapper.vm.emitSelected();
    expect(wrapper.vm.relationshipField.value).toEqual(null);
    expect(wrapper.emitted().setValue[0]).toEqual([null]);
    wrapper.vm.emitSelected(['test']);
    expect(wrapper.emitted().setValue[1]).toEqual([[{ _ref: 'test', _refProperties: {} }]]);
    wrapper.vm.emitSelected('test');
    expect(wrapper.emitted().setValue[2]).toEqual([{ _ref: 'test', _refProperties: {} }]);
  });

  it('should emitSelected properly with temporalConstraint', () => {
    wrapper.vm.relationshipProperty.relationshipGrantTemporalConstraintsEnforced = true;
    wrapper.vm.temporalConstraint = '2021-05-21T20:50:00.000Z/2021-05-22T03:50:00.000Z';
    wrapper.vm.emitSelected(['test']);
    expect(wrapper.emitted().setValue[0]).toEqual([[{ _ref: 'test', _refProperties: { temporalConstraints: [{ duration: wrapper.vm.temporalConstraint }] } }]]);
    wrapper.vm.emitSelected('test');
    expect(wrapper.emitted().setValue[1]).toEqual([{ _ref: 'test', _refProperties: { temporalConstraints: [{ duration: wrapper.vm.temporalConstraint }] } }]);
  });

  it('should set value properly when temporalConstraint changed', () => {
    wrapper.vm.relationshipField.value = ['test'];
    wrapper.vm.temporalConstraint = '2021-05-21T20:50:00.000Z/2022-05-22T03:50:00.000Z';
    expect(wrapper.emitted().setValue[0]).toEqual([[{ _ref: 'test', _refProperties: { temporalConstraints: [{ duration: wrapper.vm.temporalConstraint }] } }]]);
  });

  it('should set value properly when temporalConstraint enabled and disabled', () => {
    wrapper.vm.relationshipField.value = ['test'];
    wrapper.vm.temporalConstraint = '2021-05-21T20:50:00.000Z/2023-05-22T03:50:00.000Z';
    wrapper.vm.temporalConstraintEnabled = true;
    expect(wrapper.emitted().setValue[1]).toEqual([[{ _ref: 'test', _refProperties: { temporalConstraints: [{ duration: wrapper.vm.temporalConstraint }] } }]]);
    wrapper.vm.temporalConstraintEnabled = false;
    expect(wrapper.emitted().setValue[2]).toEqual([[{ _ref: 'test', _refProperties: null }]]);
  });
});
