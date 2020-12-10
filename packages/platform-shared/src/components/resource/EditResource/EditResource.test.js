/**
 * Copyright 2019-2020 ForgeRock AS. All Rights Reserved
 *
 * Use of this code requires a commercial software license with ForgeRock AS.
 * or with one of its affiliates. All use shall be exclusively subject
 * to such license between the licensee and ForgeRock AS.
 */

/* eslint-disable import/no-extraneous-dependencies */
import BootstrapVue from 'bootstrap-vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import EditResource from './index';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

describe('EditResource.vue', () => {
  const $route = {
    path: '/test',
    meta: {},
    params: {
      resourceName: 'test',
      resourceType: 'test',
      resourceId: 'test',
    },
  };

  let wrapper;

  beforeEach(() => {
    jest.spyOn(EditResource, 'mounted')
      .mockImplementation(() => { });

    wrapper = shallowMount(EditResource, {
      localVue,
      stubs: {
        'router-link': true,
      },
      mocks: {
        $route,
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
    });
  });

  afterEach(() => {
    wrapper = null;
  });

  it('EditResource page loaded', () => {
    expect(wrapper.name()).toBe('EditResource');
    expect(wrapper).toMatchSnapshot();
  });

  it('Format display data', () => {
    wrapper.vm.resourceSchema = {
      icon: 'fa-test',
      order: ['country', 'userName', 'sn', 'email', 'contractor', 'manager'],
      required: ['userName'],
      properties: {
        userName: {
          type: 'string',
          title: 'Username',
          viewable: true,
        },
        sn: {
          type: 'string',
          title: 'Last Name',
          viewable: true,
        },
        email: {
          type: 'string',
          title: 'Email',
          viewable: true,
        },
        contractor: {
          type: 'boolean',
          title: 'Contractor',
          viewable: true,
        },
        country: {
          type: 'string',
          title: 'Country',
          viewable: true,
        },
        manager: {
          type: 'relationship',
          title: 'Manager',
          viewable: true,
        },
      },
    };

    wrapper.vm.resourcePrivilege = {
      UPDATE: {
        allowed: true,
        properties: ['userName', 'contractor', 'sn', 'email', 'manager'],
      },
      DELETE: {
        allowed: true,
      },
      VIEW: {
        allowed: true,
        properties: ['userName', 'country', 'sn', 'email'],
      },
    };

    wrapper.vm.resourceDetails = {
      userName: 'test',
      email: 'test@test.com',
    };

    wrapper.vm.generateDisplay();

    expect(wrapper.vm.icon).toBe('check_box_outline_blank');
    expect(wrapper.vm.formFields.contractor).toBe(false);
    // make sure the view and update properties are merged together and in the correct order
    expect(wrapper.vm.displayProperties.length).toBe(6);
    expect(wrapper.vm.displayProperties[0].key).toBe('country');
    // set relationshipProperties
    wrapper.vm.relationshipProperties = wrapper.vm.getRelationshipProperties(wrapper.vm.resourceSchema, wrapper.vm.resourcePrivilege);
    expect(wrapper.vm.relationshipProperties).toEqual({
      manager: {
        type: 'relationship',
        title: 'Manager',
        key: 'manager',
        propName: 'manager',
        readOnly: false,
        disabled: false,
        value: '',
        viewable: true,
      },
    });
    expect(wrapper.vm.buildResourceUrl()).toEqual('test/test/test?_fields=*,manager/*');
  });
});
