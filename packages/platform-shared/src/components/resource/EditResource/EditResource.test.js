/**
 * Copyright 2019 ForgeRock AS. All Rights Reserved
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
        ToggleButton: true,
      },
      mocks: {
        $route,
        $t: () => {},
        $store: {
          state: {
            userId: 'foo',
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
    const schema = {
      icon: 'fa-test',
      order: ['country', 'userName', 'sn', 'email', 'contractor'],
      required: ['userName'],
      properties: {
        userName: {
          type: 'string',
          title: 'Username',
        },
        sn: {
          type: 'string',
          title: 'Last Name',
        },
        email: {
          type: 'string',
          title: 'Email',
        },
        contractor: {
          type: 'boolean',
          title: 'Contractor',
        },
        country: {
          type: 'string',
          title: 'Country',
        },
      },
    };

    const privilege = {
      UPDATE: {
        allowed: true,
        properties: ['userName', 'contractor', 'sn', 'email'],
      },
      DELETE: {
        allowed: true,
      },
      VIEW: {
        allowed: true,
        properties: ['userName', 'country', 'sn', 'email'],
      },
    };

    const resourceDetails = {
      userName: 'test',
      email: 'test@test.com',
    };

    wrapper.vm.generateDisplay(schema, privilege, resourceDetails);

    expect(wrapper.vm.icon).toBe('check_box_outline_blank');
    expect(wrapper.vm.formFields.contractor).toBe(false);
    // make sure the view and update properties are merged together and in the correct order
    expect(wrapper.vm.displayProperties.length).toBe(5);
    expect(wrapper.vm.displayProperties[0].key).toBe('country');
  });

  it('Password reveal correctly', () => {
    expect(wrapper.vm.passwordInputType).toBe('password');

    wrapper.vm.revealNew();

    expect(wrapper.vm.passwordInputType).toBe('text');

    wrapper.vm.revealNew();

    expect(wrapper.vm.passwordInputType).toBe('password');
  });
});
