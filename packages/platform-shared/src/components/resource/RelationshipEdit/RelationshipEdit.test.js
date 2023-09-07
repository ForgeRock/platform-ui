/**
 * Copyright (c) 2020-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount, flushPromises } from '@vue/test-utils';
import { map } from 'lodash';
import * as ManagedResourceApi from '@forgerock/platform-shared/src/api/ManagedResourceApi';
import { setupTestPinia } from '../../../utils/testPiniaHelpers';
import * as schemaApi from '@/api/SchemaApi';
import RelationshipEdit from './index';

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
    setupTestPinia();
    wrapper = shallowMount(RelationshipEdit, {
      global: {
        mocks: {
          $t: () => { },
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
                managedObjectMinimumUIFilterLength: {
                  user: 2,
                },
              },
            },
            commit: () => {},
          },
        },
      },
      props: {
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
        setValue: () => { },
      },
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should setupEditor properly', async () => {
    const queryFilterExtension = '!(/effectiveApplications[_id eq \'1234\'])';
    const params = {
      pageSize: 10,
      fields: '',
      queryFilter: '',
      sortKeys: '',
    };
    const getManagedResourceList = jest.spyOn(ManagedResourceApi, 'getManagedResourceList').mockReturnValue(Promise.resolve(optionsQueryResult));
    schemaApi.getSchema = jest.fn().mockReturnValue(Promise.resolve(resourceSchema));
    await wrapper.setProps({ queryFilterExtension });
    wrapper.vm.setupEditor();
    const { fields } = wrapper.vm.resourceCollection.query;
    const fieldsMap = map(fields, (field) => `/${field} sw "ab"`).join(' or ');
    const managedObjectName = wrapper.vm.resourceCollection.path.split('/')[1];
    params.fields = fields.join(',');
    params.queryFilter = `(${fieldsMap}) and ${wrapper.vm.queryFilterExtension}`;
    [params.sortKeys] = fields;

    expect(wrapper.vm.allResourceCollections.length).toEqual(1);
    expect(wrapper.vm.rescourceCollectionTypes.length).toEqual(1);
    expect(wrapper.vm.relationshipField.value).toEqual('managed/user/testy');
    expect(wrapper.vm.resourceCollection).toEqual(wrapper.vm.relationshipField.resourceCollection[0]);
    await wrapper.vm.setOptions('a');
    expect(getManagedResourceList).not.toHaveBeenCalled();
    await wrapper.vm.setOptions('ab');
    expect(getManagedResourceList).toHaveBeenCalledWith(managedObjectName, params);
  });

  it('should refresh getManagedResourceList when input length is 0 even if there is threshold', async () => {
    const queryFilterExtension = '!(/effectiveApplications[_id eq \'1234\'])';
    const getManagedResourceList = jest.spyOn(ManagedResourceApi, 'getManagedResourceList').mockReturnValue(Promise.resolve(optionsQueryResult));
    schemaApi.getSchema = jest.fn().mockReturnValue(Promise.resolve(resourceSchema));
    await wrapper.setProps({ queryFilterExtension });
    wrapper.vm.setupEditor();

    await wrapper.vm.setOptions('a');
    expect(getManagedResourceList).not.toHaveBeenCalled();
    await wrapper.vm.setOptions('');
    expect(getManagedResourceList).toHaveBeenCalled();
  });

  it('should emitSelected properly without temporalConstraint', () => {
    wrapper.vm.emitSelected();
    expect(wrapper.vm.relationshipField.value).toEqual(null);
    expect(wrapper.emitted().setValue[0]).toEqual(['']);
    wrapper.vm.emitSelected(['test', 'test']);
    expect(wrapper.emitted().setValue[1]).toEqual([[{ _ref: 'test', _refProperties: {} }]]);
    wrapper.vm.emitSelected('test');
    expect(wrapper.emitted().setValue[2]).toEqual([{ _ref: 'test', _refProperties: {} }]);
    wrapper.vm.emitSelected(['test', 'testtwo']);
    expect(wrapper.emitted().setValue[3]).toEqual([[{ _ref: 'test', _refProperties: {} }, { _ref: 'testtwo', _refProperties: {} }]]);
  });

  it('should emitSelected properly with temporalConstraint', () => {
    wrapper.vm.relationshipProperty.relationshipGrantTemporalConstraintsEnforced = true;
    wrapper.vm.temporalConstraint = '2021-05-21T20:50:00.000Z/2021-05-22T03:50:00.000Z';
    wrapper.vm.emitSelected(['test']);
    expect(wrapper.emitted().setValue[0]).toEqual([[{ _ref: 'test', _refProperties: { temporalConstraints: [{ duration: wrapper.vm.temporalConstraint }] } }]]);
    wrapper.vm.emitSelected('test');
    expect(wrapper.emitted().setValue[1]).toEqual([{ _ref: 'test', _refProperties: { temporalConstraints: [{ duration: wrapper.vm.temporalConstraint }] } }]);
  });

  it('should set value properly when temporalConstraint changed', async () => {
    wrapper.vm.relationshipField.value = ['test'];
    wrapper.vm.temporalConstraint = '2021-05-21T20:50:00.000Z/2022-05-22T03:50:00.000Z';
    await flushPromises();
    expect(wrapper.emitted().setValue[0]).toEqual([[{ _ref: 'test', _refProperties: { temporalConstraints: [{ duration: wrapper.vm.temporalConstraint }] } }]]);
  });

  it('should set value properly when temporalConstraint enabled and disabled', async () => {
    wrapper.vm.relationshipField.value = ['test'];
    wrapper.vm.temporalConstraint = '2021-05-21T20:50:00.000Z/2023-05-22T03:50:00.000Z';
    wrapper.vm.temporalConstraintEnabled = true;
    await flushPromises();
    expect(wrapper.emitted().setValue[1]).toEqual([[{ _ref: 'test', _refProperties: { temporalConstraints: [{ duration: wrapper.vm.temporalConstraint }] } }]]);
    wrapper.vm.temporalConstraintEnabled = false;
    await flushPromises();
    expect(wrapper.emitted().setValue[2]).toEqual([[{ _ref: 'test', _refProperties: null }]]);
  });

  it('should emit the complete resource selection array when selection is an Array and selection has changed', async () => {
    const resource = { givenName: 'Jon', sn: 'Doe', userName: 'jDoe' };
    wrapper.vm.relationshipField.options = [{
      value: 'managed/alpha_user/7809aeb2',
      resource,
    }];
    wrapper.vm.emitSelected(['managed/alpha_user/7809aeb2']);
    await flushPromises();
    expect(wrapper.emitted('resource-selections')[0]).toEqual([[resource]]);
  });
});
