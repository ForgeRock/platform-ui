/**
 * Copyright (c) 2021-2023 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import { BootstrapVue } from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import * as SchemaApi from '@/api/SchemaApi';
import CustomStep from './index';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

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
    wrapper = shallowMount(CustomStep, {
      localVue,
      mocks: {
        $t: (key) => key,
        $store: {
          state: {
            realm: 'test',
            UserStore: {
              adminUser: true,
            },
            SharedStore: {
              workforceEnabled: false,
            },
          },
        },
      },
      propsData: {
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
    wrapper = null;
  });

  it('Create resource dialog loaded', () => {
    expect(wrapper.name()).toBe('CustomStep');
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
    wrapper.vm.$store.state.UserStore.adminUser = false;
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
});
