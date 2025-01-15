/**
 * Copyright (c) 2021-2025 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { shallowMount, flushPromises } from '@vue/test-utils';
import { setupTestPinia } from '../../../../utils/testPiniaHelpers';
import * as SchemaApi from '@/api/SchemaApi';
import CustomStep from './index';

describe('CustomStep.vue', () => {
  let wrapper;
  const getSchemaSpy = jest.spyOn(SchemaApi, 'getSchema').mockImplementation(() => Promise.resolve({
    data: {
      result: [{
        resourceCollection: 'test',
        properties: {
          test: 'testProperties',
        },
        _id: 'testId',
      }],
      order: [
        'test',
        'test2',
      ],
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
            innerTest: 'innerPropTest',
          },
        },
        test2: {
          value: 'test2',
          type: 'string',
          title: 'test2Title',
          propName: 'test2PropName',
          viewable: true,
        },
      },
    },
  }));
  beforeEach(() => {
    setupTestPinia({ user: { idmRoles: ['openidm-admin'], idmUIAdminRoles: ['openidm-admin'] } });
    wrapper = shallowMount(CustomStep, {
      global: {
        mocks: {
          $t: (key) => key,
          $store: {
            state: {
              realm: 'test',
              SharedStore: {
                workforceEnabled: false,
              },
            },
          },
        },
      },
      props: {
        property: {
          key: 'privileges',
          default: 'testDefault',
          isConditional: true,
          isTemporalConstraint: false,
          field: 'password',
          type: 'string',
          value: 'privilegesValue',
        },
        resourceName: 'testName',
      },
    });
  });
  afterEach(() => {
    wrapper.unmount();
  });

  it('handles changes to query filter', async () => {
    wrapper.vm.queryFilterChange('test');
    expect(wrapper.vm.queryFilterField.value).toBe('test');
    expect(wrapper.emitted().input).toBeTruthy();

    await wrapper.vm.setPrivilegesStep();

    expect(getSchemaSpy).toHaveBeenCalled();
    expect(wrapper.vm.schemaMap).toStrictEqual({
      testId: {
        _id: 'testId',
        properties: {
          test: 'testProperties',
        },
        resourceCollection: 'test',
      },
    });

    jest.spyOn(wrapper.vm, 'getRequestService').mockImplementation(() => (
      {
        post: () => Promise.resolve(
          {
            data: [
              {
                privilegePath: {
                  queryFilter: 'resourceCollection eq "internal/role" or (resourceCollection sw "managed")',
                  fields: '*',
                },
              },
            ],
          },
        ),
      }
    ));
    setupTestPinia({ user: { idmRoles: [] } });
    await wrapper.vm.setPrivilegesStep();
    expect(wrapper.vm.schemaMap).toStrictEqual({
      testId: {
        _id: 'testId',
        properties: {
          test: 'testProperties',
        },
        resourceCollection: 'test',
      },
    });
  });

  it('Create resource dialog loaded', async () => {
    wrapper.vm.$store.state.isFraas = true;
    await wrapper.vm.setConditionOptions();
    expect(getSchemaSpy).toHaveBeenCalled();
    expect(wrapper.vm.conditionOptions).toStrictEqual([
      {
        label: 'testTitle/innerTest',
        type: undefined,
        value: 'test/innerTest',
      },
      {
        label: 'test2Title',
        type: 'string',
        value: 'test2',
      },
    ]);
  });

  it('toggles form', () => {
    wrapper.vm.showForm = false;
    wrapper.vm.toggleForm();
    expect(wrapper.vm.queryFilterField.value).toEqual('');
    expect(wrapper.emitted().input[0][1]).toEqual(null);
  });

  it('should display the error notification into setConditionOptions', async () => {
    const conditionObject = [];
    jest.spyOn(SchemaApi, 'getSchema').mockImplementation(() => Promise.reject());
    const showErrorMessageSpy = jest.spyOn(wrapper.vm, 'showErrorMessage');
    await wrapper.vm.setConditionOptions(conditionObject);
    await flushPromises();
    expect(showErrorMessageSpy).toHaveBeenCalledWith('error', 'pages.access.invalidEdit');
  });

  it('does not add _id to privileges if _id is not in schema', async () => {
    const privilegesField = [
      {
        path: 'testPath',
        accessFlags: [],
      },
    ];
    wrapper.vm.loading = false;
    await flushPromises();
    await wrapper.findComponent('fr-add-privileges-stub').vm.$emit('new-privileges-modified', privilegesField);
    expect(wrapper.emitted().input[0][1]).toEqual(privilegesField);
  });

  it('adds _id to privileges if _id is in schema', async () => {
    const privilegesField = [
      {
        path: 'testPath',
        accessFlags: [],
      },
    ];
    wrapper.vm.schemaMap = {
      testPath: {
        properties: {
          _id: {
            type: 'string',
            title: 'ID',
          },
        },
      },
    };

    wrapper.vm.loading = false;
    await flushPromises();
    await wrapper.findComponent('fr-add-privileges-stub').vm.$emit('new-privileges-modified', privilegesField);
    privilegesField[0].accessFlags.push({
      attribute: '_id',
      readOnly: true,
    });
    expect(wrapper.emitted().input[0][1]).toEqual(privilegesField);
  });
});
